import './polyfill';


import { debug } from '@/utils/log';
import { getAppImpl, getCurrentPagesImpl } from '../App';
import { loadPage } from '../SubPackage';


const g = self;

let started = true;
let queue = [];

function processLoadPage(event) {
  const { pagePath, queryString, id: pageId, viewId } = event.data;
  loadPage(pagePath, () => {
    const appImpl = getAppImpl();
    const page = appImpl.newPage({ pagePath, queryString, pageId });
    page.setViewId(viewId);
    // refresh page
    if (page.$loadTime) {
      page.refresh();
      return;
    }

    const pages = getCurrentPagesImpl();
    // tab a -> tab b quickly change to -> tab a
    // or redirect/reLaunch/navigateTo on App.onLaunch
    if (pages && pages[pages.length - 1] === page) {
      page.load();
    }
  });
}

function processEndpoint(event) {
  const { id: pageId } = event.data;
  const appImpl = getAppImpl();
  const page = appImpl.getPageById(pageId);

  page.onMessage(event);
}

function processMessage(event) {
  const { msgType } = event.data;
    if (msgType === 'DOMContentLoaded') {
      processLoadPage(event)
    }
    if (msgType === 'endpoint') {
      processEndpoint(event)
    }
}

g.send = (event) => {
  debug('framework', '[WORKER] App Received Message:', event.data);
  
  if (started) {
    processMessage(event)
  } else {
    queue.push(event);
  }
}

g.addEventListener('message', g.send)

export function pauseApp() {
  started = false;
}

export default function bootstrap() {
  started = true;
  queue.forEach(processMessage);
  queue = [];
}
