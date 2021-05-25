import addEvents, { addEvent } from '@/utils/addEvents';

export default function Base(SuperClass) {
  class BaseMixin extends SuperClass {
    static get properties() {
      return {
        hidden: {
          type: Boolean,
          reflectToAttribute: true,
        },
        __fields: {
          type: Object,
        },
      };
    }

    constructor(...args) {
      super(...args);
      this.triggerReRender = () => {
        this.emitter.emit('RE_RENDER', 'base');
      };
    }

    get bridge() {
      return this.__fields.bridge;
    }

    get emitter() {
      return this.__fields.emitter;
    }

    get pageStatus() {
      return this.__fields.status;
    }

    get trackFn() {
      return this.__fields.trackFn;
    }

    get publish() {
      return this.bridge.publish;
    }

    get subscribe() {
      return this.bridge.subscribe;
    }

    get unsubscribe() {
      return this.bridge.unsubscribe;
    }

    get onNative() {
      return this.bridge.onNative;
    }

    get offNative() {
      return this.bridge.offNative;
    }

    get invokeNative() {
      return this.bridge.invokeNative;
    }

    get invokeService() {
      return this.bridge.invokeService;
    }

    connectedCallback() {
      super.connectedCallback();
    }

    ready() {
      super.ready();

      if (this.listeners) {
        const _this = this;
        for (const key in this.listeners) {
          if (Object.hasOwnProperty.call(this.listeners, key)) {
            const eventHandler = this.listeners[key];
            const m = key.split('.');
            const eventTarget = m.length > 1 ? m[0] : null;
            const eventKey = eventTarget ? m[1] : m[0];

            const fn = function (e) {
              return _this[eventHandler].call(_this, e);
            };

            addEvent(eventTarget ? this.$[eventTarget] : this, eventKey, fn);
          }
        }
      }
    }

    hasBehavior(type) {
      // simple mock of hasBehavior method
      if (type === 'base') {
        return true;
      }

      return false;
    }

    invoke(methodName, params, option) {
      this.invokeMethod(methodName, params, option);
    }

    async invokeMethod(method, params = {}, option = {}) {
      const pureParams = omitBy(params, isFunction);
      const call = (obj, key) => {
        const fn = get$3(obj, key);

        if (typeof fn === 'function') {
          fn(res);
        }
      };

      const res = await this.invokeNative(method, pureParams);
      res.errMsg = res.errMsg || `${method}:ok`;
      const status = res.errMsg.startsWith(`${method}:ok`) ? 'ok' : res.errMsg.startsWith(`${method}:cancel`) ? 'cancel' : 'fail';

      if (status === 'ok') {
        call(option, 'beforeSuccess');
        call(params, 'success');
        call(option, 'afterSuccess');
      } else if (status === 'cancel') {
        // FIXME: 这里在 cancel 中调用 fail 是为了兼容老逻辑
        // 未来重构会去掉在基础库内部使用 invokeMethod 的逻辑`
        call(params, 'fail');
        call(option, 'cancel');
      } else if (status === 'fail') {
        call(option, 'beforeFail');
        call(params, 'fail');
        call(option, 'beforeFail');
      }
      call(params, 'complete');
      call(option, 'afterAll');
    }

    triggerEvent(eventName, detail = {}) {
      // 这个api用来触发组件自己独有的事件，比如swiper的change，input的focus，
      const e = new CustomEvent(eventName, {
        detail,
        bubbles: false,
        // 微信的做法，这些事件都不会冒泡
        composed: false,
      });
      this.dispatchEvent(e);
    }

    parentCustomComponent() {
      // find parent custom component
      const cc = isInCustomComponent(this);

      if (!cc) {
        return null;
      }

      return cc._id;
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
  }

  return BaseMixin;
}
