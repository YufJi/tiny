import setData, { spliceData, getOpStr } from '@/utils/setData';
import objectKeys from '@/utils/objectKeys';
import mergeArray from '@/utils/mergeArray';
import log, { debug } from '@/utils/log';
import invokeWithGuardAndReThrow from '@/utils/invokeWithGuardAndReThrow';
import {
  PendingKeyType,
  PendingKeyData,
  PendingKeyOp,
  PendingValuePage,
  PayloadKeyMountedComponents,
  PayloadKeyUnmountedComponents,
  ComponentKeyId,
  ComponentKeyIs,
} from '@/utils/consts';
import { getAppImpl } from '../App';
import EventHub from '../EventHub';
import getComponentClass from '../ComponentRegistry/getComponentClass';
import $global from '../common/global';
import MessageHandleMixin from '../mixins/MessageHandleMixin';

const publicInstanceMethods = ['onShareAppMessage', 'onReachBottom', 'onPageScroll'];
function noop() {}

export default function PageComponent({ id, query, pagePath }) {
  if (!(this instanceof PageComponent)) {
    return new PageComponent({ id, query, pagePath });
  }
  this.$startTime = Date.now();
  this.onMessage = this.onMessage.bind(this);
  this.componentInstances = {};

  Object.assign(this, {
    pagePath,
    id,
    bridge: $global.bridge,
    pendingData: [],
    pendingCallbacks: [],
    initialCallbacks: [],
    self: this,
    query,
    pageType: 'WORKER',
  });

  const self = this;

  /* 设置publicInstance */
  const publicInstance = this.publicInstance = Object.create({
    route: pagePath,
    ...$global.pagesConfig[pagePath].user,
  }, {
    setData: {
      value: function value(a, b) {
        return self.setData(setData, a, b);
      },
    },
    $spliceData: {
      value: function value(a, b) {
        return self.setData(spliceData, a, b);
      },
    },
    $getComponentBy: {
      value: this.getComponentBy.bind(this),
    },
  });

  if (typeof publicInstance.data === 'function') {
    publicInstance.data = publicInstance.data() || {};
  }
}

const allUsingComponentsCache = {};

function getAllUsingComponents(pagePath) {
  if (pagePath in allUsingComponentsCache) {
    return allUsingComponentsCache[pagePath];
  }
  const allUsingComponents = [];

  const { usingComponents } = $global.pagesConfig[pagePath].system;
  if (usingComponents) {
    objectKeys(usingComponents).forEach((c) => {
      const cs = getComponentClass(usingComponents[c]).getAllComponents();
      mergeArray(allUsingComponents, cs);
    });
    allUsingComponentsCache[pagePath] = allUsingComponents;
  }

  return allUsingComponents;
}

PageComponent.prototype = {
  ...MessageHandleMixin,
  load() {
    // in case pageResume following appResume, tab page??
    if (!this.$loadTime) {
      this.$loadTime = Date.now();
      // setData will be merged with startRender
      this._disableRemoteData = true;
      log('framework: page onLoad', this.pagePath);
      EventHub.emit('pageLoad', { page: this });
      invokeWithGuardAndReThrow(this.publicInstance.onLoad, this.publicInstance, this.query);
      // depend app status!! maybe unstable
      if (getAppImpl().shown) {
        this.show();
      }
      if (this._fromTabItemTap) {
        this.onTabItemTap(this.tabProps);
      }
      this._disableRemoteData = false;
    }
    this.startRender();
  },
  refresh() {
    this.unmountAllComponents();
    this.startRender(true);
  },
  show() {
    if (this.unloaded) {
      return;
    }
    // in case navigateTo inside App.onLaunch
    if (!this.$loadTime) {
      this.load();
      return;
    }
    if (this.shown) {
      return;
    }
    this.shown = true;
    EventHub.emit('enterPage', { page: this });
    this.executeUserMethod('onShow');
    log('framework: page onShow', this.pagePath);
  },
  pullDownRefresh(e) {
    EventHub.emit('pullDownRefresh', { page: this });
    this.executeUserMethod('onPullDownRefresh', [e]);
  },
  hide() {
    if (this.unloaded) {
      return;
    }
    if (!this.$loadTime) {
      return;
    }
    if (!this.shown) {
      return;
    }
    this.shown = false;
    EventHub.emit('leavePage', { page: this });
    EventHub.emit('pageHide', { page: this });
    this.executeUserMethod('onHide');
    log('framework: page onHide', this.pagePath);
  },
  unload() {
    log('framework: page onUnload', this.pagePath);
    if (this.unloaded || !this.$loadTime) {
    // remove from page stack
      EventHub.emit('pageUnload', { page: this });
      return;
    }
    this.unloaded = true;
    this.unmountAllComponents();
    invokeWithGuardAndReThrow(this.publicInstance.onUnload, this.publicInstance);
    EventHub.emit('leavePage', { page: this });
    EventHub.emit('pageUnload', { page: this });
  },
  unmountAllComponents() {
    const oldComponentInstances = this.componentInstances;
    this.componentInstances = {};
    objectKeys(oldComponentInstances).forEach((k) => {
      oldComponentInstances[k].unload();
    });
  },
  isLoaded() {
    return !!this.$loadTime && !this.unloaded;
  },
  startRender(isRefresh) {
    const { publicInstance, id } = this;

    const config = {};
    publicInstanceMethods.forEach((k) => {
      const hookFn = publicInstance[k];
      if (typeof hookFn === 'function' && hookFn !== noop) {
        config[k] = true;
      }
    });
    const componentsConfig = {};

    getAllUsingComponents(this.pagePath).forEach((component) => {
      const ComponentClass = getComponentClass(component);
      componentsConfig[component] = {
        properties: ComponentClass.properties,
        data: ComponentClass.data,
      };
    });
    // 此时发消息给bridge触发render的渲染，并且带了firstData过去
    this.callRemote('self', 'startRender', {
      id,
      isRefresh,
      publicInstance: config,
      componentsConfig,
      data: { ...publicInstance.data },
    });
  },
  getViewId() {
    return this.publicInstance.$viewId;
  },
  setViewId(viewId) {
    this.publicInstance.$viewId = viewId;
  },
  getComponentInstance(id) {
    if (String(id) === '1') {
      return this;
    }
    return this.componentInstances[id];
  },
  getComponentBy(by, config = {}) {
    const instances = [];
    const { componentInstances } = this;

    if (componentInstances) {
      const keys = objectKeys(componentInstances);
      for (let i = 0; i < keys.length; i+=1) {
        const { publicInstance } = componentInstances[keys[i]];
        if (by(publicInstance)) {
          instances.push(publicInstance);
          if (config.returnOnFirstMatch) {
            return instances;
          }
        }
      }
    }
    return instances;
  },

  /* 组件内部绑定事件，触发通过worker page来执行 */
  triggerComponentEvent(componentId, eventName, eventObject) {
    const componentInstance = this.getComponentInstance(componentId);
    if (componentInstance) {
      this.batchedUpdates(() => {
        invokeWithGuardAndReThrow(componentInstance.publicInstance[eventName], componentInstance.publicInstance, eventObject);
      });
    }
  },

  onTabItemTap(tabProps) {
    this.executeUserMethod('onTabItemTap', [tabProps]);
  },

  unmountComponents(unmountedKeys) {
    const { componentInstances } = this;

    unmountedKeys.forEach((id) => {
      if (componentInstances[id]) {
        componentInstances[id].unload();
        delete componentInstances[id];
      }
    });
  },

  updateComponents(payload) {
    if (!payload) {
      return;
    }
    const { componentInstances } = this;

    const mountedComponents = payload[PayloadKeyMountedComponents] || [];
    const unmountedComponents = payload[PayloadKeyUnmountedComponents] || [];
    // from bottom to top
    mountedComponents.forEach((componentConfig) => {
      const id = componentConfig[ComponentKeyId];

      if (componentInstances[id]) {
        componentInstances[id].setComponentConfig(componentConfig);
      } else if (componentConfig[ComponentKeyIs]) {
        // incase update after unmount
        const ComponentClass = getComponentClass(componentConfig[ComponentKeyIs]);
        componentInstances[id] = new ComponentClass(this, id, componentConfig);
        componentInstances[id].ready();
      }
    });
    const unmountedKeys = unmountedComponents.concat().reverse();
    this.unmountComponents(unmountedKeys);
  },

  ready(payload) {
    if (this.unloaded) {
      return;
    }
    if (this.readied) {
      return;
    }
    this.batchedUpdates(() => {
      this.readied = true;
      this.update(payload);
      EventHub.emit('pageReady', { page: this });
      this.initialCallbacks.forEach((fn) => {
        return fn();
      });
      this.executeUserMethod('onReady');
      log('framework: page onReady', this.pagePath);
    });
  },

  update(payload) {
    this.batchedUpdates(() => {
      this.updateComponents(payload);
    });
  },

  postMessage(data) {
    if (this.unloaded) {
      return;
    }
    debug('framework', `[WORKER] Page ${this.pagePath} postMessage`, data);

    this.bridge.call('postMessage', {
      ...data,
      pageType: this.pageType,
      msgType: 'endpoint',
      viewId: this.getViewId(), // 渲染层frameId
    });
  },

  console: (function (_console) {
    function console(_x2) {
      return _console.apply(this, arguments);
    }

    console.toString = function () {
      return _console.toString();
    };

    return console;
  })(function (type) {
  // make compiled code
    console[type].apply(console, [].slice.call(arguments, 1, -2));
  }),

  setData(op, diffData, options_) {
    if (this.unloaded) {
      console.log(`${'setData(...) can only update a loaded page. ' + 'This usually means you called setData() on a unloaded page. '}` + `Please check the code for the "${this.pagePath}" page.`);
      return;
    }
    if (!diffData) {
      return;
    }
    // no need to create immutable data
    this.publicInstance.data = op(this.publicInstance.data, diffData);
    let options = options_ || {};
    let callback;
    if (typeof options_ === 'function') {
      callback = options_;
      options = { complete: callback };
    }
    if (this._disableRemoteData) {
      if (callback) {
        this.initialCallbacks.push(callback);
      }
    } else {
      const data = {
        [PendingKeyType]: PendingValuePage,
        [PendingKeyData]: diffData,
        [PendingKeyOp]: getOpStr(op),
      };

      this.setRemoteData(data, options);
    }
  },
  executeUserMethod(method, args = []) {
    const _this = this;

    this.batchedUpdates(() => {
      invokeWithGuardAndReThrow( _this.publicInstance[method], _this.publicInstance, ...args);
    });
  },
  onPageScroll(...args) {
    this.executeUserMethod('onPageScroll', args);
  },
  onReachBottom(...args) {
    this.executeUserMethod('onReachBottom', args);
  },
  batchedUpdates(fn) {
    if (this.isBatching) {
      return fn();
    }
    this.isBatching = true;
    try {
      fn();
    } finally {
      this.isBatching = false;
    }
    this.flushData();
  },
  onRenderEvent(name, ...args) {
    const { publicInstance } = this;

    if (!publicInstance[name]) {
      console.warn(`${this.getPagePath()}: can not find event handle method: ${name}`);
      return;
    }

    this.executeUserMethod(name, args);
  },
  setRemoteData(data, { complete } = {}) {
    this.pendingData.push(data);
    if (complete) {
      this.pendingCallbacks.push(complete);
    }
    if (this.isBatching) {
      // do nothing
    } else {
      this.flushData();
    }
  },
  flushData() {
    if (this.unloaded || !this.pendingData.length) {
      return;
    }
    const { pendingData, componentInstances, pendingCallbacks } = this;

    this.pendingData = [];
    this.pendingCallbacks = [];
    // prevent invalid json pass through
    this.callRemote('self', 'receiveData', pendingData, () => {
      pendingCallbacks.forEach((fn) => {
        return fn();
      });
    });
  },
};
