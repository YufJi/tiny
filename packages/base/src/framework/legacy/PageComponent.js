import Nerv, { createNervClass } from '@/nerv';
import { publish } from '@/bridge';
import addEvents from '@/utils/addEvents';
import {
  PendingKeyType,
  PendingKeyId,
  PendingKeyData,
  PendingKeyOp,
  PendingValuePage,
  PendingValueComponent,
  OpSet,
} from '@/utils/consts';
import objectKeys from '@/utils/objectKeys';
import { getOpFn } from '@/utils/setData';
import { debug } from '@/utils/log';
import { elementPrefix } from '@/utils/config';
import { getNormalizedEvent } from '@/utils/addListenerToElement';
import BasicEventMixin from '../mixins/BasicEventMixin';
import MessageHandleMixin from '../mixins/MessageHandleMixin';
import RefMixin from '../mixins/RefMixin';
import { setCurrentPageImpl } from '../App';
import EventHub from '../EventHub';
import $global from '../common/global';
import { rpx2px } from '../utils/unit';
import Platform from '../Platform';

const styleSheetCaches = {};
function getStyleSheet(pagePath) {
  if (pagePath in styleSheetCaches) {
    return styleSheetCaches[pagePath];
  }
  const setupConfig = $global.pagesConfig[pagePath].system;
  let _stylesheet = setupConfig.stylesheet;

  if (_stylesheet) {
    _stylesheet = _stylesheet();
  }
  const stylesheet = _stylesheet && (_stylesheet.default || _stylesheet);
  styleSheetCaches[pagePath] = stylesheet;
  return stylesheet;
}

const renderCache = {};
function getRender(pagePath) {
  if (pagePath in renderCache) {
    return renderCache[pagePath];
  }
  const setupConfig = $global.pagesConfig[pagePath].system;
  const _render = setupConfig.render;
  // lazy require xml and css
  let render = _render();
  render = render.default || render;
  renderCache[pagePath] = render;
  return render;
}

export default createNervClass({
  $isCustomComponent: false,
  displayName: 'PageComponent',
  mixins: [
    MessageHandleMixin,
    RefMixin,
  ],
  getInitialState() {
    const { id, publicInstance, customComponents, isRefresh, pagePath } = this.props;

    this.setId(id);
    this.publicInstance = publicInstance;
    this.customComponents = customComponents;
    this.pagePath = pagePath;
    this.pageType = 'RENDER';
    this.eventHandlers = {};
    this.componentInstances = {};
    this.self = this;

    setCurrentPageImpl(this);

    if (publicInstance.onReachBottom || publicInstance.onPageScroll) {
      addEvents(window, {
        scroll: this.checkScroll,
      });
    }

    return {
      ...(publicInstance.data || {}),
    };
  },
  componentDidMount() {
    this.insertStyle();
    this.initMessageChannel();

    Object.assign(this, {
      bridge: $global.bridge,
      renderSeq: 1,
    });

    const e = { page: this };

    EventHub.emit('pageLoad', e);
    this.callRemote('self', 'load');
  },
  UNSAFE_componentWillUpdate() {
    this.renderSeq+=1;
  },
  insertStyle() {
    const headNode = document.getElementsByTagName('head')[0];
    // special for 1rpx or 2rpx
    const remReg = rpx2px(2) < 1 ? /\b0\.0[12]rem/g : rpx2px(1) < 1 ? /\b0\.01rem/g : null;
    const replacer = Platform.browser === 'ios' ? '0.5px' : '1px';

    const stylesheet = getStyleSheet(this.pagePath);
    if (stylesheet) {
      const styleNode = document.createElement('style');
      let styleString = stylesheet.toString();
      if (remReg) {
        styleString = styleString.replace(remReg, replacer);
      }
      styleNode.innerHTML = styleString;
      headNode.appendChild(styleNode);
    }
  },
  /* load完成 准备ready */
  onRenderPageLoad() {
    setTimeout(() => {
      debug('framework', `[RENDER] Page ${this.pagePath} onLoaded`);
      EventHub.emit('pageLoaded');

      const e = { page: this };
      EventHub.emit('pageReady', e);
      this.callRemote('self', 'ready', e.payload);
      this.loaded = true;
    });
  },
  onComponentAttached(componentId) {
    const fn = () => {
      const component = this.componentInstances[componentId];
      if (component) {
        component.onAttachedReady();
      }
    };

    if (this.loaded) {
      fn();
    } else {
      EventHub.on('pageLoaded', fn);
    }
  },
  checkScroll() {
    const onReachBottomDistance = 50;
    const { innerHeight, pageYOffset } = window;
    const { scrollHeight } = document.body;

    if (this.publicInstance.onPageScroll) {
      this.callRemote('self', 'onPageScroll', {
        scrollTop: pageYOffset,
        scrollHeight,
      });
    }
    if (this.publicInstance.onReachBottom && pageYOffset > 0) {
      const closeBottom = scrollHeight - (innerHeight + pageYOffset) <= onReachBottomDistance;
      if (closeBottom) {
        if (!this.shouldNotFireOnReachBottom) {
          this.shouldNotFireOnReachBottom = true;
          this.callRemote('self', 'onReachBottom');
        }
      } else {
        this.shouldNotFireOnReachBottom = false;
      }
    }
  },
  $getEventHandler(name) {
    const _this = this;

    if (!name || typeof name !== 'string') {
      return name;
    }
    if (!this.eventHandlers[name]) {
      this.eventHandlers[name] = function (e, ...args) {
        let event = {};
        if (e instanceof CustomEvent) {
          event = getNormalizedEvent(e);
        } else {
          event = e;
        }

        publish('onRenderPageEvent', {
          method: name,
          args: [event, ...args],
        });
      };
      const handle = this.eventHandlers[name];
      handle.handleName = name;
      handle.type = 'page';
      handle.id = this.id;
    }
    return this.eventHandlers[name];
  },
  /* 接受worker消息触发 */
  triggerComponentCustomEvent(componentId, eventName, detail, options) {
    const component = this.componentInstances[componentId];
    if (component) {
      component.triggerEvent(eventName, detail, options);
    }
  },
  receiveData(toBeData, callback) {
    const _this = this;

    if (!toBeData.length) {
      return callback();
    }
    const pageData = [];
    const { componentInstances } = this;

    const componentsData = {};
    toBeData.forEach((toData) => {
      const type = toData[PendingKeyType];
      const data = toData[PendingKeyData];
      const id = toData[PendingKeyId];
      const op = toData[PendingKeyOp] || OpSet;
      if (type === PendingValuePage) {
        pageData.push({ data, op });
      } else if (type === PendingValueComponent && componentInstances[id]) {
        componentsData[id] = componentsData[id] || [];
        componentsData[id].push({ data, op });
      }
    });
    const doIt = () => {
      const count = objectKeys(componentsData).length + (pageData.length ? 1 : 0);
      let c = 0;
      const now = Date.now();
      const unmountedChecked = objectKeys(componentsData);
      const allKeys = unmountedChecked.concat();
      const pageComponent = _this;
      function done() {
        if (c < 0) {
          return;
        }
        const doneComponent = this;
        if (doneComponent === pageComponent) {
          ++c;
        }
        for (let l = unmountedChecked.length - 1; l >= 0; l--) {
          const id = unmountedChecked[l];
          const currentComponent = componentInstances[id];
          if (!currentComponent || currentComponent === doneComponent) {
            ++c;
            unmountedChecked.splice(l, 1);
          }
        }
        if (c === count) {
          c = -1;
          pageComponent.onPageUpdate(now, callback);
        }
      }
      allKeys.forEach((id) => {
        // if unmounted, will not trigger setState callback
        componentInstances[id].setData(componentsData[id], done);
      });
      if (pageData.length) {
        _this.setData(pageData, done);
      }
    };

    doIt();
  },
  onPageUpdate(now, callback) {
    this.logRenderTime(now);
    const e = { page: this };
    EventHub.emit('pageUpdate', e);
    if (e.payload) {
      this.callRemote('self', 'update', e.payload);
    }
    if (callback) {
      callback();
    }
  },
  setData(toBeData, callback) {
    let ret = this.state;
    toBeData.forEach((d) => {
      // immutable for shouldComponentUpdate
      ret = getOpFn(d.op)(ret, d.data);
    });

    this.setState({
      ...ret,
    }, callback);
  },
  initMessageChannel: function initMessageChannel() {
    const { messageChannel } = this.props;
    messageChannel.onMessage(this.onMessage);
  },
  postMessage(data) {
    debug('framework', `[RENDER] Page ${this.pagePath} postMessage`, data);
    const { messageChannel } = this.props;
    messageChannel.postMessage({
      ...data,
      pageType: this.pageType,
      msgType: 'endpoint',
    });
  },
  logRenderTime(now) {
    debug('framework', `render ${this.pagePath} costs ${Date.now() - now}ms.`);
  },
  saveRoot(ref) {
    this.root = ref;
  },
  render() {
    const { ...data } = this.state;

    return Nerv.createElement(`${elementPrefix}-page`, {
      ref: this.saveRoot,
    }, getRender(this.pagePath).call(this, data));
  },
});
