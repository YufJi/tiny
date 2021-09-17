/*
 * @Author: YufJ
 * @Date: 2021-07-12 11:17:17
 * @LastEditTime: 2021-08-16 12:22:33
 * @Description:
 * @FilePath: /tiny-v1/packages/base2.0/src/framework/webview/nerv/render.js
 */
import { mountVNode, flushMount } from './lifecycle';
import { patch } from './vdom/patch';
import { mountElement } from './vdom/create-element';
import { throwError } from './utils';
import options from './options';
import { isComposite } from './shared';

export default function render(vnode, container, callback) {
  if (!container) {
    throwError(`${container} should be a DOM Element`);
  }

  const lastVnode = container._component;

  let dom;

  options.roots.push(vnode);

  if (typeof lastVnode !== 'undefined') {
    options.roots = options.roots.filter((item) => item !== lastVnode);
    dom = patch(lastVnode, vnode, container, {});
  } else {
    dom = mountVNode(vnode, {});
    mountElement(dom, container);
  }

  flushMount();

  if (typeof callback === 'function') {
    callback();
  }

  return isComposite(vnode) ? vnode.component : dom;
}
