import { PolymerElement, html } from '@polymer/polymer';
import { TemplateTag } from 'shared';
import { Base, Data } from './mixins';

function padNumber(d) {
  d = parseInt(d, 10);

  if (isNaN(d)) {
    return '';
  }

  return d < 10 ? `0${d}` : d.toString();
}

class Picker extends Data(Base(PolymerElement)) {
  static get is() {
    return `${TemplateTag.LowerCasePrefix}-picker`;
  }

  static get properties() {
    return {
      range: {
        type: Array,
        value: [],
        observer: 'rangeChanged',
      },
      value: {
        type: Object,
        observer: 'valueChanged',
      },
      mode: {
        type: String,
        value: 'selector',
      },
      fields: {
        type: String,
        value: 'day',
      },
      start: {
        type: String,
        value: '',
      },
      end: {
        type: String,
        value: '',
      },
      disabled: {
        type: Boolean,
        value: false,
      },
      rangeKey: {
        type: String,
        value: '',
      },
      customItem: {
        type: String,
      },
    };
  }

  static get template() {
    return html`
      <style>
        :host {
            display: block;
            -webkit-user-select: none;
            user-select: none;
        }
        #wrapper {
            -webkit-tap-highlight-color: transparent;
        }
        ::slotted(*) {
            -webkit-user-select: none;
            user-select: none;
            -webkit-tap-highlight-color: transparent;
        }
      </style>
      <div id="wrapper">
        <slot></slot>
      </div>
    `;
  }

  get listeners() {
    return {
      tap: 'showPickerView',
    };
  }

  ready() {
    super.ready();

    console.log('picker ready', this.range, this.value);

    document.addEventListener('onKeyboardShow', () => {
      this.__hasKeyboard = true;
    });

    document.addEventListener('onKeyboardComplete', () => {
      this.__hasKeyboard = false;

      if (typeof this.__whenKeyboardComplete === 'function') {
        this.__whenKeyboardComplete();

        this.__whenKeyboardComplete = null;
      }
    });
  }

  resetFormData() {
    if (this.mode === 'selector') {
      this.value = -1;
    } else if (this.mode === 'region' || this.mode === 'multiSelector') {
      this.value = [];
    } else {
      this.value = '';
    }
  }

  getFormData(cb) {
    if (this.__pickerShow) {
      this.__formCallback = cb;
    } else if (typeof cb === 'function') {
      let result;

      if (this.mode === 'region' || this.mode === 'multiSelector') {
        result = Array.isArray(this.value) ? this.value : [];
      } else {
        result = this.value;
      }

      cb(result);
    }
  }

  formGetDataCallback() {
    if (typeof this.__formCallback === 'function') {
      this.__formCallback(this.value);
    }

    this.__formCallback = undefined;
  }

  showPickerView() {
    console.log('showPickerView');
    if (this.__hasKeyboard) {
      this.__whenKeyboardComplete = this._showPickerView;
    } else {
      this._showPickerView();
    }
  }

  _showPickerView() {
    if (this.mode === 'date' || this.mode === 'time') {
      this.showDatePickerView();
    } else if (this.mode === 'multiSelector') {
      this.showMultiPickerView();
    } else if (this.mode === 'region') {
      this.showRegionView();
    } else if (this.mode === 'selector') {
      this.showSelector();
    }
  }

  showSelector(e) {
    const _this = this;

    if (!this.disabled) {
      let n = parseInt(this.value, 10);

      if (isNaN(n) || n >= this.range.length) {
        n = 0;
      }

      const i = [];

      if (this.rangeKey) {
        for (let r = 0; r < this.range.length; r++) {
          const o = this.range[r];
          i.push(`${o[this.rangeKey]}`);
        }
      } else {
        for (let _r = 0; _r < this.range.length; _r++) {
          i.push(`${this.range[_r]}`);
        }
      }

      _this.invokeMethod('showPickerView', {
        array: i,
        current: n,
        success: function success(e) {
          _this.value = e.index.toString();

          _this.triggerEvent('change', {
            value: _this.value,
          });
        },
        fail: function fail() {
          _this.triggerEvent('cancel', {});
        },
        complete: function complete() {
          _this.resetPickerState();

          _this.formGetDataCallback();
        },
      });

      this.__pickerShow = true;
    }
  }

  showDatePickerView() {
    const _this = this;

    if (!this.disabled) {
      let safeValue = this.value;

      if (!safeValue) {
        const now = new Date();
        const YYYY = now.getFullYear();
        const MM = padNumber(now.getMonth() + 1);
        const DD = padNumber(now.getDate());
        const hh = padNumber(now.getHours());
        const mm = padNumber(now.getMinutes());
        safeValue = this.mode === 'date' ? `${YYYY}-${MM}-${DD}` : `${hh}:${mm}`;
      }

      _this.invokeMethod('showDatePickerView', {
        range: {
          start: this.start,
          end: this.end,
        },
        mode: this.mode,
        current: safeValue,
        fields: this.fields,
        success: function success(e) {
          _this.value = e.value;

          _this.triggerEvent('change', {
            value: _this.value,
          });
        },
        fail: function fail() {
          _this.triggerEvent('cancel', {});
        },
        complete: function complete() {
          _this.resetPickerState();

          _this.formGetDataCallback();
        },
      });

      this.__pickerShow = true;
    }
  }

  showMultiPickerView(e, t, n) {
    const _this = this;

    if (!this.disabled) {
      let value = [];
      let range = [];

      if (typeof e !== 'undefined') {
        this.value = value = e.current;
        this.range = range = e.array;
      } else {
        for (let a = 0; a < this.range.length; a++) {
          if (this.value && Array.isArray(this.value)) {
            value.push(parseInt(this.value[a]));

            if (isNaN(value[a]) || value[a] >= this.range[a].length) {
              value[a] = 0;
            }
          } else {
            value.push(0);
          }

          const s = [];

          if (this.rangeKey) {
            for (let l = 0; l < this.range[a].length; l++) {
              const c = this.range[a][l];
              s.push(`${c[this.rangeKey]}`);
            }
          } else {
            for (let _l = 0; _l < this.range[a].length; _l++) {
              s.push(`${this.range[a][_l]}`);
            }
          }

          range.push(s);
        }

        if (!this.value || !Array.isArray(this.value)) {
          // show multipicker的时候，value必须是一个数组
          this.value = value;
        }
      }

      if (range.length > 5) {
        console.error('showMultiPickerView');
        range = range.slice(0, 5);
        value = value.slice(0, 5);
      }

      _this.invokeMethod('showMultiPickerView', {
        array: range,
        current: value,
        success: function success(e) {
          _this.value = e.current;

          _this.triggerEvent('change', {
            value: typeof n === 'function' ? n(_this.value) : _this.value,
          });
        },
        fail: function fail() {
          _this.triggerEvent('cancel', {});
        },
        complete: function complete() {
          _this.resetPickerState();

          _this.formGetDataCallback();
        },
      });

      this.__pickerShow = true;
      this.__multi_picker_watching = true;
      this.onNative('onMultiPickerViewChange', (e) => {
        if (_this.__pickerShow && _this.value[e.column] !== e.current) {
          _this.value[e.column] = e.current;
          typeof t === 'function' ? t(e) : _this.triggerEvent('columnchange', {
            column: e.column,
            value: e.current,
          });
        }
      });
    }
  }

  showRegionView() {
    if (!this.disabled) {
      let { value } = this;

      if (!value || !Array.isArray(value)) {
        value = []; // 传空，交给端上处理
      }

      const _this = this;

      _this.invokeMethod('showRegionPickerView', {
        current: value,
        customItem: this.customItem,
        success: function success(e) {
          _this.value = e.value;

          _this.triggerEvent('change', {
            value: _this.value,
          });
        },
        fail: function fail() {
          _this.triggerEvent('cancel', {});
        },
        complete: function complete() {
          _this.resetPickerState();

          _this.formGetDataCallback();
        },
      });
    }
  }

  resetPickerState() {
    this.__pickerShow = false;
  }

  valueChanged(e, t) {
    const n = this;

    if (this.__pickerShow && this.__multi_picker_watching) {
      !(function i(r, o) {
        if (r < o) {
          if (e[r] !== t[r]) {
            const a = e[r] >= n.range[r].length ? 0 : e[r];
            const s = [];

            if (n.rangeKey) {
              for (let l = 0; l < n.range[r].length; l++) {
                const c = n.range[r][l];
                s.push(`${c[n.rangeKey]}`);
              }
            } else {
              for (let _l2 = 0; _l2 < n.range[r].length; _l2++) {
                s.push(`${n.range[r][_l2]}`);
              }
            }

            n.invokeMethod('updateMultiPickerView', {
              column: r,
              array: s,
              current: a,
              success: function success() {
                n.value[r] = a;
                i(r + 1, o);
              },
            });
          } else {
            i(r + 1, o);
          }
        }
      })(0, e.length);
    }
  }

  rangeChanged(e, t) {
    const n = this;

    if (this.__pickerShow && this.__multi_picker_watching) {
      !(function i(r, o) {
        if (r < o) {
          if (n._diffArray(e[r], t[r])) {
            i(r + 1, o);
          } else {
            const a = n.value[r] >= e[r].length ? 0 : n.value[r];
            const s = [];

            if (n.rangeKey) {
              for (let l = 0; l < e[r].length; l++) {
                const c = e[r][l];
                s.push(`${c[n.rangeKey]}`);
              }
            } else {
              for (let _l3 = 0; _l3 < e[r].length; _l3++) {
                s.push(`${e[r][_l3]}`);
              }
            }

            n.invokeMethod('updateMultiPickerView', {
              column: r,
              array: s,
              current: a,
              success: function success() {
                n.value[r] = a;
                i(r + 1, o);
              },
            });
          }
        }
      })(0, e.length);
    }
  }

  _diffArray(e, t) {
    if (e.length !== t.length) {
      return false;
    }

    for (let n = 0, i = e.length; n < i; n++) {
      if (typeof e[n] === 'object' && typeof t[n] === 'object') {
        if (e[n][this.rangeKey] !== t[n][this.rangeKey]) {
          return false;
        }
      } else if (typeof e[n] !== typeof t[n] || e[n] !== t[n]) {
        return false;
      }
    }

    return true;
  }
}

window.customElements.define(Picker.is, Picker);
