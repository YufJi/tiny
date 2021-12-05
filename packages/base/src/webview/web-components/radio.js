import { html, PolymerElement } from '@polymer/polymer';
import { TemplateTag } from 'shared';
import { Base, LabelTarget, Item, Disabled } from './mixins';

const documentContainer = document.createElement('div');
documentContainer.setAttribute('style', 'display: none;');
documentContainer.innerHTML = `<dom-module id="radio-style">
  <template>
    <style>
      :host {
        -webkit-tap-highlight-color: transparent;
        display: inline-block;
      }
      
      :host .radio-wrapper {
        display: -webkit-inline-flex;
        display: inline-flex;
        -webkit-align-items: center;
                align-items: center;
        vertical-align: middle;
      }
      :host .radio-input {
        -webkit-appearance: none;
                appearance: none;
        margin-right: 5px;
        outline: 0;
        border: 1px solid #E8E8E8;
        border-radius: 50%;
        background-color: #FFFFFF;
        width: 22px;
        height: 22px;
        position: relative;
      }
     
      :host .radio-input.radio-input-checked:before {
        font: normal normal normal 14px/1 "iconfont";
        content: "\\e621";
        color: #ffffff;
        font-size: 28px;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -48%) scale(0.73);
        -webkit-transform: translate(-50%, -48%) scale(0.73);
      }
    </style>
  </template>
</dom-module>`;
document.head.appendChild(documentContainer);

class Radio extends Disabled(Item(LabelTarget(Base(PolymerElement)))) {
  static get is() {
    return `${TemplateTag.LowerCasePrefix}-radio`;
  }

  static get properties() {
    return {
      color: {
        type: String,
        value: '#04BE02',
      },
      checkedColor: {
        type: String,
        computed: '_getColor(checked, color)',
      },
    };
  }

  static get template() {
    return html`
      <style include="radio-style">
      </style>
      <div class="radio-wrapper">
        <div id="input" class$="radio-input [[hasCheckedClass(checked)]] [[hasDisabledClass(disabled)]]" style$="background-color: [[judgeDisableColor(checkedColor)]]; border-color: [[judgeDisableColor(checkedColor)]]">
        </div>
        <slot></slot>
      </div>
    `;
  }

  get listeners() {
    return {
      tap: 'onInputTap',
    };
  }

  onInputTap() {
    if (this.disabled) {
      return;
    }

    if (!this.checked) {
      this.checked = true;
      this.changedByTap();
    }
  }

  handleLabelTap() {
    this.onInputTap();
  }

  hasCheckedClass(checked) {
    return checked ? 'radio-input-checked' : '';
  }

  hasDisabledClass(disabled) {
    return disabled ? 'radio-input-disabled' : '';
  }

  _getColor(e, t) {
    return e ? t : '';
  }

  judgeDisableColor(color) {
    return this.disabled ? '#e8e8e8' : color;
  }
}

window.customElements.define(Radio.is, Radio);
