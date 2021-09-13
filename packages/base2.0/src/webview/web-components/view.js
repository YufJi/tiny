import { PolymerElement, html } from '@polymer/polymer';
import { elementPrefix } from 'utils/config';
import { Base, Hover } from './mixins';

class View extends Hover(Base(PolymerElement)) {
  static get is() {
    return `${elementPrefix}-view`;
  }

  static get template() {
    return html`
      <style>      
        :host {
          display: block;
          white-space: normal;
        }

        #main {
          /* ios12 special */
          text-decoration: inherit;      
        }
      </style>
      <slot id="main"></slot>
    `;
  }
}

window.customElements.define(View.is, View);
