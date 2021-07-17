/*
 * @Author: YufJ
 * @Date: 2021-07-12 19:30:32
 * @LastEditTime: 2021-07-13 15:09:45
 * @Description:
 * @FilePath: /yeact/src/full-component.js
 */
import { VType } from './shared';
import { isUndefined, isArray } from './utils';
import {
  mountComponent,
  reRenderComponent,
  unmountComponent,
  getContextByContextType,
} from './lifecycle';
import options from './options';

export default class ComponentWrapper {
  constructor(type, props) {
    this.vtype = VType.Composite;
    this.type = type;
    this.name = type.name;

    if (isUndefined(this.name)) {
      const names = type.toString().match(/^function\s*([^\s(]+)/);
      this.name = isArray(names) ? names[0] : 'Component';
    }

    type.displayName = this.name;
    this._owner = props.owner;
    delete props.owner;

    if ((this.ref = props.ref)) {
      delete props.ref;
    }

    if (type._forwarded) {
      if (!isUndefined(this.ref)) {
        props.ref = this.ref;
      }
      delete this.ref;
    }
    this.props = props;
    this.key = props.key || null;
    this.dom = null;
    options.afterCreate(this);
  }

  init(parentContext, parentComponent) {
    options.beforeMount(this);
    const dom = mountComponent(this, parentContext, parentComponent);
    options.afterMount(this);
    return dom;
  }

  update(previous, current, parentContext, domNode) {
    this.context = getContextByContextType(this, parentContext);
    options.beforeUpdate(this);
    const dom = reRenderComponent(previous, this);
    options.afterUpdate(this);
    return dom;
  }

  destroy() {
    options.beforeUnmount(this);
    unmountComponent(this);
  }
}
