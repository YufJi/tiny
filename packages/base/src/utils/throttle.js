
import debounce from './debounce';

export default function throttle(func, wait, options) {
  let leading = true;
  let trailing = true;
  if (options) {
    leading = 'leading' in options ? options.leading : leading;
    trailing = 'trailing' in options ? options.trailing : trailing;
  }
  return debounce(func, wait, {
    leading,
    maxWait: wait,
    trailing,
  });
}
