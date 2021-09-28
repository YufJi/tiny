import { VType } from '../shared';

export default function createVText(text) {
  return {
    text,
    vtype: VType.Text,
    dom: null,
  };
}
