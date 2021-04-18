
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _framework_dev__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/framework/ */ "./src/framework/dev.tsx");
/* harmony import */ var _timeToString__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./timeToString */ "./src/audio/timeToString.tsx");
/* harmony import */ var create_react_class__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! create-react-class */ "./node_modules/create-react-class/index.js");
/* harmony import */ var create_react_class__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(create_react_class__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _utils_system__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @/utils/system */ "./src/utils/system.tsx");
/* harmony import */ var _utils_addEvents__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @/utils/addEvents */ "./src/utils/addEvents.tsx");



import React from 'react';
import { createComponent }  from '@/framework/';
import timeToString from './timeToString';

import './index.less';

var prefixCls = 'a-audio';
var pausePic = 'https://zos.alipayobjects.com/rmsportal/ZnENqDjdATSxszOcALjL.png';
var playPic = 'https://zos.alipayobjects.com/rmsportal/GEWVXOYPgcWRvxjPWjYc.png';
var Audio = createComponent({
    name: 'audio'
})(create_react_class__WEBPACK_IMPORTED_MODULE_3___default()({
    displayName: 'Audio',
    getDefaultProps: function getDefaultProps() {
        return {
            loop: false,
            controls: true,
            name: '未知音频',
            author: '未知作者'
        };
    },
    getInitialState: function getInitialState() {
        return {
            progress: 0,
            src: this.props.src,
            playing: false
        };
    },
    componentDidMount: function componentDidMount() {
        // hack: iOS cannot play audio without control touches (controls = false)
        // http://stackoverflow.com/questions/3009888/autoplay-audio-files-on-an-ipad-with-html5
        if (_utils_system__WEBPACK_IMPORTED_MODULE_4__["isIOS"]) {
            this.documentEvents = Object(_utils_addEvents__WEBPACK_IMPORTED_MODULE_5__["default"])(document, {
                touchstart: this.loadFn
            });
        }
    },
    componentDidUpdate: function componentDidUpdate() {
        if (this.props.src !== this.state.src) {
            this.setState({
                src: this.props.src,
                progress: 0
            });
            this.pause();
        }
    },
    componentWillUnmount: function componentWillUnmount() {
        this.removeDocumentEvents();
    },
    removeDocumentEvents: function removeDocumentEvents() {
        if (this.documentEvents) {
            this.documentEvents.remove();
            this.documentEvents = null;
        }
    },
    loadFn: function loadFn() {
        var audioHandle = this.refs.root;
        audioHandle.src = this.state.src;
        audioHandle.play();
        audioHandle.pause();
        this.removeDocumentEvents();
    },
    onError: function onError(ev) {
        var errorMsg ;
        if (ev.target.error && ev.target.error.code) {
            var errors = ['', 'MEDIA_ERR_ABORTED', 'MEDIA_ERR_NETWORK', 'MEDIA_ERR_DECODE', 'MEDIA_ERR_SRC_NOT_SUPPORTED'];
            errorMsg = errors[ev.target.error.code];
        }
        if (this.props.onError && errorMsg) {
            var e = this.props.$mp.getNormalizedEvent('error', {
                detail: { errMsg: errorMsg }
            });
            this.props.onError(e);
        }
    },
    play: function play() {
        var onPlay = this.props.onPlay;
        // noinspection TypeScriptUnresolvedVariable

        this.refs.root.play();
        if (onPlay) {
            onPlay(this.props.$mp.getNormalizedEvent('play'));
        }
        this.setState({
            playing: true
        });
    },
    pause: function pause() {
        var onPause = this.props.onPause;
        // noinspection TypeScriptUnresolvedVariable

        this.refs.root.pause();
        if (onPause) {
            onPause(this.props.$mp.getNormalizedEvent('pause'));
        }
        this.setState({
            playing: false
        });
    },
    seek: function seek(position) {
        // noinspection TypeScriptUnresolvedVariable
        this.refs.root.currentTime = position || 0;
        this.setState({
            progress: position
        });
    },
    timeUpdate: function timeUpdate(e) {
        var currentTime = e.target.currentTime;
        this.setState({
            progress: currentTime
        });
        if (this.props.onTimeUpdate) {
            var ev = this.props.$mp.getNormalizedEvent('timeUpdate', {
                detail: {
                    currentTime: currentTime,
                    duration: e.target.duration
                }
            });
            this.props.onTimeUpdate(ev);
        }
    },
    ended: function ended() {
        if (this.props.onEnded) {
            this.props.onEnded(this.props.$mp.getNormalizedEvent('ended'));
        }
    },
    playpausetap: function playpausetap() {
        if (this.state.playing) {
            this.pause();
        } else {
            this.play();
        }
    },
    setSrc: function setSrc(src) {
        this.pause();
        this.setState({
            src: src,
            progress: 0
        });
    },
    render: function render() {
        var props = this.props;
        var posterStyle = {};
        if (props.poster) {
            posterStyle.background = 'url(' + props.poster + ') 100%/100% no-repeat';
        }
        return React.createElement(
            'div',
            { id: props.id, className: props.className, style: props.style },
            props.controls && React.createElement(
                'div',
                { className: prefixCls + '-container', style: props.style },
                React.createElement(
                    'div',
                    { className: prefixCls + '-poster', style: posterStyle, onClick: this.playpausetap },
                    React.createElement('img', { src: this.state.playing ? pausePic : playPic, width: '24' })
                ),
                React.createElement(
                    'div',
                    { className: prefixCls + '-info' },
                    React.createElement(
                        'p',
                        { className: prefixCls + '-info-name', 'aria-label': 'Audio Name' },
                        props.name
                    ),
                    React.createElement(
                        'p',
                        { className: prefixCls + '-info-author', 'aria-label': 'Audio Author' },
                        props.author
                    )
                ),
                React.createElement(
                    'div',
                    { className: prefixCls + '-timer', role: 'timer' },
                    timeToString(this.state.progress)
                )
            ),
            React.createElement('audio', { className: prefixCls + '-tag', ref: 'root', src: this.state.src, loop: props.loop, onError: this.onError, onPlay: this.onPlay, onPause: this.pause, onEnded: this.ended, onTimeUpdate: this.timeUpdate })
        );
    }
}));

export default Audio;
