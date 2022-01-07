import { cssToDom, isArray, hyphenate, getValByPath, capitalize, getType } from './util';
import { diff } from './vdom/diff';
import options from './options';
import { afterNextRender } from './render-status';
import { mergeData } from '../util';

let id = 0;

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

    this.attrsToProps();

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
    this.attrsToProps(ignoreAttrs);
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

  updateProps(obj) {
    const attrs = this.constructor.properties;

    Object.keys(obj).forEach((key) => {
      const { type } = attrs[key];

      if (getType(obj[key]) === type) {
        this.props[key] = obj[key];
        if (this.prevProps) {
          this.prevProps[key] = obj[key];
        }
      }
    });

    this.forceUpdate();
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

  attrsToProps(ignoreAttrs) {
    if (ignoreAttrs) return;

    const ele = this;

    ele.props.css = ele.getAttribute('css');

    const attrs = this.constructor.properties;

    if (!attrs) return;

    Object.keys(attrs).forEach((key) => {
      const { type, value } = attrs[key];
      const val = ele.getAttribute(hyphenate(key));
      if (val !== null) {
        if (getType(val) === type) {
          ele.props[key] = val;
        }
      } else if (value) {
        ele.props[key] = value;
      } else {
        ele.props[key] = null;
      }
    });

    mergeData(this.data, ele.props);
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
    // Object.assign(this.data, data);

    mergeData(this.data, data);

    this.forceUpdate();
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
