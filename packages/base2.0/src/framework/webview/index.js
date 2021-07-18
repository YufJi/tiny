/*
 * @Author: YufJ
 * @Date: 2021-07-05 20:28:59
 * @LastEditTime: 2021-07-18 21:45:53
 * @Description:
 * @FilePath: /tiny-v1/packages/base2.0/src/framework/webview/index.js
 */
import './web-components';
import bootstrap from './bootstrap';

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

bootstrap();
