/*
 * @Author: YufJ
 * @Date: 2021-07-11 14:02:38
 * @LastEditTime: 2021-08-13 12:23:24
 * @Description:
 * @FilePath: /tiny-v1/packages/base2.0/src/framework/webview/api/index.js
 */
import { isNil } from 'lodash';
import { tryCatch } from '../util';

export function onComponentDataChange(bridge, componentHub) {
  bridge.replyService('componentDataChange')(
    tryCatch('COMPONENT_DATA_CHANGE', async (e) => {
      componentHub.events.dispatch('componentDataChange', e);
    }),
  );
}

export function onTriggerComponentEvent(bridge, componentHub) {
  bridge.replyService('triggerComponentEvent')(
    tryCatch('TRIGGER_COMPONENT_EVENT', async (e) => {
      const { eventDetail, eventName, eventOption, nodeId } = e;
      const component = componentHub.instances.get(nodeId);

      component && triggerCustomEvent(component, eventName, eventDetail, eventOption);
    }),
  );
}

function triggerCustomEvent(component, eventName, detail, option) {
  const { bubbles, composed } = option;

  const event = new Event(eventName, {
    bubbles,
    composed,
  });

  event.detail = detail;

  component.dispatchEvent(event);
}

export function onRequestComponentObserver(bridge, componentHub, emitter, root) {
  const { subscribe, publish } = bridge;

  initTriggerListener(emitter);

  subscribe('requestComponentObserver', tryCatch('COMPONENT_OBSERVER', (e) => {
    const { req, reqId } = e;
    const { type } = req;

    if (type === 'addIntersectionObserver') {
      const { nodeId, ...rest } = req;
      const observerId = requestObserver(nodeId ? componentHub.get(nodeId) : root, rest, (info) => {
        publish('responseComponentObserver', {
          reqId,
          res: { info },
        });
      });

      publish('responseComponentObserver', {
        reqId,
        res: { observerId },
      });
    } else if (type === 'removeIntersectionObserver') {
      const { observerId } = req;
      observerId && removeObserver(observerId);

      publish('responseComponentObserver', { reqId, reqEnd: true });
    }
  }));
}

export function onSelectComponentInPage(bridge, root) {
  bridge.replyService('selectComponentInPage')(
    tryCatch('SELECT_ALL_COMPONENT', async (e) => {
      const { selector, single } = e;

      return selectComponent(root, { single, selector });
    }),
  );
}

export function onSelectComponent(bridge, componentHub) {
  bridge.replyService('selectComponent')(
    tryCatch('SELECT_COMPONENT', async (e) => {
      const { selector, single, nodeId } = e.selector;
      const component = componentHub.instances.get(nodeId);

      return isNil(component) ? [] : selectComponent(component, { single, selector });
    }),
  );
}

export function onPageScrollTo(bridge) {
  bridge.replyService('pageScrollTo')(async (e) => {
    const { duration, scrollTop } = e;
    await pageScrollTo(duration, scrollTop);
    return { errMsg: 'pageScrollTo:ok' };
  });
}

export function onDisableScroll(bridge) {
  disableScroll(bridge.subscribe, bridge.invokeNative);
}

// 这个事件没啥用
export function onAppLoadStatusChange(bridge) {
  bridge.onNative('onLoadApp', (e) => {
    // console.info('[framework] onLoadApp', e);
  });
}

function disableScroll(subscribe, invokeNative) {
  let disable = false;

  document.addEventListener('touchmove', (e) => {
    disable && e.preventDefault();
  });

  subscribe('disable-scroll', (e) => {
    invokeNative('disableScrollBounce', { disable: e.disable });
    disable = e.disable;
  });
}

export function enableScroll(config, fields) {
  const { enablePageScroll, enablePullUpRefresh, onReachBottomDistance } = config;

  const { root, bridge } = fields;
  const { publish } = bridge;

  const enable = enablePageScroll || enablePullUpRefresh;

  if (enable) {
    window.onscroll = function () {
      enablePageScroll && publish('PAGE_EVENT', {
        type: 'onPageScroll',
        data: { scrollTop: window.pageYOffset },
        nodeId: 0,
      });

      enablePullUpRefresh && checkScroll(onReachBottomDistance, root) && triggerPullUpRefresh(publish);
    };
  }

  enablePullUpRefresh && trackDOMTouches(onReachBottomDistance, bridge);
}
