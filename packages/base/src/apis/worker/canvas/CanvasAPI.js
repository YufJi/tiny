import callRender from '@/apis/callRender.worker';
import { getStartupParams, getCurrentPageImpl } from '@/framework/';
import ap from '@/apis/ap';
import { isNativeComponent } from '@/utils/system';
import objectKeys from '@/utils/objectKeys';
import EventEmitter from '@/utils/EventEmitter';
import resolvePath from '@/utils/resolvePath';
import upperFirstChar from '@/utils/upperFirstChar';
import { handleCallbackParams } from '../../util';
import CanvasProtocolEncoder from './CanvasProtocolEncoder';
import { callBridgeAPI, callCanvasBridge } from './bridge';

const styleProperties = ['fillStyle', 'strokeStyle', 'globalAlpha', 'lineWidth', 'lineCap', 'lineJoin', 'miterLimit', 'textBaseline', 'lineDashOffset', 'textAlign', 'globalCompositeOperation'];
function getSetUpperName(name) {
  return `set${upperFirstChar(name)}`;
}
function clean(obj) {
  const ret = { ...obj };
  delete ret.success;
  delete ret.error;
  delete ret.complete;
  return ret;
}
const allSetProperties = [].concat(styleProperties, ['shadow', 'fontSize', 'font']);

function Context(id, { page, enableNative }) {
  this.callBackMap = {};
  this.actions = [];
  this.callId = 0;
  this.id = id;
  this.emitter = new EventEmitter();
  this.page = page;
  this.enableNative = enableNative !== false && isNativeComponent && getStartupParams().hasNativeCanvas;
  this.state = {
    font: '10px Arial',
    fontSize: 10,
    fontWeight: 'normal',
    fontStyle: 'normal',
    fontFamily: 'Arial',
  };
  // 以下为compact协议中使用字段
  // 是否开启字符协议, 用于调试
  // 开启条件(需都满足)：
  // 1.选择使用native canvas
  // 2.android平台, 且客户端通过动态推包获取到native canvas bundle
  // 3.启动参数中nativeCanvasCompactProtocol标记位为true
  if (this.enableNative) {
    this.enableCompactProtocol = getStartupParams().nativeCanvasCompactProtocol;
    this.protocolVersion = '1';
    // 前端管理图片的异步加载，包括已加载图片buffer, 正在加载的图片buffer, 等待加载的frame buffer的图片buffer, 防止重复调用
    // 图片buffer只有compact协议中才使用
    this.localImageBuffer = {};
    // 正在loading的图片buffer
    this.localImageLoadingBuffer = {};
    this.actionsShouldLoadImage = false;
  }
  const ctx = this;
  allSetProperties.forEach((style) => {
    Object.defineProperty(ctx, style, {
      configurable: true,
      set: function set(value) {
        ctx[getSetUpperName(style)](value);
      },
    });
  });
}

const imageDataAPI = {
  getImageData: {
    v: function v(opt) {
      if ((Number(opt.width) || 0) === 0) {
        return {
          message: 'the source width is 0',
        };
      }
      if ((Number(opt.height) || 0) === 0) {
        return {
          message: 'the source height is 0',
        };
      }
    },
    b: function b(opt) {
      opt.x = Number(opt.x) || 0;
      opt.y = Number(opt.y) || 0;
      opt.width = Number(opt.width) || 0;
      opt.height = Number(opt.height) || 0;
    },
    a: function a(res) {
      res.data = new Uint8ClampedArray(res.data);
    },
  },
  putImageData: {
    v: function v(opt) {
      if (typeof opt.width !== 'number') {
        return {
          message: 'width argument must be an Number',
        };
      }
      if (Object.prototype.toString.call(opt.data) !== '[object Uint8ClampedArray]') {
        return {
          message: 'data argument must be an Uint8ClampedArray',
        };
      }
    },
    b: function b(opt) {
      opt.x = Number(opt.x) || 0;
      opt.y = Number(opt.y) || 0;
      opt.height = typeof opt.height === 'number' ? opt.height : opt.data.length / opt.width / 4 | 0;
      opt.data = Array.prototype.slice.call(opt.data);
    },
  },
};

const contextPrototype = Context.prototype = {
  _getPage: function _getPage() {
    return this.page || getCurrentPageImpl();
  },
  _listen: function _listen(type, callback) {
    const _this = this;

    const { emitter } = this;

    emitter.on(type, callback);
    if (emitter.listenerCount(type) === 1 && !this.callBackMap[type]) {
      const listener = this.callBackMap[type] = function (e) {
        if (e.viewId === _this._getPage().getViewId() && e.data.element === _this.id) {
          const data = { ...e.data };
          delete data.NBPageUrl;
          data.type = data.eventType;
          delete data.eventType;
          emitter.emit(type, data);
        }
      };
      ap.on(type, listener);
    }
  },
  _unListen: function _unListen(type, callback) {
    const { emitter } = this;

    emitter.off(type, callback);
    if (emitter.listenerCount(type) === 0) {
      const listener = this.callBackMap[type];
      if (listener) {
        ap.off(type, listener);
        delete this.callBackMap[type];
      }
    }
  },
  _commitDrawFrame: function _commitDrawFrame(reserve, actions, callback) {
    const actionsEncoded = CanvasProtocolEncoder.encodeDrawActions(this, actions);
    if (this.enableNative) {
      const data = {
        timeStamp: Date.now(),
        actions: actionsEncoded,
        reserve,
      };
      // 告诉客户端传输数据所采用的协议版本, 让客户端采用对应方式解析
      // 升级版本时需注意客户端兼容情况
      if (this.enableCompactProtocol) {
        data.protocolVersion = this.protocolVersion;
      }
      callCanvasBridge('NBComponent.sendMessage', {
        actionType: 'draw',
        element: this.id,
        viewId: this._getPage().getViewId(),
        data,
      }, callback);
    } else {
      // console.log("draw for web:", actionsEncoded);
      this._getPage().callRemote(`refComponents.${this.id}`, 'draw', actionsEncoded, reserve, (res) => {
        if (typeof callback === 'function') {
          callback(res);
        }
      });
    }
  },
  addEventListener: function addEventListener(type, callback) {
    this._listen(`nbcomponent.canvas.on${upperFirstChar(type)}`, callback);
  },
  removeEventListener: function removeEventListener(type, callback) {
    this._unListen(`nbcomponent.canvas.on${upperFirstChar(type)}`, callback);
  },
  destroy: function destroy() {
    const _this2 = this;

    Object.keys(this.callBackMap).forEach((k) => {
      ap.off(k, _this2.callBackMap[k]);
    });
  },
  draw: function draw(reserve, callback) {
    const that = this;
    const encoder = CanvasProtocolEncoder;
    if (this.enableCompactProtocol) {
      // 需要加载的图片url
      const toLoadImgUrls = [];
      if (this.actionsShouldLoadImage) {
        // 检测当前actions是否需要加载图片(含drawImage/fillStyle=pattern等)
        for (let i = 0; i < this.actions.length; i++) {
          const action = this.actions[i];
          const url = encoder.getNotLoadingImageUrlFromAction(this, action);
          if (url && toLoadImgUrls.indexOf(url) < 0) {
            toLoadImgUrls.push(url);
          }
        }
      }
      if (toLoadImgUrls.length > 0) {
        const frameData = {
          reserve,
          actions: this.actions,
          callback,
        };
        encoder.performLoadImage(this, toLoadImgUrls, () => {
          encoder.onImageLoadComplete(that, frameData);
        });
      }
      // 需要等待图片加载完，才触发渲染
      if (toLoadImgUrls != null && toLoadImgUrls.length > 0 || this.localImageLoadingBuffer.length > 0) {
        // 重置图片加载状态,为下一帧重置状态
        this.actionsShouldLoadImage = false;
        this.actions = [];
        return;
      }
    }
    // 重置图片加载状态
    this.actionsShouldLoadImage = false;
    // debug('framework', `drawCanvas:reserve:${reserve}`, this.actions);
    this._commitDrawFrame(reserve, this.actions, callback);
    // 清空actions
    this.actions = [];
  },
  toDataURL: function toDataURL(params) {
    const _this3 = this;

    if (this.enableNative) {
      // todo
    } else {
      return new Promise(((resolve, reject) => {
        callRender('toDataURL', {
          page: _this3._getPage(),
          caller: `refComponents.${_this3.id}`,
          args: [{ ...params,
            success: function success(res) {
              resolve(res);
              if (params.success) {
                params.success(res);
              }
            },
            fail: function fail(res) {
              reject(res);
              if (params.fail) {
                params.fail(res);
              }
            },
            complete: function complete(res) {
              if (params.complete) {
                params.complete(res);
              }
            } }],
        });
      }));
    }
  },
  toTempFilePath: function toTempFilePath(params) {
    const _this4 = this;

    if (this.enableNative) {
      return callBridgeAPI(this, 'toTempFilePath', clean(params), params);
    } else {
      return new Promise(((resolve, reject) => {
        callRender('toTempFilePath', {
          page: _this4._getPage(),
          caller: `refComponents.${_this4.id}`,
          args: [{ ...params,
            success: function success(res) {
              resolve(res);
              if (params.success) {
                params.success(res);
              }
            },
            fail: function fail(res) {
              reject(res);
              if (params.fail) {
                params.fail(res);
              }
            },
            complete: function complete(res) {
              if (params.complete) {
                params.complete(res);
              }
            } }],
        });
      }));
    }
  },
  setShadow: function setShadow(offsetX = 0, offsetY = 0, blur = 0, color = 'black') {
    this.actions = this.actions.concat(CanvasProtocolEncoder.encodeProperties(this, [{
      property: 'shadowOffsetX',
      value: offsetX,
    }, {
      property: 'shadowOffsetY',
      value: offsetY,
    }, {
      property: 'shadowBlur',
      value: blur,
    }, {
      property: 'shadowColor',
      value: color,
    }]));
  },
  setFontSize: function setFontSize(value) {
    this.state.font = this.state.font.replace(/\d+\.?\d*px/, `${value}px`);
    this.state.fontSize = value;
    this.actions.push(CanvasProtocolEncoder.encodeProperty(this, {
      property: 'font',
      value: this.state.font,
    }));
  },
  setFont: function setFont(value) {
    const _this5 = this;

    this.state.font = value;
    const matches = value.match(/^(([\w\-]+\s)*)(\d+px)(\/(\d+\.?\d*(px)?))?\s+(.*)/);
    if (matches) {
      const fontStyles = matches[1].trim().split(/\s/);
      this.state.fontSize = parseFloat(matches[3]);
      this.state.fontFamily = matches[7];
      fontStyles.forEach((s) => {
        if (['italic', 'oblique', 'normal'].indexOf(s) > -1) {
          _this5.state.fontStyle = s;
        } else if (['bold', 'normal'].indexOf(s) > -1) {
          _this5.state.fontWeight = s;
        }
      });
    }
    this.actions.push(CanvasProtocolEncoder.encodeProperty(this, {
      property: 'font',
      value,
    }));
  },
  createPattern: function createPattern(...args) {
    if (this.enableCompactProtocol) {
      return {
        class: 'pattern',
        action: 'createPattern',
        args,
      };
    } else {
      this.actions.push({
        action: 'createPattern',
        callId: ++this.callId,
        args,
      });
      return {
        $callId: this.callId,
      };
    }
  },
};

objectKeys(imageDataAPI).forEach((apiName) => {
  const apiConfig = imageDataAPI[apiName] || {};
  contextPrototype[apiName] = function (param) {
    const _this6 = this;

    const _a = handleCallbackParams(param);
    const { success, fail, ...rest } = _a;
    if (apiConfig && apiConfig.v) {
      const error = apiConfig.v(rest);
      if (error) {
        fail({
          errorMessage: error.message,
          error: error.message,
        });
        return;
      }
    }
    if (apiConfig && apiConfig.b) {
      apiConfig.b(rest);
    }
    if (this.enableNative) {
      return callBridgeAPI(this, apiName, rest, param);
    }
    return new Promise(((resolve, reject) => {
      let _getPage2;

      const args = [`refComponents.${_this6.id}`, apiName];
      const newSuccess = function newSuccess(originRes) {
        const res = originRes;
        if (apiConfig.a) {
          apiConfig.a(res);
        }
        resolve(res);
        if (success) {
          success(res);
        }
      };
      const newFail = function newFail(res) {
        reject(res);
        if (fail) {
          fail(res);
        }
      };
      args.push(rest, newSuccess, newFail);
      (_getPage2 = _this6._getPage()).callRemote.apply(_getPage2, args);
    }));
  };
});

styleProperties.forEach((property) => {
  contextPrototype[getSetUpperName(property)] = function set(value) {
    const that = this;
    if (this.enableCompactProtocol) {
      // pattern涉及图片异步load,提前处理
      if ((property === 'fillStyle' || property === 'strokeStyle') && value != null && typeof value === 'object' && value.class === 'pattern') {
        const firstArg = value.args[0];
        if (typeof firstArg === 'string' && firstArg) {
          const imgInfo = CanvasProtocolEncoder.getLoadedImage(that, firstArg);
          if (imgInfo) {
            if (CanvasProtocolEncoder.isValidImageInfo(imgInfo)) {
              value.args = [imgInfo.id, imgInfo.width, imgInfo.height, value.args[1]];
            } else {
              // 无效图片，不计入最终actions
              return;
            }
          } else {
            that.actionsShouldLoadImage = true;
            // 未在本地加载的图片，action格式为未转化
            that.actions.push({
              property,
              // value格式：{class:xx, args:[]}
              value,
            });
            return;
          }
        } else if (typeof firstArg === 'object' && CanvasProtocolEncoder.isValidImageInfo(firstArg)) {
          value.args = [firstArg.id, firstArg.width, firstArg.height, value.args[1]];
        }
      }
    }
    this.actions.push(CanvasProtocolEncoder.encodeProperty(this, {
      property,
      value,
    }));
  };
});

['createLinearGradient', 'createRadialGradient', 'createCircularGradient'].forEach((_action) => {
  contextPrototype[_action] = function pushAction(..._args) {
    let args = _args;
    let action = _action;
    if (action === 'createCircularGradient') {
      action = 'createRadialGradient';
      args = [args[0], args[1], 0, args[0], args[1], args[2]];
    }
    let className = '';
    if (action === 'createLinearGradient') {
      className = 'linearGradient';
    } else {
      className = 'radialGradient';
    }
    if (this.enableCompactProtocol) {
      return {
        class: className,
        positions: [],
        colors: [],
        args,
        addColorStop: function addColorStop(pos, color) {
          this.positions.push(pos);
          this.colors.push(color);
        },
      };
    } else {
      const nested = [];
      this.actions.push({
        action,
        nested,
        callId: ++this.callId,
        args,
      });
      return {
        $callId: this.callId,
        addColorStop: function addColorStop(...innerArgs) {
          nested.push({
            action: 'addColorStop',
            args: innerArgs,
          });
        },
      };
    }
  };
});

[
  'clip',
  'fill',
  'rect',
  'fillRect',
  'strokeRect',
  'stroke',
  'scale',
  'rotate',
  'translate',
  'save',
  'restore',
  'clearRect',
  'fillText',
  'moveTo',
  'lineTo',
  'arcTo',
  'arc',
  'transform',
  'setTransform',
  'stroke',
  'beginPath',
  'closePath',
  'quadraticCurveTo',
  'bezierCurveTo',
  'setLineDash',
  'strokeText',
].forEach((action) => {
  contextPrototype[action] = function pushAction(...args) {
    this.actions.push(CanvasProtocolEncoder.encodeDrawApi(this, {
      action,
      args,
    }));
  };
});

contextPrototype.isCanvasContext = 1;

contextPrototype.drawImage = function (img_, ...args) {
  let img = img_;

  if (typeof img === 'string') {
    if (this._getPage()) {
      img = resolvePath(img_, `/${this._getPage().getPagePath()}`);
    }
    if (this.enableCompactProtocol) {
      // compact协议会将drawImage尝试转化为draw本地cache格式
      const imgInfo = CanvasProtocolEncoder.getLoadedImage(this, img);
      var finalArgs;
      if (imgInfo) {
        // 扩展为全参数格式
        if (CanvasProtocolEncoder.isValidImageInfo(imgInfo)) {
          finalArgs = CanvasProtocolEncoder.formatDrawImageArgs(imgInfo, args);
        } else {
          // 无效图片, 不计入actions
          return;
        }
      } else {
        this.actionsShouldLoadImage = true;
        finalArgs = [img].concat(args);
        // 未在本地加载的图片，action格式为未转化
        this.actions.push({
          action: 'drawImage',
          args: finalArgs,
        });
        return;
      }
    } else {
      finalArgs = [img].concat(args);
    }
    this.actions.push(CanvasProtocolEncoder.encodeDrawApi(this, {
      action: 'drawImage',
      args: finalArgs,
    }));
  } else if (img && typeof img === 'object' && CanvasProtocolEncoder.isValidImageInfo(img)) {
    // 有效的图片对象格式
    if (this.enableCompactProtocol) {
      const fArgs = CanvasProtocolEncoder.formatDrawImageArgs(img, args);
      this.actions.push(CanvasProtocolEncoder.encodeDrawApi(this, {
        action: 'drawImage',
        args: fArgs,
      }));
    }
  } else if (img && img.isCanvasContext) {
    this.actions.push(CanvasProtocolEncoder.encodeDrawApi(this, {
      action: 'drawCanvas',
      args: [img.id].concat(args),
    }));
  }
};

contextPrototype.measureText = function measureText(value) {
  if (this.enableNative) {
    let result = callBridgeAPI(this, 'measureText', {
      text: value,
      font: this.state.font,
    }, undefined, true);
    if (!result) {
      result = {};
    }
    return result;
  }

  const { fontSize, fontFamily, fontWeight, fontStyle } = this.state;

  return ap.callSync('measureText', {
    text: value,
    fontSize,
    fontFamily,
    fontWeight,
    fontStyle,
  });
};

export default ({
  canvasToTempFilePath(...args) {
    callRender('toTempFilePath', {
      caller: `refComponents.${args[0].canvasId}`,
      args,
    });
  },
  createCanvasContext(id, options) {
    return new Context(id, ({ ...options, page: getCurrentPageImpl() }));
  },
});
