import { isFunction, get } from 'lodash';
import { pageModels, componentModels, resetUserInteraction, setUserInteraction } from '../context';
import { warn, wrapUserFunction } from '../utils';

export default function handlePageEvent({ nodeId, type, data }, webviewId) {
  const page = get(pageModels, webviewId);

  if (!page) {
    console.warn(`Page(${webviewId}) not found`);
    return;
  }

  const instance = nodeId ? get(componentModels, [webviewId, nodeId]) : page;

  if (!instance) {
    // 这里之所以是 warn 是因为 component 可能存在延迟查询的情况
    // component 不存在不一定是异常，因此不抛错只是 warn 提示
    console.warn(`Cannot get Component with ${webviewId}, ${nodeId}`);
    return;
  }

  const userCallback = get(instance, type);

  if (isFunction(userCallback)) {
    setUserInteraction(data.type);
    const result = wrapUserFunction(`at ${instance.is} ${data.type} event`, userCallback).call(instance, data);
    resetUserInteraction();
    return result;
  } else {
    // 用户警告
    warn(`Do not have ${type} handler in current instance: ${instance.is}. Please make sure that ${type} handler has been defined.`);
  }
}
