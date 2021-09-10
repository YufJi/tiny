/*
 * @Author: YufJ
 * @Date: 2021-07-05 20:28:59
 * @LastEditTime: 2021-08-13 16:56:01
 * @Description:
 * @FilePath: /tiny-v1/packages/base2.0/src/framework/webview/index.js
 */
import { g } from 'utils';
import * as bridge from './bridge';
import './web-components';

import bootstrap from './bootstrap';
import Nerv from './nerv';
import XMLRuntime from './render-helpers';
import StyleSheet from './StyleSheet';

g.onerror = function onerror(msg = '', url, line, col, error) {
  let stack = [];
  try {
    stack = JSON.stringify(error.stack).split('\\n').splice(0, 3);
  } catch (e) {}

  const args = [msg, url, line, col, error];
  console.error('[RENDER] onerror', args);
};

/* 初始化font-size */
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

g.JSBridge = bridge;
g.Nerv = Nerv;
g.XMLRuntime = XMLRuntime;
g.TinyStyleSheet = StyleSheet;

bootstrap();
