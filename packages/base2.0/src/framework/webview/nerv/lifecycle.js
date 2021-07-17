import {
  isNil,
  isComponent,
  isInvalid,
  VType,
  EMPTY_OBJ,
  isComposite,
} from './shared';
import { extend, clone, isFunction, isNumber, isString, isUndefined, isArray } from './utils';
import CurrentOwner from './current-owner';
import createElement from './vdom/create-element';
import createVText from './vdom/create-vtext';
import { createVoid } from './vdom/create-void';
import { patch } from './vdom/patch';
import { unmount } from './vdom/unmount';
import Ref from './vdom/ref';
import Component from './component';
import { invokeEffects } from './hooks';

const readyComponents = [];

export function errorCatcher(fn, component) {
  try {
    return fn();
  } catch (error) {
    errorHandler(component, error);
  }
}

function errorHandler(component, error) {
  let boundary;
  const { getDerivedStateFromError } = component.constructor;

  if (isFunction(getDerivedStateFromError) || isFunction(component.componentDidCatch)) {
    boundary = component;
    return;
  } else if (component._parentComponent) {
    component = component._parentComponent;
  } else {
    return;
  }

  if (boundary) {
    const { getDerivedStateFromError } = boundary.constructor;
    const { _disable } = boundary;
    boundary._disable = false;
    if (isFunction(getDerivedStateFromError)) {
      component.setState(getDerivedStateFromError(error));
    } else if (isFunction(component.componentDidCatch)) {
      boundary.componentDidCatch(error);
    }
    boundary._disable = _disable;
  } else {
    throw error;
  }
}

export function ensureVirtualNode(rendered) {
  if (isNumber(rendered) || isString(rendered)) {
    return createVText(rendered);
  } else if (isInvalid(rendered)) {
    return createVoid();
  } else if (isArray(rendered)) {
    rendered = rendered.length === 0 ? createVoid() : rendered.map(ensureVirtualNode);
  }
  return rendered;
}

export function mountVNode(vnode, parentContext, parentComponent) {
  return createElement(vnode, parentContext, parentComponent);
}

export function getContextByContextType(vnode, parentContext) {
  const { contextType } = vnode.type;
  const hasContextType = !isUndefined(contextType);
  const provider = hasContextType ? (parentContext[contextType._id]) : null;
  const context = hasContextType
    ? (
      !isNil(provider) ? provider.value : contextType._defaultValue
    )
    : parentContext;
  return context;
}

export function mountComponent(vnode, parentContext, parentComponent) {
  const { ref } = vnode;
  if (vnode.type.prototype && vnode.type.prototype.render) {
    const context = getContextByContextType(vnode, parentContext);
    vnode.component = new vnode.type(vnode.props, context);
  } else {
    const c = new Component(vnode.props, parentContext);
    c.render = () => vnode.type.call(c, c.props, c.context);
    vnode.component = c;
  }
  const { component } = vnode;
  component.vnode = vnode;
  if (isComponent(parentComponent)) {
    component._parentComponent = parentComponent;
  }
  const newState = callGetDerivedStateFromProps(vnode.props, component.state, component);
  if (!isUndefined(newState)) {
    component.state = newState;
  }
  if (!hasNewLifecycle(component) && isFunction(component.componentWillMount)) {
    errorCatcher(() => {
      component.componentWillMount();
    }, component);
    component.state = component.getState();
    component.clearCallBacks();
  }
  component._dirty = false;
  const rendered = renderComponent(component);

  rendered.parentVNode = vnode;
  component._rendered = rendered;
  if (!isNil(ref)) {
    Ref.attach(vnode, ref, vnode.dom);
  }

  vnode.dom = mountVNode(
    rendered,
    getChildContext(component, parentContext),
    component,
  );

  const { dom } = vnode;
  invokeEffects(component, 'reversedLayoutEffects');
  invokeEffects(component, 'layoutEffects');
  if (isFunction(component.componentDidMount)) {
    readyComponents.push(component);
  }
  component._disable = false;
  return dom;
}

export function getChildContext(component, context = EMPTY_OBJ) {
  if (isFunction(component.getChildContext)) {
    return extend(clone(context), component.getChildContext());
  }
  return clone(context);
}

export function renderComponent(component) {
  CurrentOwner.current = component;
  CurrentOwner.index = 0;
  invokeEffects(component, 'effects');

  let rendered;

  errorCatcher(() => {
    rendered = component.render();
  }, component);

  rendered = ensureVirtualNode(rendered);
  CurrentOwner.current = null;

  return rendered;
}

export function flushMount() {
  if (!readyComponents.length) {
    return;
  }
  // @TODO: perf
  const queue = readyComponents.slice(0);
  readyComponents.length = 0;
  queue.forEach((item) => {
    if (isFunction(item)) {
      item();
    } else if (item.componentDidMount) {
      errorCatcher(() => {
        item.componentDidMount();
      }, item);
    }
  });
}

function getFragmentHostNode(children) {
  const child = children[0];
  if (isArray(child)) {
    return getFragmentHostNode(child);
  } else if (isComposite(child) && child.dom == null) {
    return getFragmentHostNode(child.component._rendered);
  }
  return child != null ? child.dom : null;
}

export function reRenderComponent(
  prev,
  current,
) {
  current.component = prev.component;

  const { component } = current;
  const nextProps = current.props;
  const nextContext = current.context;
  component._disable = true;

  if (!hasNewLifecycle(component) && isFunction(component.componentWillReceiveProps)) {
    errorCatcher(() => {
      component.componentWillReceiveProps(nextProps, nextContext);
    }, component);
  }

  component._disable = false;
  component.prevProps = component.props;
  component.prevState = component.state;
  component.prevContext = component.context;
  component.props = nextProps;
  component.context = nextContext;

  if (!isNil(current.ref)) {
    Ref.update(prev, current);
  }

  return updateComponent(component);
}

function callShouldComponentUpdate(props, state, context, component) {
  let shouldUpdate = true;
  errorCatcher(() => {
    shouldUpdate = component.shouldComponentUpdate(props, state, context);
  }, component);
  return shouldUpdate;
}

export function updateComponent(component, isForce = false) {
  let { vnode } = component;
  let { dom } = vnode;
  const { props } = component;
  let state = component.getState();
  const { context } = component;
  const prevProps = component.prevProps || props;
  const prevState = component.prevState || component.state;
  const prevContext = component.prevContext || context;

  const stateFromProps = callGetDerivedStateFromProps(props, state, component);

  if (!isUndefined(stateFromProps)) {
    state = stateFromProps;
  }

  component.props = prevProps;
  component.context = prevContext;
  let skip = false;
  const onSCU = props.onShouldComponentUpdate;
  if (
    !isForce
    && (
      (isFunction(component.shouldComponentUpdate)
      && callShouldComponentUpdate(props, state, context, component) === false)
      || (isFunction(onSCU) && onSCU(prevProps, props) === false)
    )
  ) {
    skip = true;
  } else if (!hasNewLifecycle(component) && isFunction(component.componentWillUpdate)) {
    errorCatcher(() => {
      component.componentWillUpdate(props, state, context);
    }, component);
  }

  if (!isUndefined(stateFromProps)) {
    component.state = stateFromProps;
  }

  component.props = props;
  component.state = state;
  component.context = context;
  component._dirty = false;

  if (!skip) {
    const lastRendered = component._rendered;
    const rendered = renderComponent(component);

    rendered.parentVNode = vnode;

    const childContext = getChildContext(component, context);
    const snapshot = callGetSnapshotBeforeUpdate(prevProps, prevState, component);
    let parentDom = lastRendered.dom && lastRendered.dom.parentNode;

    if (isArray(lastRendered)) {
      const hostNode = getFragmentHostNode(lastRendered);
      if (hostNode != null) {
        lastRendered.dom = hostNode.parentNode;
        parentDom = lastRendered.dom;
      }
    }

    vnode.dom = patch(lastRendered, rendered, parentDom || null, childContext);
    dom = vnode.dom;
    component._rendered = rendered;

    if (isFunction(component.componentDidUpdate)) {
      errorCatcher(() => {
        component.componentDidUpdate(prevProps, prevState, snapshot);
      }, component);
    }
    while (vnode = vnode.parentVNode) {
      if ((vnode.vtype & VType.Composite) > 0) {
        vnode.dom = dom;
      }
    }
  }

  component.prevProps = component.props;
  component.prevState = component.state;
  component.prevContext = component.context;
  component.clearCallBacks();
  flushMount();

  invokeEffects(component, 'reversedLayoutEffects');
  invokeEffects(component, 'layoutEffects');

  return dom;
}

export function unmountComponent(vnode) {
  const { component } = vnode;
  component.hooks.forEach((hook) => {
    if (isFunction(hook.cleanup)) {
      hook.cleanup();
    }
  });
  if (isFunction(component.componentWillUnmount)) {
    errorCatcher(() => {
      component.componentWillUnmount();
    }, component);
  }
  component._disable = true;
  unmount(component._rendered);
  if (!isNil(vnode.ref)) {
    Ref.detach(vnode, vnode.ref, vnode.dom);
  }
}

function callGetDerivedStateFromProps(props, state, inst) {
  const { getDerivedStateFromProps } = inst.constructor;
  let newState;
  // @TODO show warning
  errorCatcher(() => {
    if (isFunction(getDerivedStateFromProps)) {
      const partialState = getDerivedStateFromProps.call(
        null,
        props,
        state,
      );
      if (!isUndefined(partialState)) {
        newState = extend(clone(state), partialState);
      }
    }
  }, inst);
  return newState;
}

function callGetSnapshotBeforeUpdate(props, state, inst) {
  const { getSnapshotBeforeUpdate } = inst;
  let snapshot;
  errorCatcher(() => {
    if (isFunction(getSnapshotBeforeUpdate)) {
      snapshot = getSnapshotBeforeUpdate.call(inst, props, state);
    }
  }, inst);
  return snapshot;
}

function hasNewLifecycle(component) {
  if (isFunction(component.constructor.getDerivedStateFromProps)) {
    return true;
  }
  return false;
}
