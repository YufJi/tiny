/*
 * @Author: YufJ
 * @Date: 2021-07-09 15:11:41
 * @LastEditTime: 2021-07-14 20:11:22
 * @Description:
 * @FilePath: /tiny-v1/packages/base2.0/src/framework/webview/util.js
 */

import { isFunction, wrap, noop, kebabCase, hasIn, isPlainObject, isObject, camelCase } from 'lodash';
import { getType } from 'utils';

export function tryCatch(method, callback, context) {
  return isFunction(callback)
    ? wrap(callback, (fn, ...args) => {
      try {
        return fn.apply(context || fn, args);
      } catch (error) {
        console.error(`[WEBVIEW_ERROR] at ${method}: \n${error.message}`);
      }
    })
    : noop;
}

export function getRealRoute(relative = '', path = '') {
  if (path.indexOf('/') === 0) {
    return path.substr(1);
  }

  if (path.indexOf('./') === 0) {
    return getRealRoute(relative, path.substr(2));
  }

  let count = 0;
  const pathParts = path.split('/');

  for (let i = 0; i < pathParts.length; i++) {
    if (pathParts[i] === '..') {
      count++;
    } else {
      break;
    }
  }

  pathParts.splice(0, count);

  const relativeParts = relative.length > 0 ? relative.split('/') : [];

  relativeParts.splice(relativeParts.length - count - 1, count + 1);

  return relativeParts.concat(pathParts).join('/');
}

const blackPropList = ['$scopedSlots'];

export function normalizeProps(props, properties) {
  const obj = {};
  for (let i = 0; i < Object.entries(properties).length; i+=1) {
    const [key, value] = Object.entries(properties)[i];
    // eslint-disable-next-line no-continue
    if (blackPropList.indexOf(key) !== -1) continue;
    // eslint-disable-next-line no-loop-func
    [key, kebabCase(key)].forEach((k) => {
      if (hasIn(props, k)) {
        obj[key] = normalizeValue(value.type, props[k]);
      }
    });
  }

  return obj;
}

const ValidateStrategy = {
  string(o) {
    return isPlainObject(o) ? '[object Object]' : o ? String(o) : '';
  },
  number(o) {
    return isNaN(Number(o)) ? 0 : Number(o);
  },
  object(o) {
    return Array.isArray(o) ? o : isObject(o) ? {} : null;
  },
  boolean(o) {
    return !!o;
  },
  array(o) {
    return [];
  },
  null(o) {
    return o;
  },
};

export function normalizeValue(type, value) {
  let n; let r;
  return getType(value) === type
    ? value
    : ValidateStrategy[type] && ValidateStrategy[type].call(ValidateStrategy, value) || null;
}

export function filterDataset(props) {
  const o = {};

  for (let i = 0; i < Object.entries(props).length; i+=1) {
    const [key, value] = Object.entries(props)[i];
    const words = key.split('-');
    const prefix = words[0];
    const k = words.slice(1);

    if (prefix === 'data' && k.length > 0) {
      o[camelCase(k)] = value;
    }
  }

  return o;
}

export function isShadowRoot(e) {
  return !e || e._type_ && e._type_.startsWith('SHADOW_ROOT');
}

export function isSlot(e) {
  return e.id === '__slot__';
}

export function getShadowRootId(e) {
  return e._nodeId_;
}

export function getComponentConfig(e) {
  return e._config_;
}

export function getParent(e) {
  let t = e.parentElement;
  if (!t || isShadowRoot(t)) return null;

  if (isSlot(t)) {
    for (; t && !isShadowRoot(t); ) {
      var n;
      t = (n = t) == null ? void 0 : n.parentElement;
    }
    return t;
  }
  return t;
}
