import objectKeys from '../objectKeys';

let v;

export function setValue(o) {
  if (objectKeys(o).length) {
    v = o;
  }
}
export function getValue() {
  return v;
}

self.__getStartupParams = getValue;
