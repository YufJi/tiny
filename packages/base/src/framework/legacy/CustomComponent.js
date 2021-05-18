import Nerv, { createNervClass } from '@/nerv';
import { getOpFn } from '@/utils/setData';
import objectKeys from '@/utils/objectKeys';
import {
  PayloadKeyMountedComponents,
  PayloadKeyUnmountedComponents,
  ComponentKeyId,
  ComponentKeyIs,
  ComponentKeyDiffProps,
  DiffKeyUpdated,
  DiffKeyDeleted,
} from '@/utils/consts';
import { debug } from '@/utils/log';

import $global from '../common/global';
import EventHub from '../EventHub';
import PureRenderMixin from '../mixins/PureRenderMixin';
import transformChildrenToSlots from '../utils/transformChildrenToSlots';
import normalizeComponentProps from '../utils/normalizeComponentProps';
import { getType } from '../../utils/types';

let componentId = 1;
let mountedComponents;
let unmountedComponents;

function reset() {
  mountedComponents = [];
  unmountedComponents = [];
}

reset();

EventHub.addListener(['pageLoad', 'pageReady', 'pageUpdate'], (e) => {
  e.payload = {
    ...(e.payload || {}),
    ...{
      [PayloadKeyMountedComponents]: mountedComponents,
      [PayloadKeyUnmountedComponents]: unmountedComponents,
    },
  };
  reset();
});

const renderCache = {};

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

export default (is) => createNervClass({
  $isCustomComponent: true,
  displayName: is,
  mixins: [
    PureRenderMixin,
  ],
  statics: {
    is,
    getDerivedStateFromProps(nextProps, state) {
      const { __page } = nextProps;
      const { properties } = __page.customComponents[is];
      const changedProps = {};

      for (const key in nextProps) {
        if (nextProps.hasOwnProperty(key)) {
          const nextProp = nextProps[key];
          if (properties.hasOwnProperty(key) && getType(nextProp) === properties[key].type) {
            changedProps[key] = nextProp;
          }
        }
      }
      return { ...state, ...changedProps };
    },
  },

  getInitialState() {
    const { __page } = this.props;
    this.is = is;
    this.id = this.id || ++componentId;
    const { properties, data } = __page.customComponents[is];
    this.properties = properties;
    this.eventHandlers = {};

    this.prevProps = {};
    __page.componentInstances[this.id] = this;
    __page.fireComponentLifecycle(this.recordMounted(false), 'created');

    return { ...data };
  },
  componentDidMount() {
    const { __page } = this.props;

    const info = this.recordMounted(this.diffProps(this.prevProps));
    __page.fireComponentLifecycle(info, 'attached');

    this.prevProps = this.props;
  },
  onAttachedReady() {
    const { __page } = this.props;

    const info = this.recordMounted(this.diffProps(this.prevProps));
    __page.fireComponentLifecycle(info, 'ready');
  },
  componentDidUpdate(prevProps) {
    const diffProps = this.diffProps(prevProps);

    if (diffProps) {
      this.recordMounted(diffProps);
    }
  },
  componentWillUnmount() {
    const { __page } = this.props;
    delete __page.componentInstances[this.id];
    unmountedComponents.push(this.id);
    __page.fireComponentLifecycle(this.recordMounted(false), 'unload');
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
  recordMounted(diffProps) {
    const info = {
      [ComponentKeyId]: this.id,
      [ComponentKeyIs]: this.is,
    };

    mountedComponents.push(info);

    if (diffProps) {
      const { newProps } = this.normalizeProps(diffProps);

      info[ComponentKeyDiffProps] = newProps;
    }
    return info;
  },
  diffProps(prevProps) {
    const { properties = {} } = this;
    const { props } = this; // 当前props

    const deleted = [];
    const updated = {};
    let isUpdated;
    let isDeleted;

    objectKeys(normalizeComponentProps(prevProps)).forEach((prevKey) => {
      const prevProp = prevProps[prevKey];
      if (properties.hasOwnProperty(prevKey) && getType(prevProp) === properties[prevKey].type) {
        if (!(prevKey in props)) {
          deleted.push(prevKey);
          isDeleted = true;
        } else if (prevProp !== props[prevKey]) {
          updated[prevKey] = props[prevKey];
          isUpdated = true;
        }
      }
    });

    objectKeys(normalizeComponentProps(props)).forEach((key) => {
      const prop = props[key];
      if (properties.hasOwnProperty(key) && getType(prop) === properties[key].type) {
        if (!(key in prevProps)) {
          updated[key] = prop;
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

    if (props[DiffKeyUpdated]) {
      newProps[DiffKeyUpdated] = { ...props[DiffKeyUpdated] };
    }

    return { newProps };
  },
  $getEventHandler(name) {
    const _this = this;

    if (!name || typeof name !== 'string') {
      return name;
    }
    const { eventHandlers } = this;
    const { __page } = this.props;

    if (!eventHandlers[name]) {
      const handle = function (...args) {
        __page.callRemote.apply(__page, ['self', 'triggerComponentEvent', _this.id, name].concat(args));
      };
      handle.handleName = name;
      handle.type = 'component';
      handle.id = this.id;

      eventHandlers[name] = handle;
    }
    return eventHandlers[name];
  },
  $getRefHandler(...args) {
    const { __page } = this.props;

    return __page.$getRefHandler.call(__page, ...args);
  },

  triggerEvent(eventName, detail, options) {
    const event = new CustomEvent(eventName, {
      detail,
      ...options,
    });
    this.root.dispatchEvent(event);
  },

  render() {
    const { children, $scopedSlots } = this.props;
    const props = normalizeComponentProps(this.props);
    const $slots = transformChildrenToSlots(children);

    const {
      id,
      className,
      ...rest
    } = props;

    return (
      <span
        ref={(ref) => this.root = ref}
        id={id}
        className={className}
        {...rest}
      >
        {getRender(is).call(this, {
          $id: this.id,
          $scopedSlots,
          $slots,
          ...rest,
          ...this.state,
        })}
      </span>
    );
  },
});
