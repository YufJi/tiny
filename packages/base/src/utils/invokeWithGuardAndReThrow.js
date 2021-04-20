import gerror from './gerror';

const g = self;

export default function invokeWithGuardAndReThrow(fn, context = null, ...args) {
  if (!fn) {
    return;
  }
  try {
    return fn.apply(context, args);
  } catch (e) {
    gerror(e);
  }
}
