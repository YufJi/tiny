
import { isAndroid, compareUCVersion } from './system';
import callInternalAPI from './callInternalAPI';

const { devicePixelRatio } = window;

export default function focusInput(node, inputFocus4Android, supportNative) {
  if (node) {
    node.focus();
    if (isAndroid) {
      // android系统 input native化后 非页面初次进入时调用inputFocus4Android反而出错
      if (compareUCVersion('2.13') >= 0 || supportNative === true && node.type !== 'password' && inputFocus4Android === false) {
        return null;
      }

      const { right, bottom } = node.getBoundingClientRect();

      callInternalAPI('inputFocus4Android', {
        coordinateX: String(right * devicePixelRatio),
        coordinateY: String(bottom * devicePixelRatio),
      });
    }
  }
}
