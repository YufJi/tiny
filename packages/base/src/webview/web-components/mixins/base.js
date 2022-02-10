/* eslint-disable no-inner-declarations */
/* eslint-disable func-names */
import { addListener } from 'shared';
import { invokeMethod } from '@/webview/api/util';
import { onNative, publish, subscribe } from '../../bridge';

export default function Base(SuperClass) {
  return class extends SuperClass {
    static get properties() {
      return {
        hidden: {
          type: Boolean,
          reflectToAttribute: true,
        },
      };
    }

    get publish() {
      return publish;
    }

    get subscribe() {
      return subscribe;
    }

    get invokeMethod() {
      return invokeMethod;
    }

    get onNative() {
      return onNative;
    }

    connectedCallback() {
      super.connectedCallback();
    }

    ready() {
      super.ready();

      if (this.listeners) {
        const eventKeys = Object.keys(this.listeners);

        function loop(i, l) {
          const item = eventKeys[i];
          const eventHandler = this.listeners[item];
          const m = item.split('.');
          const eventTarget = m.length > 1 ? m[0] : null;
          const eventKey = eventTarget ? m[1] : m[0];

          addListener(eventTarget ? this.$[eventTarget] : this, eventKey, (e) => {
            return this[eventHandler].call(this, e);
          });
        }

        for (let i = 0, l = eventKeys.length; i < l; i+=1) {
          loop.call(this, i, l);
        }
      }
    }

    disconnectedCallback() {
      super.disconnectedCallback();
    }

    hasBehavior(type) {
      // simple mock of hasBehavior method
      if (type === 'base') {
        return true;
      }

      return false;
    }

    triggerEvent(eventName, detail = {}) {
      // 这个api用来触发组件自己独有的事件，比如swiper的change，input的focus，
      const e = new CustomEvent(eventName, {
        detail,
        bubbles: false, // 微信的做法，这些事件都不会冒泡
        composed: false,
      });
      this.dispatchEvent(e);
    }

    _deserializeValue(value, type) {
      if (type === Boolean) {
        return !!value;
      }

      if (type === String) {
        if (value === undefined || value === null) {
          return '';
        }
        // compiler会把value=""编译成value: true, 兼容一下
        if (typeof value === 'boolean' && value) {
          return '';
        }

        return value.toString();
      }

      return super._deserializeValue(value, type);
    }
  };
}
