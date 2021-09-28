import { VType } from '../shared';

export function createVoid() {
  return {
    dom: null,
    vtype: VType.Void,
  };
}
