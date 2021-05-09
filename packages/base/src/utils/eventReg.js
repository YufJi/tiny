import { noop } from './types';

export function getPropsEventName(name, isCatch = false, capture = false) {
  let str = '';

  str += isCatch ? 'catch' : 'bind';

  if (name) {
    str += name;
  }
  if (capture) {
    str = `capture-${str}`;
  }

  return str;
}

export function getPropsEvent(name, isCatch = false, capture = false) {
  let str = '';

  str += isCatch ? 'catch' : 'bind';

  if (name) {
    str += name;
  }
  if (capture) {
    str = `capture-${str}`;
  }

  const handler = this.props[str];

  if (typeof handler === 'function') {
    return handler;
  }
  return noop;
}
