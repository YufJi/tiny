import React from 'react';
import createReactClass from 'create-react-class';
import classnames from 'classnames';
import focusInput from '@/utils/focusInput';
import callBridge from '@/utils/callBridge';
import { compareSystemVersion, isAndroid, isIDE, isIOS, isNativeComponent } from '@/utils/system';
import rgba2Color from '@/utils/rgba2Color';
import addEvents from '@/utils/addEvents';
import callInternalAPI from '@/utils/callInternalAPI';
import formMixin from '../form/mixin';
import { createComponent } from '@/framework/';

const g = self;
let id = 0;
const cacheInputId = {};
const prefixCls = 'a-input';
const g10138 = compareSystemVersion('10.1.38') >= 0;

const Input = createComponent({
  name: 'input',
  pure: false,
})(createReactClass({
  displayName: 'Input',
  mixins: [formMixin],
  getDefaultProps: function getDefaultProps() {
    return {
      value: '',
      type: 'text',
      password: false,
      placeholder: '',
      disabled: false,
      maxlength: 140,
      focus: false,
      confirmType: 'done',
      confirmHold: false,
      selectionStart: -1,
      selectionEnd: -1,
      controlled: false,
      randomNumber: false,
      enableNative: true,
      enableNewNativeInput: false,
    };
  },
  getInitialState: function getInitialState() {
    this.compositionend = true;
    this.useNewInput = false;
    const { focus, enableNative, enableNewNativeInput } = this.props;
    // 10.1.20 ios支持input native化
    // 10.1.22 android支持input native化
    // 财富客户端 nebulaMng基线 10.1.15
    // 高德客户端 nebulaMng基线 10.1.20
    // 非支付宝客户端都不启用native 键盘

    if (true) {
      this.supportNative = enableNative === true && !isIDE && isNativeComponent;
      if (g10138 && this.supportNative && enableNewNativeInput) {
        this.useNewInput = !isAndroid;
      }
    } else {}
    return {
      focused: focus,
      compositionValue: '',
    };
  },
  componentDidMount: function componentDidMount() {
    if (this.useNewInput) {
      // android bug
      if (isAndroid && !cacheInputId[this.getId()]) {
        this.readyForRender = false;
        this.detachInputReady = addEvents(document, {
          'nbcomponent.canrender': this.onNativeReady,
        });
      } else {
        this.readyForRender = true;
        this.renderNewInput(this.state.focused);
      }
      this.detachEvents = addEvents(document, {
        'nbcomponent.input.input': this.onNewInputEvent,
        'nbcomponent.input.focus': this.onNewInputEvent,
        'nbcomponent.input.blur': this.onNewInputEvent,
        'nbcomponent.input.keydown': this.onNewInputEvent,
      });
    } else {
      if (this.state.focused) {
        this.focus(true);
      }
      if (this.input) {
        // ios can not use react event
        this.inputEvents = addEvents(this.input, {
          keydown: this.onKeyDown,
        });
      }
    }
  },
  componentDidUpdate: function componentDidUpdate(prevProps) {
    const { focus, syncInput } = this.props;

    const needFocus = !!focus && !prevProps.focus && !this.state.focused;
    if (this.useNewInput) {
      this.renderNewInput(needFocus);
    } else {
      // 新增隐藏属性 sync-input 当为true时可以在onInput等回调中执行native input同步web input的操作
      if (isIOS && this.compositionend === true && syncInput && g._currentInput === this.input && g.AlipayH5Keyboad._getInputJsonWithElement) {
        callInternalAPI('resetNativeKeyBoardInput', g.AlipayH5Keyboad._getInputJsonWithElement(g._currentInput));
      }
      if (g._currentInput === this.input && this.compositionend === true) {
        const color = rgba2Color(window.getComputedStyle(this.container, null).color);
        callInternalAPI('updateNativeKeyBoardInput', {
          text: `${this.getCurrentValue()}`,
          color,
        });
      }
      if (needFocus) {
        this.focus(false);
      }
    }
  },
  componentWillUnmount: function componentWillUnmount() {
    if (this.input && this.inputEvents) {
      this.inputEvents.remove();
    }
    if (this.useNewInput) {
      if (this.detachInputReady) {
        this.detachInputReady.remove();
      }
      callBridge('NBComponent.remove', {
        element: this.getId(),
      });
      this.detachEvents.remove();
    }
  },
  onNewInputEvent: function onNewInputEvent(e) {
    const { type } = e;
    const _e$data = e.data;
    const data = _e$data === undefined ? {} : _e$data;
    const { element } = data;
    const { value } = data;
    const { marked } = data;
    const { keyCode } = data;

    if (element === this.getId() && type !== undefined) {
      const realType = type.substring(18);
      const { $mp, onFocus, onBlur, onInput, onConfirm, controlled } = this.props;

      switch (realType) {
        case 'focus':
          g._MpActiveNativeElement = this.getId();
          this.setState({
            focused: true,
          });
          if (onFocus) {
            onFocus($mp.getNormalizedEvent('focus', { detail: { value } }));
          }
          break;
        case 'blur':
          g._MpActiveNativeElement = undefined;
          this.setState({
            focused: false,
          });
          if (onBlur) {
            onBlur($mp.getNormalizedEvent('blur', { detail: { value } }));
          }
          break;
        case 'input':
          if (onInput && marked !== 'Y') {
            onInput($mp.getNormalizedEvent('input', { detail: { value } }));
            if (!controlled) {
              this.setState({
                value,
              });
            }
            this.setState({
              compositionValue: '',
            });
          } else {
            this.setState({
              compositionValue: value,
            });
          }
          break;
        case 'keydown':
          if (onConfirm && keyCode === 13) {
            onConfirm($mp.getNormalizedEvent('confirm', { detail: { value } }));
          }
          break;
        default:
          break;
      }
    }
  },
  renderNewInput: function renderNewInput(needFocus) {
    const _this = this;

    if (!this.readyForRender) {
      return;
    }
    this.clearRenderDelay();
    const _props4 = this.props;
    const { type } = _props4;
    const { password } = _props4;
    const { disabled } = _props4;
    const { maxlength } = _props4;
    const { confirmType } = _props4;
    const { confirmHold } = _props4;
    const { selectionStart } = _props4;
    const { selectionEnd } = _props4;
    const { randomNumber } = _props4;
    const { cursor } = _props4;

    const value = this.getCurrentValue();
    const computedStyle = window.getComputedStyle(this.input, null);
    callBridge('NBComponent.render', {
      element: this.getId(),
      data: {
        tagName: 'input',
        position: 'static',
        placeholder: '',
        type: password ? 'password' : 'text',
        keyboard: type,
        value,
        color: computedStyle.color,
        disabled,
        fontSize: computedStyle.fontSize,
        fontFamily: computedStyle.fontFamily,
        fontWeight: computedStyle.fontWeight,
        lineHeight: computedStyle.lineHeight,
        maxlength,
        canPaste: true,
        textAlign: computedStyle.textAlign,
        selectionStart,
        selectionEnd,
        returnType: confirmType,
        canReturn: confirmHold === true ? 'N' : 'Y',
        randomNumber: randomNumber === true ? 'Y' : 'N',
        cursor,
      },
    }, (e) => {
      if (e.success && needFocus) {
        callBridge('NBComponent.sendMessage', {
          actionType: 'focus',
          element: _this.getId(),
        });
      }
    });
  },
  onInput: function onInput(e) {
    const _props5 = this.props;
    const { onInput } = _props5;
    const { controlled } = _props5;
    const { $mp } = _props5;

    const { value } = e.target;
    // 如果native的键盘  event会带marked属性，用于告知是否是中间态
    if (this.supportNative && isIOS) {
      this.compositionend = e.nativeEvent.marked !== true;
    }
    if (onInput && this.compositionend === true) {
      onInput($mp.getNormalizedEvent('input', {
        detail: { value },
      }));
    }
    if (!controlled) {
      this.setState({
        value,
      });
    }
  },
  onFocus: function onFocus() {
    const _props6 = this.props;
    const { onFocus } = _props6;
    const { $mp } = _props6;

    const value = this.getCurrentValue();
    this.setState({
      focused: true,
    });
    if (onFocus) {
      onFocus($mp.getNormalizedEvent('focus', {
        detail: { value },
      }));
    }
  },
  onBlur: function onBlur(e) {
    const _props7 = this.props;
    const { password } = _props7;
    const { type } = _props7;
    // ios 非password 都支持native化 android只有text支持

    if (!password && this.supportNative && (isIOS || !isIOS && type === 'text')) {
      if (e.nativeEvent.simulated) {
        this.blur();
      }
    } else {
      this.blur();
    }
  },
  blur: function blur() {
    const _props8 = this.props;
    const { onBlur } = _props8;
    const { $mp } = _props8;

    const value = this.getCurrentValue();
    this.setState({
      focused: false,
    });
    if (onBlur) {
      onBlur($mp.getNormalizedEvent('blur', {
        detail: { value },
      }));
    }
  },
  onKeyDown: function onKeyDown(e) {
    const _props9 = this.props;
    const { onConfirm } = _props9;
    const { $mp } = _props9;

    if (onConfirm && (e.keyCode === 13 || e.data && e.data.keyCode === 13)) {
      onConfirm($mp.getNormalizedEvent('confirm', {
        detail: { value: e.target.value },
      }));
    }
  },
  focus: function focus() {
    const inputFocus4Android = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
    const { disabled } = this.props;

    if (!disabled && this.input) {
      focusInput(this.input, inputFocus4Android, this.supportNative);
    }
  },
  saveContainer: function saveContainer(container) {
    this.container = container;
  },
  saveInput: function saveInput(input) {
    this.input = input;
  },
  handleComposition: function handleComposition(e) {
    if (e.type === 'compositionend') {
      this.compositionend = true;
      const _props10 = this.props;
      const { onInput } = _props10;
      const { $mp } = _props10;

      if (onInput) {
        onInput($mp.getNormalizedEvent('input', {
          detail: { value: e.target.value },
        }));
      }
    } else {
      this.compositionend = false;
    }
  },
  getId: function getId() {
    if (this.id) {
      return this.id;
    }
    this.id = this.props.id || `mp_input_${++id}`;
    return this.id;
  },
  onNativeReady: function onNativeReady(e) {
    if (!e || e.elementid === this.getId()) {
      this.readyForRender = true;
      cacheInputId[this.getId()] = true;
      this.renderNewInput();
    }
  },
  clearRenderDelay: function clearRenderDelay() {
    if (this.detachInputReady) {
      this.detachInputReady.remove();
      this.detachInputReady = null;
    }
  },
  render: function render() {
    let _classNames;

    const _props11 = this.props;
    const { placeholder } = _props11;
    const { type } = _props11;
    const { password } = _props11;
    const { disabled } = _props11;
    const { maxlength } = _props11;
    const { className } = _props11;
    const { style } = _props11;
    const { id } = _props11;
    const { placeholderStyle } = _props11;
    const { placeholderClass } = _props11;
    const { confirmType } = _props11;
    const { confirmHold } = _props11;
    const { selectionStart } = _props11;
    const { selectionEnd } = _props11;
    const { randomNumber } = _props11;
    const { cursor } = _props11;
    const { $mp } = _props11;

    const value = this.getCurrentValue();
    const { compositionValue } = this.state;

    const kbParams = {
      type: 'text',
      // can not use onChange, react will fire onChange when enter on android
      // ios can not trigger onchange when type=digit
      onInput: this.onInput,
    };
    /* text, number, idcard, digit */
    if (password) {
      kbParams.type = 'password';
    } else if (type === 'number' || type === 'digit' || type === 'idcard') {
      kbParams['data-keyboard'] = type;
      kbParams['data-randomnumber'] = randomNumber === true ? 'Y' : 'N';
    }
    if (!this.supportNative && kbParams.type === 'text' && isIOS) {
      kbParams.onCompositionStart = this.handleComposition;
      kbParams.onCompositionEnd = this.handleComposition;
    }
    // input native化
    // ios 非password 都支持native化 android只有text支持
    if (!password && this.supportNative && (isIOS || !isIOS && kbParams.type === 'text')) {
      kbParams['data-keyboard'] = type;
      kbParams['data-selection-start'] = selectionStart;
      kbParams['data-selection-end'] = selectionEnd;
      kbParams['data-return-type'] = confirmType;
      kbParams['data-return'] = confirmHold === true ? 'N' : 'Y';
      if (cursor !== undefined) {
        kbParams['data-cursor'] = cursor;
      }
    }
    const placeholderCls = classnames((_classNames = {}, _classNames[`${prefixCls}-placeholder`] = true, _classNames[placeholderClass] = !!placeholderClass, _classNames));
    return React.createElement(
      'div',
      { className, id, style, ref: this.saveContainer },
      React.createElement(
        'div',
        { className: `${prefixCls}-wrap` },
        (typeof value === 'string' && value.length === 0 || !value && value !== 0) && compositionValue === '' && placeholder && React.createElement(
          'div',
          { className: placeholderCls, style: placeholderStyle ? $mp.getNormalizedStyle(placeholderStyle) : {} },
          React.createElement(
            'span',
            null,
            placeholder,
          ),
        ),
        this.useNewInput ? React.createElement('input', { ref: this.saveInput,
          style: {
            position: 'absolute',
            visibility: 'hidden',
            zIndex: 0,
          },
          className: `${prefixCls}-content` }) : null,
        this.useNewInput ? React.createElement(
          'object',
          { className: `${prefixCls}-content`, id: this.getId(), type: 'application/view' },
          React.createElement('param', { name: 'type', value: 'input' }),
          React.createElement('param', { name: 'id', value: this.getId() }),
        ) : React.createElement('input', { ref: this.saveInput, className: `${prefixCls}-content`, value, disabled, onFocus: this.onFocus, onBlur: this.onBlur, maxLength: maxlength, ...kbParams }),
      ),
    );
  },
}));

export default Input;
