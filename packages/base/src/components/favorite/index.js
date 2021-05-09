__webpack_require__.r(__webpack_exports__);
/* harmony import */ const babel_runtime_helpers_extends__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! babel-runtime/helpers/extends */ './node_modules/babel-runtime-loose/helpers/extends.js');
/* harmony import */ const babel_runtime_helpers_extends__WEBPACK_IMPORTED_MODULE_0___default = /* #__PURE__ */__webpack_require__.n(babel_runtime_helpers_extends__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ const react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ './node_modules/react/index.js');
/* harmony import */ const react__WEBPACK_IMPORTED_MODULE_1___default = /* #__PURE__ */__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ const _framework_dev__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @/framework/ */ './src/framework/dev.tsx');
/* harmony import */ const create_react_class__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! create-react-class */ './node_modules/create-react-class/index.js');
/* harmony import */ const create_react_class__WEBPACK_IMPORTED_MODULE_3___default = /* #__PURE__ */__webpack_require__.n(create_react_class__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ const classnames__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! classnames */ './node_modules/classnames/index.js');
/* harmony import */ const classnames__WEBPACK_IMPORTED_MODULE_4___default = /* #__PURE__ */__webpack_require__.n(classnames__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ const _shared_Button__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../shared/Button */ './src/shared/Button.tsx');
/* harmony import */ const _utils_callInternalAPI__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @/utils/callInternalAPI */ './src/utils/callInternalAPI.tsx');
/* harmony import */ const _utils_callBridge__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @/utils/callBridge */ './src/utils/callBridge.tsx');
/* harmony import */ const _utils_addEvents__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @/utils/addEvents */ './src/utils/addEvents.tsx');
/* harmony import */ const _utils_system__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! @/utils/system */ './src/utils/system.tsx');
/* harmony import */ const _index_less__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./index.less */ './src/favorite/index.less');
/* harmony import */ const _index_less__WEBPACK_IMPORTED_MODULE_10___default = /* #__PURE__ */__webpack_require__.n(_index_less__WEBPACK_IMPORTED_MODULE_10__);
/* harmony import */ const react_dom__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! react-dom */ './node_modules/react-dom/index.js');
/* harmony import */ const react_dom__WEBPACK_IMPORTED_MODULE_11___default = /* #__PURE__ */__webpack_require__.n(react_dom__WEBPACK_IMPORTED_MODULE_11__);

const g10135 = Object(_utils_system__WEBPACK_IMPORTED_MODULE_9__.compareSystemVersion)('10.1.35') >= 0;

const prefixCls = 'a-favorite';
const iconHasNoBg = 'https://gw.alipayobjects.com/zos/rmsportal/rHIPJaJAipeAaSnPoZrG.png';
const iconHasBg = 'https://gw.alipayobjects.com/zos/rmsportal/MQNfemDmnDTuCEjZKxUa.png';
let current = null;
const FAVORITE_APPID = '68687164';
function removeInternal(id) {
  Object(_utils_callBridge__WEBPACK_IMPORTED_MODULE_7__.default)('NBComponent.remove', {
    element: id,
  });
}
function removeNBComponent(id) {
  const elem = document.getElementById(id);
  if (elem) {
    const childrens = elem.children;
    if (childrens) {
      for (let i = 0; i < childrens.length; i++) {
        removeNBComponent(childrens[i].id);
      }
    }
    removeInternal(id);
  }
}
const Favorite = Object(_framework_dev__WEBPACK_IMPORTED_MODULE_2__.createComponent)({
  name: 'favorite',
})(create_react_class__WEBPACK_IMPORTED_MODULE_3___default()({
  displayName: 'Favorite',
  getInitialState: function getInitialState() {
    current = current || this;
    this.appId = Object(_framework_dev__WEBPACK_IMPORTED_MODULE_2__.getStartupParams)().appId;
    const { titleBarColor } = Object(_framework_dev__WEBPACK_IMPORTED_MODULE_2__.getStartupParams)();
    this.bgColor = '';
    if (titleBarColor) {
      this.bgColor = `#${titleBarColor.toString(16)}`;
    }
    this.hasBGC = titleBarColor !== undefined && `${titleBarColor}` !== '16777215';
    this.closeIcon = 'https://gw.alipayobjects.com/zos/rmsportal/MexNKXyjnklNPGFrOzXv.png';
    this.favIcon = 'https://gw.alipayobjects.com/zos/rmsportal/kmGXGCMPGEHFvxWfkDTI.png';
    if (this.hasBGC) {
      this.closeIcon = 'https://gw.alipayobjects.com/zos/rmsportal/rWzUILlTmaibwKAivSlz.png';
      this.favIcon = 'https://gw.alipayobjects.com/zos/rmsportal/uYbkkkQlMTkFtatIZVJA.png';
    }
    // 疲劳度处理（3天内出现一次，总共出现3次）
    // 关闭，收藏两个action
    this.showTimes = 0;
    this.showTimesSetOnce = false;
    this.modalShowTimes = 0;
    this.appIsAtHome = false; // 默认收藏小程序不在首页
    return {
      doHide: false,
      appIcon: '',
      isFavorite: undefined,
      slogan: '',
      showModal: false,
      modalType: 0,
    };
  },
  componentDidMount: function componentDidMount() {
    const _this = this;

    this.favoriteEvents = Object(_utils_addEvents__WEBPACK_IMPORTED_MODULE_8__.default)(document, {
      'nbcomponent.text.bindtap': this.onTap,
      'nbcomponent.image.bindtap': this.onTap,
    });
    if (current !== this) {
      return;
    }
    Object(_utils_callBridge__WEBPACK_IMPORTED_MODULE_7__.default)('getAppInfo', {
      appId: this.appId,
      stageCode: '',
    }, (res) => {
      _this.setState({
        appIcon: res.iconUrl,
        slogan: res.slogan,
      });
    });
    const { appId } = this;
    Object(_utils_callInternalAPI__WEBPACK_IMPORTED_MODULE_6__.default)('getClientConfig', {
      configKey: 'ta_fav_comp_whitelist',
    }, (res) => {
      if (res.configKey && typeof res.configKey === 'string' && (res.configKey.indexOf(appId) > -1 || res.configKey === 'all')) {
        Object(_utils_callInternalAPI__WEBPACK_IMPORTED_MODULE_6__.default)('getClientConfig', {
          configKey: 'ta_fav_comp_blacklist',
        }, (res) => {
          if (!res.configKey || res.configKey === '' || res.configKey && typeof res.configKey === 'string' && res.configKey.indexOf(appId) === -1) {
            _this.syncStatus();
          }
        });
      }
    });
  },
  onTap: function onTap(e) {
    const { element } = e.data;

    if (element === 'J_favorite-modal-close') {
      this.logSpmExpoOrClick('a192.b7462.c18364.d33274', 'clicked');
      this.closeModal();
    }
    if (element === 'J_a-favorite-modal-know') {
      this.logSpmExpoOrClick('a192.b7462.c18365.d33275', 'clicked');
      this.closeModal();
    }
    if (element === 'J_a-favorite-modal-add') {
      this.add2Home();
    }
  },
  componentDidUpdate: function componentDidUpdate() {
    const { showModal } = this.state;

    if (showModal) {
      Object(_utils_callBridge__WEBPACK_IMPORTED_MODULE_7__.default)('NBComponent.render', {
        version: '2.0',
        element: 'J_a-favorite-cover',
      });
    }
  },
  componentWillUnmount: function componentWillUnmount() {
    current = null;
    if (this.favoriteEvents) {
      this.favoriteEvents.remove();
    }
    Object(_utils_callBridge__WEBPACK_IMPORTED_MODULE_7__.default)('NBComponent.remove', {
      element: 'J_a-favorite-cover',
    });
  },
  logSpmExpoOrClick: function logSpmExpoOrClick(spmId, actionId) {
    const type = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';

    Object(_utils_callBridge__WEBPACK_IMPORTED_MODULE_7__.default)('remoteLog', {
      type: 'monitor',
      bizType: 'TINYAPP',
      logLevel: 2,
      param1: Object(_framework_dev__WEBPACK_IMPORTED_MODULE_2__.getCurrentPageImpl)().getPagePath(),
      param4: type ? `appId=${this.appId}^type=${type}` : this.appId,
      spmId,
      actionId,
    });
  },
  getFavoriteContainer: function getFavoriteContainer() {
    if (this.favorite_container) {
      return this.favorite_container;
    }
    this.favorite_container = document.createElement('div');
    document.body.appendChild(this.favorite_container);
    Object(_framework_dev__WEBPACK_IMPORTED_MODULE_2__.getCurrentPageImpl)().getRootNode().classList.add('a-favorite-paddingdown');
    return this.favorite_container;
  },
  checkFatigue: function checkFatigue() {
    const _this2 = this;

    const { onDoFavorite } = this.props;

    Object(_utils_callInternalAPI__WEBPACK_IMPORTED_MODULE_6__.default)('getSharedData', {
      keys: ['MP_favorite_modal'],
      readFromFile: 'NO',
    }, (res) => {
      if (res.error) {
        res.data = null;
        delete res.error;
      }
      if (res.data && res.data.MP_favorite_modal) {
        const data = JSON.parse(res.data.MP_favorite_modal);
        res.data = data;
      }
      if (res.data) {
        _this2.modalTime = res.data.modalTime;
        _this2.modalShowTimes = res.data.modalShowTimes || 0;
      }
      // 如果不在首页
      if (!_this2.appIsAtHome) {
        // 不在首页疲劳度控制，只允许出现3次弹窗，3次以后不弹窗
        if (_this2.modalShowTimes < 3) {
          _this2.setState({
            showModal: true,
            modalType: 0,
          });
          _this2.logSpmExpoOrClick('a192.b7462.c18364', 'exposure');
        } else {
          // setTimeout(() => {
          //   this.setState({
          //     doHide: true,
          //   });
          //   this.paddingUp();
          // }, 2000);
          if (onDoFavorite) {
            _this2.logSpmExpoOrClick('a192.b7462.c17971.d32336', 'clicked', 'callback');
            onDoFavorite();
          } else {
            _this2.showToast('可在首页-更多-小程序收藏中查看');
          }
        }
      } else if (_this2.modalShowTimes === 0) {
        // 首页已经存在，第一次显示知道了弹框，一次后不允许弹窗
        _this2.setState({
          showModal: true,
          modalType: 1,
        });
        _this2.logSpmExpoOrClick('a192.b7462.c18365', 'exposure');
      } else {
        // setTimeout(() => {
        //   this.setState({
        //     doHide: true,
        //   });
        //   this.paddingUp();
        // }, 2000);
        if (onDoFavorite) {
          _this2.logSpmExpoOrClick('a192.b7462.c17971.d32336', 'clicked', 'callback');
          onDoFavorite();
        } else {
          _this2.showToast('收藏成功，可在首页-小程序收藏查看');
        }
      }
      _this2.setModalStorage();
    });
  },
  showModal: function showModal() {
    const _this3 = this;

    if (!_utils_system__WEBPACK_IMPORTED_MODULE_9__.isAndroid) {
      const rootNode = Object(_framework_dev__WEBPACK_IMPORTED_MODULE_2__.getCurrentPageImpl)().getRootNode();
      this.rootNodeHeight = rootNode.style.height;
      this.rootNodeOverfow = rootNode.style.overflow;
      rootNode.style.overflow = 'hidden';
      rootNode.style.height = '100vh';
    }
    Object(_utils_callInternalAPI__WEBPACK_IMPORTED_MODULE_6__.default)('shouldShowAddComponent', { appId: FAVORITE_APPID }, (res) => {
      _this3.appIsAtHome = !res.success;
      _this3.checkFatigue();
    });
  },
  showToast: function showToast(content) {
    Object(_utils_callBridge__WEBPACK_IMPORTED_MODULE_7__.default)('toast', {
      content,
      duration: 3000,
    });
  },
  syncStatus: function syncStatus() {
    const _this4 = this;

    Object(_utils_callBridge__WEBPACK_IMPORTED_MODULE_7__.default)('getTinyLocalStorage', {
      key: `MP_${this.appId}_favorite`,
    }, (res) => {
      if (res.error === 11) {
        res.data = null;
        delete res.error;
        delete res.errorMessage;
        delete res.success;
      }
      if (res.data) {
        const data = JSON.parse(res.data);
        res.data = data.APDataStorage;
      }
      // 收藏组件展示次数，默认是0次
      if (res.data && res.data.showTimes !== undefined) {
        _this4.showTimes = res.data.showTimes;
      }
      const threeDays = 1000 * 60 * 60 * 24 * 3; // 3天内只出现一次
      // 从未设置过，
      // 或者距离上次设置已经超过3天且展示次数在3次以内
      if (res.data === null || !!res.data.time && new Date().getTime() - res.data.time > threeDays && _this4.showTimes < 3) {
        Object(_utils_callInternalAPI__WEBPACK_IMPORTED_MODULE_6__.default)('rpc', {
          operationType: 'alipay.openservice.mini.miniapp.iskeep.query',
          requestData: [{
            appId: _this4.appId,
          }],
        }, (res) => {
          if (res.success && res.hasKeep === false) {
            _this4.setState({
              isFavorite: res.hasKeep,
            });
          }
        });
      }
    });
  },
  hideFavorite: function hideFavorite() {
    this.setState({
      doHide: true,
    });
    this.setFavoriteStorage();
    // 关闭埋点
    this.logSpmExpoOrClick('a192.b7462.c17971.d32338', 'clicked');
    this.paddingUp();
    const { onFavoriteClosed } = this.props;

    if (onFavoriteClosed) {
      onFavoriteClosed();
    }
  },
  doFavorite: function doFavorite() {
    const _this5 = this;

    const { onDoFavorite } = this.props;

    Object(_utils_callInternalAPI__WEBPACK_IMPORTED_MODULE_6__.default)('add2Favorite', {}, (res) => {
      if (res.success) {
        _this5.setState({
          isFavorite: true,
        });
        // 35版本以下的安卓由于较多JSAPI的bug，还是弹toast。或者32版本以下的包由于没有nbcomponent特性也只弹toast
        if (!g10135 && _utils_system__WEBPACK_IMPORTED_MODULE_9__.isAndroid) {
          _this5.logSpmExpoOrClick('a192.b7462.c17971.d32336', 'clicked', 'version');
          // setTimeout(() => {
          //   this.setState({
          //     doHide: true,
          //   });
          //   this.paddingUp();
          // }, 2000);
          if (onDoFavorite) {
            _this5.logSpmExpoOrClick('a192.b7462.c17971.d32336', 'clicked', 'callback');
            onDoFavorite();
          } else {
            _this5.showToast('可在首页-更多-小程序收藏中查看');
          }
        } else {
          _this5.logSpmExpoOrClick('a192.b7462.c17971.d32336', 'clicked', 'modal');
          _this5.showModal();
        }
        _this5.setFavoriteStorage();
        // todo
        // 收藏后提示  a192.b7462.c17971.d32339  exposure
        // this.logSpmExpoOrClick('a192.b7462.c17971.d32339', 'exposure');
      } else {
        _this5.showToast(res.resultMsg);
        _this5.logSpmExpoOrClick('a192.b7462.c17971.d32336', 'clicked', 'error');
      }
    });
  },
  undoFavorite: function undoFavorite() {
    if (this.state.isFavorite) {
      Object(_utils_callBridge__WEBPACK_IMPORTED_MODULE_7__.default)('pushWindow', {
        url: 'alipays://platformapi/startapp?appId=20000909&url=%2Fwww%2Fmsg.html%3FpublicId%3D2018082861165687%26msgId%3D201808286116568747e89756-841b-4c18-9cee-413c0cc08526%26cardId%3D20180828611656876ffd5bf0-73e7-4e14-9fda-3431311417fd&sourceId=publicplatform',
      });
      // 点击查看文章埋点
      this.logSpmExpoOrClick('a192.b7462.c17971.d36928', 'clicked');
    }
  },
  setFavoriteStorage: function setFavoriteStorage() {
    // 单次打开期间，showTimes计数次数只会 +1;
    if (!this.showTimesSetOnce) {
      this.showTimes = this.showTimes + 1;
    } else {
      this.showTimesSetOnce = true;
    }
    Object(_utils_callBridge__WEBPACK_IMPORTED_MODULE_7__.default)('setTinyLocalStorage', {
      key: `MP_${this.appId}_favorite`,
      type: 'user',
      business: this.appId,
      data: JSON.stringify({
        APDataStorage: {
          time: new Date().getTime(),
          showTimes: this.showTimes,
        },
      }),
    });
  },
  setModalStorage: function setModalStorage() {
    Object(_utils_callInternalAPI__WEBPACK_IMPORTED_MODULE_6__.default)('setSharedData', {
      data: {
        MP_favorite_modal: JSON.stringify({
          modalTime: new Date().getTime(),
          modalShowTimes: this.modalShowTimes + 1,
        }),
      },
      writeToFile: 'YES',
    });
  },
  paddingUp: function paddingUp() {
    const rootNode = Object(_framework_dev__WEBPACK_IMPORTED_MODULE_2__.getCurrentPageImpl)().getRootNode();
    rootNode.classList.remove('a-favorite-paddingdown');
    rootNode.classList.add('a-favorite-paddingup');
  },
  closeModal: function closeModal() {
    if (_utils_system__WEBPACK_IMPORTED_MODULE_9__.isAndroid) {
      removeNBComponent('J_a-favorite-cover');
    } else {
      Object(_utils_callBridge__WEBPACK_IMPORTED_MODULE_7__.default)('NBComponent.remove', {
        element: 'J_a-favorite-cover',
      });
    }
    this.setState({
      showModal: false,
    });
    // setTimeout(() => {
    //   this.setState({
    //     doHide: true,
    //   });
    //   this.paddingUp();
    // }, 2000);
    if (!_utils_system__WEBPACK_IMPORTED_MODULE_9__.isAndroid) {
      const rootNode = Object(_framework_dev__WEBPACK_IMPORTED_MODULE_2__.getCurrentPageImpl)().getRootNode();
      rootNode.style.height = this.rootNodeHeight;
      rootNode.style.overflow = this.rootNodeOverfow;
    }
    const { onDoFavorite } = this.props;

    if (onDoFavorite) {
      this.logSpmExpoOrClick('a192.b7462.c17971.d32336', 'clicked', 'callback');
      onDoFavorite();
    } else if (this.appIsAtHome) {
      this.showToast('收藏成功，可在首页-小程序收藏查看');
    } else {
      this.showToast('可在首页-更多-小程序收藏中查看');
    }
  },
  add2Home: function add2Home() {
    const _this6 = this;

    this.logSpmExpoOrClick('a192.b7462.c18364.d33273', 'clicked');
    Object(_utils_callInternalAPI__WEBPACK_IMPORTED_MODULE_6__.default)('addToHomeWithComponent', { appId: FAVORITE_APPID }, () => {
      _this6.closeModal();
    });
  },
  render: function render() {
    let _classNames;
    let _classNames2;
    const _this7 = this;

    if (current !== this) {
      return null;
    }
    const _props = this.props;
    const { id } = _props;
    const { children } = _props;
    const { className } = _props;
    let { style } = this.props;
    const _state = this.state;
    const { isFavorite } = _state;
    const { appIcon } = _state;
    const { slogan } = _state;
    const { doHide } = _state;
    const { showModal } = _state;
    const { modalType } = _state;

    if (isFavorite === undefined) {
      return null;
    }
    const wrapCls = classnames__WEBPACK_IMPORTED_MODULE_4___default()((_classNames = {}, _classNames[className] = true, _classNames[`${prefixCls}-has-bg`] = this.hasBGC, _classNames['a-favorite-hide'] = doHide, _classNames['a-favorite-show'] = !doHide, _classNames));
    if (this.hasBGC) {
      style = { ...style, backgroundColor: this.bgColor };
    }
    const btnCls = classnames__WEBPACK_IMPORTED_MODULE_4___default()((_classNames2 = {}, _classNames2['a-button'] = true, _classNames2[`${prefixCls}-btn`] = true, _classNames2[`${prefixCls}-btn-do-fav`] = !isFavorite, _classNames2));
    // 组件曝光
    if (!this.showFavorite) {
      this.logSpmExpoOrClick('a192.b7462.c17971', 'exposure');
      this.showFavorite = true;
    }
    const briefText = modalType === 0 ? '把收藏入口添加到首页，使用更便捷' : '可在首页-小程序收藏查看';
    return react_dom__WEBPACK_IMPORTED_MODULE_11___default.a.createPortal(react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(
      'div',
      null,
      react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(
        'div',
        { className: wrapCls, id, style },
        react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement('div', { className: `${prefixCls}-matte` }),
        react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(
          'div',
          { className: `${prefixCls}-close`, onClick: this.hideFavorite },
          react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement('img', { src: this.closeIcon }),
        ),
        react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement('img', { className: `${prefixCls}-icon`, src: appIcon }),
        react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(
          'div',
          { className: `${prefixCls}-content`,
            onClick: function onClick() {
              _this7.undoFavorite();
            } },
          isFavorite ? react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(
            'div',
            { className: `${prefixCls}-content-favorited` },
            '\u5DF2\u6DFB\u52A0\u81F3',
            react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement('img', { src: this.hasBGC ? iconHasBg : iconHasNoBg, className: `${prefixCls}-content-icon` }),
            '\u5C0F\u7A0B\u5E8F\u6536\u85CF',
          ) : children || slogan,
        ),
        react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(
          _shared_Button__WEBPACK_IMPORTED_MODULE_5__.default,
          { className: btnCls,
            activeClassName: `${prefixCls}-btn-active`,
            type: 'ghost',
            size: 'mini',
            onClick: function onClick() {
              if (isFavorite) {
                _this7.undoFavorite();
              } else {
                _this7.doFavorite();
              }
            } },
          isFavorite ? null : react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement('img', { src: this.favIcon }),
          isFavorite ? '查看' : '收藏',
        ),
      ),
      showModal ? react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(
        'div',
        { className: 'nbcomponent a-favorite-cover', id: 'J_a-favorite-cover', 'nbcomponent-type': 'container', 'nbcomponent-data': '{"backgroundColor": "#00000065"}' },
        react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(
          'div',
          { className: 'nbcomponent a-favorite-modal', 'nbcomponent-type': 'container', 'nbcomponent-data': '{"backgroundColor": "#ffffffff"}', id: 'J_dada22' },
          react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement('div', { className: 'nbcomponent a-favorite-modal-bg', 'nbcomponent-type': 'image', 'nbcomponent-data': '{"src": "https://gw.alipayobjects.com/zos/rmsportal/GVzOPncNcJgduBznVCma.png"}', id: 'a-favorite-modal-bg' }),
          react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement('div', { id: 'J_a-favorite-modal-icon', className: 'nbcomponent a-favorite-modal-icon', 'nbcomponent-type': 'image', 'nbcomponent-data': `{"src": "${appIcon}"}` }),
          react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(
            'div',
            { 'nbcomponent-type': 'container', 'nbcomponent-data': '{"backgroundColor": "#ffffffff"}', id: 'modal-content', className: 'nbcomponent a-favorite-modal-content' },
            react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement('div', { id: 'modal-content-bottom', className: 'nbcomponent a-faorite-modal-contentbottom', 'nbcomponent-type': 'container', 'nbcomponent-data': '{"backgroundColor": "#e5e5e5ff"}' }),
            react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement('div', { id: 'modal-title', 'nbcomponent-type': 'text', 'nbcomponent-data': '{"text": "\u6536\u85CF\u6210\u529F", "color": "#333333ff", "fontSize": "18.0", "fontWeight": "bold", "textAlign": "center" }', className: 'nbcomponent a-favorite-modal-title' }),
            react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement('div', { id: 'modal-brief', 'nbcomponent-type': 'text', 'nbcomponent-data': `{"text": "${briefText}", "color": "#333333ff", "fontSize": "14.0", "textAlign": "center"}`, className: 'nbcomponent a-favorite-modal-brief' }),
          ),
          modalType === 0 ? react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(
            'div',
            { 'nbcomponent-type': 'container', 'nbcomponent-data': '{"backgroundColor": "#ffffffff"}', id: 'modal-operation', className: 'nbcomponent a-favorite-modal-operation' },
            react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement('div', { id: 'J_favorite-modal-close', 'nbcomponent-type': 'text', 'nbcomponent-data': '{"text": "\u6682\u4E0D\u8003\u8651", "color": "#999999ff", "fontSize": "18.0", "textAlign": "center"}', className: 'nbcomponent a-favorite-modal-close' }),
            react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement('div', { id: 'modal-operation-borderright', className: 'nbcomponent a-favorite-modal-borderright', 'nbcomponent-type': 'container', 'nbcomponent-data': '{"backgroundColor": "#e5e5e5ff"}' }),
            react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement('div', { 'nbcomponent-data': '{"text": "\u7ACB\u5373\u6DFB\u52A0", "color": "#108ee9ff", "fontSize": "18.0", "textAlign": "center"}', 'nbcomponent-type': 'text', id: 'J_a-favorite-modal-add', className: 'nbcomponent a-favorite-modal-add' }),
          ) : react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(
            'div',
            { 'nbcomponent-type': 'container', 'nbcomponent-data': '{"backgroundColor": "#ffffffff"}', id: 'modal-operation', className: 'nbcomponent a-favorite-modal-operation' },
            react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement('div', { 'nbcomponent-data': '{"text": "\u6211\u77E5\u9053\u4E86", "color": "#108ee9ff", "fontSize": "18.0", "textAlign": "center"}', 'nbcomponent-type': 'text', id: 'J_a-favorite-modal-know', className: 'nbcomponent a-favorite-modal-add' }),
          ),
        ),
      ) : null,
    ), this.getFavoriteContainer());
  },
}));
/* harmony default export */ __webpack_exports__.default = (Favorite);
