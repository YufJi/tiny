
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _framework_dev__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/framework/ */ "./src/framework/dev.tsx");
/* harmony import */ var create_react_class__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! create-react-class */ "./node_modules/create-react-class/index.js");
/* harmony import */ var create_react_class__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(create_react_class__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _utils_system__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @/utils/system */ "./src/utils/system.tsx");
/* harmony import */ var _utils_addEvents__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @/utils/addEvents */ "./src/utils/addEvents.tsx");
/* harmony import */ var _utils_callBridge__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @/utils/callBridge */ "./src/utils/callBridge.tsx");
/* harmony import */ var _index_less__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./index.less */ "./src/live-pusher/index.less");
/* harmony import */ var _index_less__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(_index_less__WEBPACK_IMPORTED_MODULE_6__);







var id = 0;
var cacheLivePusherId = {};
var LivePusher = Object(_framework_dev__WEBPACK_IMPORTED_MODULE_1__["createComponent"])({
    name: 'live-pusher',
    trackPageUpdateForIOS: true
})(create_react_class__WEBPACK_IMPORTED_MODULE_2___default()({
    displayName: 'LivePusher',
    getDefaultProps: function getDefaultProps() {
        return {
            url: '',
            mode: 'RTC',
            autopush: false,
            muted: false,
            enableCamera: true,
            autoFocus: true,
            orientation: false,
            beauty: 0,
            whiteness: 0,
            aspect: '9:16',
            minBitrate: 200,
            maxBitrate: 1000,
            waitingImage: undefined,
            waitingImageHash: undefined,
            zoom: false,
            backgroundMute: false,
            onStateChange: function onStateChange() {},
            onNetStatus: function onNetStatus() {},
            onError: function onError() {}
        };
    },
    componentDidMount: function componentDidMount() {
        // android bug
        if (_utils_system__WEBPACK_IMPORTED_MODULE_3__["isAndroid"] && !cacheLivePusherId[this.getId()]) {
            this.readyForRender = false;
            this.detachLivePusherReady = Object(_utils_addEvents__WEBPACK_IMPORTED_MODULE_4__["default"])(document, {
                'nbcomponent.canrender': this.onNativeReady
            });
        } else {
            this.readyForRender = true;
            this.renderLivePusher();
        }
        this.detachEvents = Object(_utils_addEvents__WEBPACK_IMPORTED_MODULE_4__["default"])(document, {
            'nbcomponent.live-pusher.onChangeState': this.onStateChange,
            'nbcomponent.live-pusher.onTimeUpdate': this.onNetStatus,
            'nbcomponent.live-pusher.onError': this.onError
        });
    },
    componentDidUpdate: function componentDidUpdate() {
        this.renderLivePusher();
    },
    componentWillUnmount: function componentWillUnmount() {
        if (this.detachLivePusherReady) {
            this.detachLivePusherReady.remove();
        }
        Object(_utils_callBridge__WEBPACK_IMPORTED_MODULE_5__["default"])('NBComponent.remove', {
            element: this.getId()
        });
        this.detachEvents.remove();
    },
    onNativeReady: function onNativeReady(e) {
        if (!e || e.elementid === this.getId()) {
            this.readyForRender = true;
            cacheLivePusherId[this.getId()] = true;
            this.renderLivePusher();
        }
    },
    clearRenderDelay: function clearRenderDelay() {
        if (this.detachLivePusherReady) {
            this.detachLivePusherReady.remove();
            this.detachLivePusherReady = null;
        }
    },
    renderLivePusher: function renderLivePusher() {
        if (!this.readyForRender || !_utils_system__WEBPACK_IMPORTED_MODULE_3__["isNativeComponent"]) {
            return;
        }
        this.clearRenderDelay();
        var url = this.url,
            mode = this.mode,
            autopush = this.autopush,
            muted = this.muted,
            enableCamera = this.enableCamera,
            autoFocus = this.autoFocus,
            orientation = this.orientation,
            beauty = this.beauty,
            whiteness = this.whiteness,
            aspect = this.aspect,
            minBitrate = this.minBitrate,
            maxBitrate = this.maxBitrate,
            waitingImage = this.waitingImage,
            waitingImageHash = this.waitingImageHash,
            zoom = this.zoom,
            backgroundMute = this.backgroundMute;

        Object(_utils_callBridge__WEBPACK_IMPORTED_MODULE_5__["default"])('NBComponent.render', {
            element: this.getId(),
            data: {
                url: url,
                mode: mode,
                autopush: autopush,
                muted: muted,
                enableCamera: enableCamera,
                autoFocus: autoFocus,
                orientation: orientation,
                beauty: beauty,
                whiteness: whiteness,
                aspect: aspect,
                minBitrate: minBitrate,
                maxBitrate: maxBitrate,
                waitingImage: waitingImage,
                waitingImageHash: waitingImageHash,
                zoom: zoom,
                backgroundMute: backgroundMute
            }
        });
    },
    getId: function getId() {
        if (this.id) {
            return this.id;
        }
        this.id = this.props.id || 'mp_live_pusher_' + ++id;
        return this.id;
    },
    onChangeState: function onChangeState(e) {
        var _e$data = e.data,
            element = _e$data.element,
            code = _e$data.code;
        var _props = this.props,
            onChangeState = _props.onChangeState,
            $mp = _props.$mp;

        if (this.getId() === element) {
            if (onChangeState) {
                onChangeState($mp.getNormalizedEvent('changeState', {
                    detail: {
                        code: code
                    }
                }));
            }
        }
    },
    onNetStatus: function onNetStatus(e) {
        var _e$data2 = e.data,
            element = _e$data2.element,
            info = _e$data2.info;
        var _props2 = this.props,
            onNetStatus = _props2.onNetStatus,
            $mp = _props2.$mp;

        if (this.getId() === element) {
            if (onNetStatus) {
                onNetStatus($mp.getNormalizedEvent('netStatus', {
                    detail: {
                        info: info
                    }
                }));
            }
        }
    },
    onError: function onError(e) {
        var _e$data3 = e.data,
            element = _e$data3.element,
            errMsg = _e$data3.errMsg,
            errCode = _e$data3.errCode;
        var _props3 = this.props,
            onError = _props3.onError,
            $mp = _props3.$mp;

        if (this.getId() === element) {
            if (onError) {
                onError($mp.getNormalizedEvent('error', {
                    detail: {
                        errMsg: errMsg,
                        errCode: errCode
                    }
                }));
            }
        }
    },
    render: function render() {
        var _props4 = this.props,
            style = _props4.style,
            className = _props4.className,
            id = _props4.id;

        if (!_utils_system__WEBPACK_IMPORTED_MODULE_3__["isNativeComponent"]) {
            return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(
                'div',
                { className: className, style: style, id: id },
                '\u5F53\u524D\u73AF\u5883\u4E0D\u652F\u6301live-pusher\u7EC4\u4EF6'
            );
        }
        return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(
            'object',
            { className: className + ' nbcomponentanimation-' + this.getId(), style: style, id: id, type: 'application/view', role: 'application' },
            react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement('param', { name: 'type', value: 'live-pusher' }),
            react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement('param', { name: 'id', value: this.getId() })
        );
    }
}));
/* harmony default export */ __webpack_exports__["default"] = (LivePusher);

