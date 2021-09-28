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
