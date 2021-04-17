
import { getCurrentPageImpl, getCurrentPagesImpl } from '@/core/framework/App';

export default function callRender(method, params = {}) {
  const { homepage = false, args: innerArgs = [], caller = 'bridge' } = params;

  const pages = getCurrentPagesImpl();
  const page = params.page || (homepage ? pages && pages[0] : getCurrentPageImpl());
  if (!page) {
    console.warn('Can not getCurrentPage for callBridge.worker!', method, params);
    return;
  }
  
  const args = [caller, method].concat(innerArgs);
  let lastArg = args[args.length - 1];
  if (lastArg) {
    if (typeof lastArg === 'object') {
      const { success, fail, complete } = lastArg;

      if (success || fail || complete) {
        args[args.length - 1] = lastArg = { ...lastArg };
        delete lastArg.success;
        delete lastArg.fail;
        delete lastArg.complete;
        args.push((...args) => {
          if (success) {
            success(...args);
          }
          if (complete) {
            complete(...args);
          }
        });
        args.push((...args) => {
          if (fail) {
            fail(...args);
          }
          if (complete) {
            complete(...args);
          }
        });
      }
    } else if (typeof lastArg === 'function') {
      args.push(lastArg);
    }
  }
  page.callRemote.call(page, ...args);
}
