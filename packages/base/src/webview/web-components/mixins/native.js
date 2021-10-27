export default function Native(superClass) {
  return class extends superClass {
    constructor() {
      super();

      this._deferred = [];
      this._isReady = false;
      this._box = {
        left: 0,
        top: 0,
        width: 0,
        height: 0,
      };
    }

    static get properties() {
      return {
        hidden: {
          type: Boolean,
          reflectToAttribute: true,
          observer: 'hiddenChanged',
        },
      };
    }

    _getBox(e, isRelative) {
      const rect = this.getBoundingClientRect();
      const box = {
        left: rect.left + window.scrollX,
        top: rect.top + window.scrollY,
        width: this.offsetWidth,
        height: this.offsetHeight,
      };

      if (isRelative) return box;

      const i = e || window.getComputedStyle(this);
      const o = parseFloat(i.getPropertyValue('border-top-width')) || 0;
      const a = parseFloat(i.getPropertyValue('border-bottom-width')) || 0;
      const s = parseFloat(i.getPropertyValue('border-left-width')) || 0;
      const l = parseFloat(i.getPropertyValue('border-right-width')) || 0;

      box.left += s;
      box.top += o;
      box.width -= s + l;
      box.height -= o + a;

      return box;
    }

    _diff() {
      const box = this._getBox();

      for (const key in box) {
        if (box[key] !== this._box[key]) {
          return box;
        }
      }

      return false;
    }

    hiddenChanged(lastest, previous) {
      this._isReady
        ? this._hiddenChanged && this._hiddenChanged(lastest, previous)
        : this._deferred.push({
          callback: 'hiddenChanged',
          args: [lastest, previous],
        });
    }

    push2defferd(item) {
      const { callback, args } = item;

      this._deferred.push({ callback, args });
    }

    _ready() {
      this._isReady = true;
      this._deferred.forEach((item) => {
        this[item.callback].apply(this, item.args);
      });

      this._deferred = [];
    }

    _iosGlobalNativeViewId(container) {
      let id;

      for (id = (~~(16777215 * Math.random())).toString(16); id.length < 6;) {
        id = `0${id}`;
      }

      const n = document.createElement('div');
      n.style.background = `#${id}01`;
      n.style.webkitOverflowScrolling = 'touch';
      n.style.overflow = 'scroll';
      n.style.position = 'absolute';
      n.style.width = '100%';
      n.style.height = '100%';
      n.style.top = 0;
      n.style.left = 0;

      const r = document.createElement('div');
      r.style.height = '100%';
      r.style.marginTop = '1px';
      n.appendChild(r);

      if (getComputedStyle(container).position === 'static') {
        container.style.position = 'relative';
      }

      container.prepend(n);

      return id;
    }

    _getData() {
      const nodeId = this.parentCustomComponent();
      const handlers = {};

      Object.keys(this).forEach((key) => {
        key.slice(0, 4) === 'bind' && (handlers[key] = this[key]);
      });

      return {
        handlers,
        event: {
          target: {
            dataset: this._dataset || {},
            id: this.id,
            offsetTop: this.offsetTop,
            offsetLeft: this.offsetLeft,
          },
          currentTarget: {
            dataset: this._dataset || {},
            id: this.id,
            offsetTop: this.offsetTop,
            offsetLeft: this.offsetLeft,
          },
        },
        nodeId,
      };
    }
  };
}
