/*
 * @Author: YufJ
 * @Date: 2021-07-12 21:04:41
 * @LastEditTime: 2021-07-12 21:09:53
 * @Description:
 * @FilePath: /yeact/src/dom.js
 */
import { nextTick } from './utils';
import { isValidElement as isValidNervElement, VType, isComponent, isInvalid } from './shared';
import { getChildContext } from './lifecycle';
import render from './render';
import { unmount } from './vdom/unmount';
import createElement from './create-element';
import Component from './component';

export function unmountComponentAtNode(dom) {
  const component = dom._component;

  if (isValidNervElement(component)) {
    unmount(component, dom);
    delete dom._component;
    return true;
  }

  return false;
}

export function findDOMNode(component) {
  if (isInvalid(component)) {
    return null;
  }
  return isComponent(component)
    ? component.vnode.dom
    : isValidNervElement(component)
      ? component.dom : component;
}

export function createFactory(type) {
  return createElement.bind(null, type);
}

class WrapperComponent extends Component {
  getChildContext() {
    // tslint:disable-next-line
    return this.props.context;
  }

  render() {
    return this.props.children;
  }
}

export function unstable_renderSubtreeIntoContainer(
  parentComponent,
  vnode,
  container,
  callback,
) {
  // @TODO: should handle props.context?
  const wrapper = createElement(
    WrapperComponent,
    { context: getChildContext(parentComponent, parentComponent.context) },
    vnode,
  );
  const rendered = render(wrapper, container);
  if (callback) {
    callback.call(rendered);
  }
  return rendered;
}

export function isValidElement(element) {
  return (
    isValidNervElement(element) && (element.vtype & (VType.Composite | VType.Node)) > 0
  );
}

export const unstable_batchedUpdates = nextTick;
