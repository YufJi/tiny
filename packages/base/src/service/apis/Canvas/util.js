import { guid } from 'shared';
import { subscribe, publish } from '../../bridge';
import { invokeMethod } from '../util';

export const canvasStore = {};
export const actionsCache = {};

export function callDraw({ canvasId, webviewId, actions, reserve, callback }) {
  const randid = guid();
  publish(`canvas${canvasId}Draw`, {
    actions,
    reserve,
    randid,
  }, [webviewId]);

  subscribe(`canvas${canvasId}DrawDone${randid}`, () => {
    callback();
  });
}

export function getBase64Data(param) {
  publish(`canvas${param.canvasId}ToBase64`, param, [param.webviewId]);
  subscribe(`canvas${param.canvasId}ToBase64Done`, (res) => {
    invokeMethod('base64ToTempFilePath', { base64Data: res.dataUrl, ...param }, {
      beforeAll(res) {
        res.errMsg = res.errMsg.replace('base64ToTempFilePath', 'canvasToTempFilePath');
      },
    });
  });
}

export function deepcopy(variable) {
  if (Array.isArray(variable)) {
    const res = [];
    variable.forEach((item) => {
      res.push(deepcopy(item));
    });
    return res;
  }

  if (typeof variable === 'object') {
    const reso = {};

    for (const i in variable) {
      reso[i] = deepcopy(variable[i]);
    }

    return reso;
  }

  return variable;
}

export function trans2ValidFont(font) {
  if (typeof font !== 'string') {
    return null;
  }

  font = font.trim(); // 预期支持的字体格式
  // 经典格式: italic small-caps bold 16px sans-serif, serif[, ...]

  const reg = /^((?:(?:italic|small-caps|bold)\s+)*)([+\-]?\d+\.?\d*)px\s+((?:[\w\-]+(?:\s*,\s*)?)+)$/;
  const result = reg.exec(font);

  if (!result) {
    return null;
  }
  // 捕获分组1：字体变化(Array)
  // 捕获分组2：字号(number)
  // 捕获分组3：字体集合(Array)
  const fontVariant = result[1].split(/\s+/).filter((item) => {
    return item;
  });
  const fontSize = Math.max(+result[2], 0);
  const fontFamily = result[3].split(/\s*,\s*/).filter((item) => {
    return item;
  }); // 组装font value

  const value = `${fontVariant.join(' ')} ${fontSize}px ${fontFamily.join(', ')}`;
  return {
    value,
    fontSize,
    fontFamily,
  };
}

export class Gradient {
  constructor(type, data) {
    this.type = type;
    this.data = data;
    this.colorStop = [];
  }

  addColorStop(e, color) {
    this.colorStop.push([e, color]);
  }
}

export function infix(webviewId, canvasId) {
  return `${webviewId}_cvs_${canvasId}`;
}
