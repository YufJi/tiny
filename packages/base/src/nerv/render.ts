import { VirtualNode, isComposite } from '@/nerv/shared';
import { mountVNode, flushMount } from './lifecycle';
import { patch } from './vdom/patch';
import options from './options';
import { mountElement } from './vdom/create-element';

export function render(
  vnode: VirtualNode,
  container: Element,
  callback?: Function,
) {
  if (!container) {
    throw new Error(`${container} should be a DOM Element`);
  }
  const lastVnode = (container as any)._component;
  let dom;
  options.roots.push(vnode);

  if (typeof lastVnode !== 'undefined') {
    options.roots = options.roots.filter((item) => item !== lastVnode);
    dom = patch(lastVnode, vnode, container, {});
  } else {
    dom = mountVNode(vnode, {});
    mountElement(dom, container);
  }

  if (container) {
    (container as any)._component = vnode;
  }
  flushMount();
  if (callback) {
    callback();
  }

  return isComposite(vnode) ? vnode.component : dom;
}
