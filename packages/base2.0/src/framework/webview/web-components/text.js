import { PolymerElement, html } from '@polymer/polymer';
import { elementPrefix, UpperCasePerfix } from '@utils/config';
import { Base } from './mixins';

class Text extends Base(PolymerElement) {
  static get is() {
    return `${elementPrefix}-text`;
  }

  static get properties() {
    return {
      style: {
        type: String,
        observer: '_styleChanged',
      },
      class: {
        type: String,
        observer: '_classChanged',
      },
      selectable: {
        type: Boolean,
        value: false,
      },
      decode: {
        type: Boolean,
        value: false,
      },
      space: {
        type: String,
        value: '',
      },
    };
  }

  static get template() {
    return html`
      <slot id="slot" style="display: none;"></slot>
      <span id="main"></span>
    `;
  }

  connectedCallback() {
    super.connectedCallback();

    this._update();

    this._observer = new MutationObserver(this._update.bind(this));

    this._observer.observe(this, {
      childList: true,
      subtree: true,
      characterData: true, // 必须
    });
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    this._observer && this._observer.disconnect();
  }

  _styleChanged(styles) {
    this.setAttribute('style', styles);
  }

  _classChanged(cls) {
    this.setAttribute('class', cls);
  }

  _decode(txt) {
    this.space
      && (this.space === 'nbsp'
        ? (txt = txt.replace(/ /g, ' '))
        : this.space === 'ensp'
          ? (txt = txt.replace(/ /g, ' '))
          : this.space === 'emsp' && (txt = txt.replace(/ /g, ' ')));

    return this.decode
      ? txt
        .replace(/&nbsp;/g, ' ')
        .replace(/&ensp;/g, ' ')
        .replace(/&emsp;/g, ' ')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "'")
        .replace(/&amp;/g, '&')
      : txt;
  }

  _update() {
    const textNode = document.createDocumentFragment();

    Array.from(this.childNodes).forEach((shadowNode) => {
      if (shadowNode.nodeType === shadowNode.TEXT_NODE) {
        const lines = this._decode(shadowNode.textContent).split('\n');

        for (let i = 0; i < lines.length; i+=1) {
          i && textNode.appendChild(document.createElement('br'));

          textNode.appendChild(document.createTextNode(lines[i]));
        }
      } else if (shadowNode.nodeType === 1 && shadowNode.tagName === `${UpperCasePerfix}-TEXT`) {
        const cloneNode = Node.prototype.cloneNode || Element.prototype.cloneNode;

        const _clone = (root) => {
          const outer = cloneNode.call(root);
          outer.$$data = root.$$data;

          Array.from(root.childNodes).forEach((child) => {
            if (child.nodeType === 1 && child.tagName === `${UpperCasePerfix}-TEXT`) {
              outer.appendChild(_clone(child));
            } else {
              outer.appendChild(child.cloneNode());
            }
          });
          return outer;
        };

        textNode.appendChild(_clone(shadowNode));
      }
    });

    this.$.main.innerHTML = '';
    this.$.main.appendChild(textNode);
  }
}

window.customElements.define(Text.is, Text);
