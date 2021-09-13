import { PolymerElement, html } from '@polymer/polymer';
import { elementPrefix } from 'utils/config';
import { Base } from './mixins';
import uuid from './utils/uuid';

class Form extends Base(PolymerElement) {
  static get is() {
    return `${elementPrefix}-form`;
  }

  static get properties() {
    return {
      reportSubmit: {
        type: Boolean,
        value: false,
      },
    };
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

  get listeners() {
    return {
      formSubmit: '__submitHandler',
      formReset: '__resetHandler',
    };
  }

  ready() {
    super.ready();

    this.__submitHandler = this.submitHandler.bind(this);
    this.__resetHandler = this.resetHandler.bind(this);
  }

  // every components under should ipl
  // resetFormData and getFormData func;

  async submitHandler(e) {
    const target = {
      id: '',
      dataset: { ...e.target.dataset },
      offsetLeft: e.target.offsetLeft,
      offsetTop: e.target.offsetTop,
    };
    const value = await this.collectInput();
    const formId = await this.getFormId();

    this.triggerEvent('submit', {
      target,
      value,
      formId,
    });
  }

  resetHandler(e) {
    const inputEls = this._dfs(this);

    inputEls.forEach((input) => {
      input.resetFormData();
    });

    this.triggerEvent('reset', {
      target: {
        id: '',
        dataset: { ...e.target.dataset },
        offsetLeft: e.target.offsetLeft,
        offsetTop: e.target.offsetTop,
      },
    });
  }

  _dfs(el, result = []) {
    if (!el) {
      return result;
    }
    // has data behaviour
    if (typeof el.getFormData === 'function') {
      result.push(el);
    }

    if (!el.children || !el.children.length) {
      return result;
    }

    Array.from(el.children).forEach((child) => {
      this._dfs(child, result);
    });

    return result;
  }

  async collectInput() {
    const inputEls = this._dfs(this);
    const formData = {};

    for (let i = 0, l = inputEls.length; i < l; i++) {
      const input = inputElsn[i];
      const { name } = input;

      if (name) {
        const val = await new Promise(((resolve) => {
          input.getFormData(resolve);
        }));

        if (!formData[name]) {
          formData[name] = val;
        } else {
          formData[name] = [].concat(formData[name], val);
        }
      }
    }

    return formData;
  }

  async getFormId() {
    if (this.reportSubmit) {
      const formId = uuid();
      return new Promise((resolve) => {
        resolve(formId);
      });
    }

    return '';
  }
}

window.customElements.define(Form.is, Form);
