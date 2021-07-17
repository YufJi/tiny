/*
 * @Author: YufJ
 * @Date: 2021-07-12 20:20:45
 * @LastEditTime: 2021-07-12 20:25:30
 * @Description:
 * @FilePath: /yeact/src/render-queue.js
 */
import { nextTick } from './utils';
import { updateComponent } from './lifecycle';

let items = [];

export function enqueueRender(component) {
  // tslint:disable-next-line:no-conditional-assignment
  if (!component._dirty && (component._dirty = true) && items.push(component) === 1) {
    nextTick(rerender);
  }
}

export function rerender(isForce = false) {
  let p;
  const list = items;
  items = [];
  // tslint:disable-next-line:no-conditional-assignment
  while (p = list.pop()) {
    if (p._dirty) {
      updateComponent(p, isForce);
    }
  }
}
