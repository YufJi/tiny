
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _framework_dev__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/framework/ */ "./src/framework/dev.tsx");
/* harmony import */ var create_react_class__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! create-react-class */ "./node_modules/create-react-class/index.js");
/* harmony import */ var create_react_class__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(create_react_class__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _utils_system__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @/utils/system */ "./src/utils/system.tsx");
/* harmony import */ var _utils_addEvents__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @/utils/addEvents */ "./src/utils/addEvents.tsx");
/* harmony import */ var _utils_callBridge__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @/utils/callBridge */ "./src/utils/callBridge.tsx");
/* harmony import */ var _index_less__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./index.less */ "./src/camera/index.less");
/* harmony import */ var _index_less__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(_index_less__WEBPACK_IMPORTED_MODULE_6__);







var id = 0;
var cacheCameraId = {};
var Camera = Object(_framework_dev__WEBPACK_IMPORTED_MODULE_1__["createComponent"])({
    name: 'camera'
})(create_react_class__WEBPACK_IMPORTED_MODULE_2___default()({
    displayName: 'Camera',
    componentDidMount: function componentDidMount() {
        if (_utils_system__WEBPACK_IMPORTED_MODULE_3__["isAndroid"] && !cacheCameraId[this.getId()]) {
            this.readyForRender = false;
            this.detachCameraReady = Object(_utils_addEvents__WEBPACK_IMPORTED_MODULE_4__["default"])(document, {
                'nbcomponent.canrender': this.onNativeReady
            });
        } else {
            this.readyForRender = true;
            this.renderCamera();
        }
        this.cameraEvents = Object(_utils_addEvents__WEBPACK_IMPORTED_MODULE_4__["default"])(document, {
            'nbcomponent.camera.stop': this.onCameraStop,
            'nbcomponent.camera.error': this.onCameraError,
            'nbcomponent.camera.scancode': this.onCameraScancode
        });
    },
    componentDidUpdate: function componentDidUpdate() {
        this.renderCamera();
    },
    componentWillUnmount: function componentWillUnmount() {
        if (this.detachCameraReady) {
            this.detachCameraReady.remove();
        }
        Object(_utils_callBridge__WEBPACK_IMPORTED_MODULE_5__["default"])('NBComponent.remove', {
            element: this.getId()
        });
        this.cameraEvents.remove();
    },
    getId: function getId() {
        if (this.id) {
            return this.id;
        }
        this.id = this.props.id || 'mp_camera_' + ++id;
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
        var element = _ref.data.element;
        var _props = this.props,
            onStop = _props.onStop,
            $mp = _props.$mp;

        if (onStop && element === this.getId()) {
            onStop($mp.getNormalizedEvent('stop'));
        }
    },
    onCameraError: function onCameraError(_ref2) {
        var _ref2$data = _ref2.data,
            element = _ref2$data.element,
            errorMessage = _ref2$data.errorMessage,
            errorCode = _ref2$data.errorCode;
        var _props2 = this.props,
            onError = _props2.onError,
            $mp = _props2.$mp;

        if (onError && element === this.getId()) {
            onError($mp.getNormalizedEvent('error', {
                detail: {
                    errorMessage: errorMessage,
                    errorCode: errorCode
                }
            }));
        }
    },
    onCameraScancode: function onCameraScancode(_ref3) {
        var element = _ref3.data.element;
        var _props3 = this.props,
            onScancode = _props3.onScancode,
            $mp = _props3.$mp;

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
        if (!this.readyForRender || !_utils_system__WEBPACK_IMPORTED_MODULE_3__["isNativeComponent"]) {
            return;
        }
        this.clearRenderDelay();
        var _props4 = this.props,
            mode = _props4.mode,
            devicePosition = _props4.devicePosition,
            flash = _props4.flash,
            scanSrea = _props4.scanSrea;

        Object(_utils_callBridge__WEBPACK_IMPORTED_MODULE_5__["default"])('NBComponent.render', {
            element: this.getId(),
            data: {
                mode: mode,
                devicePosition: devicePosition,
                flash: flash,
                scanSrea: scanSrea
            }
        });
    },
    render: function render() {
        var _props5 = this.props,
            style = _props5.style,
            className = _props5.className,
            id = _props5.id;

        if (!_utils_system__WEBPACK_IMPORTED_MODULE_3__["isNativeComponent"]) {
            return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(
                'div',
                { className: className, style: style, id: id },
                '\u5F53\u524D\u73AF\u5883\u4E0D\u652F\u6301camera\u7EC4\u4EF6'
            );
        }
        return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(
            'object',
            { className: className + ' nbcomponentanimation-' + this.getId(), style: style, id: id, type: 'application/view', role: 'application' },
            react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement('param', { name: 'type', value: 'camera' }),
            react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement('param', { name: 'id', value: this.getId() })
        );
    }
}));
/* harmony default export */ __webpack_exports__["default"] = (Camera);

