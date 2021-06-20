const path = require('path');
const cssSelectParser = require('postcss-selector-parser');
const fs = require('fs');
const resolve = require('resolve');
const loadJsonFile = require('load-json-file');
const crypto = require('crypto');
const defaultLib = require('./defaultLib');
const { miniStore, pluginStore } = require('./configStore');

const numberReSnippet = '(?:NaN|-?(?:(?:\\d+|\\d*\\.\\d+)(?:[E|e][+|-]?\\d+)?|Infinity))';
const matchOnlyNumberRe = new RegExp(`^(${numberReSnippet})$`);

const elementPrefix = 'tiny';
const supportedWebcomponents = [
  'view',
  'button',
  'text',
  'label',
  'form',
  'input',
  'checkbox',
  'checkbox-group',
  'radio',
  'radio-group',
  'icon',
  'image',
  'scroll-view',
  'slider',
  'progress',
  'switch',
  'swiper',
  'swiper-item',
];

function isNumber(str) {
  return !!str.trim().match(matchOnlyNumberRe);
}

function padding(level, str) {
  return new Array(level + 1).join(' ') + str;
}

function relative(from_, to) {
  const p = path.relative(path.dirname(from_), to);
  if (!p.startsWith('./') && !p.startsWith('../')) {
    return `./${p}`;
  }
  return p;
}

function escapeQuote(str_, backQuote, singleQuote) {
  let str = str_;
  if (str) {
    if (singleQuote) {
      str = str.replace(/'/g, "\\'");
    }
    if (backQuote) {
      str = str.replace(/`/g, '\\`');
    }
  }
  return str;
}

function camelCase(name) {
  return name.replace(/-(\w)/g, (w, g) => `${g.toUpperCase()}`);
}

function toComponentName(str) {
  if (supportedWebcomponents.indexOf(str) !== -1) {
    return `${elementPrefix}-${str}`;
  }

  const ret = camelCase(str);
  return ret.charAt(0).toUpperCase() + ret.slice(1);
}

const unSupported = ['tag', 'attribute', 'universal'];

function pluginTransformSelector(n, { pluginId }) {
  if (unSupported.indexOf(n.type) !== -1) {
    throw new Error(`plugin does not support ${n.type} selector!`);
  }
  if (n.type === 'class') {
    return cssSelectParser.className({
      value: `p-${pluginId}-${n.value}`,
    });
  } else if (n.type === 'id') {
    return cssSelectParser.id({
      value: `p-${pluginId}-${n.value}`,
    });
  }
  return n;
}

/**
 * 如果用户输入的选择器中,含有 [wx-]view 的tag, 替换成 .$-view
 * @param selectorString 选择器
 * @return {*}
 */
function selectorTransformer(selectorString, { pluginId }) {
  if (typeof selectorString === 'string') {
    const transformSelector = (selectors) => {
      if (selectors.nodes) {
        selectors.nodes.forEach((selector) => {
          if (selector.nodes) {
            selector.nodes = selector.nodes.map((n) => {
              if (pluginId) {
                return pluginTransformSelector(n, { pluginId });
              }
              if (n.type === 'tag') {
                const tag = n.value;
                return cssSelectParser.tag({
                  value: `${elementPrefix}-${tag}`,
                });
              }
              return n;
            });
          }
        });
      }
    };

    return cssSelectParser(transformSelector).process(selectorString).result;
  }
  return selectorString;
}

function getAllFiles(dir, _now) {
  let ret = [];
  const now = _now || [];
  const files = fs.readdirSync(dir);
  files.forEach((f) => {
    if (f.startsWith('.')) {
      return;
    }
    const fullPath = path.join(dir, f);
    if (fs.statSync(fullPath).isDirectory()) {
      /* 尾递归 */
      ret = ret.concat(getAllFiles(fullPath, now.concat(f)));
      return;
    }

    ret.push(now.concat(f).join('/'));
  });
  return ret;
}

function normalizeColor(v) {
  if (typeof v === 'string' && v.startsWith('#')) {
    let color = v.slice(1);
    if (color.length === 3) {
      const c1 = color.charAt(0);
      const c2 = color.charAt(1);
      const c3 = color.charAt(2);
      color = `${c1}${c1}${c2}${c2}${c3}${c3}`;
    }
    // 16进制转10进制
    return parseInt(color, 16);
  }
  return v;
}

function transformColorConfig(c) {
  const newC = {};
  if (c) {
    Object.keys(c).forEach((k) => {
      if (k in c) {
        const v = c[k];
        if (k.endsWith('Color') || k === 'color') {
          newC[k] = normalizeColor(v);
        } else {
          newC[k] = v;
        }
      }
    });
  }
  return newC;
}

function normalizePathForWin(p) {
  return p.replace(/\\/g, '/');
}

function getProjectPath(fullPath, cwd) {
  return normalizePathForWin(fullPath).replace(
    `${normalizePathForWin(cwd)}/`,
    '',
  );
}

function checkImport(moduleName, suffix, renderPath, projectRoot) {
  let from = moduleName;
  if (!from.endsWith(suffix)) {
    from += suffix;
  }
  if (fs) {
    let fullPath;
    if (from.startsWith('/')) {
      fullPath = path.join(projectRoot, from);
    } else if (from.startsWith('./') || from.startsWith('../')) {
      fullPath = path.join(path.dirname(renderPath), from);
    } else {
      fullPath = resolve.sync(from, { basedir: path.dirname(renderPath) }) || from;
    }
    if (!fullPath.endsWith(suffix)) {
      fullPath += suffix;
    }
    if (!fs.existsSync(fullPath) || !fs.statSync(fullPath).isFile()) {
      throw new Error(`${fullPath.slice(projectRoot.length)} not exists!`);
    }
  }
  return from;
}

/**
 * 读取json文件
 * @param {*} jsonPath
 * @return {Object}
 */
function safeJsonParse(jsonPath) {
  let ret = {};
  try {
    ret = loadJsonFile.sync(jsonPath);
  } catch (err) {
    throw err;
  }

  return ret;
}

function getPagesFromPackage(mPackage) {
  const { root } = mPackage;
  return mPackage.pages.map((p) => `${root}/${p}`);
}

const globals = [
  'globalThis',
  'global',
  'fetch',
  'self',
  'window',
  'document',
  'location',
  'XMLHttpRequest',
];

function getSecurityHeader(globals2 = []) {
  return globals
    .concat(globals2)
    .map((g) => `var ${g} = undefined;`)
    .join('\n');
}

function prefixPath(p) {
  if (p.charAt(0) === '.' || p.charAt(0) === '/') {
    return p;
  }
  return `./${p}`;
}

function isValidFilePath(file) {
  const fileNameBlackListChar = /["'`]/;
  return !fileNameBlackListChar.test(file);
}

function genResourceHash(p, option = {}) {
  const { src, compileType, type, transformConfig } = option;
  if (src && compileType && type) {
    const store = (compileType === 'mini' ? miniStore : pluginStore) || {};
    const map = (type === 'page' ? store.pageMap : store.componentMap) || {};
    const directDependencies = map[p] || {};
    let indirectDependencies = {};
    // 组件样式跟随page, 页面A依赖组件B, 组件B新增依赖组件C时，页面A.acss缓存产物有问题，需要使缓存失效
    if (type === 'page') {
      // eslint-disable-next-line global-require
      indirectDependencies = require('./pageMap').getPagesComponents([p], {
        pluginId: compileType === 'plugin',
      });
    }
    let filePath = path.join(src, p);
    const extname = path.extname(filePath);
    if (extname) {
      filePath = filePath.slice(0, -extname.length);
    }

    const cssFilePath = `${filePath}${transformConfig.styleExtname}`;
    return crypto
      .createHash('sha1')
      .update(
        JSON.stringify({
          dependencies: {
            directDependencies,
            indirectDependencies,
          },
          cssExist: fs.existsSync(cssFilePath),
        }),
      )
      .digest('hex');
  }
  return '';
}

function getImport(p, baseDir, option) {
  if (!isValidFilePath(p)) {
    throw new Error(`illegal file path ${p}`);
  }

  const hash = genResourceHash(p, option);
  return `require('${prefixPath(normalizePathForWin(path.join(baseDir, p)))}${
    hash ? `?hash=${hash}` : ''
  }');`;
}

function getImports(imports = [], baseDir, option) {
  return imports.map((p) => getImport(p, baseDir, option));
}

module.exports = {
  getSecurityHeader,
  cleanPageJson(json) {
    const ret = { ...json };
    delete ret.usingComponents;
    return ret;
  },
  getAllPagesFromAppJson(app) {
    let { pages } = app;
    pages = pages.concat();
    if (app.subPackages) {
      app.subPackages.forEach((mPackage) => {
        const subPages = getPagesFromPackage(mPackage);
        if (subPages && subPages.length) {
          pages = pages.concat(subPages);
        }
      });
    }
    return pages;
  },
  cleanSubPackagesJson(arr) {
    arr.forEach((a) => {
      if (a.root.startsWith('/')) {
        a.root = a.root.slice(1);
      }
      if (a.root.endsWith('/')) {
        a.root = a.root.slice(0, -1);
      }
    });
  },
  escapeQuote,
  getPagesFromPackage,
  safeJsonParse,
  checkImport,
  getProjectPath,
  getAllFiles,
  normalizePathForWin,
  transformColorConfig,
  camelCase,
  relative,
  toComponentName,
  padding,
  isNumber,
  normalizeColor,
  endsWith(str, suffix) {
    return str.slice(-suffix.length) === suffix;
  },
  selectorTransformer,
  getImports,
  getImport,
  isValidFilePath,
  supportedWebcomponents,
};
