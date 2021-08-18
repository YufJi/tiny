import { html, PolymerElement } from '@polymer/polymer';
import { elementPrefix } from 'utils/config';
import { Base, Data, Group } from './mixins';

class RadioGroup extends Group(Data(Base(PolymerElement))) {
  static get is() {
    return `${elementPrefix}-radio-group`;
  }

  static get properties() {
    return {
      value: {
        type: String,
      },
    };
  }

  static get template() {
    return html`
      <style>
        :host {
          display: block;
        }
        :host([ hidden ]) {
          display: none;
        }
      </style>
      <slot></slot>
    `;
  }

  get childItemType() {
    return `${elementPrefix}-radio`;
  }

  constructor() {
    super();
    this._selectedItem = null;
  }

  addItem(e) {
    if (e.checked) {
      if (this._selectedItem) {
        this._selectedItem.checked = false;
      }

      this.value = e.value;
      this._selectedItem = e;
    }
  }

  removeItem(e) {
    if (this._selectedItem === e) {
      this.value = '';
      this._selectedItem = null;
    }
  }

  renameItem(e, t) {
    this._selectedItem === e && (this.value = t);
  }

  changed(e) {
    if (this._selectedItem === e) {
      this.removeItem(e);
    } else {
      this.addItem(e);
    }
  }
}

window.customElements.define(RadioGroup.is, RadioGroup);
