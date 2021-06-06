import Nerv, { hydrate, unmountComponentAtNode } from '@/nerv';
import { debug } from '@/utils/log';
import { noop } from '@/utils/types';
import { publish, subscribe } from '@/bridge';

import PageRegistry from '../PageRegistry';
import { getPageInfoFromUrl } from '../utils/pageInfoAndUrl';
import getMessageChannel from './getMessageChannel';
import { loadPage } from '../SubPackage';

const g = self;

export default function bootstrap(config, bridge) {
  const { container = document.getElementById('__frame__'), onRender = noop, onFail = noop, type } = config;
  const pageInfo = getPageInfoFromUrl(location.href);
  debug('framework', 'pageInfo', pageInfo);
  const { pagePath, id, queryString } = pageInfo;
  if (pagePath) {
    document.documentElement.style.fontSize = `${100 * document.documentElement.clientWidth / 750}px`;

    loadPage(pagePath, () => {
      const PageComponent = PageRegistry.getComponent(pagePath);
      if (PageComponent) {
        debug('framework', `Render page: ${pagePath}`);
        if (onRender) {
          onRender(type);
        }
        const messageChannel = getMessageChannel(pageInfo, bridge);
        subscribe('onInitDataReady', (params) => {
          const { id, publicInstance, customComponents, isRefresh } = params;

          hydrate(<PageComponent
            id={id}
            publicInstance={publicInstance}
            customComponents={customComponents}
            pagePath={pagePath}
            isRefresh={isRefresh}
            container={container}
            messageChannel={messageChannel}
          />, container);
        });

        publish('DOMContentLoaded', {
          pagePath,
          id,
          queryString,
        }, WEBVIEWID);
      } else {
        const error = new Error(`page '${pagePath}' not found!`);
        error.type = 'PAGE_NOT_FOUND';
        if (onFail) {
          onFail(error);
        }
      }
    });
  } else {
    unmountComponentAtNode(container);
  }
}
