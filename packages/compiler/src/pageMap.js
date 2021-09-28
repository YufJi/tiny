const path = require('path');
const fs = require('fs');
const resolve = require('resolve');
const assign = require('object-assign');
const getExtApp = require('./getExtApp');
const {
  safeJsonParse,
  normalizePathForWin,
  getAllPagesFromAppJson,
} = require('./utils');
const { miniStore, pluginStore } = require('./configStore');
const { PLUGIN_PREFIX, PLUGIN_PRIVATE_PREFIX } = require('./pluginUtils');

let globalUsingComponents;

const updateUsingComponents = function (
  cwd,
  dirname,
  usingComponents,
  { pluginId = false } = {},
) {
  /* 处理usingComponents路径 */
  Object.keys(usingComponents).forEach((c) => {
    let dPath = usingComponents[c];

    if (dPath.startsWith('./') || dPath.startsWith('../')) {
      dPath = path.join(dirname, dPath).slice(cwd.length);
    } else if (dPath.startsWith(PLUGIN_PREFIX)) {
      // console.log('dPath:', dPath);
    } else if (dPath.startsWith(PLUGIN_PRIVATE_PREFIX)) {
      const domain = dPath.slice(PLUGIN_PRIVATE_PREFIX.length).split('/')[0];
      if (pluginId && domain === pluginId) {
        dPath = dPath.slice(`${PLUGIN_PRIVATE_PREFIX}${domain}`.length);
      } else {
        throw new Error(`can not use schema ${PLUGIN_PRIVATE_PREFIX}`);
      }
    } else if (!dPath.startsWith('/')) {
      const resolvedPath = resolve.sync(dPath, {
        basedir: dirname,
        preserveSymlinks: false,
      });
      if (resolvedPath.startsWith(cwd)) {
        dPath = resolvedPath.slice(cwd.length);
        const extname = path.extname(dPath);
        if (extname) {
          dPath = dPath.slice(0, -extname.length);
        }
      } else {
        throw new Error(
          `Cannot find module '${dPath}' from '${dirname}'`,
        );
      }
    }
    /* 格式化win下路径 */
    usingComponents[c] = normalizePathForWin(dPath);
  });

  /* 存储自定义组件的usingComponents */
  Object.keys(usingComponents).forEach((c) => {
    updateComponentMap(cwd, usingComponents[c], { pluginId });
  });
};

function updateComponentMap(
  cwd,
  cPath,
  { pluginId = false } = {},
) {
  /* 如果是插件不处理 */
  if (cPath.startsWith(PLUGIN_PREFIX) || cPath.startsWith(PLUGIN_PRIVATE_PREFIX)) {
    return;
  }

  const componentMap = pluginId ? pluginStore.componentMap : miniStore.componentMap;
  /* 如果已经存储不处理 */
  if (typeof componentMap[cPath] !== 'undefined') {
    return;
  }
  componentMap[cPath] = false;
  /* 自定义组件配置文件路径 */
  const cFullPath = path.join(cwd, `${cPath}.json`);

  if (fs.existsSync(cFullPath)) {
    const cJson = safeJsonParse(cFullPath);

    if (cJson.component) {
      cJson.usingComponents = assign({}, globalUsingComponents || {}, cJson.usingComponents || {});
      componentMap[cPath] = cJson;

      updateUsingComponents(cwd, path.dirname(cFullPath), cJson.usingComponents, {
        pluginId,
      });
    }
  }
}

function updatePluginPageMap({ cwd, appJson, pluginId }) {
  const pages = appJson.pages || [];
  const pMap = {};
  pluginStore.componentMap = {};
  pages.forEach((page) => {
    const pageJsonPath = path.join(cwd, `${page}.json`);
    if (fs.existsSync(pageJsonPath)) {
      const pageInfo = safeJsonParse(pageJsonPath);
      pMap[page] = pageInfo.usingComponents || {};

      updateUsingComponents(cwd, path.dirname(pageJsonPath), pMap[page], {
        pluginId,
      });
    } else {
      pMap[page] = {};
    }
  });
  pluginStore.pageMap = pMap;
}

function updatePublicComponents({ cwd, appJson, pluginId }) {
  const components = Object.values(appJson.publicComponents || {});
  components.forEach((com) => {
    updateComponentMap(cwd, `/${com}`, { pluginId });
  });
}

exports.updatePlugin = function updatePlugin({ cwd, appJson, pluginId }) {
  updatePluginPageMap({ cwd, appJson, pluginId });
  updatePublicComponents({ cwd, appJson, pluginId });
};

exports.update = function update({ src, mergeSubPackages, variables, transformConfig }) {
  const extApp = getExtApp({ src, mergeSubPackages, variables });

  const { tabBar, usingComponents } = extApp.app;

  const pages = getAllPagesFromAppJson(extApp.app);
  // console.log("update pages", pages);
  /* 存储每个页面的usingComponents */
  const pMap = {};
  /* 存储每个自定义组件的配置 */
  miniStore.componentMap = {};

  // 处理全局自定义组件
  globalUsingComponents = usingComponents;
  updateUsingComponents(src, src, globalUsingComponents || {});

  pages.forEach((page) => {
    if (/^[\.\/]/.test(page)) {
      throw new Error('app.json中pages不应该以 \'/\' 或 \'.\' 开头');
    }

    /* 页面配置文件路径 */
    const pageJsonPath = path.join(src, `${page}.json`);
    if (fs.existsSync(pageJsonPath)) {
      /* 读取页面配置 */
      const pageInfo = safeJsonParse(pageJsonPath);
      if (pageInfo.usingComponents) {
        const cssPath = pageJsonPath.replace(/\.json$/, transformConfig.styleExtname);
        if (!fs.existsSync(cssPath)) {
          fs.writeFileSync(cssPath, '/* required by usingComponents */');
        }
      }

      // 处理页面定义自定义组件
      pMap[page] = assign({}, pageInfo.usingComponents || {});
      updateUsingComponents(src, path.dirname(pageJsonPath), pMap[page]);
      pMap[page] = assign({}, globalUsingComponents || {}, pMap[page] || {});
    } else {
      pMap[page] = {};
    }
  });
  /* 存储 */
  miniStore.pageMap = pMap;

  /* 存储tabBar 此处需修改兼容微信 */
  if (tabBar && tabBar.list) {
    const tMap = {};
    tabBar.list.forEach((item, index) => {
      tMap[item.pagePath] = index;
    });
    miniStore.tabPages = tMap;
  }
};

exports.getPage = function getPage(pagePath, extname, { pluginId = false } = {}) {
  const pMap = pluginId ? pluginStore.pageMap : miniStore.pageMap;

  if (extname) {
    return pMap[pagePath.slice(0, -extname.length)];
  }
  return pMap[pagePath];
};

exports.findTabIndex = function findTabIndex(
  pagePath,
  extname,
  { pluginId = false } = {},
) {
  const tabPages = pluginId ? pluginStore.tabPages : miniStore.tabPages;
  const name = extname ? pagePath.slice(0, -extname.length) : pagePath;
  if (name in tabPages) {
    // framework depends 10
    return tabPages[name] + 10;
  }
  return -1;
};

exports.getComponent = function getComponent(
  f,
  cwd,
  { pluginId = false } = {},
) {
  const componentMap = pluginId ? pluginStore.componentMap : miniStore.componentMap;
  updateComponentMap(cwd, f, { pluginId });

  return componentMap[f];
};

function getComponentDeps(
  usingComponents,
  ret = {},
  list = [],
  { pluginId = false, cur } = {},
) {
  if (usingComponents) {
    Object.keys(usingComponents).forEach((u) => {
      const cPath = usingComponents[u];

      if (!cPath.startsWith(PLUGIN_PREFIX) && !cPath.startsWith(PLUGIN_PRIVATE_PREFIX)) {
        const componentMap = pluginId ? pluginStore.componentMap : miniStore.componentMap;

        if (!componentMap[cPath]) {
          throw new Error(
            `${cur}.json\ncomponent ${u} => ${cPath} 不存在\n或 ${cPath}.json 中没有申明 "component: true" \n或其他异常`,
          );
        }
        let componentUsingComponents;
        try {
          componentUsingComponents = componentMap[cPath].usingComponents;
        } catch (e) {
          throw new Error(
            `${cur}.json\ncomponent ${u} => ${cPath} 不存在\n或 ${cPath}.json 中没有申明 "component: true" \n或其他异常`,
          );
        }
        if (!ret[cPath]) {
          ret[cPath] = 1;
          getComponentDeps(componentUsingComponents, ret, list, {
            pluginId,
            cur: cPath,
          });
          list.push(cPath);
        }
      }
    });
  }
  return list;
}

exports.getPagesComponents = function getPagesComponents(
  pages,
  { pluginId = false } = {},
) {
  const pageMap = pluginId ? pluginStore.pageMap : miniStore.pageMap;

  const ret = {};
  const list = [];
  pages.forEach((p) => {
    getComponentDeps(pageMap[p], ret, list, { pluginId, cur: p });
  });
  return list;
};

exports.getPageComponents = function getPageComponents(
  p,
  { pluginId = false } = {},
) {
  const pageMap = pluginId ? pluginStore.pageMap : miniStore.pageMap;
  const ret = {};
  // childComponent first, parentComponent after
  const list = [];
  getComponentDeps(pageMap[p], ret, list, { pluginId, cur: p });
  return list;
};

exports.getPluginComponents = function getPluginComponents(
  pages,
  publicComponents,
) {
  const { pageMap } = pluginStore;
  const { componentMap } = pluginStore;
  const ret = {};
  const list = [];
  pages.forEach((p) => {
    getComponentDeps(pageMap[p], ret, list, { pluginId: true, cur: p });
  });
  publicComponents.forEach((c) => {
    const is = `/${c}`;
    getComponentDeps(componentMap[is].usingComponents, ret, list, {
      pluginId: true,
      cur: is,
    });
    if (!ret[is]) {
      ret[is] = 1;
      list.push(is);
    }
  });
  return list;
};
