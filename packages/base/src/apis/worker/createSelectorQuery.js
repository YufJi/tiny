
import { getCurrentPageImpl } from '@/core/framework/';

export class SelectorQuery {
  constructor(page) {
    this.actions = [];
    this.page = page;
  }

  select(selector) {
    this.selector = {
      value: selector,
    };
    return this;
  }

  selectAll(selector) {
    this.selector = {
      value: selector,
      type: 'all',
    };
    return this;
  }

  selectViewport() {
    this.selector = {
      value: 'viewport',
    };
    return this;
  }

  boundingClientRect() {
    if (this.selector) {
      this.actions.push({
        selector: this.selector,
        type: 'rect',
      });
      this.selector = null;
    }
    return this;
  }

  scrollOffset() {
    if (this.selector) {
      this.actions.push({
        selector: this.selector,
        type: 'scroll',
      });
      this.selector = null;
    }
    return this;
  }

  exec(callback) {
    const page = this.page || getCurrentPageImpl();
    if (page) {
      page.callRemote('bridge', 'createSelectorQuery', this.actions, callback);
    }
  }
}


export default function createSelectorQuery({ page } = {}) {
  return new SelectorQuery(page);
}
