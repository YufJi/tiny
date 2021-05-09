__webpack_require__.r(__webpack_exports__);
/* harmony import */ const react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ './node_modules/react/index.js');
/* harmony import */ const react__WEBPACK_IMPORTED_MODULE_0___default = /* #__PURE__ */__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ const _framework_dev__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/framework/ */ './src/framework/dev.tsx');
/* harmony import */ const create_react_class__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! create-react-class */ './node_modules/create-react-class/index.js');
/* harmony import */ const create_react_class__WEBPACK_IMPORTED_MODULE_2___default = /* #__PURE__ */__webpack_require__.n(create_react_class__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ const _utils_system__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @/utils/system */ './src/utils/system.tsx');
/* harmony import */ const _utils_addEvents__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @/utils/addEvents */ './src/utils/addEvents.tsx');
/* harmony import */ const _utils_callBridge__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @/utils/callBridge */ './src/utils/callBridge.tsx');
/* harmony import */ const _index_less__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./index.less */ './src/camera/index.less');
/* harmony import */ const _index_less__WEBPACK_IMPORTED_MODULE_6___default = /* #__PURE__ */__webpack_require__.n(_index_less__WEBPACK_IMPORTED_MODULE_6__);

let id = 0;
const cacheCameraId = {};
const Camera = Object(_framework_dev__WEBPACK_IMPORTED_MODULE_1__.createComponent)({
  name: 'camera',
})(create_react_class__WEBPACK_IMPORTED_MODULE_2___default()({
  displayName: 'Camera',
  componentDidMount: function componentDidMount() {
    if (_utils_system__WEBPACK_IMPORTED_MODULE_3__.isAndroid && !cacheCameraId[this.getId()]) {
      this.readyForRender = false;
      this.detachCameraReady = Object(_utils_addEvents__WEBPACK_IMPORTED_MODULE_4__.default)(document, {
        'nbcomponent.canrender': this.onNativeReady,
      });
    } else {
      this.readyForRender = true;
      this.renderCamera();
    }
    this.cameraEvents = Object(_utils_addEvents__WEBPACK_IMPORTED_MODULE_4__.default)(document, {
      'nbcomponent.camera.stop': this.onCameraStop,
      'nbcomponent.camera.error': this.onCameraError,
      'nbcomponent.camera.scancode': this.onCameraScancode,
    });
  },
  componentDidUpdate: function componentDidUpdate() {
    this.renderCamera();
  },
  componentWillUnmount: function componentWillUnmount() {
    if (this.detachCameraReady) {
      this.detachCameraReady.remove();
    }
    Object(_utils_callBridge__WEBPACK_IMPORTED_MODULE_5__.default)('NBComponent.remove', {
      element: this.getId(),
    });
    this.cameraEvents.remove();
  },
  getId: function getId() {
    if (this.id) {
      return this.id;
    }
    this.id = this.props.id || `mp_camera_${++id}`;
    return this.id;
  },
  onNativeReady: function onNativeReady(e) {
    if (!e || e.elementid === this.getId()) {
      this.readyForRender = true;
      cacheCameraId[this.getId()] = true;
      this.renderCamera();
    }
  },
  onCameraStop: function onCameraStop(_ref) {
    const { element } = _ref.data;
    const _props = this.props;
    const { onStop } = _props;
    const { $mp } = _props;

    if (onStop && element === this.getId()) {
      onStop($mp.getNormalizedEvent('stop'));
    }
  },
  onCameraError: function onCameraError(_ref2) {
    const _ref2$data = _ref2.data;
    const { element } = _ref2$data;
    const { errorMessage } = _ref2$data;
    const { errorCode } = _ref2$data;
    const _props2 = this.props;
    const { onError } = _props2;
    const { $mp } = _props2;

    if (onError && element === this.getId()) {
      onError($mp.getNormalizedEvent('error', {
        detail: {
          errorMessage,
          errorCode,
        },
      }));
    }
  },
  onCameraScancode: function onCameraScancode(_ref3) {
    const { element } = _ref3.data;
    const _props3 = this.props;
    const { onScancode } = _props3;
    const { $mp } = _props3;

    if (onScancode && element === this.getId()) {
      onScancode($mp.getNormalizedEvent('scancode'));
    }
  },
  clearRenderDelay: function clearRenderDelay() {
    if (this.detachCameraReady) {
      this.detachCameraReady.remove();
      this.detachCameraReady = null;
    }
  },
  renderCamera: function renderCamera() {
    if (!this.readyForRender || !_utils_system__WEBPACK_IMPORTED_MODULE_3__.isNativeComponent) {
      return;
    }
    this.clearRenderDelay();
    const _props4 = this.props;
    const { mode } = _props4;
    const { devicePosition } = _props4;
    const { flash } = _props4;
    const { scanSrea } = _props4;

    Object(_utils_callBridge__WEBPACK_IMPORTED_MODULE_5__.default)('NBComponent.render', {
      element: this.getId(),
      data: {
        mode,
        devicePosition,
        flash,
        scanSrea,
      },
    });
  },
  render: function render() {
    const _props5 = this.props;
    const { style } = _props5;
    const { className } = _props5;
    const { id } = _props5;

    if (!_utils_system__WEBPACK_IMPORTED_MODULE_3__.isNativeComponent) {
      return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(
        'div',
        { className, style, id },
        '\u5F53\u524D\u73AF\u5883\u4E0D\u652F\u6301camera\u7EC4\u4EF6',
      );
    }
    return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(
      'object',
      { className: `${className} nbcomponentanimation-${this.getId()}`, style, id, type: 'application/view', role: 'application' },
      react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement('param', { name: 'type', value: 'camera' }),
      react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement('param', { name: 'id', value: this.getId() }),
    );
  },
}));
/* harmony default export */ __webpack_exports__.default = (Camera);
