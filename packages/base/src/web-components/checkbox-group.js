import { PolymerElement, html } from '@polymer/polymer';
import { elementPrefix } from '@/utils/config';
import { Base, Data, Group } from './mixins';

class CheckboxGroup extends Group(Data(Base(PolymerElement))) {
  static get is() {
    return `${elementPrefix}-checkbox-group`;
  }

  static get template() {
    return html`
      <style>
        :host {
          display: block;
        }
      </style>
      <slot></slot>
    `;
  }

  constructor(...args) {
    super(...args);
    this.value = [];
  }

  get childItemType() {
    return `${elementPrefix}-checkbox`;
  }

  addItem(e) {
    if (e.checked) {
      this.value.push(e.value);
    }
  }

  removeItem(e) {
    if (e.checked) {
      const t = this.value.indexOf(e.value);
      t >= 0 && this.value.splice(t, 1);
    }
  }

  renameItem(e, t, n) {
    if (e.checked) {
      const i = this.value.indexOf(n);
      i >= 0 && (this.value[i] = t);
    }
  }

  changed(e) {
    if (e.checked) {
      this.value.push(e.value);
    } else {
      const t = this.value.indexOf(e.value);
      if (t >= 0) {
        this.value.splice(t, 1);
      }
    }
  }
}

window.customElements.define(CheckboxGroup.is, CheckboxGroup);
