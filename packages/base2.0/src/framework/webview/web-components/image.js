/* eslint-disable default-case */
import { PolymerElement, html } from '@polymer/polymer';
import { elementPrefix } from '@utils/config';
import resolvePageUrl from '@/framework/utils/resolvePageUrl';
import { getCurrentPageImpl } from '@/framework/App';

import { Base } from './mixins';
import scrollUtil from './utils/scrollUtil';

const documentContainer = document.createElement('div');
documentContainer.setAttribute('style', 'display: none;');
documentContainer.innerHTML = `
  <dom-module id="image-style">
    <template>
      <style>
        #imageWrapper {
          height: 100%;
          width: 100%;
        }
      </style>
    </template>
  </dom-module>
`;
document.head.appendChild(documentContainer);

class Image extends Base(PolymerElement) {
  static get is() {
    return `${elementPrefix}-image`;
  }

  static get properties() {
    return {
      src: {
        type: String,
        observer: 'srcChanged',
        reflectToAttribute: true,
      },
      mode: {
        type: String,
        observer: 'modeChanged',
      },
      backgroundSize: {
        type: String,
        observer: 'backgroundSizeChanged',
      },
      backgroundPosition: {
        type: String,
        observer: 'backgroundPositionChanged',
      },
      backgroundRepeat: {
        type: String,
        observer: 'backgroundRepeatChanged',
      },
      _disableSizePositionRepeat: {
        type: Boolean,
      },
      width: {
        type: String,
        observer: '__widthChanged',
      },
      height: {
        type: String,
        observer: '__heightChanged',
      },
      lazyLoad: {
        type: Boolean,
        observer: 'lazyLoadChanged',
      },
    };
  }

  static get template() {
    return html`
      <style include="image-style">
        :host {
          width: 300px;
          height: 225px;
          display: inline-block;
          overflow: hidden;
        }

        :host([ hidden ]) {
          display: none;
        }

      </style>
      <div 
        style="background-size:100% 100%; border-radius:inherit; background-repeat:no-repeat;" 
        id="imageWrapper"
      ></div>
    `;
  }

  constructor() {
    super();

    this._attached = false;
    this._changeId = 0;
    this.__pageReRenderCallback = this._pageReRenderCallback.bind(this);
  }

  connectedCallback(e) {
    super.connectedCallback();

    this._attached = true;
    this._originalHeight = this.style.height || '';

    if (this.src) {
      setTimeout(() => {
        return this._initialize(this.lazyLoad);
      });
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    this._attached = false;

    if (this.lazyLoad) {
      scrollUtil.deregisterInstance(this);
    }

    document.removeEventListener('pageReRender', this.__pageReRenderCallback);
  }

  srcChanged(old, newOne) {
    if (this._attached && old !== newOne) {
      setTimeout(() => {
        this._changeId++;
        document.removeEventListener('pageReRender', this.__pageReRenderCallback);

        this._showImage(this._changeId);
      });
    }
  }

  modeChanged(type, oldMode) {
    // not giving mode
    if (!this._checkMode(type)) {
      this._disableSizePositionRepeat = false;
      return;
    }

    if (oldMode === 'widthFix') {
      this.style.height = this._originalHeight;
    }

    this._disableSizePositionRepeat = true;
    this.$.imageWrapper.style.backgroundSize = 'auto auto';
    this.$.imageWrapper.style.backgroundPosition = '0% 0%';
    this.$.imageWrapper.style.backgroundRepeat = 'no-repeat';

    switch (type) {
      case 'scaleToFill':
        this.$.imageWrapper.style.backgroundSize = '100% 100%';
        break;

      case 'aspectFit':
        this.$.imageWrapper.style.backgroundSize = 'contain';
        this.$.imageWrapper.style.backgroundPosition = 'center center';
        break;

      case 'aspectFill':
        this.$.imageWrapper.style.backgroundSize = 'cover';
        this.$.imageWrapper.style.backgroundPosition = 'center center';
        break;

      case 'widthFix':
        this.$.imageWrapper.style.backgroundSize = '100% 100%';
        break;

      case 'top':
        this.$.imageWrapper.style.backgroundPosition = 'top center';
        break;

      case 'bottom':
        this.$.imageWrapper.style.backgroundPosition = 'bottom center';
        break;

      case 'center':
        this.$.imageWrapper.style.backgroundPosition = 'center center';
        break;

      case 'left':
        this.$.imageWrapper.style.backgroundPosition = 'center left';
        break;

      case 'right':
        this.$.imageWrapper.style.backgroundPosition = 'center right';
        break;

      case 'top left':
        this.$.imageWrapper.style.backgroundPosition = 'top left';
        break;

      case 'top right':
        this.$.imageWrapper.style.backgroundPosition = 'top right';
        break;

      case 'bottom left':
        this.$.imageWrapper.style.backgroundPosition = 'bottom left';
        break;

      case 'bottom right':
        this.$.imageWrapper.style.backgroundPosition = 'bottom right';
    }
  }

  getWidth() {
    const e = this.$.imageWrapper.offsetWidth;
    const t = window.getComputedStyle(this.$.imageWrapper);
    return e - ((parseFloat(t.borderLeftWidth) || 0) + (parseFloat(t.borderRightWidth) || 0)) - ((parseFloat(t.paddingLeft) || 0) + (parseFloat(t.paddingRight) || 0));
  }

  backgroundSizeChanged(e, t) {
    if (!this._disableSizePositionRepeat) {
      this.$.imageWrapper.style.backgroundSize = e;
    }
  }

  backgroundPositionChanged(e, t) {
    if (!this._disableSizePositionRepeat) {
      this.$.imageWrapper.style.backgroundPosition = e;
    }
  }

  backgroundRepeatChanged(e, t) {
    if (!this._disableSizePositionRepeat) {
      this.$.imageWrapper.style.backgroundRepeat = e;
    }
  }

  lazyLoadChanged(e, t) {
    e !== t && t && this._initialize(e);
  }

  _checkMode(mode) {
    const modes = ['scaleToFill', 'aspectFit', 'aspectFill', 'top', 'bottom', 'center', 'left', 'right', 'top left', 'top right', 'bottom left', 'bottom right'];
    return !!modes.filter((m) => {
      return m === mode;
    }).length;
  }

  _initialize(lazyLoad) {
    if (!lazyLoad || scrollUtil.isNodeVisible(this)) {
      this._showImage(this._changeId);
    } else {
      scrollUtil.registerInstance(this);
    }
  }

  _showImage(id) {
    this._getImagePath(this.src, (src) => {
      this.$.imageWrapper.style.backgroundImage = `url('${src}')`;
      let img = new Image();

      img.onerror = function (e) {
        e.stopPropagation();

        if (id === this._changeId) {
          img = null;

          this.triggerEvent('error', {
            errMsg: `GET ${src} 404 (Not Found)`,
          });
        }
      };

      img.onload = function (e) {
        e.stopPropagation();

        if (id === this._changeId) {
          this.ratio = img.naturalWidth / img.naturalHeight;
          const radio = this.ratio;

          if (this.mode === 'widthFix') {
            this.style.height = `${this.getWidth() / radio}px`;

            this.triggerReRender();
          }

          document.addEventListener('pageReRender', this.__pageReRenderCallback);

          this.triggerEvent('load', {
            width: img.naturalWidth,
            height: img.naturalHeight,
          });
        }
      };

      scrollUtil.deregisterInstance(this);
      img.src = src;
    });
  }

  _pageReRenderCallback() {
    if (this.mode === 'widthFix' && this.ratio !== null) {
      this.style.height = `${this.getWidth() / this.ratio}px`;
    }

    scrollUtil.checkUnloadedImages();
  }

  _getImagePath(source, callback) {
    let src;
    if (typeof source === 'string' && source.trim()) {
      if (source.indexOf('http://') === 0
          || source.indexOf('https://') === 0
          || source.indexOf('file://') === 0
          || source.indexOf('data:image') === 0 // base64
          || source.indexOf('myfile://') === 0 // support custom protocol of IDE
          || source.indexOf('local://') === 0 // support custom protocol of IDE
          || source.indexOf('temp://') === 0 // support custom protocol of IDE
      ) {
        src = source;
      } else {
        src = resolvePageUrl(source, getCurrentPageImpl());
        const { tinyRuntimeConfig } = self;

        if (tinyRuntimeConfig && tinyRuntimeConfig.contextPath) {
          src = `${tinyRuntimeConfig.contextPath}/${src}`;
        } else {
          src = `/${src}`;
        }
      }
    }

    callback(src);
  }

  __widthChanged(val) {
    if (val) {
      const numberVal = Number(val);

      if (numberVal) {
        val += 'px';
      }

      this.style.width = val;
    }
  }

  __heightChanged(val) {
    if (val) {
      const numberVal = Number(val);

      if (numberVal) {
        val += 'px';
      }

      this.style.height = val;
    }
  }
}

window.customElements.define(Image.is, Image);
