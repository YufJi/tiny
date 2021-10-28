import { PolymerElement, html } from '@polymer/polymer';
import { elementPrefix } from 'shared/config';
import { Base, LabelTarget, Disabled, Data } from './mixins';

const documentContainer = document.createElement('div');
documentContainer.setAttribute('style', 'display: none;');
documentContainer.innerHTML = `
  <dom-module id="switch-style">
    <template>
      <style>
        :host {
          -webkit-tap-highlight-color: transparent;
          display: inline-block;
        }
        :host .switch-wrapper {
          display: -webkit-inline-flex;
          display: inline-flex;
          -webkit-align-items: center;
                  align-items: center;
          vertical-align: middle;
        }
        :host .switch-input {
          -webkit-appearance: none;
                  appearance: none;
          position: relative;
          width: 52px;
          height: 32px;
          margin-right: 5px;
          border: 1px solid #DFDFDF;
          outline: 0;
          border-radius: 16px;
          box-sizing: border-box;
          background-color: #DFDFDF;
          transition: background-color 0.1s, border 0.1s;
        }
        :host .switch-input .before {
          content: " ";
          position: absolute;
          top: 0;
          left: 0;
          width: 50px;
          height: 30px;
          border-radius: 15px;
          background-color: #FDFDFD;
          transition: -webkit-transform .3s;
          transition: transform .3s;
          transition: transform .3s, -webkit-transform .3s;
        }
        :host .switch-input:after {
          content: " ";
          position: absolute;
          top: 0;
          left: 0;
          width: 30px;
          height: 30px;
          border-radius: 15px;
          background-color: #FFFFFF;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
          transition: -webkit-transform .3s;
          transition: transform .3s;
          transition: transform .3s, -webkit-transform .3s;
        }
        :host .switch-input.switch-input-checked {
          border-color: #04BE02;
          background-color: #04BE02;
        }
        :host .switch-input.switch-input-checked .before {
          -webkit-transform: scale(0);
                  transform: scale(0);
        }
        :host .switch-input.switch-input-checked:after {
          -webkit-transform: translateX(20px);
                  transform: translateX(20px);
        }
        :host .checkbox-input {
          margin-right: 5px;
          -webkit-appearance: none;
                  appearance: none;
          outline: 0;
          border: 1px solid #D1D1D1;
          background-color: #FFFFFF;
          border-radius: 3px;
          width: 22px;
          height: 22px;
          position: relative;
          color: #09BB07;
        }
        :host .checkbox-input.checkbox-input-checked:before {
          font: normal normal normal 14px/1 "iconfont";
          content: "\\e621";
          color: inherit;
          font-size: 28px;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -48%) scale(0.73);
          -webkit-transform: translate(-50%, -48%) scale(0.73);
        }
        :host .checkbox-input.checkbox-input-disabled {
          background-color: #E1E1E1;
        }
        :host .checkbox-input.checkbox-input-disabled:before {
          color: #ADADAD;
        }
      </style>
    </template>
  </dom-module>
`;
document.head.appendChild(documentContainer);

class Switch extends Data(Disabled(LabelTarget(Base(PolymerElement)))) {
  static get is() {
    return `${elementPrefix}-switch`;
  }

  static get properties() {
    return {
      checked: {
        type: Boolean,
        value: false,
      },
      type: {
        type: String,
        value: 'switch',
      },
      color: {
        type: String,
        value: '#04BE02',
      },
      checkedColor: {
        type: String,
        computed: '_getSwitchBorderColor(checked, color)',
      },
      isSwitch: {
        type: String,
        computed: '_isSwitch(type)',
      },
    };
  }

  static get template() {
    return html`
      <style include="switch-style">
      </style>
      <div class="switch-wrapper">
        <template is="dom-if" if="[[isSwitch]]">
          <div id="switchInput"
            class$="switch-input [[checkedClsSwitch(checked)]] [[disabledClsSwitch(disabled)]]"
            style$="background-color: [[color]]; border-color: [[checkedColor]]"><i class="before"/></div>
          <slot></slot>
        </template>
        <template is="dom-if" if="[[!isSwitch]]">
          <div id="checkboxInput" class$="checkbox-input [[checkedClsBox(checked)]] [[disabledClsBox(disabled)]]" style$="color: [[color]]"></div>
          <slot></slot>
        </template>
      </div>
    `;
  }

  get listeners() {
    return {
      tap: 'onInputChange',
    };
  }

  _isSwitch(e) {
    return e !== 'checkbox';
  }

  _getSwitchBorderColor(e, t) {
    return e ? t : '';
  }

  handleLabelTap() {
    this.onInputChange();
  }

  onInputChange() {
    if (this.disabled) {
      return;
    }

    this.checked = !this.checked;

    this.triggerEvent('change', {
      value: this.checked,
    });
  }

  getFormData(callback) {
    callback(this.checked);
  }

  resetFormData() {
    this.checked = false;
  }

  checkedClsSwitch(checked) {
    if (!this.isSwitch) {
      return '';
    }

    return checked ? 'switch-input-checked' : '';
  }

  disabledClsSwitch(disabled) {
    if (!this.isSwitch) {
      return '';
    }

    return disabled ? 'switch-input-disabled' : '';
  }

  checkedClsBox(checked) {
    if (this.isSwitch) {
      return '';
    }

    return checked ? 'checkbox-input-checked' : '';
  }

  disabledClsBox(disabled) {
    if (this.isSwitch) {
      return '';
    }

    return disabled ? 'checkbox-input-disabled' : '';
  }
}

window.customElements.define(Switch.is, Switch);
