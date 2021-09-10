import { html, PolymerElement } from '@polymer/polymer';
import { elementPrefix, upperCasePerfix } from 'utils/config';
import transformRpx from '../nerv/utils/transformRpx';
import { Base, TouchTrack } from './mixins';

const documentContainer = document.createElement('div');
documentContainer.setAttribute('style', 'display: none;');
documentContainer.innerHTML = `
  <dom-module id="swiper-style">
    <template>
      <style>
        ::slotted(*) {
          -webkit-user-select: none;
          user-select: none;
        }
        :host {
          display: block;
          height: 150px;
          -webkit-user-select: none;
          user-select: none;
        }
        :host([hidden]) {
          display: none;
        }
        :host .swiper-wrapper {
          overflow: hidden;
          position: relative;
          width: 100%;
          height: 100%;
          -webkit-transform: translateZ(0);
                  transform: translateZ(0);
        }
        :host .swiper-slides {
          position: absolute;
          left: 0;
          top: 0;
          right: 0;
          bottom: 0;
        }
        :host .swiper-slide-frame {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          height: 100%;
          will-change: transform;
        }
        :host .swiper-dots {
          position: absolute;
          font-size: 0;
        }
        :host .swiper-dots-horizontal {
          left: 50%;
          bottom: 10px;
          text-align: center;
          white-space: nowrap;
          -webkit-transform: translate(-50%, 0);
          transform: translate(-50%, 0);
        }
        :host .swiper-dots-horizontal .swiper-dot {
          margin-right: 8px;
        }
        :host .swiper-dots-horizontal .swiper-dot:last-child {
          margin-right: 0;
        }
        :host .swiper-dots-vertical {
          right: 10px;
          top: 50%;
          text-align: right;
          -webkit-transform: translate(0, -50%);
          transform: translate(0, -50%);
        }
        :host .swiper-dots-vertical .swiper-dot {
          display: block;
          margin-bottom: 9px;
        }
        :host .swiper-dots-vertical .swiper-dot:last-child {
          margin-bottom: 0;
        }
        :host .swiper-dot {
          display: inline-block;
          width: 8px;
          height: 8px;
          cursor: pointer;
          transition-property: background-color;
          transition-timing-function: ease;
          background: rgba(0, 0, 0, 0.3);
          border-radius: 50%;
        }
        :host .swiper-dot-active {
          background-color: #000000;
        }
      </style>
    </template>
  </dom-module>
`;
document.head.appendChild(documentContainer);

const scheduleIntersectionUpdate = null;

class Swiper extends TouchTrack(Base(PolymerElement)) {
  static get is() {
    return `${elementPrefix}-swiper`;
  }

  static get properties() {
    return {
      indicatorDots: {
        type: Boolean,
        value: false,
      },
      vertical: {
        type: Boolean,
        value: false,
        observer: '_updateLayout',
      },
      autoplay: {
        type: Boolean,
        value: false,
        observer: '_autoplayChanged',
      },
      circular: {
        type: Boolean,
        value: false,
        observer: '_updateLayout',
      },
      interval: {
        type: Number,
        value: 5e3,
        observer: '_autoplayChanged',
      },
      duration: {
        type: Number,
        value: 500,
      },
      current: {
        type: Number,
        value: 0,
        observer: '_currentChanged',
      },
      indicatorSize: {
        type: Number,
        value: 8,
      },
      indicatorColor: {
        type: String,
        value: '',
        observer: '_updateDotsColor',
      },
      indicatorActiveColor: {
        type: String,
        value: '',
        observer: '_updateDotsColor',
      },
      previousMargin: {
        type: String,
        value: '',
        observer: '_updateMargin',
      },
      nextMargin: {
        type: String,
        value: '',
        observer: '_updateMargin',
        public: true,
      },
      currentItemId: {
        type: String,
        value: '',
        observer: '_currentItemIdChanged',
      },
      skipHiddenItemLayout: {
        type: Boolean,
        value: false,
        observer: '_skipHiddenItemLayoutChanged',
      },
      displayMultipleItems: {
        type: Number,
        value: 1,
        observer: '_displayMultiItemsChanged',
      },
      touchable: {
        type: Boolean,
        value: true,
      },
    };
  }

  static get template() {
    return html`
      <style include="swiper-style"></style>
      <div id="slidesWrapper" class="swiper-wrapper">
        <div id="slides" class="swiper-slides">
          <div id="slideFrame" class="swiper-slide-frame">
            <slot></slot>
          </div>
        </div>

        <div
          id="slidesDots"
          style$="display: [[showDots(indicatorDots)]]"
          class$="swiper-dots [[dotsClassIfVertical(vertical)]]"
        ></div>
      </div>
    `;
  }

  constructor() {
    super();

    this._attached = false;
    this._invalid = true;
    this._circularEnabled = false;
    this._currentChangeSource = '';
    this._viewportPosition = 0;
    this._marginSpecified = false;
    this._viewportMoveRatio = 1;
    this._scheduleTimeoutObj = null;
    this._animating = null;
    this._requestedAnimation = false;
    this._animateFrameFunc = this._animateFrameFuncProto.bind(this);
    this._itemIdItemMap = {};
    this._items = [];
    this._itemListDirty = false;
    this._userTracking = false;
    this._userDirectionChecked = false;
    this._contentTrackViewport = 0;
    this._contentTrackSpeed = 0;
    this._contentTrackT = 0;
    this._skipHiddenItemLayoutModified = false;
    this.__resetLayout_defer_id = null;

    this.__resetLayout = () => {
      // Throttled layout function
      clearTimeout(this.__resetLayout_defer_id);
      this.__resetLayout_defer_id = setTimeout(this._resetLayout.bind(this), 0);
    };
  }

  ready() {
    super.ready();

    if (this.touchable) {
      this.touchtrack(this.$.slidesWrapper, '_handleContentTrack', true);
    }
    // watch children
    this.addEventListener('swiper-item-link', (e) => {
      e.stopPropagation();

      this._itemListChanged();

      this.__resetLayout();
    });
    this.addEventListener('swiper-item-unlink', (e) => {
      e.stopPropagation();

      this._itemListChanged();

      if (this._getPositionFromCurrent() < 0 && this.current !== 0) {
        // 避免触发current的change回调
        this._currentChangeSource = '__none__'; // 说明原来的current值已经无效了

        this.current = 0;
      }

      this.__resetLayout();
    });
    this.addEventListener('swiper-item-idupdate', (e) => {
      e.stopPropagation();
      const { el, value, oldValue } = e.detail;

      this._itemIdUpdated(el, value, oldValue);
    });
  }

  connectedCallback() {
    super.connectedCallback();

    this._attached = true;
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    this._attached = false;

    this._cancelSchedule();
  }

  _itemIdUpdated(e, t, n) {
    if (t !== n) {
      this._itemListChanged();

      this.currentItemId && this._currentItemIdChanged();
    }
  }

  _currentItemIdChanged(e) {
    if (this._currentChangeSource === '__none__') {
      this._currentChangeSource = '';
      return;
    }

    if (e !== '') {
      this.current = this._getPositionFromCurrent();
    }
  }

  _currentChanged(e, t) {
    if (this._currentChangeSource === '__none__') {
      this._currentChangeSource = '';
      return;
    }

    const n = this._currentChangeSource;
    this._currentChangeSource = '';

    if (!this._isCurrentValueLegal(e)) {
      this.__resetLayout();

      return;
    }

    if (!this._isCurrentValueLegal(t)) {
      this.__resetLayout();

      return;
    }

    if (!n) {
      this._animateViewport(e, '', 0);
    }

    if (e !== t) {
      const i = this._getItems()[e];

      if (i) {
        this.currentItemId = i.itemId;
        this.triggerEvent('change', {
          current: this.current,
          currentItemId: i.itemId,
          source: n,
        });
      }

      this._updateDots(e);
    }
  }

  _updateMargin() {
    this._marginSpecified = true;

    this.__resetLayout();
  }

  _skipHiddenItemLayoutChanged() {
    this._skipHiddenItemLayoutModified = true;

    this._updateLayout();
  }

  _updateLayout() {
    this.__resetLayout();
  }

  _displayMultiItemsChanged() {
    const items = this._getItems();

    if (items.length >= this.displayMultipleItems && items.length - this.displayMultipleItems < this.current) {
      this.current = items.length - this.displayMultipleItems;

      if (this.currentItemId) {
        this.currentItemId = items[this.current].itemId;
      }

      this._currentChangeSource = '__none__';
    }

    this.__resetLayout();
  }

  _autoplayChanged(e) {
    e ? this._scheduleAutoplay() : this._cancelSchedule();
  }

  _itemListChanged() {
    this._itemListDirty = true;
  }

  _updateItemList() {
    this._itemListDirty = false;
    // get children connected to me
    const swiperItems = Array.prototype.slice.call(this.querySelectorAll(`${elementPrefix}-swiper-item`));

    this._items = swiperItems.filter((i) => {
      return this._isThatMyItem(i);
    });

    this._items.forEach((t) => {
      if (t.itemId && !this._itemIdItemMap[t.itemId]) {
        this._itemIdItemMap[t.itemId] = t;
      }
    });
  }

  _getItems() {
    this._itemListDirty && this._updateItemList();
    return this._items;
  }

  _getItemByItemId(e) {
    this._itemListDirty && this._updateItemList();
    return this._itemIdItemMap[e];
  }

  _isThatMyItem(target) {
    const isMe = (node) => {
      if (node.tagName.toUpperCase() === `${upperCasePerfix}-SWIPER`) {
        if (node === this) {
          return true;
        } else {
          return false;
        }
      }

      if (node.parentElement) {
        return isMe(node.parentElement);
      }

      return false;
    };

    return isMe(target.parentElement);
  }

  _scheduleAutoplay() {
    const e = this;

    this._cancelSchedule();

    if (!this._attached || this._invalid || this._getItems().length <= this.displayMultipleItems) {
      return;
    }

    const t = function t() {
      e._currentChangeSource = 'autoplay';

      if (e._circularEnabled) {
        e.current = e._normalizeCurrentValue(e.current + 1);
      } else {
        e.current = e.current + e.displayMultipleItems < e._getItems().length ? e.current + 1 : 0;
      }

      e._animateViewport(e.current, 'autoplay', e._circularEnabled ? 1 : 0);

      e._scheduleTimeoutObj = setTimeout(t, e.interval);
    };

    this._scheduleTimeoutObj = setTimeout(t, this.interval);
  }

  _cancelSchedule() {
    if (this._scheduleTimeoutObj) {
      clearTimeout(this._scheduleTimeoutObj);
      this._scheduleTimeoutObj = null;
    }
  }

  _updateDots(current) {
    const valid = !this._invalid;
    const $slidesDots = this.$.slidesDots;
    $slidesDots.innerHTML = '';

    const items = this._getItems();

    for (let i = 0, l = items.length; i < l; i+=1) {
      const node = document.createElement('div');
      const MIN_INDICATOR_SIZE = 4;
      const size = this.indicatorSize > 0 ? this.indicatorSize : MIN_INDICATOR_SIZE;
      node.setAttribute('data-dot-index', i);
      node.style.width = `${size}px`;
      node.style.height = `${size}px`;
      node.style.marginRight = `${size}px`;
      $slidesDots.appendChild(node);

      if (valid && i >= current && i < current + this.displayMultipleItems || i < current + this.displayMultipleItems - l) {
        node.setAttribute('class', 'swiper-dot swiper-dot-active');

        if (this.indicatorActiveColor) {
          node.style.backgroundColor = this.indicatorActiveColor;
        }
      } else {
        node.setAttribute('class', 'swiper-dot');

        if (this.indicatorColor) {
          node.style.backgroundColor = this.indicatorColor;
        }
      }
    }
  }

  _updateDotsColor() {
    for (let e = this.$.slidesDots, t = 0; t < e.childNodes.length; t+=1) {
      const n = e.childNodes[t];

      if (n.getAttribute('class').indexOf('swiper-dot-active') >= 0) {
        if (this.indicatorActiveColor) {
          n.style.backgroundColor = this.indicatorActiveColor;
        }
      } else if (this.indicatorColor) {
        n.style.backgroundColor = this.indicatorColor;
      }
    }
  }

  _normalizeCurrentValue(e) {
    const t = this._getItems().length;

    if (!t) {
      return -1;
    }

    const n = (Math.round(e) % t + t) % t;

    if (this._circularEnabled) {
      if (t <= this.displayMultipleItems) {
        return 0;
      }
    } else if (n > t - this.displayMultipleItems) {
      return t - this.displayMultipleItems;
    }

    return n;
  }

  _isCurrentValueLegal(e) {
    return !!this._getItems().length && e === this._normalizeCurrentValue(e);
  }

  _transformPropRpx(e) {
    if (/^\s*[+-]?\d+(\.\d+)?(px)?\s*$/i.test(e)) {
      return e.slice(-2) !== 'px' ? `${e}px` : e;
    } else if (/^\s*[+-]?\d+(\.\d+)?rpx\s*$/i.test(e)) {
      return transformRpx(e);
    } else {
      return '';
    }
  }

  _getPositionFromCurrent() {
    if (this.currentItemId) {
      return this._getItems().indexOf(this._getItemByItemId(this.currentItemId));
    }

    if (this._isCurrentValueLegal(this.current)) {
      return this.current;
    }

    return -2;
  }

  _updateHiddenItemDisplay(e) {
    if (this._skipHiddenItemLayoutModified) {
      for (let t = this._getItems(), n = 0; n < t.length; n++) {
        const i = t[n];
        const r = i._position <= e - 2 || i._position >= e + this.displayMultipleItems + 1;
        i.style.display = r ? 'none' : i._originalDisplay;
      }
    }
  }

  _getElementSize(el) {
    return {
      width: this._getElementWidth(el),
      height: this._getElementHeight(el),
    };
  }

  _getElementWidth(el) {
    return this._getElementSizeApi(el, 'width', 375);
  }

  _getElementHeight(el) {
    return this._getElementSizeApi(el, 'height', 150);
  }

  _getElementSizeApi(el, attrName, defaultValue) {
    const DEFAULT = defaultValue;
    const lowerAttrName = attrName.toLowerCase();
    const upperAttrName = lowerAttrName.replace(/[wh]/, (match) => {
      return match.toUpperCase();
    });

    if (el) {
      // e.g. offsetWidth或offsetHeight
      const attrValue = el[`offset${upperAttrName}`]; // 通常执行路径

      if (attrValue > 0) {
        return attrValue;
      } // 元素初始为display:none时的执行路径
      // 尝试获取swiper元素的宽度或高度

      if (window.getComputedStyle) {
        let size = window.getComputedStyle(this)[lowerAttrName];
        size = parseFloat(size);
        return Number.isNaN(size) ? DEFAULT : size;
      }
    }

    return DEFAULT;
  }

  _resetLayout() {
    if (this._attached) {
      this._cancelSchedule();

      this._endViewportAnimation();

      const items = this._getItems();

      if (this.currentItemId) {
        this.current = this._getPositionFromCurrent();

        if (this._currentChangeSource === '__none__') {
          this._currentChangeSource = '';
        }
      }

      const $slides = this.$.slides;
      const $slideFrame = this.$.slideFrame;

      if (this.vertical) {
        if (this._marginSpecified) {
          $slides.style.left = 0;
          $slides.style.right = 0;
          $slides.style.top = this._transformPropRpx(this.previousMargin);
          $slides.style.bottom = this._transformPropRpx(this.nextMargin);
        }

        $slideFrame.style.width = '100%';
        $slideFrame.style.height = `${Math.abs(100 / this.displayMultipleItems)}%`;
      } else {
        if (this._marginSpecified) {
          $slides.style.top = 0;
          $slides.style.bottom = 0;
          $slides.style.left = this._transformPropRpx(this.previousMargin);
          $slides.style.right = this._transformPropRpx(this.nextMargin);
        }

        $slideFrame.style.height = '100%';
        $slideFrame.style.width = `${Math.abs(100 / this.displayMultipleItems)}%`;
      } // cache size for transition calculation

      const size = this._getElementSize($slideFrame);

      this._slidesFrameSizeX = size.width;
      this._slidesFrameSizeY = size.height;
      this._itemPos = [];

      for (let i = 0; i < items.length; i++) {
        if (this._skipHiddenItemLayoutModified) {
          items[i].style.display = items[i]._originalDisplay;
        }

        this._updateItemPos(i, i);
      }

      this._viewportMoveRatio = 1;

      if (this.displayMultipleItems === 1 && items.length) {
        const itemWidth = this._getElementWidth(items[0]);

        const slideFrameWidth = this._getElementWidth(this.$.slideFrame);

        this._viewportMoveRatio = itemWidth / slideFrameWidth;

        if (this._viewportMoveRatio > 1) {
          this._viewportMoveRatio = 1;
        }
      }

      this._circularEnabled = this.circular && items.length > this.displayMultipleItems;
      const a = this._viewportPosition;
      this._viewportPosition = -2;

      const s = this._getPositionFromCurrent();

      if (s >= 0) {
        this._invalid = false;

        if (this._userTracking) {
          this._updateViewport(a + s - this._contentTrackViewport);

          this._contentTrackViewport = s;
        } else {
          this._updateViewport(s);
        }

        this.autoplay && this._scheduleAutoplay();
      } else {
        this._invalid = true;

        this._updateViewport(-this.displayMultipleItems - 1);
      }

      this._updateDots(s);
    }
  }

  _checkCircularLayout(e) {
    if (!this._invalid) {
      const t = this._getItems();

      const n = t.length;
      const i = e + this.displayMultipleItems;

      for (let r = 0; r < n; r++) {
        const o = t[r];
        const a = o._position;
        const s = Math.floor(e / n) * n + r;
        const l = s + n;
        const c = s - n;
        const u = Math.max(e - (s + 1), s - i, 0);
        const d = Math.max(e - (l + 1), l - i, 0);
        const h = Math.max(e - (c + 1), c - i, 0);
        const p = Math.min(u, d, h);
        const f = [s, l, c][[u, d, h].indexOf(p)];
        a !== f && this._updateItemPos(r, f);
      }
    }
  }

  _updateItemPos(e, t) {
    // 计算各元素的位置偏移
    const x = this.vertical ? '0' : `${100 * t}%`;
    const y = this.vertical ? `${100 * t}%` : '0';
    const transfrom = `translate(${x}, ${y}) translateZ(0)`;

    const item = this._getItems()[e];

    item.style['-webkit-transform'] = transfrom;
    item.style.transform = transfrom;
    item.style.position = 'absolute';
    item.style.width = '100%';
    item.style.height = '100%';
    item._position = t;
  }

  _updateViewport(e) {
    if (Math.floor(2 * this._viewportPosition) !== Math.floor(2 * e) || Math.ceil(2 * this._viewportPosition) === Math.ceil(2 * e)) {
      this._circularEnabled && this._checkCircularLayout(e);
      this.skipHiddenItemLayout && this._updateHiddenItemDisplay(e);
    }

    const t = this.vertical ? '0' : `${100 * -e * this._viewportMoveRatio}%`;
    const n = this.vertical ? `${100 * -e * this._viewportMoveRatio}%` : '0';
    const i = `translate(${t}, ${n}) translateZ(0)`;
    this.$.slideFrame.style['-webkit-transform'] = i;
    this.$.slideFrame.style.transform = i;
    this._viewportPosition = e;
  }

  _animateFrameFuncProto() {
    if (!this._animating) {
      this._requestedAnimation = false;
      return;
    }

    const animating = this._animating; // let toPos = animating.toPos;
    // let acc = animating.acc;
    // let endTime = animating.endTime;
    // let source = animating.source;

    const { toPos } = animating;
    const { acc } = animating;
    const { endTime } = animating;
    const { source } = animating;
    const { transitionStart } = animating;
    const o = endTime - Date.now();

    if (o <= 0) {
      this._updateViewport(toPos);

      this._animating = null;
      this._requestedAnimation = false;

      const a = this._getItems()[this.current];

      a && this.triggerEvent('animationfinish', {
        current: this.current,
        currentItemId: a.itemId,
        source,
      });
      return;
    }

    const s = acc * o * o / 2;
    const l = toPos + s; // transition calculation

    let dx = 0;
    let dy = 0;

    if (this.vertical) {
      dy = ~~((l - transitionStart) * this._slidesFrameSizeY);
    } else {
      dx = ~~((l - transitionStart) * this._slidesFrameSizeX);
    }

    this.dispatchEvent(new CustomEvent('transition', {
      detail: {
        dx,
        dy,
      },
      bubbles: true,
      composed: true,
    }));

    this._updateViewport(l);

    window.requestAnimationFrame(this._animateFrameFunc);
  }
  /**
   *
   * @param {number} targetIndex 动画将要移动到的swiper-item的下标
   * @param {string} source 触发动画的原因
   * @param {number} n 枚举值
   */

  _animateViewport(targetIndex, source, n) {
    this._cancelViewportAnimation();

    const { duration } = this;

    const itemsNum = this._getItems().length;

    let vp = this._viewportPosition;

    if (n < 0) {
      while (vp < targetIndex) {
        vp += itemsNum;
      }

      while (vp - itemsNum > targetIndex) {
        vp -= itemsNum;
      }
    } else if (n > 0) {
      while (vp > targetIndex) {
        vp -= itemsNum;
      }

      while (vp + itemsNum < targetIndex) {
        vp += itemsNum;
      }
    } else {
      while (vp + itemsNum < targetIndex) {
        vp += itemsNum;
      }

      while (vp - itemsNum > targetIndex) {
        vp -= itemsNum;
      }

      if (vp + itemsNum - targetIndex < targetIndex - vp && this.circular) {
        vp += itemsNum;
      }
    }

    this._animating = {
      toPos: targetIndex,
      acc: 2 * (vp - targetIndex) / (duration * duration),
      endTime: Date.now() + duration,
      source,
      transitionStart: source === 'touch' ? this._contentTrackViewport : this._viewportPosition,
    };

    if (!this._requestedAnimation) {
      this._requestedAnimation = true;
      window.requestAnimationFrame(this._animateFrameFunc);
    }
  }

  _cancelViewportAnimation() {
    this._animating = null;
  }

  _endViewportAnimation() {
    if (this._animating) {
      this._updateViewport(this._animating.toPos);

      this._animating = null;
    }
  }

  _handleTrackStart(e) {
    this._inDangerArea = e.x <= 13; // ios设备在屏幕左侧该区域右滑会触发webview返回

    this._cancelSchedule();

    this._contentTrackViewport = this._viewportPosition;
    this._contentTrackSpeed = 0;
    this._contentTrackT = Date.now();

    this._cancelViewportAnimation();
  }

  _handleTrackMove(e) {
    const lastT = this._contentTrackT;
    this._contentTrackT = Date.now();
    const ellapsedT = this._contentTrackT - lastT;

    if (this._frozen) {
      return;
    }

    if (e.x < 0 || e.y < 0) {
      this._frozen = true;
      return;
    }

    if (e.x <= 55 && e.ddx > 0 && this._inDangerArea) {
      this._frozen = true;
      return;
    }

    if (ellapsedT === 0) {
      return;
    }

    const i = this._getItems().length;

    const r = i - this.displayMultipleItems;

    const o = function o(e) {
      return 0.5 - 0.25 / (e + 0.5);
    };

    const a = (e, n) => {
      let i = this._contentTrackViewport + e;
      this._contentTrackSpeed = 0.6 * this._contentTrackSpeed + 0.4 * n;

      if (!this._circularEnabled && (i < 0 || i > r)) {
        if (i < 0) {
          i = -o(-i);
        } else if (i > r) {
          i = r + o(i - r);
        }

        this._contentTrackSpeed = 0;
      }

      this._updateViewport(i);
    };
    // transition event
    let { dx, dy } = e;

    if (this.vertical) {
      dx = 0;
      a(-e.dy / this._slidesFrameSizeY, -e.ddy / ellapsedT);
    } else {
      dy = 0;
      a(-e.dx / this._slidesFrameSizeX, -e.ddx / ellapsedT);
    }

    this.dispatchEvent(new CustomEvent('transition', {
      detail: {
        dx: -dx,
        dy: -dy,
      },
      bubbles: true,
      composed: true,
    }));
  }

  _handleTrackEnd(e) {
    this.autoplay && this._scheduleAutoplay();
    this._userTracking = false;
    this._frozen = false;
    const t = this._contentTrackSpeed / Math.abs(this._contentTrackSpeed);
    let n = 0;

    if (!e && Math.abs(this._contentTrackSpeed) > 0.2) {
      n = 0.5 * t;
    }

    const i = this._normalizeCurrentValue(this._viewportPosition + n);

    if (e) {
      this._updateViewport(this._contentTrackViewport);
    } else if (this.current !== i) {
      // 判断滑动的方向
      // 变量t不可靠，因为它表示手指的移动方向，而手指移动方向并不总是决定swiper滑动的方向
      const direction = this.current < this._viewportPosition ? 1 : -1;
      this._currentChangeSource = 'touch';
      this.current = i; // 修复：
      // swiper循环播放开启并且当前视口中是最后一个Item的情况下，用手缓慢将第一个item滑到视口中，并占视口面积一半以上，再松手时，
      // swiper疯狂向右滑（->）经过中间全部的item，到达第一个item的问题
      // 预期应该是向左滑动（<-）一些，停在第一个item上

      this._circularEnabled && (n = direction);

      this._animateViewport(i, 'touch', n);
    } else {
      this._animateViewport(i, 'touch', n);
    }
  }

  _handleContentTrack(e) {
    if (!this._invalid) {
      if (e.detail.state === 'start') {
        this._userTracking = true;
        this._userDirectionChecked = false;
        return this._handleTrackStart(e.detail);
      }

      if (e.detail.state === 'end') {
        return this._handleTrackEnd(false);
      }

      if (e.detail.state === 'cancel') {
        return this._handleTrackEnd(true);
      }

      if (this._userTracking) {
        if (!this._userDirectionChecked) {
          this._userDirectionChecked = true;
          const t = Math.abs(e.detail.dx);
          const n = Math.abs(e.detail.dy);

          if (t >= n && this.vertical) {
            this._userTracking = false;
          } else if (t <= n && !this.vertical) {
            this._userTracking = false;
          }

          if (!this._userTracking) {
            this.autoplay && this._scheduleAutoplay();
            return;
          }
        }

        // touchmove事件不冒泡，与微信对齐
        e.stopPropagation();
        this.dispatchEvent(new CustomEvent('touchmove', {
          detail: {
            srcMoveEvent: e,
          },
          bubbles: true,
          composed: true,
        }));
        // 避免页面滑动
        e.preventDefault();

        this._handleTrackMove(e.detail);

        return false;
      }
    }
  }

  getScrollPosition() {
    return {
      scrollLeft: 0,
      scrollTop: 0,
    };
  }

  dotsClassIfVertical(vertical) {
    return vertical ? 'swiper-dots-vertical' : 'swiper-dots-horizontal';
  }

  showDots(yes) {
    return yes ? 'block' : 'none';
  }
}

window.customElements.define(Swiper.is, Swiper);
