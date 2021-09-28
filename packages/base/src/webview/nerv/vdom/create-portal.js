import { VType } from '../shared';

export function createPortal(children, container) {
  return {
    type: container,
    vtype: VType.Portal,
    children,
    dom: null,
  };
}
