function noop() {}

const PREFIX = '$sjs_';
const messageReg = new RegExp(PREFIX, 'g');
const stackReg = new RegExp(`\\s${PREFIX}`, 'g');
const SJS_FUNC = 1;

function startsWithPrefix(str) {
  return str.lastIndexOf(PREFIX, 0) === 0;
}

function is(target, type) {
  return Object.prototype.toString.call(target) === `[object ${type}]`;
}

export function prefix(target, p = true, r) {
  if (!target) {
    return target;
  }
  const { constructor } = target;

  if (is(target, 'String') || is(target, 'Boolean') || is(target, 'Number')) {
    return target;
  }
  if (is(target, 'Object')) {
    const ret = {};
    for (let k in target) {
      if (target.hasOwnProperty(k)) {
        const v = prefix(target[k], p, r);
        if (p) {
          if (!startsWithPrefix(k)) {
            k = PREFIX + k;
          }
          ret[k] = v;
        } else {
          if (startsWithPrefix(k)) {
            k = k.slice(PREFIX.length);
          }
          ret[k] = v;
        }
      }
    }
    return ret;
  } else if (Array.isArray(target)) {
    const _ret = [];
    for (let i = 0; i < target.length; i+=1) {
      _ret.push(prefix(target[i], p, r));
    }
    return _ret;
  } else if (is(target, 'Date')) {
    const _ret2 = new Date();
    _ret2.setTime(target.getTime());
    return _ret2;
  } else if (is(target, 'RegExp')) {
    let f = '';
    if (target.global) {
      f += 'g';
    }
    if (target.ignoreCase) {
      f += 'i';
    }
    if (target.multiline) {
      f += 'm';
    }
    return new RegExp(target.source, f);
  } else if (is(target, 'Function')) {
    if (r === SJS_FUNC) return target;
  }
  return null;
}

export default function (fullArgs, isFunction) {
  const args = fullArgs.slice(1);
  let ret = fullArgs[0];
  let lastArg = void 0;
  for (let i = 0; i < args.length; i++) {
    /* eslint eqeqeq:0 */
    if (ret == null) {
      break;
    }
    lastArg = ret;
    let key = args[i];
    if (typeof key === 'string') {
      key = PREFIX + key;
    }
    ret = ret[key];
  }
  if (isFunction) {
    if (typeof ret !== 'function') {
      return noop;
    }
    return function (...runArgs) {
      runArgs = runArgs.map((arg) => {
        return prefix(arg);
      });
      try {
        return prefix(ret.apply(lastArg, runArgs), false);
      } catch (e) {
        e.message = e.message.replace(messageReg, '');
        e.stack = e.stack.substring(0, e.stack.indexOf('\n', e.stack.lastIndexOf(`at ${PREFIX}`)));
        e.stack = e.stack.replace(stackReg, ' ');
        throw e;
      }
    };
  }
  /** TIPS: SJS handler 不支持axml中调用函数返回函数的场景
   * 若用户调用了在 sjs 内的一个函数，然后这个函数返回了一个函数。
   * 这个时候这个返回值（函数）不能作为 SJS 事件handler。
   * 虽然类型也是函数，但是会在上面直接判掉
   */
  if (typeof ret === 'function') {
    ret.sjs = true;
    ret.prefix = prefix;
    return ret;
  }
  return prefix(ret, false);
}
