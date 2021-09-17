/*
 * @Author: YufJ
 * @Date: 2021-07-13 11:40:15
 * @LastEditTime: 2021-07-13 11:45:15
 * @Description:
 * @FilePath: /yeact/src/hydrate.js
 */
// tslint:disable:no-conditional-assignment
import render from './render';

export function hydrate(vnode, container, callback) {
  if (container !== null) {
    // lastChild causes less reflow than firstChild
    let dom = container.lastChild;
    // there should be only a single entry for the root
    while (dom) {
      const next = dom.previousSibling;
      container.removeChild(dom);
      dom = next;
    }
    return render(vnode, container, callback);
  }
}
