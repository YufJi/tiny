/*
 * @Author: YufJ
 * @Date: 2021-07-11 14:02:38
 * @LastEditTime: 2021-07-11 14:03:17
 * @Description:
 * @FilePath: /tiny-v1/packages/base2.0/src/framework/webview/api/index.js
 */
/*
 * @Author: YufJ
 * @Date: 2021-07-09 15:46:44
 * @LastEditTime: 2021-07-11 14:01:51
 * @Description:
 * @FilePath: /tiny-v1/packages/base2.0/src/framework/webview/JSCoreEvent.js
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
