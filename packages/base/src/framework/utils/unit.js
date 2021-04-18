
import Platform from '../Platform';

const isIOS = Platform.browser === 'ios';
const { clientWidth } = document.documentElement;
export function rpx(v) {
  let value = rpx2px(v);
  if (value > 0 && value < 1) {
    value = isIOS ? 0.5 : 1;
  } else {
    value = Math.floor(value);
  }
  return `${value}px`;
}
export function rpx2px(v) {
  return v / 750 * clientWidth;
}
export function px(v) {
  return `${v}px`;
}
