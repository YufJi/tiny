import React from 'react';
import Touchable from 'rc-touchable';
import createReactClass from 'create-react-class';
import { createComponent, getCurrentPageImpl, getStartupParams } from '@/framework/';
import BasicEventMixin from '@/mixins/BasicEventMixin';
import TestMixin from '@/utils/TestMixin';
import isImageOk from '@/utils/isImageOk';
import callBridge from '@/utils/callBridge';
import objectKeys from '@/utils/objectKeys';
import { isAndroid, isNativeComponent } from '@/utils/system';
import addEvents from '@/utils/addEvents';
import upperFirstChar from '@/utils/upperFirstChar';

let cachedCanvas;
let id = 0;
const cacheCanvasId = {};
const g = self;

function getCachedCanvas({ destWidth, destHeight }) {
  if (cachedCanvas) {
    cachedCanvas.setAttribute('width', destWidth);
    cachedCanvas.setAttribute('height', destHeight);
    cachedCanvas.getContext('2d').clearRect(0, 0, destWidth, destHeight);
    return cachedCanvas;
  }
  cachedCanvas = document.createElement('canvas');
  const { style } = cachedCanvas;
  style.display = 'none';
  cachedCanvas.setAttribute('width', destWidth);
  cachedCanvas.setAttribute('height', destHeight);
  document.body.appendChild(cachedCanvas);
  return cachedCanvas;
}

function createTouchList(touchList = []) {
  const _this = this;

  const list = touchList && [].slice.call(touchList, 0) || [];
  return list.map((item) => {
    return {
      // or consider dpr
      x: item.pageX - _this.baseX,
      y: item.pageY - _this.baseY,
      identifier: item.identifier,
    };
  });
}

function defaultCreateTap(nativeEvent) {
  const detail = {};
  if (nativeEvent) {
    nativeEvent = nativeEvent.nativeEvent || nativeEvent;
    if ('pageX' in nativeEvent) {
      detail.pageX = nativeEvent.pageX;
      detail.pageY = nativeEvent.pageY;
    }
    if ('clientX' in nativeEvent) {
      detail.clientX = nativeEvent.clientX;
      detail.clientY = nativeEvent.clientY;
    } else if ('pageX' in detail) {
      detail.clientX = detail.pageX - window.pageXOffset;
      detail.clientY = detail.pageY - window.pageYOffset;
    }
  }
  return {
    detail,
  };
}

function createTap(nativeEvent, defaultCreateTap) {
  const { detail } = defaultCreateTap(nativeEvent);

  detail.x = detail.pageX - this.baseX;
  detail.y = detail.pageY - this.baseY;

  return {
    detail,
  };
}

function getOnEvent(e) {
  return `on${upperFirstChar(e)}`;
}

const Canvas = createComponent({
  name: 'canvas',
})(createReactClass({
  displayName: 'Canvas',
  mixins: [
    BasicEventMixin({
      createTouchList,
      createTap,
    }),
    TestMixin,
  ],
  componentDidMount() {
    const _this2 = this;

    if (this.useNative()) {
      if (isAndroid && !cacheCanvasId[this.getId()]) {
        this.readyForRender = false;
        this.detachCanvasReady = addEvents(document, {
          'nbcomponent.canrender': this.onNativeReady,
        });
      } else {
        this.readyForRender = true;
        this.renderCanvas();
      }
      const events = [];
      ['Tap', 'LongTap', 'TouchStart', 'TouchMove', 'TouchEnd', 'TouchCancel'].forEach((e) => {
        events[`nbcomponent.canvas.on${e}`] = _this2.fireNativeEvent;
      });
      this.detachEvents = addEvents(document, events);
    } else {
      this.seq = 0;
      this.onLayout();
    }
  },
  isTrackPageUpdateForIOS() {
    return this.useNative();
  },
  fireNativeEvent({ data }) {
    const { eventType, element, ...event } = data;
    if (element === this.getId()) {
      const onEvent = getOnEvent(eventType);
      if (this.props[onEvent]) {
        const { callbackId, type, ...validEvent } = event;
        this.props[onEvent](this.props.$mp.getNormalizedEvent(eventType, validEvent));
      }
    }
  },
  componentDidUpdate() {
    if (this.useNative()) {
      this.renderCanvas();
    } else {
      this.onLayout();
    }
  },
  componentWillUnmount() {
    if (this.detachCanvasReady) {
      this.detachCanvasReady.remove();
    }
    if (this.detachEvents) {
      this.detachEvents.remove();
    }
    if (this.useNative()) {
      callBridge('NBComponent.remove', {
        element: this.getId(),
      });
    }
  },
  clearRenderDelay() {
    if (this.detachCanvasReady) {
      this.detachCanvasReady.remove();
      this.detachCanvasReady = null;
    }
  },
  renderCanvas() {
    if (!this.readyForRender) {
      return;
    }
    this.clearRenderDelay();
    const { width, height, disableScroll, offscreen } = this.props;

    callBridge('NBComponent.render', {
      element: this.getId(),
      data: {
        timeStamp: Date.now(),
        disableScroll,
        offscreen,
        width,
        height,
      },
    });
  },
  onNativeReady(e) {
    if (!e || e.elementid === this.getId()) {
      this.readyForRender = true;
      cacheCanvasId[this.getId()] = true;
      this.renderCanvas();
    }
  },
  getWH() {
    const { root } = this;

    return {
      width: root.width || root.offsetWidth,
      height: root.height || root.offsetHeight,
    };
  },
  toTempFilePath(param, success, fail) {
    const data = this._getBase64ImageData(param);
    if (data.base64 && data.format) {
      callBridge('downloadFile', {
        url: data.base64.replace(`data:${data.format};base64,`, ''),
        type: 'image',
      }, (result) => {
        if (result.error) {
          fail(result);
        } else {
          success(result);
        }
      });
    } else {
      fail(data);
    }
  },
  getImageData(params, success, fail) {
    let { x, y, width, height } = params;

    x = Number(x) || 0;
    y = Number(y) || 0;
    try {
      const { root } = this;

      const ctx = root.getContext('2d');
      const imageData = ctx.getImageData(x, y, width, height);
      success({
        width,
        height,
        data: Array.prototype.slice.call(imageData.data),
      });
    } catch (e) {
      fail({
        errorMessage: e.message,
        error: e.message,
      });
    }
  },
  putImageData(params, success, fail) {
    let { x, y, width, height, data } = params;

    x = Number(x) || 0;
    y = Number(y) || 0;
    try {
      const imageData = new ImageData(new Uint8ClampedArray(data), width, height);
      const { root } = this;

      const ctx = root.getContext('2d');
      ctx.putImageData(imageData, x, y);
      success({});
    } catch (e) {
      fail({
        errorMessage: e.message,
        error: e.message,
      });
    }
  },
  draw(actions, reserve, callback) {
    const _this3 = this;

    const insideSeq = ++this.seq;
    const { root } = this;
    const { $mp } = this.props;
    // or consider dpr

    const ctx = root.getContext('2d');
    if (!reserve) {
      const _getWH = this.getWH();
      const { width } = _getWH;
      const { height } = _getWH;

      ctx.clearRect(0, 0, width, height);
    }
    const actionAlls = {};
    function doIt(action, next) {
      if (action.property) {
        let { value } = action;

        if (value && value.$callId) {
          value = actionAlls[value.$callId];
        }
        ctx[action.property] = value;
        next();
      } else {
        if (!ctx[action.action]) {
          throw new Error(`not find method ${action.action}`);
        }
        let { args } = action;

        if (action.action === 'drawCanvas') {
          const canvasId = args[0];
          const newArgs = [].concat(args);
          newArgs[0] = document.getElementById(canvasId);
          if (newArgs[0]) {
            ctx.drawImage.apply(ctx, newArgs);
          }
        } else if ((action.action === 'drawImage' || action.action === 'createPattern') && typeof args[0] === 'string') {
          args = [].concat(action.args);
          const image = new Image();
          image.crossOrigin = 'Anonymous';
          image.src = $mp.getNormalizedSrc(args[0]);
          args[0] = image;
          const run = function run() {
            if (insideSeq === _this3.seq) {
              const ret = ctx[action.action].apply(ctx, args);
              if (action.callId) {
                actionAlls[action.callId] = ret;
              }
              next();
            }
          };
          if (isImageOk(image)) {
            run();
          } else {
            image.onload = run;
          }
        } else {
          const arg = args[0];
          if (arg && arg.$callId) {
            args = [actionAlls[arg.$callId]].concat(args.slice(1));
          }
          const ret = ctx[action.action].apply(ctx, args);
          if (action.callId) {
            actionAlls[action.callId] = ret;
          }
          if (action.nested) {
            action.nested.forEach((n) => {
              ret[n.action].apply(ret, n.args);
            });
          }
          next();
        }
      }
    }
    let index = -1;
    function nextAction() {
      ++index;
      if (index < actions.length) {
        doIt(actions[index], nextAction);
      } else {
        callback({});
      }
    }
    nextAction();
  },
  _getBase64ImageData(param) {
    let data;
    const typeMap = {
      jpg: 'image/jpeg',
      png: 'image/png',
    };

    let { x, y, width, height, destWidth, destHeight, fileType, quality } = param || {};

    fileType = ['jpg', 'png'].indexOf(fileType) > -1 ? fileType : 'png';
    quality = fileType === 'jpg' ? quality < 0 || quality > 1 ? 1 : quality : 1;
    const format = typeMap[fileType];
    try {
      const { root } = this;

      if (x !== undefined || y !== undefined || width !== undefined || height !== undefined || destWidth !== undefined || destHeight !== undefined) {
        const _getWH2 = this.getWH();
        const rootWidth = _getWH2.width;
        const rootHeight = _getWH2.height;

        x = x || 0;
        y = y || 0;
        width = width || rootWidth;
        height = height || rootHeight;
        width = Math.min(width, rootWidth - x);
        height = Math.min(height, rootHeight - y);
        destWidth = destWidth || width;
        destHeight = destHeight || height;
        const newCanvas = getCachedCanvas({ destWidth, destHeight });
        newCanvas.getContext('2d').drawImage(root, x, y, width, height, 0, 0, destWidth, destHeight);
        data = newCanvas.toDataURL(format, quality);
      } else {
        data = root.toDataURL(format, quality);
      }
      return {
        base64: data,
        format,
      };
    } catch (e) {
      return e;
    }
  },
  toDataURL(param, success, fail) {
    const data = this._getBase64ImageData(param);
    if (data.error) {
      fail(data);
    } else {
      success(data.base64);
    }
  },
  onLayout() {
    const { root } = this;
    const { width, height } = this.props;

    if (!width) {
      const { offsetWidth } = root;

      if (root.width !== offsetWidth) {
        root.setAttribute('width', offsetWidth);
      }
    }
    if (!height) {
      const { offsetHeight } = root;

      if (root.height !== offsetHeight) {
        root.setAttribute('height', offsetHeight);
      }
    }
    const rect = root.getBoundingClientRect();
    this.baseX = rect.left + window.pageXOffset;
    this.baseY = rect.top + window.pageYOffset;
  },
  getId() {
    if (this.id) {
      return this.id;
    }
    this.id = this.props.id || `mp_canvas_${++id}`;
    return this.id;
  },
  getEnableNativeProp() {
    return this.props.enableNative !== false;
  },
  useNative() {
    return this.getEnableNativeProp() && isNativeComponent && getStartupParams().hasNativeCanvas;
  },
  fireTapEvent(srcEvent, eventType) {
    const onType = getOnEvent(eventType);
    if (this.getEnableNativeProp()) {
      getCurrentPageImpl().callRemote('bridge', '__emit', `nbcomponent.canvas.${onType}`, {
        viewId: g.WEBVIEWID,
        data: { element: this.getId(), eventType, ...createTap.call(this, srcEvent, defaultCreateTap) },
      });
    }
    this[onType](srcEvent);
  },
  fireTouchEvent(srcEvent, eventType) {
    const onType = getOnEvent(eventType);
    if (this.getEnableNativeProp()) {
      getCurrentPageImpl().callRemote('bridge', '__emit', `nbcomponent.canvas.${onType}`, {
        viewId: g.WEBVIEWID,
        data: {
          element: this.getId(),
          eventType,
          touches: createTouchList.call(this, srcEvent.touches),
          changedTouches: createTouchList.call(this, srcEvent.changedTouches),
        },
      });
    }
    this[onType](srcEvent);
  },
  onCanvasTap(e) {
    this.fireTapEvent(e, 'tap');
    this.logTestId();
  },
  onCanvasLongTap(e) {
    this.fireTapEvent(e, 'longTap');
  },
  onCanvasTouchStart(srcEvent) {
    this.fireTouchEvent(srcEvent, 'touchStart');
  },
  onCanvasTouchMove(srcEvent) {
    this.fireTouchEvent(srcEvent, 'touchMove');
  },
  onCanvasTouchEnd(srcEvent) {
    this.fireTouchEvent(srcEvent, 'touchEnd');
  },
  onCanvasTouchCancel(srcEvent) {
    this.fireTouchEvent(srcEvent, 'touchCancel');
  },
  render() {
    const { props } = this;

    if (this.useNative()) {
      return React.createElement(
        'object',
        { className: `${props.className} nbcomponentanimation-${this.getId()}`, style: props.style, id: props.id, type: 'application/view', role: 'application' },
        React.createElement('param', { name: 'type', value: 'canvas' }),
        React.createElement('param', { name: 'id', value: this.getId() }),
      );
    }
    let { style } = props;

    const events = {};
    const nodeEvents = {
      onClick: this.onCanvasTap,
      onTouchStart: this.onCanvasTouchStart,
      onTouchMove: this.onCanvasTouchMove,
      onTouchEnd: this.onCanvasTouchEnd,
      onTouchCancel: this.onCanvasTouchCancel,
    };
    if (this.hasEvent('LongTap')) {
      events.onLongPress = this.onCanvasLongTap;
    }
    const otherProps = {};
    if (props.width) {
      otherProps.width = props.width;
    }
    if (props.height) {
      otherProps.height = props.height;
    }
    let clickable = {};
    if (props && (props.onTap || props.catchTap)) {
      clickable = {
        'data-clickable': true,
      };
    }
    if (props.offscreen) {
      style = { ...style, position: 'absolute', left: '-9999px', top: '-9999px' };
    }
    const content = React.createElement('canvas', {
      id: props.id,
      className: props.className,
      ref: (ref) => this.root = ref,
      style,
      ...nodeEvents,
      ...clickable,
      ...otherProps,
      ...this.getTestProps(),
    });
    if (objectKeys(events).length) {
      return React.createElement(
        Touchable,
        events,
        content,
      );
    }
    return content;
  },
}));

export default Canvas;
