import { html, PolymerElement } from '@polymer/polymer';
import { elementPrefix, upperCasePerfix } from '@utils/config';
import { Base } from './mixins';

class SwiperItem extends Base(PolymerElement) {
  static get is() {
    return `${elementPrefix}-swiper-item`;
  }

  static get properties() {
    return {
      itemId: {
        type: String,
        value: '',
        observer: '_updateId',
      },
    };
  }

  static get template() {
    return html`
      <style>
        :host {
          display: block;
          overflow: hidden;
          will-change: 'transform';
        }

        :host([ hidden ]) {
          display: none;
        }
      </style>
      <slot></slot>
    `;
  }

  ready() {
    super.ready();

    this._relatedSwiper = this._findSwiper(this.parentElement);

    if (!this._relatedSwiper) {
      throw new Error('<swiper-item> can only be used as child of <swiper>');
    }
  }

  connectedCallback() {
    super.connectedCallback();

    this._originalDisplay = this.style.display;

    this._relatedSwiper.dispatchEvent(new CustomEvent('swiper-item-link', {
      detail: {
        el: this,
      },
      bubbles: true,
    }));
  }

  disconnectedCallback() {
    this._relatedSwiper.dispatchEvent(new CustomEvent('swiper-item-unlink', {
      detail: {
        el: this,
      },
      bubbles: true,
    }));

    super.disconnectedCallback();
  }

  _findSwiper(el) {
    if (el.tagName === `${upperCasePerfix}-SWIPER`) {
      return el;
    }

    const parent = el.parentElement;

    if (!parent) {
      return null;
    }

    return this._findSwiper(parent);
  }

  _updateId(e, t) {
    this.dispatchEvent(new CustomEvent('swiper-item-idupdate', {
      detail: {
        value: e,
        oldValue: t,
      },
      bubbles: true,
    }));
  }
}

window.customElements.define(SwiperItem.is, SwiperItem);
