import ReactDOM from 'react-dom';
import React from 'react';
import { debug } from '@/utils/log';
import AppRegistry from '../AppRegistry';
import { getPageInfoFromUrl } from '../utils/pageInfoAndUrl';
import getMessageChannel from './getMessageChannel';
import { loadPage } from '../SubPackage';

const g = self;
function noop() {}

export function render(config, bridge) {
  const { container = document.getElementById('root'), onRender = noop, onFail = noop, type } = config;
  const pageInfo = getPageInfoFromUrl(location.href);
  debug('framework', 'pageInfo', pageInfo);
  const { pagePath } = pageInfo;
  if (pagePath) {
    document.documentElement.style.fontSize = `${100 * document.documentElement.clientWidth / 750}px`;

    loadPage(pagePath, () => {
      const PageComponent = AppRegistry.getComponent(pagePath);
      if (PageComponent) {
        console.log('framework: Render page', pagePath);
        if (onRender) {
          onRender(type);
        }
        const messageChannel = getMessageChannel(pageInfo, bridge);
        ReactDOM.render(React.createElement(PageComponent, { pagePath, container, messageChannel }), container);
      } else {
        const error = new Error(`page '${pagePath}' not found!`);
        error.type = 'PAGE_NOT_FOUND';
        if (onFail) {
          onFail(error);
        }
      }
    });
  } else {
    ReactDOM.unmountComponentAtNode(container);
  }
}
