import ReactDOM from 'react-dom';
import React from 'react';
import createReactClass from 'create-react-class';

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
import MessageHandleMixin from '../mixins/MessageHandleMixin';
import RefMixin from '../mixins/RefMixin';
import { setCurrentPageImpl } from '../App';
import EventHub from '../EventHub';
import { setComponentsConfig } from './CustomComponent';
import $global from '../common/global';
import { rpx2px } from '../utils/unit';
import Platform from '../Platform';

const renderCache = {};
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

const onReachBottomDistance = 50;
const headNode = document.getElementsByTagName('head')[0];
// special for 1rpx or 2rpx
const remReg = rpx2px(2) < 1 ? /\b0\.0[12]rem/g : rpx2px(1) < 1 ? /\b0\.01rem/g : null;
const replacer = Platform.browser === 'ios' ? '0.5px' : '1px';

export default createReactClass({
  $isCustomComponent: false,
  displayName: 'PageComponent',
  mixins: [MessageHandleMixin, RefMixin],
  getInitialState() {
    this.pagePath = this.props.pagePath;
    this.pageType = 'RENDER';
    return {};
  },
  componentDidMount() {
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
    Object.assign(this, {
      bridge: $global.bridge,
      renderSeq: 1,
      eventHandlers: {},
      componentInstances: {},
      self: this,
      publicInstance: {},
    });
    setCurrentPageImpl(this);
    // for IDE and debug
    self.$page = this;
    this.initMessageChannel();
    EventHub.emit('pageLoad', { page: this });
  },
  componentWillUpdate() {
    this.renderSeq+=1;
  },
  logRenderTime(now) {
    this.callRemote('self', 'console', 'log', `framework: render ${this.pagePath} costs ${Date.now() - now}ms.`);
  },
  startRender(remoteConfig) {
    const _this = this;

    const { data, publicInstance = {}, id, isRefresh, componentsConfig } = remoteConfig;

    this.publicInstance = publicInstance;
    setComponentsConfig(componentsConfig);
    this.setId(id);
    const now = Date.now();
    this.setState({
      data,
    }, () => {
      _this.logRenderTime(now);
      const e = { page: _this };
      EventHub.emit('pageReady', e);

      if (isRefresh) {
        if (e.payload) {
          _this.callRemote('self', 'update', e.payload);
        }
      } else {
        _this.callRemote('self', 'ready', e.payload);
      }
      if (publicInstance.onReachBottom || publicInstance.onPageScroll) {
        addEvents(window, {
          scroll: _this.checkScroll,
        });
      }
    });
  },
  checkScroll() {
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
      const handle = this.eventHandlers[name] = function (...args) {
        _this.callRemote.apply( _this, ['self', 'onRenderEvent', name].concat(args));
      };
      handle.handleName = name;
      handle.type = 'page';
      handle.id = this.id;
    }
    return this.eventHandlers[name];
  },
  triggerComponentEvent(componentId, eventName, detail, options) {
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
    const doIt = function doIt() {
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
    if (ReactDOM.unstable_batchedUpdates) {
      ReactDOM.unstable_batchedUpdates(doIt);
    } else {
      doIt();
    }
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
    const { data } = this.state;

    let ret = data;
    toBeData.forEach((d) => {
      // immutable for shouldComponentUpdate
      ret = getOpFn(d.op)(ret, d.data);
    });
    this.setState({ data: ret }, callback);
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
  getRootNode() {
    return this.root;
  },
  saveRoot(root) {
    this.root = root;
  },
  render() {
    const { state } = this;

    if (!state || !state.data) {
      return (
        <div dangerouslySetInnerHTML={{ __html: this.props.container.innerHTML }} />
      );
    }

    // does not need scroll-view like react-native
    // container is scroll-view
    // when prerender, window.innerHeight is accurate when render actually.
    // can not set overflow: hidden, mate7 can not scroll.
    return (
      <React.StrictMode>
        <div className="a-page tiny-page" ref={this.saveRoot}>
          {getRender(this.pagePath).call(this, state.data)}
        </div>
      </React.StrictMode>
    );
  },
});
