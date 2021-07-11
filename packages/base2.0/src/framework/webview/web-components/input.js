import { PolymerElement, html } from '@polymer/polymer';
import { GestureEventListeners } from '@polymer/polymer/lib/mixins/gesture-event-listeners';
import { elementPrefix } from '@utils/config';
import { Data, Base } from './mixins';

const documentContainer = document.createElement('div');
documentContainer.setAttribute('style', 'display: none;');
documentContainer.innerHTML = `<dom-module id="input-style">
  <template>
    <style>
      :host {
        display: block;
        height: 1.4rem;
        text-overflow: clip;
        overflow: hidden;
        white-space: nowrap;
        font-family: PingFang SC, -apple-system, helvetica, sans-serif;;
        min-height: 1.4rem;
        -webkit-tap-highlight-color: transparent;
      }

      :host input {
        position: relative;
        min-height: 1.4rem;
        border: none;
        height: inherit;
        width: 100%;
        font-size: inherit;
        font-weight: inherit;
        color: inherit;
        background: transparent;
        display: inherit;
        padding: 0;
        margin: 0;
        outline: none;
        vertical-align: middle;
        text-align: inherit;
        overflow: inherit;
        white-space: inherit;
        text-overflow: inherit;
        -webkit-tap-highlight-color: transparent;
        z-index: 2;
      }

      :host([ hidden ]) {
        display: none;
      }

      :host div {
        position: relative;
        min-height: 1.4rem;
        text-overflow: inherit;
        border: none;
        height: 100%;
        font-size: inherit;
        font-weight: inherit;
        font-family: PingFang SC, -apple-system, helvetica, sans-serif;;
        color: inherit;
        /*background: inherit;*/
        padding: 0;
        margin: 0;
        outline: none;
        text-align: inherit;
        -webkit-tap-highlight-color: transparent;
        white-space: nowrap;
        overflow: hidden;
      }

      :host div.input-placeholder {
        color: #CACACA;
      }

      :host div[type=password] div {
        color: black;
      }

      :host div div {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        line-height: 100%;
        height: inherit;
        min-height: 1.4rem;
        white-space: pre;
        text-align: inherit;
        overflow: hidden;
        vertical-align: middle;
        z-index: 1;
      }
    </style>
  </template>
</dom-module>`;
document.head.appendChild(documentContainer);

let webInputId = 0;

function castNumber(e) {
  e = Number(e);
  return isNaN(e) ? -1 : e;
}

class WebInput extends Data(GestureEventListeners(Base(PolymerElement))) {
  static get is() {
    return `${elementPrefix}-input`;
  }

  static get properties() {
    return {
      autoFocus: {
        type: Boolean,
        value: false,
      },
      placeholder: {
        type: String,
        value: '',
      },
      placeholderStyle: {
        type: String,
        value: '',
        observer: '_placeholderStyleChange',
      },
      placeholderClass: {
        type: String,
        value: '',
      },
      dropdownStyle: {
        type: Object,
        value: {},
      },
      value: {
        type: String,
        default: '',
        observer: 'defaultValueChange',
        reflectToAttribute: true,
      },
      filteredValue: {
        type: String,
        computed: 'filterValue(value, maxlength)',
      },
      showValue: {
        type: String,
        value: '',
      },
      maxlength: {
        type: Number,
        value: 140,
        reflectToAttribute: true,
        observer: 'maxlengthChanged',
      },
      type: {
        type: String,
        value: 'text',
        observer: 'defaultTypeChange',
      },
      password: {
        type: Boolean,
        value: false,
        observer: '_passwordChange',
      },
      disabled: {
        type: Boolean,
        value: false,
      },
      cursorSpacing: {
        type: Number,
        value: 0,
      },
      cursor: {
        type: null,
        value: -1,
      },
      selectionStart: {
        type: Number,
        value: -1,
      },
      selectionEnd: {
        type: Number,
        value: -1,
      },
      style: {
        type: String,
        defaultValue: '',
      },
    };
  }

  static get template() {
    return html`
      <style include="input-style">
      </style>
      <div id="wrapper">
        <input id="inputElement"
          disabled$="[[ disabled ]]"
          class$="input-placeholder [[ _prefixedPlaceholderClass ]]"
          on-input="__onChange"
          on-focus="_onFocus"
          on-blur="_onBlur"
          on-keyDown="_onKeyDown"
          on-keyUp="_onKeyUp"
          placeholder$="[[placeholder]]"
          maxlength="[[maxlength]]"
          type$="[[type]]"
          value="[[value]]"
          style="[[styles]]"
        >
      </div>
    `;
  }

  constructor(...args) {
    super(...args);
    this.webInputId = webInputId++;
  }

  get focus() {
    return this.$$focus;
  }

  set focus(newValue) {
    this.$$focus = this._deserializeValue(newValue, Boolean);

    this._couldFocus(this.$$focus);
  }

  ready() {
    super.ready();

    if (typeof this.$$focus === 'undefined') {
      this.$$focus = false;
    }
  }

  getFormData(fn) {
    typeof fn === 'function' && fn(this.filteredValue);
  }

  resetFormData() {
    this.value = '';
  }

  _event(type) {
    const target = {
      id: this.id || '',
      offsetLeft: this.offsetLeft,
      offsetTop: this.offsetTop,
      dataset: this.dataset,
    };
    return {
      type,
      currentTarget: target,
      target,
      timsStamp: 0,
    };
  }

  connectedCallback() {
    super.connectedCallback();

    this._attached = true;
    this.setProperty();

    this._checkAutoFocus();

    this.styles = this.getComputedStyleString();
    // this.$.inputElement.addEventListener('input', this._onInput.bind(this));

    // this.__setKeyboardValueId = this.onSetKeyboardValue.bind(this);
    // document.addEventListener('setKeyboardValue', this.__setKeyboardValueId);
    // this.__pageReRenderCallback = this.pageReRenderCallback.bind(this);
    // document.addEventListener('pageReRender', this.__pageReRenderCallback);
  }

  onSetKeyboardValue(e) {
    // 处理bindinput 返回值的情况
    if (e.detail.inputId === this.webInputId) {
      const keyBoardValue = e.detail.value;

      // 如果没有返回值不需要重写value
      if (typeof keyBoardValue === 'undefined') {
        return;
      }

      const inputEle = this.$.inputElement;
      inputEle && (inputEle.value = keyBoardValue);
    }
  }

  setProperty() {
    const isUsePassword = this.password;

    if (isUsePassword) {
      this.type = 'password';
    }

    this.$.inputElement.setAttribute('type', this.type);
    this.$.inputElement.setAttribute('maxlength', this.maxlength);

    if (this.type === 'number') {
      this.$.inputElement.setAttribute('type', 'text');
      this.$.inputElement.setAttribute('pattern', '\d*');
    }
  }

  getComputedStyleString() {
    const style = window.getComputedStyle(this);
    return Object.keys(style).filter((name) => {
      return ['fontFamily', 'fontSize', 'color', 'backgroundColor'].indexOf(name) > -1;
    }).reduce((current, next) => {
      if (next && style[next]) {
        return `${current}${next}: ${style[next]};`;
      } else {
        return current;
      }
    }, this.style);
  }

  _passwordChange(password) {
    if (password) {
      this.type = 'password';
    } else {
      this.type = this.type === 'password' ? 'text' : this.type;
    }
  }

  maxlengthChanged(newValue) {
    // 由于 maxLength 这个 property 设置了 type: number，所以只会为 number/NaN
    if (isNaN(newValue)) {
      this.maxlength = 140;
    } else if (newValue < 0) {
      this.maxlength = +Infinity;
    } else {
      this.maxlength = newValue;
    }

    this.$.inputElement.setAttribute('maxlength', this.maxlength);
  }

  defaultTypeChange(newValue, oldValue) {
    this.$.inputElement.setAttribute('pattern', '');
  }

  filterValue(val, maxlength) {
    if (!val) {
      return '';
    }

    if (maxlength > 0) {
      return val.slice(0, maxlength);
    }

    return val;
  }

  _onInput(e) {
    e.stopPropagation();
    this.value = this.$.inputElement.value;
    const { value } = this;

    if (value.length > this.maxlength) {
      this.value = value.slice(0, this.maxlength);
    }

    this.triggerEvent('input', {
      value: this.value,
      cursor: this.value.length,
      keyCode,
    });

    // const data = this.getEventTargetData();
    // tt.publish('onKeyboardValueChange', {
    //   value,
    //   inputId: this.webInputId,
    //   data,
    //   cursor: value.length,
    // });
  }

  pageReRenderCallback() {
    this.styles = this.getComputedStyleString();
  }

  getEventTargetData() {
    if (!this.bindinput) {
      return '';
    }

    const pid = this.parentCustomComponent();
    // method from base
    const e = {
      bindinput: this.bindinput,
      target: {
        id: this.id || '',
        dataset: this.dataset,
        offsetTop: this.$.wrapper.offsetTop,
        offsetLeft: this.$.wrapper.offsetLeft,
      },
      isCustomComponent: pid !== null,
      nodeId: pid,
    };
    e.currentTarget = e.target;
    return JSON.stringify(e);
  }

  _onKeyDown() {
    this.value = this.$.inputElement.value;

    if (this.value.length > this.maxlength) {
      return false;
    }
  }

  _onKeyUp(e) {
    if (e.keyCode === 13) {
      this.value = this.$.inputElement.value;
      this.triggerEvent('confirm', {
        value: this.value,
      });
      this.$.inputElement.blur();
    }
  }

  _onFocus(e) {
    e.stopPropagation();
    this.value = this.$.inputElement.value;
    this.triggerEvent('focus', {
      value: this.value,
    });
  }

  _onBlur(e) {
    e.stopPropagation();
    this.value = this.$.inputElement.value;
    this.triggerEvent('blur', {
      value: this.value,
    });
  }

  _checkPlaceholderStyle() {
    const $input = this.$.inputElement;
    $input.classList.remove('input-placeholder');
  }

  _checkAutoFocus() {
    if (this.autoFocus || this.focus) {
      this._couldFocus(true);
    }
  }

  _couldFocus(focus) {
    const that = this;

    if (this._attached) {
      if (focus) {
        window.requestAnimationFrame(() => {
          that.selectionStart = castNumber(that.selectionStart);
          that.selectionEnd = castNumber(that.selectionEnd);
          that.cursor = castNumber(that.cursor);

          that._inputFocus(that.cursor, that.selectionStart, that.selectionEnd);
        });
      } else {
        this.$.inputElement.blur();
      }
    }
  }

  _inputFocus(cursor, selectionStart, selectionEnd) {
    if (!this.disabled) {
      this._focusInputWithSelection(cursor, selectionStart, selectionEnd);
    }
  }

  _focusInputWithSelection(cursor, selectionStart, selectionEnd) {
    this.triggerEvent('focus', {
      value: this.value,
      height: 0,
    });
    this.$.inputElement.focus();

    if (typeof selectionStart === 'number' && typeof selectionEnd === 'number' && selectionStart !== -1) {
      this.$.inputElement.setSelectionRange(selectionStart, selectionEnd);
    } else if (typeof cursor === 'number') {
      this.$.inputElement.setSelectionRange(cursor, cursor);
    }

    this.selectionStart = -1;
    this.selectionEnd = -1;
    this.cursor = -1;
  }

  _placeholderStyleChange(newValue, oldValue) {
    if (newValue && newValue !== oldValue) {
      const styleArray = this.shadowRoot.querySelectorAll('style');
      const lastStyleElm = styleArray[styleArray.length - 1];

      if (!lastStyleElm.innerHTML) {
        lastStyleElm.innerHTML = '';
      }

      lastStyleElm.innerHTML += `
        input::placeholder: {${newValue}}
        input::-webkit-input-placeholder{${newValue}}
      `;
    }
  }

  defaultValueChange(newValue, oldValue) {
    newValue = newValue || '';
    newValue = newValue.slice(0, this.maxlength);
    this.setAttribute('value', newValue);

    this._checkPlaceholderStyle();
  }

  destoryEvents() {
    this.$.inputElement.removeEventListener('input', this._onInput.bind(this));
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    this.destoryEvents();
  }
}

window.customElements.define(WebInput.is, WebInput);
