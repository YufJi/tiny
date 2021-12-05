import { PolymerElement, html } from '@polymer/polymer';
import { TemplateTag } from 'shared';

class Page extends PolymerElement {
  static get is() {
    return `${TemplateTag.LowerCasePrefix}-page`;
  }

  static get template() {
    return html`
      <style>      
        :host {
          cursor: default;
          -webkit-user-select: none;
          user-select: none;
          -webkit-touch-callout: none;
          width: 100%;
          overflow-x: hidden;
          -webkit-text-size-adjust: none;
          text-size-adjust: none;
        }
      </style>
      <slot></slot>
    `;
  }
}

window.customElements.define(Page.is, Page);
