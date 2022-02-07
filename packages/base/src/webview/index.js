import Omi from 'omi';
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

g.JSBridge = bridge;
g.Omi = Omi;
g.TemplateHelpers = helpers;
g.TinyStyleSheet = StyleSheet;

bootstrap();
