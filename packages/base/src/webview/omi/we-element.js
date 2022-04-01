import { camelCase, hasIn, isEqual, kebabCase } from 'lodash';
import { getType, ValidateStrategy } from './util';
import { patch } from './vdom/patch';
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
    this.elementId = ++id;
    this.computed = {};
    this.isInstalled = false;
  }

  connectedCallback() {
    this.bindStoreAndProvide();

    this.propsToData();

    const shadowRoot = this.initShadowRoot();

    this.insertCss(shadowRoot);

    options.afterInstall && options.afterInstall(this);

    const vnode = this.render(this.props, this.store); // props.children存在

    patch(vnode, shadowRoot, this);

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

  initShadowRoot() {
    let shadowRoot;
    if (this.constructor.isLightDom) {
      shadowRoot = this;
    } else if (!this.shadowRoot) {
      shadowRoot = this.attachShadow({
        mode: 'open',
      });
    } else {
      shadowRoot = this.shadowRoot;

      /* 清空子节点 */
      let firstChild;
      while ((firstChild = shadowRoot.firstChild)) {
        shadowRoot.removeChild(firstChild);
      }
    }

    return shadowRoot;
  }

  update(ignoreAttrs) {
    this._willUpdate = true;

    this.propsToData(ignoreAttrs);

    const vnode = this.render(this.props, this.store);

    patch(
      vnode,
      this.constructor.isLightDom ? this : this.shadowRoot,
      this,
    );

    this._willUpdate = false;
  }

  forceUpdate() {
    this.update(true);
  }

  removeAttribute(key) {
    super.removeAttribute(key);
    // Avoid executing removeAttribute methods before connectedCallback
    this.isInstalled && this.update();
  }

  pureRemoveAttribute(key) {
    super.removeAttribute(key);
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

  pureSetAttribute(key, val) {
    super.setAttribute(key, val);
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
        throw new Error('The provide prop was not found on the parent node or the provide type is incorrect.');
      }
    }
  }

  propsToData(ignoreAttrs) {
    if (ignoreAttrs) return;

    const ele = this;

    const { properties } = this.constructor;

    if (!properties) return;

    ele.prevProps = ele.prevProps || {};

    const changedData = {};
    // 遍历properties
    Object.keys(properties).forEach((key) => {
      // 拿到类型
      const { type } = properties[key];

      const val = ele.props[key] || ele.props[kebabCase(key)];
      const prevVal = ele.prevProps[key] || ele.prevProps[kebabCase(key)];

      if (!isEqual(val, prevVal)) {
        changedData[camelCase(key)] = this.normalizeValue(type, val);
      }

      ele.prevProps[key] = val;
    });

    mergeData(this.data, changedData);
  }

  setData(data) {
    mergeData(this.data, data);
    // 组件内部更新，不需要同步props
    this.forceUpdate();
  }

  normalizeProps(props, properties) {
    const data = {};
    for (let i = 0; i < Object.entries(properties).length; i+=1) {
      const [key, value] = Object.entries(properties)[i];

      if (hasIn(props, kebabCase(key))) {
        data[camelCase(key)] = this.normalizeValue(value.type, props[kebabCase(key)]);
      }
    }

    return data;
  }

  normalizeValue(type, value) {
    return getType(value) === type
      ? value
      : ValidateStrategy[type] && ValidateStrategy[type].call(ValidateStrategy, value) || null;
  }

  insertCss(shadowRoot) {
    const { css, isLightDom } = this.constructor;
    if (css) {
      if (typeof css === 'string') {
        if (isLightDom) {
          const headNode = document.getElementsByTagName('head')[0];
          const styleNode = document.createElement('style');

          styleNode.innerHTML = css;
          headNode.appendChild(styleNode);
        } else {
          const styleSheet = new CSSStyleSheet();
          styleSheet.replaceSync(css);
          shadowRoot.adoptedStyleSheets = [styleSheet];
        }
      }
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  attached() {}

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  ready() {}

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  detached() {}

  shouldUpdate() {
    return true;
  }
}
