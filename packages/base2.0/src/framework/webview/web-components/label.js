import { PolymerElement, html } from '@polymer/polymer';
import { elementPrefix } from '@utils/config';
import { Base } from './mixins';

class Label extends Base(PolymerElement) {
  static get is() {
    return `${elementPrefix}-label`;
  }

  static get properties() {
    return {};
  }

  static get template() {
    return html`
      <style>
        :host {
          -webkit-tap-highlight-color: rgba(0,0,0,0);
        }     
      </style>     
      <slot></slot>
    `;
  }

  get listeners() {
    return {
      tap: 'onTap',
    };
  }

  onTap(e) {
    let labelTarget;
    const labelFor = this.htmlFor; // tma-html-compiler会把for输出到htmlFor

    if (labelFor) {
      labelTarget = this.querySelector(`#${labelFor}`) || document.getElementById(labelFor);
    } else {
      labelTarget = this._dfs(this);
    }

    if (labelTarget && labelTarget.handleLabelTap && e.target !== labelTarget) {
      labelTarget.handleLabelTap(e);
    }
  }

  _dfs(parent) {
    // 查找子节点中isLabelTarget为true的结点
    if (parent.isLabelTarget) {
      return parent;
    }

    const children = Array.from(parent.children);

    for (let i = 0; i < children.length; i+=1) {
      const target = this._dfs(children[i]);

      if (target) {
        return target;
      }
    }
  }
}

window.customElements.define(Label.is, Label);
