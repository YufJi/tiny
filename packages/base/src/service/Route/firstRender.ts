import { isPlainObject, mapValues, groupBy } from 'lodash';
import { CustomEvent } from 'shared';
import { publish } from '../bridge';
import context, { componentBookmarks } from '../context';
import { warn } from '../utils';

const DEFAULT_ON_REACH_BOTTOM_DISTANCE = 50;
// 缓存页面使用的自定义组件配置
const pageComponentSettings = new Map();
// 缓存自定义组件配置
const componentSettings = new Map();

export default function firstRender(currentPage, isPageReload = false) {
  const ext = getPageExt(currentPage);
  ext.isPageReload = isPageReload;

  // 发送到webview
  const data = {
    data: currentPage.implement.data,
    ext,
    options: {
      firstRender: true,
      timestamp: Date.now(),
      path: currentPage.route,
    },
  };

  publish(CustomEvent.InitDataReady, data, [currentPage.webviewId]);
}

function getPageExt(currentPage) {
  const pageConfig = getConfig(currentPage.route);
  let onReachBottomDistance = DEFAULT_ON_REACH_BOTTOM_DISTANCE;
  let disableSwipeBack = false;

  if (pageConfig) {
    const distance = Number(pageConfig.onReachBottomDistance);
    onReachBottomDistance = Number.isNaN(distance) ? DEFAULT_ON_REACH_BOTTOM_DISTANCE : distance;
    disableSwipeBack = Boolean(pageConfig.disableSwipeBack);
  }

  const { customComponents, allComponentsAliasName } = getPageContainComponents(currentPage.route);

  return {
    isPageReload: false,
    webviewId: currentPage.webviewId,
    enablePullUpRefresh: Boolean(currentPage.implement.onReachBottom),
    enablePageScroll: Boolean(currentPage.implement.onPageScroll),
    onReachBottomDistance,
    route: currentPage.route,
    query: currentPage.query,
    openType: currentPage.__params__.openType || '',
    disableSwipeBack,
    customComponents,
    allComponentsAliasName,
    __allConfig__: context.__allConfig__,
    lang: context.lang,
  };
}

function getConfig(route) {
  const config = context.__allConfig__[route];

  if (isPlainObject(config)) {
    return config;
  }
}

function getPageContainComponents(route) {
  const customComponents = {};
  const allComponentsAliasName = new Set();

  if (pageComponentSettings.has(route)) {
    return pageComponentSettings.get(route);
  }

  // 递归获取自定义组件的配置信息
  initComponentSettings(route, customComponents, allComponentsAliasName);

  pageComponentSettings.set(route, {
    customComponents,
    allComponentsAliasName: Array.from(allComponentsAliasName),
  });

  return pageComponentSettings.get(route);
}

function initComponentSettings(route, componentInfoMap, componentAliasSet) {
  const config = getConfig(route);
  const usingComponents = config && config.usingComponents;
  if (!usingComponents) return;

  for (let i = 0; i < Object.entries(usingComponents).length; i+=1) {
    const [key, customPath] = Object.entries(usingComponents)[i];
    const name = key.toLowerCase();
    // const realPath = customPath.startsWith('/') ? customPath.substr(1) : path.join(path.dirname(route), customPath);
    const realPath = customPath as string;

    componentAliasSet.add(name);
    if (!componentInfoMap[realPath]) {
      let setting = componentSettings.get(realPath);

      if (!setting) {
        setting = getComponentSettings(realPath, route);
        componentSettings.set(realPath, setting);
      }

      componentInfoMap[realPath] = setting;
      initComponentSettings(realPath, componentInfoMap, componentAliasSet);
    }
  }
}

function getComponentSettings(is, route) {
  const bookmark = componentBookmarks.get(is);

  if (!bookmark) {
    throw new Error(`Component is not found in path "${is}" using by "${route}"`);
  }

  const componentInit = bookmark.init;
  const properties = mapValues(componentInit.properties, (property) => {
    return {
      type: getTransferType(property.type),
      value: property.value,
    };
  });

  return {
    properties,
    data: componentInit.data,
    relationMap: groupBy(componentInit.relations, 'type'),
    ancestors: Array.from(bookmark.ancestors),
    options: componentInit.options,
    externalClasses: componentInit.externalClasses,
  };
}

function getTransferType(originFunction) {
  if (originFunction === null) return 'null';

  const type = originFunction.name;

  if (['String', 'Number', 'Boolean', 'Object', 'Array'].includes(type)) {
    return type;
  }

  throw new Error(`The type of property is invalid: ${type}`);
}
