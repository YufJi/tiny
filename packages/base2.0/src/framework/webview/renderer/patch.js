/*
 * @Author: YufJ
 * @Date: 2021-07-19 01:21:19
 * @LastEditTime: 2021-07-19 01:56:13
 * @Description: 
 * @FilePath: /react-demo1/src/renderer/patch.js
 */

import { attachEvent, detachEvent } from "./event";
import { isNil, isNumber, isString, isFunction, isAttrAnEvent } from "./util";

export function patchProps(domEle, newProps, oldProps) {
  for (const prop in oldProps) {
    const oldValue = oldProps[prop];
    const newValue = newProps[prop]
    
    // 删除
    if (isNil(newValue) && !isNil(oldValue)) {
      if (isAttrAnEvent(prop)) {
        detachEvent(domEle, prop, oldValue);
      } else if (prop === 'dangerouslySetInnerHTML') {
        domEle.textContent = '';
      } else if (prop === 'className' || prop === 'class') {
        domEle.removeAttribute('class');
      } else {
        domEle.removeAttribute(prop);
      }
    }
  }

  for (const prop in newProps) {
    patchProp(
      domEle,
      prop,
      oldProps && oldProps[prop],
      newProps[prop],
    );
  }
}

export function patchProp(domEle, prop, oldValue, newValue) {
  // fix the value update for textarea/input
  if (oldValue !== newValue) {
    if (prop === 'className') {
      prop = 'class';
    }

    if (prop === 'children') {
      if (typeof newValue === 'string' || typeof newValue === 'number') {
        domEle.textContent = newValue;
      }
    } else if (prop === 'class') {
      domEle.className = newValue;
    } else if (prop === 'dangerouslySetInnerHTML') {
      const lastHtml = oldValue && oldValue.__html;
      const nextHtml = newValue && newValue.__html;

      if (lastHtml !== nextHtml) {
        if (!isNil(nextHtml)) {
          domEle.innerHTML = nextHtml;
        }
      }
    } else if (isAttrAnEvent(prop)) {
      patchEvent(prop, oldValue, newValue, domEle);
    } else if (prop === 'style') {
      patchStyle(oldValue, newValue, domEle);
    } else if (isNil(newValue) || newValue === false) {
      domEle.removeAttribute(prop);
    } else if (!isFunction(newValue)) {
      domEle.setAttribute(prop, newValue);
    }
  }
}

const IS_NON_DIMENSIONAL = /acit|ex(?:s|g|n|p|$)|rph|ows|mnc|ntw|ine[ch]|zoo|^ord/i;

function setStyle(domStyle, style, value) {
  if (isNil(value) || (isNumber(value) && isNaN(value))) {
    domStyle[style] = '';
    return;
  }
  if (style === 'float') {
    domStyle.cssFloat = value;
    domStyle.styleFloat = value;
    return;
  }
  domStyle[style] = !isNumber(value) || IS_NON_DIMENSIONAL.test(style) ? value : `${value}px`;
}

function patchEvent(
  eventName,
  lastEvent,
  nextEvent,
  domEle,
) {
  if (lastEvent !== nextEvent) {
    if (isFunction(lastEvent)) {
      detachEvent(domEle, eventName, lastEvent);
    }
    attachEvent(domEle, eventName, nextEvent);
  }
}

const BASE_DEVICE_WIDTH = 750;
const isIOS = navigator.userAgent.match('iPhone');
const deviceWidth = window.screen.width || 375;
const deviceDPR = window.devicePixelRatio || 2;
const eps = 1e-4;

function rpx2px(number) {
  if (number === 0) {
    return 0;
  }
  number = number / BASE_DEVICE_WIDTH * deviceWidth;
  number = Math.floor(number + eps);
  if (number === 0) {
    if (deviceDPR === 1 || !isIOS) {
      return 1;
    } else {
      return 0.5;
    }
  }
  return number;
}

function transformRpx(str) {
  if (typeof str !== 'string') {
    return str;
  }
  let state = 0;
  let res = '';
  let number = '';
  for (let i = 0, l = str.length; i < l; i++) {
    const char = str[i];
    if (/[\d.]/.test(char) && i < l - 1 && state !== 2) {
      state = 3;
      number += char;
      continue;
    } else if (state === 1) {
      if (char === '\n' || char === '\r' || char === ' ' && res.slice(-1) === ' ') {
        continue;
      }
      if (char === '(' && res.endsWith('url')) {
        state = 2;
      }
      if (char === ';') {
        state = 0;
      }
      res += char;
    } else if (state === 2) {
      if (char === ')') {
        state = 1;
      }
      res += char;
    } else if (state === 3) {
      if (!/[\d.]/.test(char)) {
        const safeNum = Number(number);
        if (str.slice(i, i + 4).match(/rpx([\s;),}]|$)/) && !isNaN(safeNum)) {
          res += `${rpx2px(safeNum)}px`;
          i += 2;
        } else {
          res += number;
          res += char;
        }
        state = 1;
        number = '';
        continue;
      }
      number += char;
      if (i === l - 1) {
        // 结束了，number还没处理
        res += number;
      }
    } else {
      if (char === ':') {
        state = 1;
      }
      res += char;
    }
  }
  return res;
}

function patchStyle(lastAttrValue, nextAttrValue, dom) {
  const domStyle = dom.style;
  let style;
  let value;

  if (isString(nextAttrValue)) {
    domStyle.cssText = transformRpx(nextAttrValue);
    return;
  }
  if (!isNil(lastAttrValue) && !isString(lastAttrValue)) {
    for (style in nextAttrValue) {
      value = nextAttrValue[style];
      if (value !== lastAttrValue[style]) {
        setStyle(domStyle, style, value);
      }
    }
    for (style in lastAttrValue) {
      if (isNil(nextAttrValue[style])) {
        domStyle[style] = '';
      }
    }
  } else {
    for (style in nextAttrValue) {
      value = nextAttrValue[style];
      setStyle(domStyle, style, value);
    }
  }
}