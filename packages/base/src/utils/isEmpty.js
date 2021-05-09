import objectKeys from './objectKeys';
import { getType } from './types';

export default function isEmpty(o) {
  const type = getType(o);

  if (type === 'object') {
    return objectKeys(o).length === 0;
  }
  if (type === 'array') {
    return o.length === 0;
  }
  if (type === 'boolean' || type === 'string' || type === 'number') {
    return !o;
  }
  if (type === 'null' || type === 'undefined') {
    return true;
  }

  return false;
}
