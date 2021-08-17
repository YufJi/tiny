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
    tryCatch('COMPONENT_DATA_CHANGE', (e) => {
      componentHub.events.dispatch('componentDataChange', e);
    }),
  );
}

export function onTriggerComponentEvent(bridge, componentHub) {
  bridge.replyService('triggerComponentEvent')(
    tryCatch('TRIGGER_COMPONENT_EVENT', (e) => {
      const { eventDetail, eventName, eventOption, nodeId } = e;
      const component = componentHub.instances.get(nodeId);

      component && triggerCustomEvent(component, eventName, eventDetail, eventOption);
    }),
  );
}

function triggerCustomEvent(e, t, n, r) {
  const i = r.bubbles;
  const o = r.composed;
  let a = dispatchEvent$1(t, n, computeComposedTarget(e, [], o), e);
  if (a && i) {
    for (let s = [e], l = e; a && (l = bubblesGetNextNode(l, o)); ) {
      a = dispatchEvent$1(t, n, computeComposedTarget(l, s, o), l);
    }
  }
}

function dispatchEvent$1(e, t, n, r) {
  let i;
  let o;
  let a;
  let s;
  let l;
  const c = e.charAt(0).toLowerCase() + e.slice(1);
  const u = (i = r._listeners) == null ? void 0 : i[c];
  if (!u) return !0;
  let d = !0;
  u.options.stop && (d = !1);
  const p = {
    type: e,
    timeStamp: Date.now(),
    target: {
      id: (o = n.id) != null ? o : '',
      dataset: (a = n._dataset) != null ? a : {},
    },
    currentTarget: {
      id: (s = r.id) != null ? s : '',
      dataset: (l = r._dataset) != null ? l : {},
    },
    detail: t,
  };
  return u.handler(p), d;
}

function bubblesGetNextNode(e, t) {
  const n = e.parentElement;
  if (!n) return null;
  if (!t) {
    if (isSlot(n)) {
      for (var r = n; r && !isShadowRoot(r); ) r = r.parentElement;
      return r;
    }
    if (isShadowRoot(n)) return null;
  }
  return n;
}
function computeComposedTarget(e, t, n) {
  return (
    t.length === 0 && t.push(e),
    n
      && (isSlot(e)
        ? t.push(e)
        : isShadowRoot(e)
          && t.length > 0
          && (t.pop(), t.length === 0 && t.push(e))),
    t[t.length - 1]
  );
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
    tryCatch('SELECT_ALL_COMPONENT', (e) => {
      const { selector, single } = e;

      return selectComponent(root, { single, selector });
    }),
  );
}

export function onSelectComponent(bridge, componentHub) {
  bridge.replyService('selectComponent')(
    tryCatch('SELECT_COMPONENT', (e) => {
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

export function onAppLoadStatusChange(bridge) {
  bridge.onNative('onLoadApp', (e) => {
    console.log(e.result);
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
