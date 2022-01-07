import { camelCase, hasIn, kebabCase } from 'lodash';
import { cssToDom, isArray, hyphenate, getValByPath, capitalize, getType } from './util';
import { diff } from './vdom/diff';
import options from './options';
import { afterNextRender } from './render-status';
import { mergeData } from '../util';

let id = 0;

const ValidateStrategy = {
  String(o) {
    return isPlainObject(o) ? '[object Object]' : o ? String(o) : '';
  },
  Number(o) {
    return isNaN(Number(o)) ? 0 : Number(o);
  },
  Object(o) {
    return Array.isArray(o) ? o : isObject(o) ? {} : null;
  },
  Boolean(o) {
    return !!o;
  },
  Array(o) {
    return [];
  },
  Null(o) {
    return o;
  },
};

export default class WeElement extends HTMLElement {
  static is = 'WeElement'

  static isLightDom = false

  constructor() {
    super();
    // fix lazy load props missing
    this.props = { ...this.props };
    this.data = {};
    this.elementId = id++;
    this.computed = {};
    this.isInstalled = false;
  }

  bindStoreAndProvide() {
    let p = this.parentNode;
    while (p && !this.store) {
      this.store = p.store;
      p = p.parentNode || p.host;
    }

    if (this.inject) {
      this.injection = {};
      p = this.parentNode;
      let provide;
      while (p && !provide) {
        provide = p.provide;
        p = p.parentNode || p.host;
      }
      if (provide) {
        this.inject.forEach((injectKey) => {
          this.injection[injectKey] = provide[injectKey];
        });
      } else {
        throw 'The provide prop was not found on the parent node or the provide type is incorrect.';
      }
    }
  }

  connectedCallback() {
    this.bindStoreAndProvide();

    this.propsToData();

    let shadowRoot;
    if (this.constructor.isLightDom) {
      shadowRoot = this;
    } else if (!this.shadowRoot) {
      shadowRoot = this.attachShadow({
        mode: 'open',
      });
    } else {
      shadowRoot = this.shadowRoot;
      let fc;
      while ((fc = shadowRoot.firstChild)) {
        shadowRoot.removeChild(fc);
      }
    }

    if (this.constructor.elementStyles) {
      shadowRoot.adoptedStyleSheets = this.constructor.elementStyles;
    } else {
      const { css } = this.constructor;
      if (css) {
        if (typeof css === 'string') {
          const styleSheet = new CSSStyleSheet();
          styleSheet.replaceSync(css);
          shadowRoot.adoptedStyleSheets = [styleSheet];
        } else if (Object.prototype.toString.call(css) === '[object Array]') {
          const styleSheets = [];
          css.forEach((styleSheet) => {
            if (typeof styleSheet === 'string') {
              const adoptedStyleSheet = new CSSStyleSheet();
              adoptedStyleSheet.replaceSync(styleSheet);
              styleSheets.push(adoptedStyleSheet);
            } else {
              styleSheets.push(styleSheet);
            }
            shadowRoot.adoptedStyleSheets = styleSheets;
          });
        } else {
          shadowRoot.adoptedStyleSheets = [css];
        }
        this.constructor.elementStyles = shadowRoot.adoptedStyleSheets;
      }
    }

    this.beforeRender();
    options.afterInstall && options.afterInstall(this);

    const vnode = this.render(this.props, this.store);
    this.rootNode = diff(null, vnode, null, this);

    this.rendered();

    if (this.css) {
      shadowRoot.appendChild(
        cssToDom(typeof this.css === 'function' ? this.css() : this.css),
      );
    }

    if (this.props.css) {
      this._customStyleElement = cssToDom(this.props.css);
      this._customStyleContent = this.props.css;
      shadowRoot.appendChild(this._customStyleElement);
    }

    if (isArray(this.rootNode)) {
      this.rootNode.forEach((item) => {
        shadowRoot.appendChild(item);
      });
    } else {
      this.rootNode && shadowRoot.appendChild(this.rootNode);
    }

    this.isInstalled = true;

    this.attached();

    afterNextRender(this, () => {
      this.ready();
    });
  }

  disconnectedCallback() {
    this.isInstalled = false;

    this.detached();
  }

  update(ignoreAttrs, updateSelf) {
    this._willUpdate = true;
    this.beforeUpdate();
    this.beforeRender();
    // fix null !== undefined
    if (this._customStyleContent != this.props.css) {
      this._customStyleContent = this.props.css;
      this._customStyleElement.textContent = this._customStyleContent;
    }
    this.propsToData(ignoreAttrs);
    const vnode = this.render(this.props, this.store);

    this.rendered();
    this.rootNode = diff(
      this.rootNode,
      vnode,
      this.constructor.isLightDom ? this : this.shadowRoot,
      this,
      updateSelf,
    );

    this._willUpdate = false;
    this.updated();
  }

  forceUpdate() {
    this.update(true);
  }

  updateSelf(ignoreAttrs) {
    this.update(ignoreAttrs, true);
  }

  removeAttribute(key) {
    super.removeAttribute(key);
    // Avoid executing removeAttribute methods before connectedCallback
    this.isInstalled && this.update();
  }

  setAttribute(key, val) {
    if (val && typeof val === 'object') {
      super.setAttribute(key, JSON.stringify(val));
    } else {
      super.setAttribute(key, val);
    }
    // Avoid executing setAttribute methods before connectedCallback
    this.isInstalled && this.update();
  }

  pureRemoveAttribute(key) {
    super.removeAttribute(key);
  }

  pureSetAttribute(key, val) {
    super.setAttribute(key, val);
  }

  propsToData(ignoreAttrs) {
    if (ignoreAttrs) return;

    const ele = this;

    ele.props.css = ele.getAttribute('css');

    const { properties } = this.constructor;

    if (!properties) return;

    ele.prevProps = ele.prevProps || {};

    const changedProps = {};
    // 遍历properties
    Object.keys(properties).forEach((key) => {
      // 拿到类型
      const { type } = properties[key];

      const val = ele.props[kebabCase(key)] || ele.props[key];
      const prevVal = ele.prevProps[kebabCase(key)] || ele.prevProps[key];

      if (val != null) {
        // 之前不存在 或者 与之前不相等
        if (!prevVal || prevVal !== val) {
          changedProps[camelCase(key)] = this.normalizeValue(type, val);
        }
      } else if (prevVal != null) {
        changedProps[camelCase(key)] = this.normalizeValue(type, val);
      }

      ele.prevProps[key] = val;
    });

    mergeData(this.data, changedProps);
  }

  fire(name, data) {
    const handler = this.props[`on${capitalize(name)}`];
    if (handler) {
      handler(
        new CustomEvent(name, {
          detail: data,
        }),
      );
    } else {
      this.dispatchEvent(
        new CustomEvent(name, {
          detail: data,
        }),
      );
    }
  }

  setData(data) {
    mergeData(this.data, data);

    this.updateSelf(true);
  }

  normalizeProps(props, properties) {
    const blackPropList = [];
    const obj = {};
    for (let i = 0; i < Object.entries(properties).length; i+=1) {
      const [key, value] = Object.entries(properties)[i];
      // eslint-disable-next-line no-continue
      if (blackPropList.indexOf(key) !== -1) continue;
      // eslint-disable-next-line no-loop-func
      [key, kebabCase(key)].forEach((k) => {
        if (hasIn(props, k)) {
          obj[camelCase(key)] = this.normalizeValue(value.type, props[k]);
        }
      });
    }

    return obj;
  }

  normalizeValue(type, value) {
    return getType(value) === type
      ? value
      : ValidateStrategy[type] && ValidateStrategy[type].call(ValidateStrategy, value) || null;
  }

  attached() {}

  ready() {}

  detached() {}

  beforeUpdate() {}

  updated() {}

  beforeRender() {}

  rendered() {}

  receiveProps() {}
}
