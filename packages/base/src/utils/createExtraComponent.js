
import React from 'react';
import createReactClass from 'create-react-class';
import { createComponent } from '../framework/dev';
import callInternalAPI from './callInternalAPI';
import objectKeys from './objectKeys';
import loadScript from './loadScript';
import upperFirstChar from './upperFirstChar';
import endsWith from './endsWith';

const g = self;
const loadComponents = {};
function loadExtraComponent(extraComponentName, appId, callback, props) {
  let info = loadComponents[appId];
  if (info) {
    if (info.done) {
      callback();
      return;
    }
    info.queue.push(callback);
    return;
  }
  info = loadComponents[appId] = {
    done: false,
    queue: [callback],
  };

  let times = 0;

  const fn = function fn() {
    return callInternalAPI('addPkgRes', {
      resAppId: appId,
    }, (res) => {
      let componentFound = false;
      if (res && res.urls) {
        res.urls.forEach((item) => {
          if (endsWith(item, 'index.js') && !componentFound) {
            // 避免同一个离线包里有多个index.js
            componentFound = true;
            loadScript(item, () => {
              if (window[extraComponentName]) {
                info.done = true;
                info.queue.forEach((c) => {
                  return c();
                });
                info.queue = [];
              }
            });
          }
        });
      } else {
        // 加载可能失败，重试5次，如果还失败，则抛出错误
        if (times < 5) {
          times++;
          fn();
        } else if (props.onError) {
          props.onError(props.$mp.getNormalizedEvent('error', {
            detail: {
              error: 0,
              errorMessage: '组件加载失败',
            },
          }));
        }
      }
    });
  };
  fn();
}

export default function createExtraComponent(componentName, appId) {
  const displayName = componentName.split('-').map((item) => {
    return upperFirstChar(item);
  }).join('');

  return createComponent({
    name: componentName,
  })(createReactClass({
    displayName,
    getInitialState: function getInitialState() {
      this.extraComponentLoaded = false;
      return {};
    },
    componentDidMount: function componentDidMount() {
      const _this = this;

      loadExtraComponent(`MP${displayName}`, appId, () => {
        _this.renderExtraComponent('mount');
        _this.extraComponentLoaded = true;
        if (_this.needExcuteUpdate) {
          _this.renderExtraComponent('update');
        }
      }, this.props);
    },
    componentDidUpdate: function componentDidUpdate() {
      if (this.extraComponentLoaded) {
        this.renderExtraComponent('update');
        this.needExcuteUpdate = false;
      } else {
        this.needExcuteUpdate = true;
      }
    },
    componentWillUnmount: function componentWillUnmount() {
      if (this.componentInstance && this.componentInstance.destroy) {
        this.componentInstance.destroy();
      }
    },
    renderExtraComponent: function renderExtraComponent(type) {
      if (!g[`MP${displayName}`]) {
        return;
      }
      if (type === 'mount') {
        this.componentInstance = new g[`MP${displayName}`](this.root, this.getNeedPassProps(g[`MP${displayName}`]));
      } else if (type === 'update') {
        if (this.componentInstance && this.componentInstance.update) {
          this.componentInstance.update(this.getNeedPassProps(g[`MP${displayName}`]));
        }
      }
    },
    getNeedPassProps: function getNeedPassProps(extraComponent) {
      const _this2 = this;

      const needPassProps = {};
      objectKeys(extraComponent.canIUse).forEach((propName) => {
        if (_this2.props[propName] !== undefined) {
          if (propName.indexOf('on') === 0) {
            let eventName = propName.slice(2);
            eventName = eventName.charAt(0).toLowerCase() + eventName.slice(1);
            needPassProps[propName] = function (e) {
              _this2.props[propName](_this2.props.$mp.getNormalizedEvent(eventName, {
                detail: e,
              }));
            };
          } else {
            needPassProps[propName] = _this2.props[propName];
          }
        }
      });
      return needPassProps;
    },
    render: function render() {
      const _this3 = this;
      const { id, style, className } = this.props;

      return (
        <div className={className} ref={(root) => _this3.root = root} id={id} style={style} />
      );
    },
  }));
}
