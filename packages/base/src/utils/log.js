
import { isDebug, isDebugSupported } from './isDebug';

function internalLog(args) {
  console.log.apply(console, args);
}

export default function log(...args) {
  if (isDebug()) {
    internalLog(args);
  }
}

export function debug(type, ...rest) {
  if (isDebugSupported(type)) {
    internalLog([`[${type}]`].concat(rest));
  }
}
