import { PolymerElement, html } from '@polymer/polymer';
import { elementPrefix } from '@/utils/config';
import { Base, LabelTarget, Item, Disabled } from './mixins';

const documentContainer = document.createElement('div');
documentContainer.setAttribute('style', 'display: none;');
documentContainer.innerHTML = `<dom-module id="checkbox-style">
  <template>
    <style>
        :host {
          -webkit-tap-highlight-color: transparent;
          display: inline-block;
        }
        :host .checkbox-wrapper {
          display: -webkit-inline-flex;
          display: inline-flex;
          -webkit-align-items: center;
          align-items: center;
          vertical-align: middle;
        }

        :host .checkbox-input {
          margin-right: 5px;
          -webkit-appearance: none;
          appearance: none;
          outline: 0;
          background-color: #FFF;
          border: 1px solid #E8E8E8;
          border-radius: 100%;
          width: 22px;
          height: 22px;
          position: relative;
        }

        :host .checkbox-input.checkbox-input-checked:before {
          font: normal normal normal 14px/1 "ttui";
          content: "\\e601";
          font-size: 28px;
          color: #FFFFFF;
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

class Checkbox extends Disabled(Item(LabelTarget(Base(PolymerElement)))) {
  static get is() {
    return `${elementPrefix}-checkbox`;
  }

  static get properties() {
    return {
      color: {
        type: String,
        value: '#F85959',
      },
      checkedColor: {
        type: String,
        computed: '_getColor(checked, color)',
      },
    };
  }

  static get template() {
    return html`
      <style include="checkbox-style"></style>
      <div class="checkbox-wrapper">
        <div
          id="input" 
          class$="checkbox-input [[hasCheckedClass(checked)]] [[hasDisabledClass(disabled)]]" 
          style$="border-color: [[judgeDisableColor(color)]];background-color: [[judgeDisableColor(checkedColor)]];"
        >
        </div>
        <slot></slot>
      </div>
    `;
  }

  get listeners() {
    return {
      tap: 'handleBoxTap',
    };
  }

  handleBoxTap() {
    if (this.disabled) {
      return;
    }

    this.checked = !this.checked;
    this.changedByTap();
  }

  handleLabelTap() {
    this.handleBoxTap();
  }

  hasCheckedClass(checked) {
    return checked ? `${elementPrefix}-checkbox-input-checked` : '';
  }

  hasDisabledClass(disabled) {
    return disabled ? `${elementPrefix}-checkbox-input-disabled` : '';
  }

  _getColor(checked, color) {
    return checked ? color : '';
  }

  judgeDisableColor(color) {
    return this.disabled ? '#E8E8E8E' : color;
  }
}

window.customElements.define(Checkbox.is, Checkbox);
