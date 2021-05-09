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
/* harmony import */ const _form_mixin__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../form/mixin */ './src/form/mixin.tsx');
/* harmony import */ const _utils_focusInput__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @/utils/focusInput */ './src/utils/focusInput.tsx');
/* harmony import */ const _utils_system__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @/utils/system */ './src/utils/system.tsx');
/* harmony import */ const _utils_stringToArray__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @/utils/stringToArray */ './src/utils/stringToArray.tsx');
/* harmony import */ const _utils_rgba2Color__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! @/utils/rgba2Color */ './src/utils/rgba2Color.tsx');
/* harmony import */ const _utils_addEvents__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! @/utils/addEvents */ './src/utils/addEvents.tsx');
/* harmony import */ const _utils_callInternalAPI__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! @/utils/callInternalAPI */ './src/utils/callInternalAPI.tsx');
/* harmony import */ const _index_less__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ./index.less */ './src/textarea/index.less');
/* harmony import */ const _index_less__WEBPACK_IMPORTED_MODULE_12___default = /* #__PURE__ */__webpack_require__.n(_index_less__WEBPACK_IMPORTED_MODULE_12__);

import React from 'react';
import createReactClass from 'create-react-class';
import classnames from 'classnames';

const prefixCls = 'a-textarea';
const g = self;
const g10135 = Object(_utils_system__WEBPACK_IMPORTED_MODULE_7__.compareSystemVersion)('10.1.35') >= 0;
function countSymbols(text = '') {
  return Object(_utils_stringToArray__WEBPACK_IMPORTED_MODULE_8__.default)(text).length;
}
/* harmony default export */ __webpack_exports__.default = (Object(_framework_dev__WEBPACK_IMPORTED_MODULE_2__.createComponent)({
  name: 'textarea',
})(create_react_class__WEBPACK_IMPORTED_MODULE_3___default()({
  displayName: 'Textarea',
  mixins: [_form_mixin__WEBPACK_IMPORTED_MODULE_5__.default],
  getDefaultProps: function getDefaultProps() {
    return {
      value: '',
      maxlength: 140,
      showCount: true,
      controlled: false,
      enableNative: true,
      autoHeight: false,
      cursorSpacing: 0,
      cursor: undefined,
      showConfirmBar: true,
      selectionStart: -1,
      selectionEnd: -1,
      adjustPosition: true,
    };
  },
  getInitialState: function getInitialState() {
    this.compositionend = true;
    if (true) {
      this.supportNative = _utils_system__WEBPACK_IMPORTED_MODULE_7__.isNativeComponent && g10135 && this.props.enableNative && !_utils_system__WEBPACK_IMPORTED_MODULE_7__.isIDE && g.disableNativeTextArea !== true;
    } else {

    }
    return {
      focused: this.props.focus,
    };
  },
  componentDidMount: function componentDidMount() {
    if (this.state.focused) {
      this.focus(true);
    }
    this.handleHeight();
    if (this.supportNative) {
      this.completeEvents = Object(_utils_addEvents__WEBPACK_IMPORTED_MODULE_10__.default)(this.textarea, {
        complete: this.onComplete,
        linechange: this.onLinechange,
      });
    }
  },
  componentDidUpdate: function componentDidUpdate(prevProps) {
    const { focus } = this.props;

    if (!!focus && !prevProps.focus && !this.state.focused) {
      this.focus(false);
    }
    this.handleHeight();
    if (g._currentInput === this.textarea && this.compositionend === true) {
      const color = Object(_utils_rgba2Color__WEBPACK_IMPORTED_MODULE_9__.default)(window.getComputedStyle(this.container, null).color);
      Object(_utils_callInternalAPI__WEBPACK_IMPORTED_MODULE_11__.default)('updateNativeKeyBoardInput', {
        text: this.getCurrentValue(),
        color,
      });
    }
  },
  componentWillUnmount: function componentWillUnmount() {
    if (this.completeEvents) {
      this.completeEvents.remove();
    }
  },
  handleHeight: function handleHeight() {
    if (this.props.autoHeight && this.textarea) {
      const textareaDom = this.textarea;
      textareaDom.style.height = ''; // 字数减少时能自动减小高度
      textareaDom.style.height = `${textareaDom.scrollHeight}px`;
      document.dispatchEvent(new CustomEvent('pageReRender', {}));
    }
  },
  onInput: function onInput(e) {
    const { value } = e.target;
    const _props = this.props;
    const { onInput } = _props;
    const { controlled } = _props;
    // 如果native的键盘  event会带marked属性，用于告知是否是中间态

    if (this.supportNative && _utils_system__WEBPACK_IMPORTED_MODULE_7__.isIOS) {
      if (e.nativeEvent.marked === true) {
        this.compositionend = false;
      } else {
        this.compositionend = true;
      }
    }
    if (onInput && this.compositionend === true) {
      const event = this.props.$mp.getNormalizedEvent('input', {
        detail: { value },
      });
      onInput(event);
    }
    if (!controlled) {
      this.setState({
        value,
      });
    }
  },
  onFocus: function onFocus(e) {
    const { onFocus } = this.props;

    const { value } = e.target;
    this.setState({
      focused: true,
    });
    if (onFocus) {
      const event = this.props.$mp.getNormalizedEvent('focus', {
        detail: { value },
      });
      onFocus(event);
    }
  },
  onBlur: function onBlur(e) {
    if (this.supportNative) {
      if (e.nativeEvent.simulated) {
        this.blur(e);
      }
    } else {
      this.blur(e);
    }
  },
  blur: function blur(e) {
    const _props2 = this.props;
    const { onBlur } = _props2;
    const { $mp } = _props2;

    const { value } = e.target;
    this.setState({
      focused: false,
    });
    if (onBlur) {
      const event = $mp.getNormalizedEvent('blur', {
        detail: { value },
      });
      onBlur(event);
    }
  },
  onComplete: function onComplete(e) {
    const _props3 = this.props;
    const { onConfirm } = _props3;
    const { $mp } = _props3;

    if (onConfirm) {
      const event = $mp.getNormalizedEvent('confirm', {
        detail: { value: e.target.value },
      });
      onConfirm(event);
    }
  },
  onLinechange: function onLinechange(e) {
    const _props4 = this.props;
    const { onLinechange } = _props4;
    const { $mp } = _props4;

    if (onLinechange) {
      const data = e.data || {};
      const { height } = data;
      const { heightRpx } = data;
      const { lineCount } = data;

      const event = $mp.getNormalizedEvent('linechange', {
        detail: {
          height,
          heightRpx,
          lineCount,
        },
      });
      onLinechange(event);
    }
    document.dispatchEvent(new CustomEvent('pageReRender', {}));
  },
  focus: function focus() {
    const inputFocus4Android = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
    const { disabled } = this.props;

    if (!disabled && this.textarea) {
      Object(_utils_focusInput__WEBPACK_IMPORTED_MODULE_6__.default)(this.textarea, inputFocus4Android, this.supportNative);
    }
  },
  onKeyDown: function onKeyDown(e) {
    const _props5 = this.props;
    const { onConfirm } = _props5;
    const { $mp } = _props5;

    if (!this.supportNative && e.keyCode === 13) {
      if (onConfirm) {
        const event = $mp.getNormalizedEvent('confirm', {
          detail: { value: e.target.value },
        });
        onConfirm(event);
      }
    }
  },
  saveContainer: function saveContainer(container) {
    this.container = container;
  },
  saveTextarea: function saveTextarea(textarea) {
    this.textarea = textarea;
  },
  handleComposition: function handleComposition(e) {
    if (e.type === 'compositionend') {
      this.compositionend = true;
      const { onInput } = this.props;

      if (onInput) {
        const event = this.props.$mp.getNormalizedEvent('input', {
          detail: { value: e.target.value },
        });
        onInput(event);
      }
    } else {
      this.compositionend = false;
    }
  },
  render: function render() {
    let _classNames;
    let _classNames2;

    const _props6 = this.props;
    const { id } = _props6;
    const { style } = _props6;
    const { className } = _props6;
    const { placeholder } = _props6;
    const { disabled } = _props6;
    const { maxlength } = _props6;
    const { onConfirm } = _props6;
    const { showCount } = _props6;
    const { placeholderStyle } = _props6;
    const { placeholderClass } = _props6;
    const { autoHeight } = _props6;
    const { fixed } = _props6;
    const { cursorSpacing } = _props6;
    const { cursor } = _props6;
    const { showConfirmBar } = _props6;
    const { selectionStart } = _props6;
    const { selectionEnd } = _props6;
    const { adjustPosition } = _props6;

    const value = this.getCurrentValue();
    let keyDownProp = {};
    if (onConfirm && !this.supportNative) {
      keyDownProp = {
        onKeyDown: this.onKeyDown,
      };
    }
    const kbParams = {};
    let characterLength;
    if (_utils_system__WEBPACK_IMPORTED_MODULE_7__.isIOS) {
      characterLength = countSymbols(value);
      kbParams.onCompositionStart = this.handleComposition;
      kbParams.onCompositionEnd = this.handleComposition;
      // 最新UC内核计算 textarea 的maxlength属性计算时也会把表情符号算为2个字符长度。需要两者保持一致。
    } else {
      characterLength = value.length;
    }
    const textareaCls = classnames__WEBPACK_IMPORTED_MODULE_4___default()((_classNames = {}, _classNames[className] = true, _classNames[`${prefixCls}-show-count`] = showCount, _classNames));
    const placeholderCls = classnames__WEBPACK_IMPORTED_MODULE_4___default()((_classNames2 = {}, _classNames2[`${prefixCls}-placeholder`] = true, _classNames2[placeholderClass] = !!placeholderClass, _classNames2));
    if (this.supportNative) {
      kbParams['data-keyboard'] = 'text';
      kbParams['data-auto-height'] = autoHeight;
      kbParams['data-cursor-spacing'] = cursorSpacing;
      kbParams['data-fixed'] = fixed;
      kbParams['data-adjust-position'] = adjustPosition;
      kbParams['data-show-confirm-bar'] = showConfirmBar;
      kbParams['data-selection-start'] = selectionStart;
      kbParams['data-selection-end'] = selectionEnd;
      if (cursor !== undefined) {
        kbParams['data-cursor'] = cursor;
      }
    }
    return react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(
      'div',
      { className: textareaCls, id, style, ref: this.saveContainer },
      react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(
        'div',
        { className: `${prefixCls}-wrap` },
        (typeof value === 'string' && value.length === 0 || !value && value !== 0) && placeholder && react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(
          'div',
          { className: placeholderCls, style: placeholderStyle ? this.props.$mp.getNormalizedStyle(placeholderStyle) : {} },
          placeholder,
        ),
        react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement('textarea', { ref: this.saveTextarea, value, className: `${prefixCls}-content`, maxLength: maxlength, onInput: this.onInput, onBlur: this.onBlur, onFocus: this.onFocus, disabled, ...keyDownProp, ...kbParams }),
      ),
      showCount && maxlength > 0 && react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(
        'p',
        { className: `${prefixCls}-count-wrap` },
        react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(
          'span',
          { className: `${prefixCls}-count` },
          characterLength,
        ),
        '/',
        maxlength,
      ),
    );
  },
})));
