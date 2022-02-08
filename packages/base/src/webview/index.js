import { g } from 'shared';
import Omi from 'omi';

import * as bridge from './bridge';
import './web-components';
import helpers from './helpers';
import StyleSheet from './StyleSheet';
import bootstrap from './bootstrap';

g.__IS_SERVICE__ = false;

g.onerror = function onerror(msg = '', url, line, col, error) {
  let stack = [];
  try {
    stack = JSON.stringify(error.stack).split('\\n').splice(0, 3);
  } catch (e) {}

  const args = [msg, url, line, col, error];
  console.error('[webview] onerror', args);
};

g.JSBridge = bridge;

g.JSX = Omi;

g.JSXHelpers = helpers;

g.TinyStyleSheet = StyleSheet;

bootstrap();
