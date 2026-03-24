import { createLogger } from '@tiny/utils';

const logger = createLogger('call-native');

let handlderId = 0;
const handlers: Map<number, (data: any) => void> = new Map();

/**
 * call 用于调用原生方法，method 是原生方法的名称，params 是传递给原生方法的参数对象。
 */
export function call<T>(method: string, params: NativeCallParams = {}) {
  const id = ++handlderId;

  const response: T = native.call(id, method, params);
  logger.debug(`Called native method ${method} with params`, params, `and got response`, response);

  // 这里假设 native.call 是一个同步调用，并且会返回一个结果。如果 native.call 是异步的，那么你需要在原生端调用 callNativeHandler 来传递结果回 JavaScript。
  if (response) {
    return response;
  }

  return new Promise((resolve: (data: T) => void) => {
    handlers.set(id, resolve);
  });
}

/**
 * nativeCallHandler 是供原生调用的函数，id 是调用的唯一标识，data 是原生传递的数据对象。
 */
export function nativeCallHandler<T>(id: number, data: T) {
  const handler = handlers.get(id);
  if (!handler) {
    logger.warn(`No handler found for id ${id}`);
    return;
  }

  handler(data);
  handlers.delete(id);
}
