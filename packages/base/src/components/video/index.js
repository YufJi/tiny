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
/* harmony import */ const _utils_addEvents__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @/utils/addEvents */ './src/utils/addEvents.tsx');
/* harmony import */ const _utils_callBridge__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @/utils/callBridge */ './src/utils/callBridge.tsx');
/* harmony import */ const _utils_system__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @/utils/system */ './src/utils/system.tsx');
/* harmony import */ const _index_less__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./index.less */ './src/video/index.less');
/* harmony import */ const _index_less__WEBPACK_IMPORTED_MODULE_8___default = /* #__PURE__ */__webpack_require__.n(_index_less__WEBPACK_IMPORTED_MODULE_8__);

let id = 0;
const prefixCls = 'a-video';
const Video = Object(_framework_dev__WEBPACK_IMPORTED_MODULE_2__.createComponent)({
  name: 'video',
})(create_react_class__WEBPACK_IMPORTED_MODULE_3___default()({
  displayName: 'Video',
  getDefaultProps: function getDefaultProps() {
    return {
      src: '',
      autoplay: false,
      initialTime: 0,
      duration: 0,
      controls: true,
      loop: false,
      muted: false,
      showFullscreenBtn: true,
      showPlayBtn: true,
      showCenterPlayBtn: true,
      objectFit: 'contain',
      pageGesture: false,
      enableProgressGesture: true,
      enableNative: false,
      mobilenetHintType: 1,
    };
  },
  getInitialState: function getInitialState() {
    this.supportNative = this.props.enableNative && _utils_system__WEBPACK_IMPORTED_MODULE_7__.isNativeComponent;
    return {};
  },
  componentDidMount: function componentDidMount() {
    if (!this.supportNative) {
      return;
    }
    this.detachEvents = Object(_utils_addEvents__WEBPACK_IMPORTED_MODULE_5__.default)(document, {
      'nbcomponent.video.onChangeState': this.onChangeState,
      'nbcomponent.video.onTimeUpdate': this.onTimeUpdate,
      'nbcomponent.video.onError': this.onError,
      'nbcomponent.video.onFullScreenChange': this.onFullScreenChange,
    });
    this.readyForPlay = false;
    if (!_utils_system__WEBPACK_IMPORTED_MODULE_7__.isIOS && !_utils_system__WEBPACK_IMPORTED_MODULE_7__.isIDE) {
      this.detachVideoReady = Object(_utils_addEvents__WEBPACK_IMPORTED_MODULE_5__.default)(document, {
        'nbcomponent.canrender': this.onNativeReady,
      });
    }
    if (this.props.autoplay) {
      this.renderVideo(true);
    }
  },
  isTrackPageUpdateForIOS: function isTrackPageUpdateForIOS() {
    return this.supportNative;
  },
  componentDidUpdate: function componentDidUpdate(prevProps) {
    const _this = this;

    if (!this.supportNative) {
      return;
    }
    const _props = this.props;
    const { autoplay } = _props;
    const { src } = _props;
    const { muted } = _props;

    if (prevProps.autoplay !== autoplay && autoplay) {
      this.renderVideo(true);
    } else if (this.readyForPlay) {
      let NativeVideoHasUpdate = false;
      if (prevProps.src !== src) {
        this.stop();
        if (autoplay) {
          this.renderVideo(true);
        }
        NativeVideoHasUpdate = true;
      }
      ['initialTime', 'duration', 'controls', 'loop', 'showFullscreenBtn', 'showPlayBtn', 'showCenterPlayBtn', 'objectFit', 'pageGesture', 'enableProgressGesture', 'extraInfo'].forEach((key) => {
        if (!NativeVideoHasUpdate && prevProps[key] !== _this.props[key]) {
          NativeVideoHasUpdate = true;
          _this.executeNBRender();
        }
      });
      if (!NativeVideoHasUpdate && prevProps.muted !== muted) {
        this.mute(muted);
      }
    }
  },
  componentWillUnmount: function componentWillUnmount() {
    if (!this.supportNative) {
      return;
    }
    if (_utils_system__WEBPACK_IMPORTED_MODULE_7__.isIOS || _utils_system__WEBPACK_IMPORTED_MODULE_7__.isIDE) {
      Object(_utils_callBridge__WEBPACK_IMPORTED_MODULE_6__.default)('NBComponent.remove', {
        element: this.getId(),
      });
    } else if (this.detachVideoReady) {
      this.detachVideoReady.remove();
    }
    this.detachEvents.remove();
  },
  onNativeReady: function onNativeReady(e) {
    // map在安卓端的渲染是，object create  -> 客户端发canrender ->前端调用NBComponent.render
    if (!e || e.elementid === this.getId()) {
      // object标签 动态插入后会触发事件，动态插入必定是调用play action时才会触发
      this.executeNBRender(true);
    }
  },
  renderVideo: function renderVideo(play = false) {
    if (_utils_system__WEBPACK_IMPORTED_MODULE_7__.isIOS || _utils_system__WEBPACK_IMPORTED_MODULE_7__.isIDE) {
      this.executeNBRender(play);
    } else if (!document.querySelector(`#${this.getId()}`)) {
      const wrap = document.querySelector(`#${this.getId()}-wrap`);
      if (wrap) {
        const videoObjectFrag = document.createDocumentFragment();
        const videoObject = document.createElement('object');
        const videoObjectParam1 = document.createElement('param');
        const videoObjectParam2 = document.createElement('param');
        const _id = this.getId();
        videoObject.className = `a-video-con nbcomponentanimation-${_id}`;
        videoObject.id = _id;
        videoObject.type = 'application/view';
        videoObject.role = 'application';
        videoObjectParam1.name = 'type';
        videoObjectParam1.value = 'video';
        videoObjectParam2.name = 'id';
        videoObjectParam2.value = this.getId();
        videoObject.appendChild(videoObjectParam1);
        videoObject.appendChild(videoObjectParam2);
        videoObjectFrag.appendChild(videoObject);
        wrap.appendChild(videoObjectFrag);
      }
    } else if (this.readyForPlay) {
      this.executeNBRender(play);
    }
  },
  executeNBRender: function executeNBRender(play = false) {
    const _this2 = this;

    const { props } = this;

    Object(_utils_callBridge__WEBPACK_IMPORTED_MODULE_6__.default)('NBComponent.render', {
      element: this.getId(),
      props: {},
      data: {
        autoplay: play ? true : props.autoplay,
        src: props.src,
        'initial-time': props.initialTime,
        duration: props.duration,
        controls: props.controls,
        loop: props.loop,
        muted: props.muted,
        'show-fullscreen-btn': props.showFullscreenBtn,
        'show-play-btn': props.showPlayBtn,
        'show-center-play-btn': props.showCenterPlayBtn,
        'object-fit': props.objectFit,
        'page-gesture': props.pageGesture,
        'enable-progress-gesture': props.enableProgressGesture,
        'extra-info': props.extraInfo,
        direction: props.direction,
        'mobilenet-hint-type': props.mobilenetHintType,
      },
    }, (e) => {
      if (e.success) {
        _this2.readyForPlay = true;
      }
    });
  },
  getId: function getId() {
    if (this.id) {
      return this.id;
    }
    this.id = this.props.id || `mp_video_${++id}`;
    return this.id;
  },
  onChangeState: function onChangeState(e) {
    const _e$data = e.data;
    const { state } = _e$data;
    const { element } = _e$data;

    if (this.getId() === element) {
      switch (state) {
        case 0:
          // stop
          this.onStop();
          break;
        case 1:
          // playing
          this.onPlay();
          break;
        case 2:
          // pause
          this.onPause();
          break;
        case 3:
          // loading
          this.onLoading();
          break;
        case 4:
          // finish
          this.onEnded();
          break;
        default:
          break;
      }
    }
  },
  onStop: function onStop() {
    // onStop 可能由视频播放完后自动异步触发，也可能是由业务主动执行ctx.stop触发，当ctx.stop 主动触发时，业务可能会基于同一个ctx切换src立马播放下一个视频，这个时候在onStop里执行remove会导致业务上不符合预期。
    if (!this.natvieVideoViewHasRemoved) {
      this.removeNativeView();
    }
    if (this.playIcon) {
      this.playIcon.style.display = 'block';
    }
    this.natvieVideoViewHasRemoved = false;
    const _props2 = this.props;
    const { onStop } = _props2;
    const { $mp } = _props2;

    if (onStop) {
      onStop($mp.getNormalizedEvent('stop'));
    }
  },
  onPlay: function onPlay() {
    if (this.playIcon) {
      this.playIcon.style.display = 'none';
    }
    const _props3 = this.props;
    const { onPlay } = _props3;
    const { $mp } = _props3;

    if (onPlay) {
      onPlay($mp.getNormalizedEvent('play'));
    }
  },
  onPause: function onPause() {
    const _props4 = this.props;
    const { onPause } = _props4;
    const { $mp } = _props4;

    if (onPause) {
      onPause($mp.getNormalizedEvent('pause'));
    }
  },
  onLoading: function onLoading() {
    const _props5 = this.props;
    const { onLoading } = _props5;
    const { $mp } = _props5;

    if (onLoading) {
      onLoading($mp.getNormalizedEvent('loading'));
    }
  },
  onEnded: function onEnded() {
    if (this.playIcon) {
      this.playIcon.style.display = 'block';
    }
    const _props6 = this.props;
    const { onEnded } = _props6;
    const { $mp } = _props6;

    if (onEnded) {
      onEnded($mp.getNormalizedEvent('ended'));
    }
  },
  onTimeUpdate: function onTimeUpdate(e) {
    let triggerEvent = false;
    let currentTime = 0;
    if (this.supportNative) {
      const { element } = e.data;

      currentTime = e.data.currentTime;
      if (this.getId() === element) {
        triggerEvent = true;
      }
    } else {
      triggerEvent = true;
    }
    const _props7 = this.props;
    const { onTimeUpdate } = _props7;
    const { $mp } = _props7;

    if (triggerEvent && onTimeUpdate) {
      const _e = $mp.getNormalizedEvent('timeUpdate', {
        detail: { currentTime },
      });
      onTimeUpdate(_e);
    }
  },
  onError: function onError(ev) {
    let triggerEvent = false;
    let errorMsg;
    if (this.playIcon) {
      this.playIcon.style.display = 'block';
    }
    if (this.supportNative) {
      const { element } = ev.data;

      if (this.getId() === element) {
        triggerEvent = true;
      }
      // todo 待整理
      errorMsg = ev && (ev.data.info || ev.data.code || '');
    } else {
      triggerEvent = true;
      if (ev.target.error && ev.target.error.code) {
        const errors = ['', 'MEDIA_ERR_ABORTED', 'MEDIA_ERR_NETWORK', 'MEDIA_ERR_DECODE', 'MEDIA_ERR_SRC_NOT_SUPPORTED'];
        errorMsg = errors[ev.target.error.code];
      }
    }
    const _props8 = this.props;
    const { onError } = _props8;
    const { $mp } = _props8;

    if (triggerEvent && onError && errorMsg) {
      const e = $mp.getNormalizedEvent('error', {
        detail: { errMsg: errorMsg },
      });
      onError(e);
    }
  },
  onFullScreenChange: function onFullScreenChange(e) {
    const _e$data2 = e.data;
    const { element } = _e$data2;
    const { fullScreen } = _e$data2;
    const { direction } = _e$data2;

    if (this.getId() === element) {
      const _props9 = this.props;
      const { onFullScreenChange } = _props9;
      const { $mp } = _props9;

      if (onFullScreenChange) {
        onFullScreenChange($mp.getNormalizedEvent('fullScreenChange', {
          detail: {
            fullScreen,
            direction,
          },
        }));
      }
    }
  },
  play: function play() {
    if (this.supportNative) {
      if (this.readyForPlay) {
        this.videoAction({ action: 'play' });
      } else {
        this.renderVideo(true);
      }
    } else {
      this.root.play();
    }
  },
  pause: function pause() {
    if (this.supportNative) {
      this.videoAction({ action: 'pause' });
    } else {
      this.root.pause();
    }
  },
  seek: function seek(time) {
    if (this.supportNative) {
      this.videoAction({ action: 'seek', data: { time } });
    } else {
      this.root.currentTime = time || 0;
    }
  },
  mute: function mute(ison) {
    if (this.supportNative) {
      this.videoAction({ action: 'mute', data: { ison } });
    } else {
      console.error('当前版本不支持mute');
    }
  },
  stop: function stop() {
    if (this.supportNative) {
      this.videoAction({ action: 'stop' });
      this.removeNativeView();
    } else {
      console.error('当前版本不支持stop');
    }
  },

  // sendDanmu(danmu) {
  //   if (this.supportNative) {
  //     this.videoAction({ action: 'sendDanmu', data: danmu });
  //   } else {
  //     console.error('当前版本不支持sendDanmu');
  //   }
  // },
  removeNativeView: function removeNativeView() {
    if (this.supportNative) {
      if (_utils_system__WEBPACK_IMPORTED_MODULE_7__.isIOS || _utils_system__WEBPACK_IMPORTED_MODULE_7__.isIDE) {
        Object(_utils_callBridge__WEBPACK_IMPORTED_MODULE_6__.default)('NBComponent.remove', {
          element: this.getId(),
        });
      } else {
        try {
          document.querySelector(`#${this.getId()}-wrap`).innerHTML = '';
        } catch (e) {}
      }
      this.readyForPlay = false;
      this.natvieVideoViewHasRemoved = true;
    }
  },
  playbackRate: function playbackRate(rate) {
    if (this.supportNative) {
      this.videoAction({ action: 'playbackRate', data: { rate } });
    } else {
      console.error('当前版本不支持playbackRate');
    }
  },
  requestFullScreen: function requestFullScreen(direction) {
    if (this.supportNative) {
      this.videoAction({ action: 'requestFullScreen', data: direction });
    } else {
      console.error('当前版本不支持requestFullScreen');
    }
  },
  exitFullScreen: function exitFullScreen() {
    if (this.supportNative) {
      this.videoAction({ action: 'exitFullScreen' });
    } else {
      console.error('当前版本不支持exitFullScreen');
    }
  },
  showStatusBar: function showStatusBar() {
    if (this.supportNative) {
      this.videoAction({ action: 'showStatusBar' });
    } else {
      console.error('当前版本不支持showStatusBar');
    }
  },
  hideStatusBar: function hideStatusBar() {
    if (this.supportNative) {
      this.videoAction({ action: 'hideStatusBar' });
    } else {
      console.error('当前版本不支持hideStatusBar');
    }
  },
  videoAction: function videoAction(options) {
    console.log(options, 'videoAction');
    Object(_utils_callBridge__WEBPACK_IMPORTED_MODULE_6__.default)('NBComponent.sendMessage', {
      actionType: options.action,
      element: this.getId(),
      data: options.data || {},
    });
  },
  saveRoot: function saveRoot(root) {
    this.root = root;
  },
  savePlayIcon: function savePlayIcon(playIcon) {
    this.playIcon = playIcon;
  },
  render: function render() {
    const { props } = this;
    if (this.supportNative) {
      let _classNames;
      let _classNames2;
      let _classNames3;
      let _classNames4;

      const postCls = classnames__WEBPACK_IMPORTED_MODULE_4___default()((_classNames = {}, _classNames[`${prefixCls}-poster`] = true, _classNames));
      const videoWrapCls = classnames__WEBPACK_IMPORTED_MODULE_4___default()((_classNames2 = {}, _classNames2[`${prefixCls}-wrap`] = true, _classNames2));
      const conCls = classnames__WEBPACK_IMPORTED_MODULE_4___default()((_classNames3 = {}, _classNames3[`${prefixCls}-con`] = true, _classNames3[`nbcomponentanimation-${this.getId()}`] = true, _classNames3));
      const fakePlayCls = classnames__WEBPACK_IMPORTED_MODULE_4___default()((_classNames4 = {}, _classNames4[`${prefixCls}-play`] = true, _classNames4));
      let nativeVideoDom = null;
      if (_utils_system__WEBPACK_IMPORTED_MODULE_7__.isIOS || _utils_system__WEBPACK_IMPORTED_MODULE_7__.isIDE) {
        nativeVideoDom = react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(
          'object',
          { className: conCls, id: props.id, type: 'application/view', role: 'application' },
          react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement('param', { name: 'type', value: 'video' }),
          react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement('param', { name: 'id', value: this.getId() }),
        );
      }
      let posterStyle = {};
      if (props.poster !== undefined) {
        posterStyle = {
          backgroundImage: `url(${props.$mp.getNormalizedSrc(props.poster)})`,
        };
      }
      return react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(
        'div',
        { className: props.className, style: props.style },
        react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement('div', { className: postCls, style: posterStyle }),
        react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(
          'div',
          { className: videoWrapCls, id: `${this.getId()}-wrap` },
          nativeVideoDom,
        ),
        react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement('div', { ref: this.savePlayIcon, className: fakePlayCls, onClick: this.play }),
      );
    }
    return react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement('video', { className: props.className, ref: this.saveRoot, style: { ...props.style, objectFit: props.objectFit }, src: props.src, poster: props.poster, id: this.getId(), autoPlay: props.autoplay, controls: props.controls, onPlay: this.onPlay, onEnded: this.onEnded, onPause: this.onPause, onError: this.onError, onTimeUpdate: this.onTimeUpdate });
  },
}));
/* harmony default export */ __webpack_exports__.default = (Video);
