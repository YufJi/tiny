import { PolymerElement, html } from '@polymer/polymer';
import { elementPrefix } from '@/utils/config';
import { Base, Data, Disabled, TouchTrack } from './mixins';

const documentContainer = document.createElement('div');
documentContainer.setAttribute('style', 'display: none;');
documentContainer.innerHTML = `<dom-module id="slider-style">
  <template>
    <style>
      :host {
        margin: 10px 18px;
        padding: 0;
        display: block;
      }

      :host([hidden]) {
        display: none;
      }

      :host * {
        -webkit-tap-highlight-color: rgba(0,0,0,0);
      }

      :host .slider-wrapper {
        display: -webkit-flex;
        display: flex;
        -webkit-align-items: center;
                align-items: center;
        min-height: 16px;
      }
      :host .slider-tap-area {
        -webkit-flex: 1;
                flex: 1;
        padding: 8px 0;
      }
      :host .slider-handle-wrapper {
        position: relative;
        height: 2px;
        border-radius: 5px;
        background-color: #e9e9e9;
        cursor: pointer;
        transition: background-color 0.3s ease;
        -webkit-tap-highlight-color: transparent;
      }
      :host .slider-track {
        height: 100%;
        border-radius: 6px;
        background-color: #1aad19;
        transition: background-color 0.3s ease;
      }
      :host .slider-handle,
      :host .slider-thumb {
        position: absolute;
        left: 50%;
        top: 50%;
        cursor: pointer;
        border-radius: 50%;
        transition: border-color 0.3s ease;
      }
      :host .slider-handle {
        width: 28px;
        height: 28px;
        margin-top: -14px;
        margin-left: -14px;
        background-color: transparent;
        z-index: 3;
        border: 0 solid rgba(0,0,0,0.04);
        /*box-shadow: 0 3px 8px 0 rgba(0,0,0,0.15);*/
      }
      :host .slider-thumb {
        z-index: 2;
        /*box-shadow: 0 0 4px rgba(0, 0, 0, 0.2);*/
        box-shadow: 0 3px 8px rgba(0, 0, 0, 0.2);
      }
      :host .slider-step {
        position: absolute;
        width: 100%;
        height: 2px;
        background: transparent;
        z-index: 1;
      }
      :host .slider-value {
        color: #888;
        font-size: 14px;
        margin-left: 1em;
      }
      :host .slider-disabled .slider-track {
        background-color: #ccc;
      }
      :host .slider-disabled .slider-thumb {
        background-color: #FFF;
        border-color: #ccc;
      }
      :host * {
        margin: 0;
      }
    </style>
  </template>
</dom-module>`;
document.head.appendChild(documentContainer);

class Slider extends TouchTrack(Disabled(Data(Base(PolymerElement)))) {
  static get is() {
    return `${elementPrefix}-slider`;
  }

  static get properties() {
    return {
      min: {
        type: Number,
        value: 0,
        observer: '_revalicateRange',
      },
      max: {
        type: Number,
        value: 100,
        observer: '_revalicateRange',
      },
      step: {
        type: Number,
        value: 1,
      },
      value: {
        type: Number,
        value: 0,
        observer: '_revalicateRange',
      },
      showValue: {
        type: Boolean,
        value: false,
      },
      activeColor: {
        type: String,
        value: '#F85959',
      },
      backgroundColor: {
        type: String,
        value: '#E8E8E8',
      },
      blockSize: {
        type: Number,
        value: 28,
      },
      blockColor: {
        type: String,
        value: '#FFFFFF',
      },
      selectedColor: {
        type: String,
        value: '#F85959',
      },
      color: {
        type: String,
        value: '#E8E8E8',
      },
      _filteredValue: {
        type: Number,
      },
    };
  }

  static get template() {
    return html`
      <style include="slider-style"></style>

      <div class$="slider-wrapper [[disabledClass(disabled)]]">
        <div id="wrapper" class="slider-tap-area">
          <div class="slider-handle-wrapper" style$="background-color: [[_getBackgroundColor(color, backgroundColor)]];">
            <div id="handle" class="slider-handle" style$="left: [[_getValueWidth(_filteredValue, min, max)]];">
            </div>
            <div class="slider-thumb" style$="[[_getThumbStyles(_filteredValue)]]">
            </div>
            <div class="slider-track" style$="width: [[_getValueWidth(_filteredValue, min, max)]];background-color: [[_getActiveColor(selectedColor, activeColor)]];">
            </div>
            <div id="step" class="slider-step"></div>
          </div>
        </div>
        <template is="dom-if" if="{{showValue}}">
          <span class="slider-value">[[_filteredValue]]</span>
        </template>
      </div>
    `;
  }

  get listeners() {
    return {
      'wrapper.tap': '_onTap',
    };
  }

  ready() {
    super.ready();
    this.touchtrack(this.$.handle, '_onTrack');
  }

  _filterValue(e) {
    if (e < this.min) {
      return this.min;
    } else if (e > this.max) {
      return this.max;
    }

    return Math.round((e - this.min) / this.step) * this.step + this.min;
  }

  _revalicateRange() {
    let n = this._filterValue(this.value);

    if (isDecimal(this.min) || isDecimal(this.max) || isDecimal(this.step)) {
      const i = Math.max(getPrecision(this.min), getPrecision(this.max), getPrecision(this.step));
      n = +n.toFixed(i);
    }

    this._filteredValue = n;
  }

  _getValueWidth(e, min, max) {
    e = e || 0;

    if (max === min) {
      return e - min ? '100%' : '0%';
    }

    return `${100 * (e - min) / (max - min)}%`;
  }

  _getBlockSize(e) {
    const t = 12;
    const n = 28;

    return e < t ? t : e > n ? n : e;
  }

  _getBackgroundColor(e, t) {
    return t !== '#FFFFFF' ? t : e !== '#FFFFFF' ? e : '#FFFFFF';
  }

  _getActiveColor(e, t) {
    return t !== '#F85959' ? t : e !== '#F85959' ? e : '#F85959';
  }

  _getThumbStyles(filteredValue) {
    const width = this._getBlockSize(this.blockSize);

    const height = width;
    const marginLeft = -width / 2;
    const marginTop = -width / 2;

    const left = this._getValueWidth(filteredValue, this.min, this.max);

    const backgroundColor = this.blockColor;
    return `width: ${width}px;height: ${height}px;margin-left: ${marginLeft}px;margin-top: ${marginTop}px;left: ${left};background-color: ${backgroundColor};`;
  }

  _onUserChangedValue(e) {
    const { offsetWidth } = this.$.step;
    const n = this.$.step.getBoundingClientRect().left;

    let value = this.min + (e.detail.x - n) * (this.max - this.min) / offsetWidth;

    value = this._filterValue(value);

    this.value = value;
  }

  _onTrack(e) {
    if (!this.disabled) {
      if (e.detail.state === 'move') {
        e.preventDefault();

        this._onUserChangedValue(e);

        this.triggerEvent('changing', {
          value: this.value,
        });
        return false;
      }

      if (e.detail.state === 'end') {
        this.triggerEvent('change', {
          value: this.value,
        });
      }
    }
  }

  _onTap(e) {
    if (!this.disabled) {
      this._onUserChangedValue(e);

      this.triggerEvent('change', {
        value: this.value,
      });
    }
  }

  resetFormData() {
    this.value = this.min;
  }

  disabledClass(disabled) {
    return disabled ? 'slider-disabled' : '';
  }
}

function isDecimal(e) {
  return e % 1 !== 0;
}

function getPrecision(t) {
  t = +t;
  return isNaN(t) || !isDecimal(t) ? 0 : t.toString().split('.')[1].length;
}

window.customElements.define(Slider.is, Slider);
