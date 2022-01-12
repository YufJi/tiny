import { html, PolymerElement } from '@polymer/polymer';
import { TemplateTag } from 'shared';
import { Base } from './mixins';

const documentContainer = document.createElement('div');
documentContainer.setAttribute('style', 'display: none;');
documentContainer.innerHTML = `
  <dom-module id="progress-style">
    <template>
      <style>
          :host {
              display: -webkit-flex;
              display: flex;
              -webkit-align-items: center;
                      align-items: center;
              width: 100%;
          }
          :host .progress-wrapper {
            flex: 1;
            overflow: hidden;
          }
          :host .progress-inner{
              width: 0;
              height: 100%;
          }
          :host .progress-info {
            margin-top: 0;
            margin-bottom: 0;
            min-width: 2em;
            margin-left: 15px;
          }
      </style>
    </template>
  </dom-module>
`;
document.head.appendChild(documentContainer);

const DEFAULT_BACKGROUND_COLOR = '#EBEBEB';
const DEFAULT_ACTIVE_COLOR = '#04BE02';
const BACKWARDS = 'backwards';
const FORWARDS = 'forwards';

class Progress extends Base(PolymerElement) {
  static get is() {
    return `${TemplateTag.LowerCasePrefix}-progress`;
  }

  static get properties() {
    return {
      percent: {
        type: Number,
        value: 0,
        observer: 'percentChange',
      },
      currentPercent: {
        type: Number,
      },
      strokeWidth: {
        type: Number,
        value: 6,
      },
      showInfo: {
        type: Boolean,
        value: false,
      },
      color: {
        type: String,
        value: DEFAULT_ACTIVE_COLOR,
      },
      activeColor: {
        type: String,
        value: DEFAULT_ACTIVE_COLOR,
      },
      backgroundColor: {
        type: String,
        value: DEFAULT_BACKGROUND_COLOR,
      },
      active: {
        type: Boolean,
        value: false,
        observer: 'activeChange',
      },
      activeMode: {
        type: String,
        value: BACKWARDS,
      },
    };
  }

  static get template() {
    return html`
      <style include="progress-style">
      </style>

      <div class="progress-wrapper" style$="background-color: [[backgroundColor]]; height: [[strokeWidth]]px;">
        <div class="progress-inner" style$="width: [[currentPercent]]%; background-color: [[activeColor]]; ">
        </div>
      </div>

      <template is="dom-if" if="{{showInfo}}">
        <div class="progress-info">
          [[currentPercent]]%
        </div>
      </template>
    `;
  }

  percentChange(newValue, oldValue) {
    if (newValue < 0) {
      this.percent = 0;
    }

    if (newValue > 100) {
      this.percent = 100;
    }

    if (this.timerid) {
      clearInterval(this.timerid);
    }
    // 第一次执行percentChange时，参数oldValue一定为undefined;
    // 如果将undefined赋值给lastPercent,会影响下方timer函数（line: 99）的执行
    // 所以令lastPercent = percent
    this.lastPercent = oldValue === undefined ? this.percent : oldValue;
    this.activeChange(this.active);
  }

  activeChange(newValue) {
    // false => true
    if (newValue) {
      const timer = function timer() {
        if (this.percent <= this.currentPercent + 1) {
          this.currentPercent = this.percent;
          clearInterval(this.timerid);
        } else {
          ++this.currentPercent;
        }
      };

      this.currentPercent = FORWARDS === this.activeMode ? this.lastPercent : 0;
      this.timerid = setInterval(timer.bind(this), 30);
      timer.call(this);
    } else {
      this.currentPercent = this.percent;
    }
  }

  connectedCallback(e) {
    super.connectedCallback();

    this.lastPercent = this.percent || 0;
  }

  disconnectedCallback(e) {
    super.disconnectedCallback();

    if (this.timerid) {
      clearInterval(this.timerid);
    }
  }
}

window.customElements.define(Progress.is, Progress);
