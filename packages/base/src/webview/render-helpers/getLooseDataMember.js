import { noop } from 'lodash';

function danger(ret) {
  // eslint-disable-next-line no-eval
  if (ret === Function || ret === eval) {
    return true;
  }
  return false;
}

export default function (fullArgs, isFunction) {
  const args = fullArgs.slice(1);
  let ret = fullArgs[0];
  let lastArg;
  for (let i = 0; i < args.length; i+=1) {
    if (danger(ret)) {
      return noop;
    }
    /* eslint eqeqeq:0 */
    if (ret == null) {
      break;
    }
    lastArg = ret;
    ret = ret[args[i]];
  }
  if (isFunction) {
    if (typeof ret !== 'function' || danger(ret)) {
      return noop;
    }
    return ret.bind(lastArg);
  }
  if (danger(ret)) {
    return noop;
  }
  return ret;
}
