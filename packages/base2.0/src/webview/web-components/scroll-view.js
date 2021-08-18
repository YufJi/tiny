import { PolymerElement, html } from '@polymer/polymer';
import { elementPrefix } from 'utils/config';
import { Base, TouchTrack } from './mixins';
import bezier from './utils/bezier';

const easyOutEasing = bezier(0, 0, 0.58, 1);

class ScrollView extends TouchTrack(Base(PolymerElement)) {
  static get is() {
    return `${elementPrefix}-scroll-view`;
  }

  static get properties() {
    return {
      scrollX: {
        type: Boolean,
        value: false,
        observer: '_scrollXChanged',
        reflectToAttribute: true,
      },
      scrollY: {
        type: Boolean,
        value: false,
        observer: '_scrollYChanged',
        reflectToAttribute: true,
      },
      upperThreshold: {
        type: Number,
        value: 50,
      },
      lowerThreshold: {
        type: Number,
        value: 50,
      },
      scrollWithAnimation: {
        type: Boolean,
        value: false,
        reflectToAttribute: true,
      },
    };
  }

  static get template() {
    return html`
      <style>
        :host {
          display: block;
          width: 100%;
        }

        :host([ hidden ]) {
          display: none;
        }

        .scroll {
          position: relative;
          -webkit-overflow-scrolling: touch;
          height: 100%;
          width: 100%;
          max-height: inherit;
        }

        .scroll::-webkit-scrollbar {
          display: none;
        }
      </style>

      <div id="wrap" class="scroll">
        <div id="main" style="overflow-x: hidden; overflow-y: hidden;" class="scroll">
          <div id="content">
            <slot></slot>
          </div>
        </div>
      </div>
    `;
  }

  get scrollTop() {
    return this.$$scrollTop;
  }

  set scrollTop(newValue) {
    const old = this.$$scrollTop;
    this.$$scrollTop = this._deserializeValue(newValue, Number);

    if (this._attached) {
      this._scrollTopChanged(this.$$scrollTop, old);
    }
  }

  get scrollLeft() {
    return this.$$scrollLeft;
  }

  set scrollLeft(newValue) {
    const old = this.$$scrollLeft;
    this.$$scrollLeft = this._deserializeValue(newValue, Number);

    if (this._attached) {
      this._scrollLeftChanged(this.$$scrollLeft, old);
    }
  }

  get scrollIntoView() {
    return this.$$scrollIntoView;
  }

  set scrollIntoView(newValue) {
    const old = this.$$scrollIntoView;
    this.$$scrollIntoView = this._deserializeValue(newValue, String);

    if (this._attached) {
      this._scrollIntoViewChanged(this.$$scrollIntoView, old);
    }
  }

  constructor() {
    super();

    this._handleScroll = this._handleScroll.bind(this);
    this.__pageRerender = this._pageRerender.bind(this);

    this.__handleTouchStart = this.__handleTouchStart.bind(this);
    this.__handleTouchMove = this.__handleTouchMove.bind(this);
    this.__handleTouchEnd = this.__handleTouchEnd.bind(this);
    this.__handleScroll = this.__handleScroll.bind(this);
  }

  ready() {
    super.ready();

    this.touchtrack(this.$.main, '_handleTrack');
  }

  connectedCallback() {
    super.connectedCallback();

    this._attached = true;
    this._lastScrollTop = this.scrollTop || 0;
    this._lastScrollLeft = this.scrollLeft || 0;
    this._lastScrollToUpperTime = 0;
    this._lastScrollToLowerTime = 0;

    this._scrollXChanged(this.scrollX);

    this._scrollYChanged(this.scrollY);

    this._scrollTopChanged(this.scrollTop);

    this._scrollLeftChanged(this.scrollLeft);

    this._scrollIntoViewChanged(this.scrollIntoView);

    this.$.main.addEventListener('touchstart', this.__handleTouchStart);
    this.$.main.addEventListener('touchmove', this.__handleTouchMove);
    this.$.main.addEventListener('touchend', this.__handleTouchEnd);
    this.$.main.addEventListener('scroll', this.__handleScroll);
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    this.$.main.removeEventListener('scroll', this.__handleScroll);
    this.$.main.removeEventListener('touchstart', this.__handleTouchStart);
    this.$.main.removeEventListener('touchmove', this.__handleTouchMove);
    this.$.main.removeEventListener('touchend', this.__handleTouchEnd);
  }

  __handleTouchMove(e) {
    // 如果当前在做scrollTop的动画，直接清除动画。
    if (this.__rafId) {
      this.__currentAnimCanceled = true;
      setTimeout(() => {
        this.__currentAnimCanceled = false;
      }, 50);
    }

    if (this.__hasKeyboard) {
      // 解决ios的bug
      this.__hasKeyboard = false;

      // this.invoke('endEditing');
    }
  }

  __handleTouchStart(e) {
    const $main = this.$.main;

    if ($main.scrollHeight > $main.offsetHeight) {
      // this.invoke('disableScrollBounce', {
      //   disable: true,
      // });
    }
  }

  __handleTouchEnd(e) {
    // e.target不指向main，所以此处手动指定
    this._handleScroll({
      target: this.$.main,
      timeStamp: e.timeStamp,
    }, true);

    // this.invoke('disableScrollBounce', {
    //   disable: false,
    // });
  }

  __handleScroll(e) {
    e.preventDefault();
    e.stopPropagation();

    this._handleScroll(e);

    document.dispatchEvent(new CustomEvent(`${elementPrefix}-scroll-view`));
  }

  async scrollTo(scrollTop, direction) {
    if (!this.__rafId) {
      const { main, content } = this.$;

      if (scrollTop < 0) {
        scrollTop = 0;
      } else if (direction === 'x' && scrollTop > main.scrollWidth - main.offsetWidth) {
        scrollTop = main.scrollWidth - main.offsetWidth;
      } else if (direction === 'y' && scrollTop > main.scrollHeight - main.offsetHeight) {
        scrollTop = main.scrollHeight - main.offsetHeight;
      }

      let r = 0;

      if (direction === 'x') {
        r = main.scrollLeft - scrollTop;
      } else if (direction === 'y') {
        r = main.scrollTop - scrollTop;
      }

      if (r !== 0) {
        let getTransformStr = function () {
          return '';
        };

        if (direction === 'x') {
          getTransformStr = function (val) {
            return `translateX(${val}px) translateZ(0)`;
          };
        } else if (direction === 'y') {
          getTransformStr = function (val) {
            return `translateY(${val}px) translateZ(0)`;
          };
        }

        this.__transitionEnd = this._transitionEnd.bind(this, scrollTop, direction);

        if (direction === 'x') {
          main.style.overflowX = 'hidden';
        } else if (direction === 'y') {
          main.style.overflowY = 'hidden';
        }

        await this._doScrollTopChangeAnimate(content, r, getTransformStr);
        this.__transitionEnd();
      }
    }
  }

  _doScrollTopChangeAnimate(content, scrollTop, getTransformStr) {
    return new Promise(((resolve) => {
      this.__rafId = null;
      const duration = 300;
      let start;

      const animate = function animate(ts = 0) {
        start = start || ts;
        const dt = ts - start;
        const percent = Math.min(dt / duration, 1);
        const curTransform = getTransformStr(easyOutEasing(percent) * scrollTop);
        content.style.transform = curTransform;
        content.style.webkitTransform = curTransform;

        if (dt >= duration || this.__currentAnimCanceled) {
          window.cancelAnimationFrame(this.__rafId);
          this.__rafId = null;
          resolve();
        } else {
          this.__rafId = window.requestAnimationFrame(animate);
        }
      };

      animate();
    }));
  }

  _getStyle(overflowX, overflowY) {
    return `overflow-x: ${overflowX ? 'auto' : 'hidden'}; overflow-y: ${overflowY ? 'auto' : 'hidden'};`;
  }

  _handleTrack(e) {
    if (e.detail.state === 'start') {
      this._noBubble = null;
      return;
    }

    if (e.detail.state === 'end') {
      this._noBubble = false;
    }

    if (this._noBubble === null && this.scrollY) {
      if (Math.abs(e.detail.ddy) / Math.abs(e.detail.ddx) > 1) {
        this._noBubble = true;
      } else {
        this._noBubble = false;
      }
    }

    if (this._noBubble === null && this.scrollX) {
      if (Math.abs(e.detail.ddx) / Math.abs(e.detail.ddy) > 1) {
        this._noBubble = true;
      } else {
        this._noBubble = false;
      }
    }

    if (this._noBubble) {
      e.stopPropagation(); // 发个别的事件，避免需要touchmove的场景得不到应有的事件

      this.dispatchEvent(new CustomEvent(`${elementPrefix}-touchmove`, {
        detail: {
          srcMoveEvent: e,
        },
        bubbles: true,
        composed: true,
      }));
    }
  }

  _handleScroll(e, fireByTouchEnd = false) {
    if (!(e.timeStamp - this._lastScrollTime < 20) || fireByTouchEnd) {
      this._lastScrollTime = e.timeStamp;

      const { scrollTop, scrollHeight, scrollWidth, scrollLeft, offsetHeight, offsetWidth } = e.target;

      if (!fireByTouchEnd) {
        this.triggerEvent('scroll', {
          scrollLeft,
          scrollTop,
          scrollHeight,
          scrollWidth,
          deltaX: this._lastScrollLeft - scrollLeft,
          deltaY: this._lastScrollTop - scrollTop,
        });
      }

      if (this.scrollY) {
        const n = this._lastScrollTop - scrollTop > 0;
        const i = this._lastScrollTop - scrollTop < 0;

        if (Math.floor(scrollTop) <= this.upperThreshold && n && e.timeStamp - this._lastScrollToUpperTime > 200) {
          this.triggerEvent('scrolltoupper', {
            direction: 'top',
          });
          this._lastScrollToUpperTime = e.timeStamp;
        }

        if (Math.ceil(scrollTop) + offsetHeight + this.lowerThreshold >= scrollHeight && i && e.timeStamp - this._lastScrollToLowerTime > 200) {
          this.triggerEvent('scrolltolower', {
            direction: 'bottom',
          });
          this._lastScrollToLowerTime = e.timeStamp;
        }
      }

      if (this.scrollX) {
        const r = this._lastScrollLeft - scrollLeft > 0;
        const o = this._lastScrollLeft - scrollLeft < 0;

        if (Math.floor(scrollLeft) <= this.upperThreshold && r && e.timeStamp - this._lastScrollToUpperTime > 200) {
          this.triggerEvent('scrolltoupper', {
            direction: 'top',
          });
          this._lastScrollToUpperTime = e.timeStamp;
        }

        if (Math.ceil(scrollLeft) + offsetWidth + this.lowerThreshold >= scrollWidth && o && e.timeStamp - this._lastScrollToLowerTime > 200) {
          this.triggerEvent('scrolltolower', {
            direction: 'bottom',
          });
          this._lastScrollToLowerTime = e.timeStamp;
        }
      }

      this._lastScrollTop = scrollTop;
      this._lastScrollLeft = scrollLeft;
    }
  }

  _scrollXChanged(e) {
    if (e) {
      if (this.scrollY) {
        document.removeEventListener('pageReRender', this.__pageRerender);
        this.$.main.style.overflowX = 'auto';
        this.$.main.style.paddingBottom = '';
        this.$.wrap.style.overflowY = '';
        this.$.wrap.style.height = '';
        this.$.content.style.height = '100%';
        return;
      }

      undefined === this._isAutoHeight && this._checkIsAutoHeight();
      this.$.main.style.overflowX = 'auto';
      this.$.main.style.paddingBottom = '20px';
      this.$.wrap.style.overflowY = 'hidden';

      if (this._isAutoHeight) {
        this.$.wrap.style.height = `${this.$.content.offsetHeight}px`;
        this.$.content.style.height = '';
      } else {
        this.$.wrap.style.height = '';
        this.$.content.style.height = `${this.offsetHeight}px`;
      }

      document.addEventListener('pageReRender', this.__pageRerender);
    } else {
      document.removeEventListener('pageReRender', this.__pageRerender);
      this.$.main.style.overflowX = 'hidden';
      this.$.main.style.paddingBottom = '';
      this.$.wrap.style.overflowY = '';
      this.$.wrap.style.height = '';
      this.$.content.style.height = '100%';
    }
  }

  _scrollYChanged(e) {
    this.$.main.style.overflowY = e ? 'auto' : 'hidden';
  }

  _checkIsAutoHeight() {
    this.$.wrap.style.height = 0;
    let e = getComputedStyle(this);
    let t = parseFloat(e.borderBottomWidth) || 0;
    let n = parseFloat(e.borderTopWidth) || 0;
    let i = parseFloat(e.paddingTop) || 0;
    let r = parseFloat(e.paddingBottom) || 0;
    this._isAutoHeight = this.offsetHeight === t + n + i + r;
    const o = 1e4 * Math.random() | 0;
    this.$.wrap.style.height = `${o}px`;
    e = getComputedStyle(this);
    t = parseFloat(e.borderBottomWidth) || 0;
    n = parseFloat(e.borderTopWidth) || 0;
    i = parseFloat(e.paddingTop) || 0;
    r = parseFloat(e.paddingBottom) || 0;
    this._isAutoHeight = this._isAutoHeight || this.offsetHeight === t + n + i + r + o;
  }

  _scrollTopChanged(scrollTop) {
    if (isNaN(scrollTop)) {
      scrollTop = 0;
    }

    if (this.scrollY) {
      Promise.resolve().then(() => {
        this.scrollWithAnimation ? this.scrollTo(scrollTop, 'y') : this.$.main.scrollTop = scrollTop;
      });
    }
  }

  _scrollLeftChanged(scrollLeft) {
    if (isNaN(scrollLeft)) {
      scrollLeft = 0;
    }

    if (this.scrollX) {
      Promise.resolve().then(() => {
        this.scrollWithAnimation ? this.scrollTo(scrollLeft, 'x') : this.$.main.scrollLeft = scrollLeft;
      });
    }
  }

  _scrollIntoViewChanged(targetId) {
    if (!targetId) {
      return;
    }

    if (!/^[_a-zA-Z][-_a-zA-Z0-9:]*$/.test(targetId)) {
      console.warn(`scroll-into-view="${targetId}" 有误`);
      console.warn('target id 属性值格式错误');
      return;
    }
    // wait for detached tree ready
    setTimeout(() => {
      const targetEle = this.querySelector(`#${targetId}`);

      if (!targetEle) {
        return;
      }

      const mainStyle = this.$.main.getBoundingClientRect();

      const targetStyle = targetEle.getBoundingClientRect();

      if (this.scrollX) {
        const gapX = targetStyle.left - mainStyle.left;
        const mainLeft = this.$.main.scrollLeft;
        const scrollLeft = mainLeft + gapX;
        this.scrollWithAnimation ? this.scrollTo(scrollLeft, 'x') : this.$.main.scrollLeft = scrollLeft;
      }

      if (this.scrollY) {
        const gapY = targetStyle.top - mainStyle.top;
        const mainScrollTop = this.$.main.scrollTop;
        const scrollTop = mainScrollTop + gapY;
        this.scrollWithAnimation ? this.scrollTo(scrollTop, 'y') : this.$.main.scrollTop = scrollTop;
      }
    }, 10);
  }

  getScrollPosition() {
    const e = this.$.main;
    return {
      scrollLeft: e.scrollLeft,
      scrollTop: e.scrollTop,
    };
  }

  _transitionEnd(e, oldOne) {
    const { main, content } = this.$;

    content.style.transform = '';
    content.style.webkitTransform = '';

    if (oldOne === 'x') {
      main.style.overflowX = this.scrollX ? 'auto' : 'hidden';
      main.scrollLeft = e;
    } else if (oldOne === 'y') {
      main.style.overflowY = this.scrollY ? 'auto' : 'hidden';
      main.scrollTop = e;
    }
  }

  _pageRerender() {
    window.requestAnimationFrame(() => {
      if (!(this.offsetHeight === this._lastOutterHeight && this.$.content.offsetHeight === this._lastContenHeight)) {
        this._checkIsAutoHeight();

        if (this._isAutoHeight) {
          this.$.wrap.style.height = `${this.$.content.offsetHeight}px`;
          this.$.content.style.height = '';
        } else {
          this.$.wrap.style.height = '';
          this.$.content.style.height = `${this.offsetHeight}px`;
        }

        this._lastOutterHeight = this.offsetHeight;
        this._lastContenHeight = this.$.content.offsetHeight;
      }
    });
  }
}

window.customElements.define(ScrollView.is, ScrollView);
