import { noop } from 'lodash';
import { invokeMethod } from '../util';
import { deepcopy, trans2ValidFont, Gradient, infix, canvasStore, actionsCache, callDraw } from './util';

const DEFAULT_FONT_SIZE = 10;
const DEFAULT_FONT_FAMILY = 'sans-serif';
const DEFAULT_FONT_VALUE = `${DEFAULT_FONT_SIZE}px ${DEFAULT_FONT_FAMILY}`;

export default class CanvasContext {
  constructor(canvasId, webviewId) {
    this.actions = [];
    this.canvasId = canvasId;
    this.webviewId = webviewId;
    this.path = [];
    this._font = {
      value: DEFAULT_FONT_VALUE,
      fontSize: DEFAULT_FONT_SIZE,
      fontFamily: [DEFAULT_FONT_FAMILY],
    };
  }

  get font() {
    return this._font.value;
  }

  set font(newFontValue) {
    // 检验字体值合法性
    const fontObj = trans2ValidFont(newFontValue);

    if (!fontObj) {
      return;
    }

    const { value } = fontObj;
    const { fontSize } = fontObj;
    const { fontFamily } = fontObj;

    if (!fontFamily.includes(DEFAULT_FONT_FAMILY)) {
      fontFamily.push(DEFAULT_FONT_FAMILY);
    }

    this._font = {
      value,
      fontSize,
      fontFamily,
    };
    this.actions.push({
      method: 'setFont',
      data: [this._font.value],
    });
  }

  draw(reserve = false, callback = noop) {
    const actions = deepcopy(this.actions);
    this.actions = [];
    this.path = [];
    const options = {
      canvasId: this.canvasId,
      webviewId: this.webviewId,
      actions,
      reserve,
      callback,
    };
    const iid = infix(this.webviewId, this.canvasId);

    if (canvasStore[iid] && Array.isArray(actions)) {
      callDraw(options);
    } else {
      actionsCache[iid] = (actionsCache[iid] || []).concat(options);
    }
  }

  beginPath() {
    this.path = [];
    this.actions.push({
      method: 'beginPath',
    });
  }

  clip() {
    this.actions.push({
      method: 'clip',
      data: deepcopy(this.path),
    });
  }

  lineTo(...args) {
    if (this.path.length > 0) {
      this.path.push({
        method: 'lineTo',
        data: args,
      });
    } else {
      this.path.push({
        method: 'moveTo',
        data: args,
      });
    }
  }

  setFontSize(fontSize) {
    fontSize = +fontSize;

    if (Number.isNaN(fontSize)) {
      return;
    }

    fontSize = Math.max(fontSize, 0);
    const { value } = this._font;
    this._font.fontSize = fontSize;
    this._font.value = value.replace(/\d+\.?\d*(?=px)/, fontSize);
    this.actions.push({
      method: 'setFont',
      data: [this._font.value],
    });
  }

  setFillStyle(color) {
    if (typeof color === 'string') {
      this.actions.push({
        method: 'setFillStyle',
        data: ['normal', color],
      });
    } else if (color instanceof Gradient) {
      this.actions.push({
        method: 'setFillStyle',
        data: [color.type, color.data, color.colorStop],
      });
    }
  }

  createLinearGradient(x0, y0, x1, y1) {
    const data = [x0, y0, x1, y1];
    const color = new Gradient('linear', data);
    return color;
  }

  setStrokeStyle(color) {
    if (typeof color === 'string') {
      this.actions.push({
        method: 'setStrokeStyle',
        data: ['normal', color],
      });
    } else if (color instanceof Gradient) {
      this.actions.push({
        method: 'setStrokeStyle',
        data: [color.type, color.data, color.colorStop],
      });
    }
  }

  setGlobalAlpha(alpha) {
    this.actions.push({
      method: 'setGlobalAlpha',
      data: [Math.floor(255 * alpha)],
    });
  }

  setShadow(x, y, blur, color) {
    this.actions.push({
      method: 'setShadow',
      data: [x, y, blur, color],
    });
  }

  setLineDash(pattern = [0, 0], offset = 0) {
    this.actions.push({
      method: 'setLineDash',
      data: [pattern, offset],
    });
  }

  fill() {
    this.actions.push({
      method: 'fillPath',
      data: deepcopy(this.path),
    });
  }

  stroke() {
    this.actions.push({
      method: 'strokePath',
      data: deepcopy(this.path),
    });
  }

  fillRect(x, y, w, h) {
    this.actions.push({
      method: 'fillRect',
      data: [x, y, w, h],
    });
  }

  strokeRect(x, y, w, h) {
    this.actions.push({
      method: 'strokePath',
      data: [{
        method: 'rect',
        data: [x, y, w, h],
      }],
    });
  }

  drawImage(...args) {
    if (args[0].indexOf('file://') === 0) {
      invokeMethod('protocolPathToAbsPath', {
        protocolPath: args[0],
        success: function success(res) {
          args[0] = res.absPath;
        },
      });
    }

    const argsLen = args.length;

    if (argsLen === 3 || argsLen === 5 || argsLen === 9) ; else {
      throw new Error('drawImage 参数不合法');
    }

    this.actions.push({
      method: 'drawImage',
      data: args,
    });
  }

  measureText(text) {
    // 处理参数
    if (text === null || text === undefined) {
      text = `${text}`;
    } else {
      text = text.toString();
    }

    // 从this._font中获取给端上的measureText参数
    let result = {
      width: 0,
    };

    const { fontSize, fontFamily: font } = this._font;

    invokeMethod('measureText', {
      fontSize,
      font,
      text,
      success: function success(res = {}) {
        result = res.data;
      },
    });

    return result;
  }
}

[
  'scale',
  'rotate',
  'translate',
  'save',
  'restore',
  'clearRect',
  'fillText',
  'setTextAlign',
  'setLineCap',
  'setLineJoin',
  'setLineWidth',
  'setMiterLimit',
  'setTextBaseline',
  'transform',
  'setTransform',

  'strokeText',
  'createPattern',
].forEach((method) => {
  CanvasContext.prototype[method] = function (...args) {
    this.actions.push({
      method,
      data: args,
    });
  };
});

[
  'moveTo',
  'rect',
  'arcTo',
  'arc',
  'quadraticCurveTo',
  'bezierCurveTo',
  'closePath',
].forEach((method) => {
  CanvasContext.prototype[method] = function (...args) {
    this.path.push({
      method,
      data: args,
    });
  };
});

[
  'createLinearGradient',
  'createRadialGradient',
  'createCircularGradient',
].forEach((method) => {
  CanvasContext.prototype[method] = function (...args) {
    if (method === 'createCircularGradient') {
      method = 'createRadialGradient';
      args = [args[0], args[1], 0, args[0], args[1], args[2]];
    }

    const nested = [];
    this.actions.push({
      method,
      data: args,
      nested,
    });
    return {
      addColorStop(...innerArgs) {
        nested.push({
          action: 'addColorStop',
          data: innerArgs,
        });
      },
    };
  };
});

// polyfill
const propertyMap = {
  fillStyle: 'setFillStyle',
  strokeStyle: 'setStrokeStyle',
  lineWidth: 'setLineWidth',
  lineCap: 'setLineCap',
  lineJoin: 'setLineJoin',
  miterLimit: 'setMiterLimit',
  font: 'setFontSize',
  globalAlpha: 'setGlobalAlpha',
};

Object.keys(propertyMap).forEach((key) => {
  Object.defineProperty(CanvasContext.prototype, key, {
    set(val) {
      this[propertyMap[key]].call(this, val);
    },
  });
});

[
  'shadowOffsetX',
  'shadowOffsetY',
  'shadowColor',
  'shadowBlur',
  'lineDashOffset',
  'textAlign',
  'textBaseline',
].forEach((property) => {
  Object.defineProperty(CanvasContext.prototype, property, {
    set(val) {
      this.actions.push({
        method: property,
        data: val,
      });
    },
  });
});
