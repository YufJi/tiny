import { PolymerElement, html } from '@polymer/polymer';
import { guid, TemplateTag } from 'shared';
import { getRealRoute } from '../util';
import { Base } from './mixins';

const DEFAULT_WIDTH = 300;
const DEFAULT_HEIGHT = 225;

class Canvas extends Base(PolymerElement) {
  static get is() {
    return `${TemplateTag.LowerCasePrefix}-canvas`;
  }

  static get properties() {
    return {
      type: { type: String, value: '' },
      canvasId: {
        type: String,
        observer: '_updateCanvasId',
        value: '',
      },
      width: { type: Number },
      height: { type: Number },
      bindtouchstart: String,
      bindtouchmove: String,
      bindtouchend: String,
      bindtouchcancel: String,
      __dirname: String,
    };
  }

  static get template() {
    return html`
      <style>
        :host {
            display: inline-block;
            font-size: 0;
        }
      </style>
      <canvas width="0" height="0" id="mainCanvas"></canvas>
    `;
  }

  ready() {
    super.ready();

    this._actionsDefer = [];
    this._actionsWaiting = false;
    this._images = {};
    this.uniqCanvasId = guid();
    this.ctx = this.$.mainCanvas.getContext('2d');

    this._updateWidth(this.width);
    this._updateHeight(this.height);
  }

  connectedCallback() {
    super.connectedCallback();

    this.__pageRerender = this._pageRerender.bind(this);
    document.addEventListener('pageReRender', this.__pageRerender);
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    document.removeEventListener('pageReRender', this.__pageRerender);
  }

  _updateCanvasId(newCanvasId, oldCanvasId) {
    if (!newCanvasId) {
      this.hidden = true;
      this.triggerEvent('error', {
        errMsg: 'canvas-id attribute is undefined',
      });
      console.error('canvas-id attribute is undefined');
    } else if (newCanvasId !== oldCanvasId) {
      this.init();
    }
  }

  _pageRerender() {
    const currentWidth = parseFloat(window.getComputedStyle(this).width);
    const currentHeight = parseFloat(window.getComputedStyle(this).height);

    if (currentWidth !== this._width || currentHeight !== this._height) {
      if (currentWidth !== this._width) {
        this._updateWidth();
      }

      if (currentHeight !== this._height) {
        this._updateHeight();
      }
      // rerender
      this.draw(this._lastReserve, this._lastActions, this._lastRandid);
    }
  }

  _updateWidth(width) {
    let realWidth = parseFloat(window.getComputedStyle(this).width);

    if (!realWidth) {
      realWidth = width || DEFAULT_WIDTH;
    }

    this._width = realWidth;
    this.$.mainCanvas.style.width = `${realWidth}px`;
    this.$.mainCanvas.width = realWidth * devicePixelRatio;
  }

  _updateHeight(height) {
    let realHeight = parseFloat(window.getComputedStyle(this).height);

    if (!realHeight) {
      realHeight = height || DEFAULT_HEIGHT;
    }

    this._height = realHeight;
    this.$.mainCanvas.style.height = `${realHeight}px`;
    this.$.mainCanvas.height = realHeight * devicePixelRatio;
  }

  init() {
    this.subscribe(`canvas${this.canvasId}Draw`, ({ actions, reserve, randid }) => {
      const item = {
        reserve,
        actions,
        randid,
        ts: Date.now(),
      };

      if (this._queue) {
        this._queue.push(item);
      } else {
        this._queue = [item];

        this._drain();
      }
    });

    this.subscribe(`canvas${this.canvasId}ToBase64`, (data) => {
      let { x, y, width, height, destWidth, destHeight } = data;

      this._box = this._getBox();
      x = x || 0;
      y = y || 0;
      (x < 0 || x > this._box.width) && (x = 0);
      (y < 0 || y > this._box.height) && (y = 0);
      width = width ? Math.min(width, this._box.width - x) : this._box.width - x;
      height = height ? Math.min(height, this._box.height - y) : this._box.height - y;
      destWidth = destWidth || width;
      destHeight = destHeight || height;
      const cvs2 = document.createElement('canvas');
      cvs2.width = destWidth;
      cvs2.height = destHeight;
      cvs2.getContext('2d').drawImage(this.$.mainCanvas, x * devicePixelRatio, y * devicePixelRatio, width * devicePixelRatio, height * devicePixelRatio, 0, 0, destWidth, destHeight);
      this.publish(`canvas${this.canvasId}ToBase64Done`, {
        dataUrl: cvs2.toDataURL().replace(/^data:image\/(jpg|png);base64,/, ''),
      });
    });

    this.publish('canvasInsert', {
      canvasId: this.canvasId,
    });
  }

  _drain() {
    if (!this._queue.length) {
      this._queue = null;
      return;
    }

    let item;

    while (this._queue.length) {
      item = this._queue.shift();

      // 测试发现16.7太苛刻了，放宽到20ms丢弃
      if (Date.now() - item.ts < 20) {
        break;
      }
    }

    const { reserve, actions, randid } = item;

    this._lastActions = [].concat(actions);
    this._lastReserve = reserve;
    this._lastRandid = randid;
    this.draw(reserve, actions, randid);
    window.requestAnimationFrame(this._drain.bind(this));
  }

  draw(reserve = null, actions, randid = 0) {
    const { ctx } = this;
    const { mainCanvas } = this.$;

    if (!Array.isArray(actions) || !this.ctx) return;

    ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    // 清除canvas
    if (reserve === false) {
      ctx.fillStyle = '#000000';
      ctx.strokeStyle = '#000000';
      ctx.shadowColor = '#000000';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      ctx.clearRect(0, 0, mainCanvas.width, mainCanvas.height);
    }

    const promiseSeries = (tasks, initial) => {
      if (!Array.isArray(tasks)) {
        return Promise.reject(new TypeError('promise.series only accepts an array of functions'));
      }

      return tasks.reduce((current, next) => {
        return current.then(next);
      }, Promise.resolve(initial));
    };

    promiseSeries(actions.map(({ method, data }) => {
      if (method === 'drawImage') {
        const n = toArray(data);

        n[0] = this.getRealPath(n[0]);
        const imgPath = n[0];
        let p;

        if (!this._images[imgPath]) {
          p = this.preloadImage(imgPath);
        }

        return () => {
          if (!this._images[imgPath].ready) return p;
          return this.drawMethod(method, n);
        };
      }

      return () => {
        return this.drawMethod(method, data);
      };
    })).then(() => {
      this.publish(`canvas${this.canvasId}DrawDone${randid}`, {});
    });
  }

  getRealPath(imgPath) {
    let src;

    if (typeof imgPath === 'string' && imgPath.trim()) {
      if (imgPath.indexOf('http://') === 0
          || imgPath.indexOf('https://') === 0
          || imgPath.indexOf('file://') === 0
          || imgPath.indexOf('data:image') === 0 // base64
          || imgPath.indexOf('local://') === 0 // support custom protocol of IDE
      ) {
        src = imgPath;
      } else {
        src = getRealRoute(this.__dirname || '', imgPath);
      }
    }

    return src;
  }

  preloadImage(imgPath) {
    return new Promise(((resolve, reject) => {
      this._images[imgPath] = new Image();
      this._images[imgPath].crossOrigin = 'anonymous';
      this._images[imgPath].queue = [];

      this._images[imgPath].onload = function () {
        this._images[imgPath].ready = true;
        resolve();
      };

      this._images[imgPath].onerror = function () {
        console.error(`Failed to load image ${imgPath} \n the server responded with a status of 404 (HTTP/1.1 404 Not Found)`);
        resolve();
      };

      this._images[imgPath].src = imgPath;
    }));
  }

  drawMethod(method, data) {
    return new Promise(((resolve, reject) => {
      const { ctx } = this;

      // console.log(`%c${method}`, 'color: red', data);

      // check if a setter
      if (method.indexOf('set') === 0 && method !== 'setTransform') {
        const setterName = lowerCase(method.substr(3));
        const value = null;

        if (setterName === 'fillStyle' || setterName === 'strokeStyle') {
          if (data[0] === 'normal') {
            ctx[setterName] = data[1];
          } else if (data[0] === 'linear') {
            const d = ctx.createLinearGradient.apply(ctx, data[1]);
            data[2].forEach((e) => {
              const t = e[0];
              const n = e[1];
              d.addColorStop(t, n);
            });
            ctx[setterName] = d;
          } else if (data[0] === 'radial') {
            /* eslint-disable no-redeclare */
            const u = data[1][0];
            const h = data[1][1];
            const p = data[1][2];
            const f = [u, h, 0, u, h, p];
            const d = ctx.createRadialGradient.apply(ctx, f);
            data[2].forEach((e) => {
              const t = e[0];
              const n = e[1];
              d.addColorStop(t, n);
            });
            ctx[setterName] = d;
          }

          return resolve();
        } else if (setterName === 'globalAlpha') {
          ctx[setterName] = data[0] / 255;
          return resolve();
        } else if (setterName === 'shadow') {
          const A = ['shadowOffsetX', 'shadowOffsetY', 'shadowBlur', 'shadowColor'];
          data.forEach((e, t) => {
            ctx[A[t]] = e;
          });
          return resolve();
        } else if (setterName === 'font') {
          ctx.font = data[0];
        } else if (setterName === 'lineDash') {
          ctx.setLineDash(data[0]);
          ctx.lineDashOffset = data[1] || 0;
        } else if (setterName === 'textBaseline') {
          data[0] === 'normal' && (data[0] = 'alphabetic');
          ctx.textBaseline = data[0];
        } else {
          ctx[setterName] = data[0];
        }

        return resolve();
      } else if (method === 'fillPath' || method === 'strokePath') {
        method = method.replace(/Path/, '');
        ctx.beginPath();
        data.forEach((e) => {
          ctx[e.method].apply(ctx, e.data);
        });
        ctx[method]();
        return resolve();
      } else if (method === 'drawImage') {
        const n = toArray(data);

        const imgPath = n[0];
        const posParamArray = n.slice(1);
        this._images[imgPath].ready ? ctx.drawImage.apply(ctx, [this._images[imgPath]].concat(posParamArray)) : this._images[imgPath].queue.push(posParamArray);
        return resolve();
      } else if (method === 'clip') {
        data.forEach((e) => {
          return ctx[e.method].apply(ctx, e.data);
        });
        ctx.clip();
        return resolve();
      } else {
        if (typeof ctx[method] === 'function') {
          ctx[method].apply(ctx, data);
        } else if (method in ctx) {
          ctx[method] = data;
        } else {
          console.warn(`canvas context 不存在 ${method}`);
        }

        return resolve();
      }
    }));
  }

  _getBox(style, isRelative) {
    const rect = this.getBoundingClientRect();
    const pos = {
      left: rect.left + window.scrollX,
      top: rect.top + window.scrollY,
      width: this.$.mainCanvas.offsetWidth,
      height: this.$.mainCanvas.offsetHeight,
    };

    if (isRelative) {
      return pos;
    }

    const cs = style || window.getComputedStyle(this);
    const borderTop = parseFloat(cs.getPropertyValue('border-top-width')) || 0;
    const borderBottom = parseFloat(cs.getPropertyValue('border-bottom-width')) || 0;
    const borderLeft = parseFloat(cs.getPropertyValue('border-left-width')) || 0;
    const borderRight = parseFloat(cs.getPropertyValue('border-right-width')) || 0;

    pos.left += borderLeft;
    pos.top += borderTop;
    // pos.width -= borderLeft + borderRight;
    // pos.height -= borderTop + borderBottom;

    return pos;
  }
}

function lowerCase(str) {
  return str.charAt(0).toLowerCase() + str.substr(1);
}

function toArray(e) {
  return Array.isArray(e) ? e : Array.from(e);
}

window.customElements.define(Canvas.is, Canvas);
