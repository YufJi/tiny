
import ap from '../../ap';
import { callBridgeAPI } from './bridge';

const { callBridge } = ap;

const g10150 = false; // compareSystemVersion('10.1.50') >= 0;
// ////////////////////////////////////////////////////////////////////////
//
// canvas私有拼串协议实现
// 协议目前只影响draw()接口的action
// 单独调用的接口不受影响
// 有：measureText, getImageData, putImageData, toTempFilePath
//
// ////////////////////////////////////////////////////////////////////////
const CanvasProtocolEncoder = {
  textMaxWidth: '100000000',
  gcanvasCommandMap: {
    clip: 'p',
    fill: 'L',
    rect: 'w',
    fillRect: 'n',
    strokeRect: 's',
    clearRect: 'c',
    stroke: 'x',
    scale: 'k',
    rotate: 'r',
    translate: 'l',
    save: 'v',
    restore: 'e',
    fillText: 'T',
    moveTo: 'g',
    lineTo: 'i',
    arcTo: 'h',
    arc: 'y',
    transform: 'f',
    setTransform: 't',
    beginPath: 'b',
    closePath: 'o',
    quadraticCurveTo: 'u',
    bezierCurveTo: 'z',
    setLineDash: 'I',
    strokeText: 'U',
    drawImage: 'd',
    // property
    strokeStyle: 'S',
    shadowBlur: 'Z',
    shadowColor: 'K',
    shadowOffsetX: 'X',
    shadowOffsetY: 'Y',
    lineCap: 'C',
    lineWidth: 'W',
    lineJoin: 'J',
    miterLimit: 'M',
    font: 'j',
    textAlign: 'A',
    textBaseline: 'E',
    lineDashOffset: 'N',
    globalAlpha: 'a',
    globalCompositeOperation: 'V',
    pattern: 'G',
    fillStyle: 'F',
    linearGradient: 'D',
    radialGradient: 'H',
  },
  replaceToken: function replaceToken(text) {
    if (typeof text === 'string') {
      text = text.replace(/!/g, '!!');
      text = text.replace(/,/g, '!,');
      text = text.replace(/;/g, '!;');
    }
    return text;
  },
  reverseReplaceToken: function reverseReplaceToken(text) {
    if (typeof text === 'string') {
      text = text.replace(/!!/g, '!');
      text = text.replace(/!,/g, ',');
      text = text.replace(/!;/g, ';');
    }
    return text;
  },
  valueToStr: function valueToStr(v) {
    // console.log("typeof v: ", typeof v, "value=", v)
    if (typeof v === 'boolean') {
      v = v ? '1' : '0';
    }
    return v;
  },
  formatValue: function formatValue(args) {
    if (!args) {
      // 空参数，直接转为空串
      return '';
    }
    if (Array.isArray(args)) {
      for (let i = 0; i < args.length; i+=1) {
        const item = args[i];
        if (typeof item === 'number') {
          // 浮点数缩减
          // args[i] = Number(args[i]).toFixed(6);
        } else {
          args[i] = this.valueToStr(item);
        }
      }
    } else if (typeof args === 'string') {
      if (args === 'null' || !args) {
        args = '';
      }
    } else if (typeof args === 'boolean') {
      args = this.valueToStr(args);
    }
    return args;
  },
  isArgsValidArray: function isArgsValidArray(args) {
    return args && Array.isArray(args);
  },
  formatDrawImageArgs: function formatDrawImageArgs(imgInfo, args) {
    const w = imgInfo.width;
    const h = imgInfo.height;
    // 扩展为全参数格式
    if (args.length === 2) {
      args = [w, h, 0, 0, w, h, args[0], args[1], w, h];
    } else if (args.length === 4) {
      args = [w, h, 0, 0, w, h, args[0], args[1], args[2], args[3]];
    } else if (args.length === 8) {
      args = [w, h].concat(args);
    }
    return [imgInfo.id].concat(args);
  },
  _encodeDrawActions: function _encodeDrawActions(actions) {
    let str = '';
    for (let i = 0; i < actions.length; i+=1) {
      if (typeof actions[i] === 'string') {
        str += actions[i];
      }
    }
    return str;
  },
  _encodeDrawApi: function _encodeDrawApi(params) {
    params.args = this.formatValue(params.args);
    // 前置处理
    if (params.action === 'fillText') {
      // 文本加'!'前缀
      if (this.isArgsValidArray(params.args)) {
        params.args[0] = this.replaceToken(params.args[0]);
        if (params.args.length === 3) {
          params.args.push(this.textMaxWidth);
        }
      }
    } else if (params.action === 'strokeText') {
      // 文本加'!'前缀
      if (this.isArgsValidArray(params.args)) {
        params.args[0] = this.replaceToken(params.args[0]);
        if (params.args.length === 3) {
          params.args.push(this.textMaxWidth);
        }
      }
    } else if (params.action === 'setLineDash') {
      // 拼接长度
      if (params.args && Array.isArray(params.args[0])) {
        params.args = [params.args[0].length].concat(params.args[0]);
      }
    }
    const realName = this.gcanvasCommandMap[params.action];
    if (realName) {
      let v = '';
      if (Array.isArray(params.args)) {
        v = params.args.join(',');
      } else {
        v = params.args;
      }
      return `${realName + v};`;
    } else {
      // 未提供映射的，直接返回原值
      return '';
    }
  },
  _encodeProperty: function _encodeProperty(params) {
    const that = this;
    params.value = this.formatValue(params.value);
    // pattern／gradient前置处理
    if (params.property === 'fillStyle' || params.property === 'strokeStyle') {
      if (params.value && typeof params.value === 'object') {
        // dict类型，可能是pattern/gradient这些
        const obj = params.value;
        const args = [];
        if (obj && obj.class) {
          const isStroke = params.property === 'strokeStyle';
          // 使用class替换原property name, 将fillStyle/strokeStyle转化为gradient命令
          params.property = obj.class;
          // 拷贝obj.args数组元素，避免改变原数组
          if (obj.class === 'pattern' || obj.class === 'linearGradient' || obj.class === 'radialGradient') {
            for (let i = 0; i < obj.args.length; i+=1) {
              args[i] = obj.args[i];
            }
            if (obj.class === 'pattern') {
              // ignore [id,width,height,mode]
            } else if (obj.class === 'linearGradient') {
              if (obj.positions && obj.positions.length > 0) {
                args.push(obj.positions.length);
                for (const k in obj.positions) {
                  args.push(obj.positions[k]);
                }
                for (const k in obj.colors) {
                  args.push(obj.colors[k]);
                }
              }
            } else if (obj.class === 'radialGradient') {
              if (obj.positions && obj.positions.length > 0) {
                args.push(obj.positions.length);
                for (const k in obj.positions) {
                  args.push(obj.positions[k]);
                }
                for (const k in obj.colors) {
                  args.push(obj.colors[k]);
                }
              }
            }
            // 如果为stroke, 在最后添加stroke标记参数(fill无需添加)
            if (isStroke) {
              args.push('1');
            }
          }
        } // 无效格式
        // console.log(obj);
        params.value = args;
      } else if (params.value && typeof params.value === 'string') {
        if (params.value.length > 64) {
          params.value = '';
        }
      }
    } else if (params.property === 'textAlign') {
      params.value = this._encodeTextAlignValue(params.value);
    } else if (params.property === 'textBaseline') {
      params.value = this._encodeTextBaseline(params.value);
    }
    const realName = this.gcanvasCommandMap[params.property];
    if (realName) {
      let v = '';
      if (Array.isArray(params.value)) {
        v = params.value.join(',');
      } else {
        v = params.value;
      }
      return `${realName + v};`;
    } else {
      // 未提供映射的，说明不支持此操作，返回空
      return '';
    }
  },
  _encodeTextAlignValue: function _encodeTextAlignValue(value) {
    let align = 0;
    switch (value) {
      case 'start':
        align = 0;
        break;
      case 'end':
        align = 1;
        break;
      case 'left':
        align = 2;
        break;
      case 'center':
        align = 3;
        break;
      case 'right':
        align = 4;
        break;
      default:
        align = 0;
    }
    return align;
  },
  _encodeTextBaseline: function _encodeTextBaseline(value) {
    let baseline = 0;
    switch (value) {
      case 'alphabetic':
        baseline = 0;
        break;
      case 'middle':
        baseline = 1;
        break;
      case 'top':
        baseline = 2;
        break;
      case 'hanging':
        baseline = 3;
        break;
      case 'bottom':
        baseline = 4;
        break;
      case 'ideographic':
        baseline = 5;
        break;
      default:
        baseline = 0;
        break;
    }
    return baseline;
  },
  encodeDrawActions: function encodeDrawActions(ctx, actions) {
    if (this.checkUseCompactProtocal(ctx)) {
      return this._encodeDrawActions(actions);
    } else {
      return actions;
    }
  },
  encodeDrawApi: function encodeDrawApi(ctx, value) {
    if (this.checkUseCompactProtocal(ctx)) {
      return this._encodeDrawApi(value);
    } else {
      return value;
    }
  },

  /**
     * value格式：{property: $pname, value: $value}
     */
  encodeProperty: function encodeProperty(ctx, value) {
    if (this.checkUseCompactProtocal(ctx)) {
      return this._encodeProperty(value);
    } else {
      return value;
    }
  },
  encodeProperties: function encodeProperties(ctx, setPropertyArr) {
    if (this.checkUseCompactProtocal(ctx)) {
      const arr = [];
      for (const key in setPropertyArr) {
        arr.push(this._encodeProperty(setPropertyArr[key]));
      }
      return arr;
    } else {
      return setPropertyArr;
    }
  },
  putLoadedImage: function putLoadedImage(ctx, url, imgInfo) {
    ctx.localImageBuffer[url] = imgInfo;
  },
  getLoadedImage: function getLoadedImage(ctx, url) {
    // console.log("getLoadedImage: ", this.localImageLoadingBuffer);
    if (ctx.localImageBuffer[url]) {
      return ctx.localImageBuffer[url];
    } else {
      return null;
    }
  },
  putLoadingImage: function putLoadingImage(ctx, url) {
    ctx.localImageLoadingBuffer[url] = 1;
  },
  getLoadingImage: function getLoadingImage(ctx, url) {
    if (ctx.localImageLoadingBuffer[url]) {
      return ctx.localImageLoadingBuffer[url];
    } else {
      return null;
    }
  },
  isValidImageInfo: function isValidImageInfo(imgInfo) {
    return imgInfo != null && imgInfo.id !== '' && imgInfo.id >= 0 && imgInfo.width > 0 && imgInfo.height > 0;
  },
  removeLoadingImage: function removeLoadingImage(ctx, url) {
    delete ctx.localImageLoadingBuffer[url];
  },

  // 批量加载图片
  performLoadImage: function performLoadImage(ctx, urls, cb) {
    // 过滤正在loading的图片
    for (let i = 0; i < urls.length; i+=1) {
      this.putLoadingImage(ctx, urls[i]);
    }
    const that = this;
    const processImageCallback = function processImageCallback(res) {
      if (res.data) {
        const imgList = res.data;
        for (let i = 0; i < imgList.length; i+=1) {
          const item = imgList[i];
          that.putLoadedImage(ctx, item.url, item);
          that.removeLoadingImage(ctx, item.url);
        }
      }
    };
    // 版本判断: 50版本以下走NBComponent.sendMessage(action=loadImage), 高版本使用my.preloadCanvasImage jsapi
    if (g10150) {
      // console.log("start performLoadImage::preloadCanvasImage", urls);
      callBridge('preloadCanvasImage', { urls }, (res) => {
        processImageCallback(res);
        cb();
      });
    } else {
      callBridgeAPI(ctx, 'loadImage', {
        urls,
      }, {
        success: function success(res) {
          processImageCallback(res);
        },
        fail: function fail(res) {
          // 所有图片加载失败时返回
          processImageCallback(res);
        },
        complete: function complete() {
          cb();
        },
      }, false);
    }
  },

  // 判断是否图片加载相关的action
  isWaitImageLoadAction: function isWaitImageLoadAction(action) {
    if (typeof action === 'object' && action) {
      if (action.action === 'drawImage' || action.property && (action.property === 'fillStyle' || action.property === 'strokeStyle') && action.value != null && typeof action.value === 'object' && action.value.class === 'pattern') {
        return true;
      }
    }
    return false;
  },
  parseImageUrlFromActionUrl: function parseImageUrlFromActionUrl(action) {
    if (!action) {
      return '';
    }
    const args = action.args ? action.args : action.value.args;
    return args[0];
  },
  getNotLoadingImageUrlFromAction: function getNotLoadingImageUrlFromAction(ctx, action) {
    if (this.isWaitImageLoadAction(action)) {
      const url = this.parseImageUrlFromActionUrl(action);
      if (url && isNaN(url) && !this.getLoadingImage(ctx, url)) {
        return url;
      }
    }
    return '';
  },
  replaceImageLoadActions: function replaceImageLoadActions(action, imgInfo) {
    let newAction = '';
    const actionName = action.action ? action.action : action.property;
    // replace img action url and img infos
    if (actionName === 'drawImage') {
      newAction = this._encodeDrawApi({
        action: actionName,
        args: this.formatDrawImageArgs(imgInfo, action.args.slice(1)),
      });
    } else if (actionName === 'fillStyle' || actionName === 'strokeStyle') {
      const value = {
        class: 'pattern',
        args: [imgInfo.id, imgInfo.width, imgInfo.height].concat(action.value.args.slice(1)),
      };
      newAction = this._encodeProperty({
        property: actionName,
        value,
      });
    }
    return newAction;
  },
  onImageLoadComplete: function onImageLoadComplete(ctx, frameData) {
    for (let j = 0; j < frameData.actions.length; j+=1) {
      const action = frameData.actions[j];
      const url = this.getNotLoadingImageUrlFromAction(ctx, action);
      if (url) {
        const imgInfo = this.getLoadedImage(ctx, url);
        if (!this.isValidImageInfo(imgInfo)) {
          // 图片加载失败情况下无效掉命令
          // console.log("loadImagefail,replace frame with emtpy: ", frameData.actions);
          frameData.actions[j] = '';
          // continue;
        } else {
          // replace img action url and img infos
          frameData.actions[j] = this.replaceImageLoadActions(action, imgInfo);
        }
      }
    }
    this.flushDrawFrame(ctx, frameData);
  },
  flushDrawFrame: function flushDrawFrame(ctx, frameData) {
    // 重置图片加载状态
    ctx.actionsShouldLoadImage = false;
    ctx._commitDrawFrame(frameData.reserve, frameData.actions, frameData.callback);
  },
  checkUseCompactProtocal: function checkUseCompactProtocal(ctx) {
    return ctx.enableCompactProtocol;
  },
};

export default CanvasProtocolEncoder;
