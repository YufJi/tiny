
import createReactClass from 'create-react-class';
import $global from '../common/global';
import EventHub from '../EventHub';
import { getOpFn } from '@/utils/setData';
import PureRenderMixin from '../mixins/PureRenderMixin';
import { getCurrentPageImpl } from '../App';
import transformChildrenToSlots from '../utils/transformChildrenToSlots';
import normalizeComponentProps from '../utils/normalizeComponentProps';
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

let componentId = 1;
let mountedComponents;
let unmountedComponents;

reset();

function reset() {
  mountedComponents = [];
  unmountedComponents = [];
}

EventHub.addListener(['pageReady', 'pageUpdate'], (e) => {
  e.payload = {
    ...e.payload,
    ...{
      [PayloadKeyMountedComponents]: mountedComponents,
      [PayloadKeyUnmountedComponents]: unmountedComponents,
    },
  };
  reset();
});

const eventReg = /^on[A-Z]/;

export function setComponentsConfig(componentsConfig) {
  if (!componentsConfig) {
    return;
  }

  for (const is in componentsConfig) {
    if (Object.hasOwnProperty.call(componentsConfig, is)) {
      $global.componentsConfig[is] = $global.componentsConfig[is] || {}
      $global.componentsConfig[is].user = componentsConfig[is]
    }
  }
}

const renderCache = {}

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
  displayName: is,
  statics: {
    isCustomComponent: 1,
    is: is,
  },
  mixins: [PureRenderMixin],
  getDefaultProps() {
    return getComponentConfig(is).props || {};
  },
  getInitialState() {
    this.is = is;
    // async render twice
    this.id = this.id || ++componentId;
    getCurrentPageImpl().componentInstances[this.id] = this;
    this.eventHandlers = {};
    this.componentEventHandlers = {};
    return {
      data: { ...getComponentConfig(this.is).data },
    };
  },
  componentDidMount() {
    this.recordMounted(this.diffProps(getComponentConfig(this.is).props || {}), true);
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
    delete getCurrentPageImpl().componentInstances[this.id];
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
    const { props } = this;

    const deleted = [];
    const updated = {};
    let isUpdated;
    let isDeleted;
    objectKeys(normalizeComponentProps(prevProps)).forEach((prevKey) => {
      if (!(prevKey in props)) {
        deleted.push(prevKey);
        isDeleted = true;
      } else if (prevProps[prevKey] !== props[prevKey]) {
        updated[prevKey] = props[prevKey];
        isUpdated = true;
      }
    });
    objectKeys(normalizeComponentProps(props)).forEach((key) => {
      if (!(key in prevProps)) {
        updated[key] = props[key];
        isUpdated = true;
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
        if (p.match(eventReg) && updated[p]) {
          ownerId = updated[p][ComponentKeyOwnerId];
          updated[p] = updated[p][ComponentKeyName];
        }
      });
    }
    return { ownerId, newProps };
  },
  $getEventHandler: function $getEventHandler(name) {
    const _this = this;

    if (!name || typeof name !== 'string') {
      return name;
    }
    const { eventHandlers } = this;

    if (!eventHandlers[name]) {
      const handle = eventHandlers[name] = function (...args) {
        let _getCurrentPageImpl;

        (_getCurrentPageImpl = getCurrentPageImpl()).callRemote.apply(_getCurrentPageImpl, ['self', 'triggerComponentEvent', _this.id, name].concat(args));
      };
      handle.handleName = name;
      handle.type = 'component';
      handle.id = this.id;
    }
    return eventHandlers[name];
  },
  $getRefHandler: function $getRefHandler(...args) {
    let _getCurrentPageImpl2;

    return (_getCurrentPageImpl2 = getCurrentPageImpl()).$getRefHandler.apply(_getCurrentPageImpl2, args);
  },
  $getComponentEventHandler: function $getComponentEventHandler(name) {
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
  setData: function setData(toBeData, callback) {
    const { data } = this.state;

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
      data: ret,
    }, callback);
  },
  render: function render() {
    const props = normalizeComponentProps(this.props);
    props.$slots = transformChildrenToSlots(this.props.children);
    props.$scopedSlots = this.props.$scopedSlots;

    return (
        getRender(is).call(this, { $id: this.id, ...props, ...this.state.data })
    )
  },
});