/*
 * @Author: YufJ
 * @Date: 2021-07-05 20:29:06
 * @LastEditTime: 2021-07-12 01:49:46
 * @Description:
 * @FilePath: /tiny-v1/packages/base2.0/src/framework/webview/bootstrap.js
 */
import EventEmitter from 'eventemitter3';
import { h, render } from './nerv';
import MicroApp from './MicroApp';

const globalJSCore = self.JSCore;

export default function bootstrap() {
  const root = document.getElementById('tiny-app');
  const fields = createFields(root);

  render(<MicroApp fields={fields} jsCore={globalJSCore} />, root);
}

function createFields(root) {
  return {
    root,
    bridge,
    status: {
      singleCamera: false,
      singleWebView: false,
    },
    emitter: new EventEmitter(),
  };
}

export function initBasicFontSize() {
  document.addEventListener('DOMContentLoaded', () => {
    const width = window.innerWidth;
    const doc = document.documentElement;

    doc.style.fontSize = `${width / 20}px`;

    const size = window.getComputedStyle(doc).fontSize;

    if (doc.style.fontSize !== size) {
      const ratio = parseFloat(doc.style.fontSize) / parseFloat(size);
      doc.style.fontSize = `${(ratio * width) / 20}px`;
    }
  });
}
