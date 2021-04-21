import createReactClass from 'create-react-class';
import { getOpFn } from '@/utils/setData';
import objectKeys from '@/utils/objectKeys';
import {
  PayloadKeyMountedComponents,
  PayloadKeyUnmountedComponents,
  ComponentKeyId,
  ComponentKeyIs,
  ComponentKeyDiffProps,
  ComponentKeyOwnerId,
  DiffKeyUpdated,
  DiffKeyDeleted,
  ComponentKeyName,
} from '@/utils/consts';
import {
  eventReg,
  commonEventReg,
} from '@/utils/reg';
import shallowEqual from '@/utils/shallowEqual';
import mapValues from '@/utils/mapValues';
import $global from '../common/global';
import EventHub from '../EventHub';
import PureRenderMixin from '../mixins/PureRenderMixin';
import CustomComponentEventMixin from '../mixins/CustomComponentEventMixin';
import transformChildrenToSlots from '../utils/transformChildrenToSlots';
import normalizeComponentProps from '../utils/normalizeComponentProps';

let componentId = 1;
let mountedComponents;
let unmountedComponents;

function reset() {
  mountedComponents = [];
  unmountedComponents = [];
}

reset();

EventHub.addListener(['pageReady', 'pageUpdate'], (e) => {
  e.payload = {
    ...(e.payload || {}),
    ...{
      [PayloadKeyMountedComponents]: mountedComponents,
      [PayloadKeyUnmountedComponents]: unmountedComponents,
    },
  };
  reset();
});

export function setComponentsConfig(componentsConfig) {
  if (!componentsConfig) {
    return;
  }

  for (const is in componentsConfig) {
    if (Object.hasOwnProperty.call(componentsConfig, is)) {
      $global.componentsConfig[is] = $global.componentsConfig[is] || {};
      $global.componentsConfig[is].user = componentsConfig[is];
    }
  }
}

const renderCache = {};

function getComponentConfig(is) {
  const userConfig = $global.componentsConfig[is].user || {};

  return userConfig;
}

function getRender(is) {
  if (is in renderCache) {
    return renderCache[is];
  }
  const setupConfig = $global.componentsConfig[is].system;
  const _render = setupConfig.render;

  let render = _render();
  render = render.default || render;
  renderCache[is] = render;
  return render;
}

export default (is) => createReactClass({
  $isCustomComponent: true,
  displayName: is,
  statics: {
    is,
  },
  mixins: [
    CustomComponentEventMixin(),
    PureRenderMixin,
  ],
  // getDefaultProps() {
  //   return getComponentConfig(is).properties || {};
  // },
  getInitialState() {
    const { __page } = this.props;
    this.is = is;
    // async render twice
    this.id = this.id || ++componentId;
    __page.componentInstances[this.id] = this;
    this.eventHandlers = {};
    this.componentEventHandlers = {};
    this.allCustomEvents = {};

    const { properties } = getComponentConfig(this.is);
    const initialProps = {};

    for (const key in properties) {
      if (Object.hasOwnProperty.call(properties, key)) {
        initialProps[key] = this.props[key];
      }
    }

    return {
      ...getComponentConfig(this.is).data,
      ...properties,
      ...initialProps,
    };
  },
  componentDidMount() {
    this.registryEventListener();
    this.recordMounted(this.diffProps(getComponentConfig(this.is).properties || {}), true);
  },
  UNSAFE_componentWillReceiveProps(nextProps) {
    const { properties } = getComponentConfig(this.is);
    const changedProps = {};

    for (const key in nextProps) {
      if (nextProps.hasOwnProperty(key)) {
        const prop = this.props[key];
        const nextProp = nextProps[key];

        if (properties.hasOwnProperty(key)) {
          if (!shallowEqual(prop, nextProp)) {
            changedProps[key] = nextProp;
          }
        }

        /* 存在自定义事件 */
        if (this.allCustomEvents[key]) {
          if (!shallowEqual(prop, nextProp)) {
            this.allCustomEvents[key].remove();
            this.allCustomEvents[key] = this.addCustomEvent(key, nextProp);
          }
        }
      }
    }

    this.setState({
      ...changedProps,
    });
  },
  componentDidUpdate(prevProps) {
    const diffProps = this.diffProps(prevProps);

    if (diffProps) {
      this.recordMounted(diffProps);
    } else {
      mountedComponents.push({
        [ComponentKeyId]: this.id,
      });
    }
  },
  componentWillUnmount() {
    const { __page } = this.props;
    delete __page.componentInstances[this.id];
    unmountedComponents.push(this.id);
  },
  recordMounted(diffProps, init) {
    const info = {
      [ComponentKeyId]: this.id,
    };
    if (init) {
      info[ComponentKeyIs] = this.is;
    }
    mountedComponents.push(info);

    if (diffProps) {
      const { newProps, ownerId } = this.normalizeProps(diffProps);

      info[ComponentKeyDiffProps] = newProps;
      if (ownerId) {
        info[ComponentKeyOwnerId] = ownerId;
      }
    }
  },
  diffProps(prevProps) {
    const { properties } = getComponentConfig(this.is);
    const { props } = this; // 当前props

    const deleted = [];
    const updated = {};
    let isUpdated;
    let isDeleted;

    objectKeys(normalizeComponentProps(prevProps)).forEach((prevKey) => {
      if (properties.hasOwnProperty(prevKey)) {
        if (!(prevKey in props)) {
          deleted.push(prevKey);
          isDeleted = true;
        } else if (prevProps[prevKey] !== props[prevKey]) {
          updated[prevKey] = props[prevKey];
          isUpdated = true;
        }
      }
    });

    objectKeys(normalizeComponentProps(props)).forEach((key) => {
      if (properties.hasOwnProperty(key)) {
        if (!(key in prevProps)) {
          updated[key] = props[key];
          isUpdated = true;
        }
      }
    });

    let ret;
    if (isUpdated) {
      ret = ret || {};
      ret[DiffKeyUpdated] = updated;
    }
    if (isDeleted) {
      ret = ret || {};
      ret[DiffKeyDeleted] = deleted;
    }
    return ret;
  },
  normalizeProps(props) {
    const newProps = {};
    if (props[DiffKeyDeleted]) {
      newProps[DiffKeyDeleted] = props[DiffKeyDeleted];
    }
    let ownerId;
    if (props[DiffKeyUpdated]) {
      const updated = newProps[DiffKeyUpdated] = { ...props[DiffKeyUpdated] };
      objectKeys(updated).forEach((p) => {
        /* 自定义事件 */
        if ((eventReg.test(p) && !commonEventReg.test(p)) && updated[p]) {
          ownerId = updated[p][ComponentKeyOwnerId];
          updated[p] = updated[p][ComponentKeyName];
        }
      });
    }

    return { ownerId, newProps };
  },
  $getEventHandler(name) {
    const _this = this;

    if (!name || typeof name !== 'string') {
      return name;
    }
    const { eventHandlers } = this;
    const { __page } = this.props;

    if (!eventHandlers[name]) {
      const handle = eventHandlers[name] = function (...args) {
        __page.callRemote.apply(__page, ['self', 'triggerComponentEvent', _this.id, name].concat(args));
      };
      handle.handleName = name;
      handle.type = 'component';
      handle.id = this.id;
    }
    return eventHandlers[name];
  },
  $getRefHandler(...args) {
    const { __page } = this.props;

    return __page.$getRefHandler.call(__page, ...args);
  },
  $getComponentEventHandler(name) {
    if (!name || typeof name !== 'string') {
      // need json transfer to worker
      return name;
    }
    const { componentEventHandlers } = this;

    if (!componentEventHandlers[name]) {
      componentEventHandlers[name] = {
        [ComponentKeyName]: name,
        [ComponentKeyOwnerId]: this.id,
      };
    }

    return componentEventHandlers[name];
  },
  triggerEvent(eventName, detail, options) {
    const event = new CustomEvent(eventName, {
      detail,
      ...options,
    });
    this._root.dispatchEvent(event);
  },
  setData(toBeData, callback) {
    const data = this.state;

    let ret = data;
    if (Array.isArray(toBeData)) {
      toBeData.forEach((d) => {
        // immutable for shouldComponentUpdate
        ret = getOpFn(d.op)(ret, d.data);
      });
    } else {
      ret = getOpFn(toBeData.op)(ret, toBeData.data);
    }

    this.setState({
      ...ret,
    }, callback);
  },
  addCustomEvent(key, fn) {
    if (eventReg.test(key) && !commonEventReg.test(key)) {
      const result = key.match(eventReg);
      if (result) {
        const onHandler = fn;
        if (this._root) {
          const handler = (e) => {
            const isCatchHandler = result[1] === 'catch';

            if (isCatchHandler && e.stopPropagation) {
              e.stopPropagation();
              onHandler(e);
              return;
            }
            onHandler(e);
          };

          this._root.addEventListener(result[2], handler, result[3] === 'capture');

          return {
            remove: () => {
              this._root.removeEventListener(result[2], handler);
            },
          };
        }
      }
    }
  },
  registryEventListener() {
    const { props } = this;
    for (const key in props) {
      if (Object.hasOwnProperty.call(props, key)) {
        this.allCustomEvents[key] = this.addCustomEvent(key, props[key]);
      }
    }
  },

  render() {
    const props = normalizeComponentProps(this.props);
    props.$slots = transformChildrenToSlots(this.props.children);
    props.$scopedSlots = this.props.$scopedSlots;

    const {
      id,
      className,
    } = props;

    const nodeEvents = this.getNodeEvents();

    return (
      <span
        id={id}
        className={className}
        ref={(ref) => this._root = ref}
        {...nodeEvents}
      >
        {getRender(is).call(this, { $id: this.id, ...this.state })}
      </span>
    );
  },
});
