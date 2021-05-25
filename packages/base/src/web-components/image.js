const _Image = /* #__PURE__ */(function (_Base) {
  _inheritsLoose(_Image, _Base);

  _createClass(_Image, null, [{
    key: 'template',
    get: function get() {
      return html$1(_templateObject$7());
    },
  }, {
    key: 'is',
    get: function get() {
      return 'tt-image';
    },
  }, {
    key: 'properties',
    get: function get() {
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
    },
  }]);

  function _Image() {
    let _this;

    _this = _Base.call(this) || this;
    _this._attached = false;
    _this._changeId = 0;
    _this.__pageReRenderCallback = _this._pageReRenderCallback.bind(_assertThisInitialized(_this));
    return _this;
  }

  const _proto = _Image.prototype;

  _proto.connectedCallback = function connectedCallback(e) {
    const _this2 = this;

    _Base.prototype.connectedCallback.call(this);

    this._attached = true;
    this._originalHeight = this.style.height || '';

    if (this.src) {
      setTimeout(() => {
        return _this2._initialize(_this2.lazyLoad);
      });
    }
  };

  _proto.disconnectedCallback = function disconnectedCallback() {
    _Base.prototype.disconnectedCallback.call(this);

    this._attached = false;

    if (this.lazyLoad) {
      scrollUtil.deregisterInstance(this);
    }

    document.removeEventListener('pageReRender', this.__pageReRenderCallback);
  };

  _proto.srcChanged = function srcChanged(old, newOne) {
    const _this3 = this;

    if (this._attached && old !== newOne) {
      setTimeout(() => {
        _this3._changeId++;
        document.removeEventListener('pageReRender', _this3.__pageReRenderCallback);

        _this3._showImage(_this3._changeId);
      });
    }
  };

  _proto.modeChanged = function modeChanged(type, oldMode) {
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
  };

  _proto.getWidth = function getWidth() {
    const e = this.$.imageWrapper.offsetWidth;
    const t = window.getComputedStyle(this.$.imageWrapper);
    return e - ((parseFloat(t.borderLeftWidth) || 0) + (parseFloat(t.borderRightWidth) || 0)) - ((parseFloat(t.paddingLeft) || 0) + (parseFloat(t.paddingRight) || 0));
  };

  _proto.backgroundSizeChanged = function backgroundSizeChanged(e, t) {
    if (!this._disableSizePositionRepeat) {
      this.$.imageWrapper.style.backgroundSize = e;
    }
  };

  _proto.backgroundPositionChanged = function backgroundPositionChanged(e, t) {
    if (!this._disableSizePositionRepeat) {
      this.$.imageWrapper.style.backgroundPosition = e;
    }
  };

  _proto.backgroundRepeatChanged = function backgroundRepeatChanged(e, t) {
    if (!this._disableSizePositionRepeat) {
      this.$.imageWrapper.style.backgroundRepeat = e;
    }
  };

  _proto.lazyLoadChanged = function lazyLoadChanged(e, t) {
    e !== t && t && this._initialize(e);
  };

  _proto._checkMode = function _checkMode(mode) {
    const modes = ['scaleToFill', 'aspectFit', 'aspectFill', 'top', 'bottom', 'center', 'left', 'right', 'top left', 'top right', 'bottom left', 'bottom right'];
    return !!modes.filter((m) => {
      return m === mode;
    }).length;
  };

  _proto._initialize = function _initialize(lazyLoad) {
    if (!lazyLoad || scrollUtil.isNodeVisible(this)) {
      this._showImage(this._changeId);
    } else {
      scrollUtil.registerInstance(this);
    }
  };

  _proto._showImage = function _showImage(id) {
    const _this4 = this;

    this._getImagePath(this.src, (src) => {
      // 为ios支持webp，ios端上劫持该图片请求
      if (is().mobile) ;

      _this4.$.imageWrapper.style.backgroundImage = `url('${src}')`;
      let img = new Image();

      img.onerror = function (e) {
        e.stopPropagation();

        if (id === _this4._changeId) {
          img = null;

          _this4.triggerEvent('error', {
            errMsg: `GET ${src} 404 (Not Found)`,
          });
        }
      };

      img.onload = function (e) {
        e.stopPropagation();

        if (id === _this4._changeId) {
          const radio = _this4.ratio = img.naturalWidth / img.naturalHeight;

          if (_this4.mode === 'widthFix') {
            _this4.style.height = `${_this4.getWidth() / radio}px`;

            _this4.triggerReRender();
          } // img = null

          document.addEventListener('pageReRender', _this4.__pageReRenderCallback);

          // 忘了为啥了
          window.requestAnimationFrame(() => {
            _this4.$.imageWrapper.style.transform = 'translateZ(0)';
            window.requestAnimationFrame(() => {
              _this4.$.imageWrapper.style.transform = '';
            });
          });

          _this4.triggerEvent('load', {
            width: img.naturalWidth,
            height: img.naturalHeight,
          });
        }
      };

      scrollUtil.deregisterInstance(_this4);
      img.src = src;
    });
  };

  _proto._pageReRenderCallback = function _pageReRenderCallback() {
    if (this.mode === 'widthFix' && this.ratio !== null) {
      this.style.height = `${this.getWidth() / this.ratio}px`;
    }

    scrollUtil.checkUnloadedImages();
  };

  _proto._getImagePath = function _getImagePath(e, callback) {
    const _is = is();

    const cc = isInCustomComponent(this);
    const dirname_abs = cc ? cc.is : '';

    if ((e === null ? 'undefined' : _typeof(e)) !== null && typeof callback === 'function') {
      e = e ? e.toString().trim() : '';

      if (e.slice(0, 2) === '//') {
        e = `http:${e}`;
      } // 绝对地址

      if (is(e).file || is(e).http || is(e).dataImage || is(e).blob) {
        callback(e);
      } else if (is(e).ttfile) {
        // h5 小程序不能显示file 协议图片
        if (window.isH5) {
          tt.getProtocolPathAddFileInfo(e, callback);
        } else {
          tt.getProtocolXPath(e, callback);
        }
      } else {
        {
          const { dirName } = window;
          const httpPath = `http://127.0.0.1:${staticPort}/static/dist/public/${dirName}/tmp`;
          e = tt.getRealRoute(httpPath, tt.getRealRoute(dirname_abs || window.__route__, e));
          callback(e);
        }
      }
    }
  };

  _proto.__widthChanged = function __widthChanged(val) {
    if (val) {
      const numberVal = Number(val);

      if (numberVal) {
        val += 'px';
      }

      this.style.width = val;
    }
  };

  _proto.__heightChanged = function __heightChanged(val) {
    if (val) {
      const numberVal = Number(val);

      if (numberVal) {
        val += 'px';
      }

      this.style.height = val;
    }
  };

  return _Image;
})(Base(PolymerElement));
