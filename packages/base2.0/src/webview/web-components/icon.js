import { PolymerElement, html } from '@polymer/polymer';
import { elementPrefix } from 'shared/config';
import { Base } from './mixins';

const documentContainer = document.createElement('div');
documentContainer.setAttribute('style', 'display: none;');
documentContainer.innerHTML = `<dom-module id="icon-style">
  <template>
    <style>
      :host {
        display: inline-block;
        font-size: 0;
      }

      

      #icon {
        font: normal normal normal 14px/1 "mpui";
      }

      #icon[class^="icon-"]:before,
      #icon[class*=" icon-"]:before {
        margin: 0;
        box-sizing: border-box;
      }

      .icon-success { color: #09BB07; }
      .icon-success:before { content: "\\e613"; }
      .icon-success_no_circle { color: #09BB07;}
      .icon-success_no_circle:before { content: "\\e610";}
      .icon-info { color: #CACACA; }
      .icon-info:before { content: "\\e60d"; }
      .icon-warn { color: #F5A623;}
      .icon-warn:before { content: "\\e614";}
      .icon-waiting { color: #50ABF9;}
      .icon-waiting:before { content: "\\e612";}
      .icon-clear { color: #09BB07;}
      .icon-clear:before { content: "\\e615";}
      .icon-cancel { color: #222222;}
      .icon-cancel:before { content: "\\e611";}
      .icon-download { color: #222222;}
      .icon-download:before { content: "\\e60f";}
      .icon-search { color: #222222;}
      .icon-search:before { content: "\\e60e";}
    </style>
  </template>
</dom-module>`;
document.head.appendChild(documentContainer);

class Icon extends Base(PolymerElement) {
  static get is() {
    return `${elementPrefix}-icon`;
  }

  static get properties() {
    return {
      type: {
        type: String,
      },
      color: {
        type: String,
      },
      size: {
        type: Number,
        value: 24,
      },
    };
  }

  static get template() {
    return html`
      <style include="icon-style"></style>
      <i id="icon" class$="icon-[[ type ]]" style$="color: [[ color ]]; font-size: [[ size ]]px"></i>
    `;
  }
}

window.customElements.define(Icon.is, Icon);
