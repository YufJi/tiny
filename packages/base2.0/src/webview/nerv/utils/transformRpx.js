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

export default function transformRpx(str) {
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
