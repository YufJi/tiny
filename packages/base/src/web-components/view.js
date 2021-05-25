import { PolymerElement, html } from '@polymer/polymer';
import Base from './common/base';
import Hover from './common/hover';
import { perfix } from './utils/config';
import { IS_IOS_11 } from './utils/tools';

class View extends Hover(Base(PolymerElement)) {
  static get is() {
    return `${perfix}-view`;
  }

  static get template() {
    return html`
      <style>      
        :host {        
          display: block;        
          white-space: normal;      
        }      
        :host[hidden] {        
          display: none !important;
        }      
        #main {        
          /* ios12 special */        
          text-decoration: inherit;      
        }    
      </style>
      <slot id="main"></slot>
    `;
  }

  ready() {
    super.ready();
    if (IS_IOS_11) {
      // ios 11.4或者11.3的兼容问题, 文本节点的text-decoration没了
      this.$.main.style.textDecoration = 'inherit';
    }
  }
}

window.customElements.define(View.is, View);
