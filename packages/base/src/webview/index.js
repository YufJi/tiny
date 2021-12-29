import React from 'react';
import { g } from 'shared';

import * as bridge from './bridge';
import './web-components';
import bootstrap from './bootstrap';
import helpers from './helpers';
import StyleSheet from './StyleSheet';

g.__IS_SERVICE__ = false;

g.onerror = function onerror(msg = '', url, line, col, error) {
  let stack = [];
  try {
    stack = JSON.stringify(error.stack).split('\\n').splice(0, 3);
  } catch (e) {}

  const args = [msg, url, line, col, error];
  console.error('[webview] onerror', args);
};

/* 初始化root font-size */
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
g.React = React;
g.TemplateHelpers = helpers;
g.TinyStyleSheet = StyleSheet;

bootstrap();
