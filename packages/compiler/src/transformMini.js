const assign = require('object-assign');
const fs = require('fs-extra');
const path = require('path');
const webpack = require('webpack');
const CopyPlugin = require('copy-webpack-plugin');
const signale = require('signale');

const generateEntries = require('./generateEntries');
const generateAppJson = require('./generateAppJson');
const generateAppConfigJson = require('./generateAppConfigJson');
const { safeJsonParse, normalizePathForWin } = require('./utils');
/* 完全转译出文件 */
const transform = require('./transform');

/**
 * 小程序应用转译入口
 * @param {*} config
 */
module.exports = function run(config) {
  const {
    importScripts, /* 需要注入的外链 */
    mergeSubPackages,
    indexPage = 'render.html',
    src, /* 小程序目录 */
    out, /* 转译输出目录 */
    pluginInjection,
    runtimeConfig = {},
  } = config;

  const transformConfig = config;
  const { contextPath } = runtimeConfig;

  /* 临时目录存放编译中间产物 */
  if (typeof transformConfig.temp === 'undefined') {
    transformConfig.temp = path.join(src, '.cache');
  }

  const { temp } = transformConfig;

  /* 清楚临时目录和输出目录 */
  if (fs.existsSync(temp) || fs.existsSync(out)) {
    fs.removeSync(out);
    fs.removeSync(temp);
    signale.success('清空就绪');
  }

  /* 同步创建缓存目录 */
  fs.mkdirsSync(temp);
  signale.success('创建临时目录');

  const projectConfigPath = path.join(src, 'project.config.json');
  let projectConfigJson = {};

  if (fs.existsSync(projectConfigPath)) {
    projectConfigJson = safeJsonParse(projectConfigPath);
    signale.success('读取project.config.json');
  }

  let sourceDir = projectConfigJson.miniprogramRoot ? path.join(src, projectConfigJson.miniprogramRoot) : src;
  sourceDir = normalizePathForWin(sourceDir).replace(/\/$/, '');

  /* 生成app.json */
  const appJson = generateAppJson({
    src: sourceDir,
    mergeSubPackages,
    transformConfig,
  });

  /* 生成入口文件 index.web 和 index.worker */
  generateEntries({
    src: sourceDir,
    appJson,
    importScripts,
    pluginInjection,
    transformConfig,
  });
  signale.success('生成入口文件');

  /* 生成appConfigJson */
  generateAppConfigJson({
    src: sourceDir,
    appJson,
    indexPage,
    contextPath,
    transformConfig,
  });

  // // todo 这里开始走webpack构建入口文件为index.web 和 index.worker
  // transform(assign({}, transformConfig, { cwd: sourceDir }));
  // return;

  const assetExts = ['*.eot', '*.woff', '*.ttf', '*.text', '*.png', '*.jpg', '*.jpeg', '*.gif', '*.bmp', '*.svg', '*.webp'];

  const isDev = true;

  const getConfig = (type) => {
    const isWorker = type === 'worker';
    const config = assign({}, transformConfig, { cwd: sourceDir });

    const templateDir = path.join(__dirname, './templates/web');

    return {
      entry: isWorker ? {
        'index.worker': path.join(temp, 'index$.worker.js'),
      } : {
        'index.web': path.join(temp, 'index$.web.js'),
      },
      resolve: {
        alias: {
          compiler: path.join(__dirname),
        },
        extensions: isWorker ? ['.worker.js', '.js', '.json'] : ['.web.js', '.js', '.json'],
      },
      output: {
        path: path.join(out),
      },
      mode: isDev ? 'development' : 'production',
      devtool: false,
      module: {
        rules: [{
          test: /\.(j|t)s$/,
          use: [{
            loader: path.resolve(__dirname, 'loaders/js-loader'),
            options: {
              isWorker,
              cwd: sourceDir,
              transformConfig: config,
            },
          }],
        }, {
          test: new RegExp(`${transformConfig.styleExtname}$`),
          use: [{
            loader: path.resolve(__dirname, 'loaders/css-loader'),
            options: {
              cwd: sourceDir,
              transformConfig: assign(
                {
                  injectStyle: true,
                },
                config,
              ),
            },
          }],
        }, {
          test: new RegExp(`${transformConfig.templateExtname}$`),
          use: [{
            loader: require.resolve('babel-loader'),
            options: {
              presets: [
                [require.resolve('@babel/preset-env'), {

                }],
                [require.resolve('@babel/preset-react'), {
                  pragma: 'Nerv.createElement', // default pragma is React.createElement (only in classic runtime)
                  throwIfNamespace: false,
                }],
              ],
              plugins: [

              ],
            },
          }, {
            loader: path.resolve(__dirname, 'loaders/template-loader'),
            options: {
              cwd: sourceDir,
              transformConfig: config,
            },
          }],
        }, {
          test: new RegExp(`${transformConfig.sjsExtname}$`),
          use: [{
            loader: path.resolve(__dirname, 'loaders/sjs-loader'),
            options: {
              cwd: sourceDir,
              transformConfig: config,
            },
          }],
        }],
      },
      plugins: [
        // new webpack.ProgressPlugin(),
        !isWorker && new CopyPlugin([
          ...assetExts.map((type) => {
            return {
              from: path.join(sourceDir, `**/${type}`),
              transformPath(targetPath, absolutePath) {
                return absolutePath.replace(sourceDir, '');
              },
            };
          }),
          `${path.join(temp, 'appConfig.json')}`,
          `${path.join(temp, 'tabBar.json')}`,

          // 模板文件
          templateDir,
        ]),
      ].filter(Boolean),
      externals: {
        nerv: 'self.Nerv',
      },
      stats: 'minimal',
    };
  };

  function getErrorInfo(err, stats) {
    if (stats && !stats.stats) {
      return {
        err: err || (stats.compilation && stats.compilation.errors && stats.compilation.errors[0]),
        stats,
        rawStats: stats,
      };
    }
    const [curStats] = stats.stats;
    return {
      err:
        err
        || (curStats.compilation && curStats.compilation.errors && curStats.compilation.errors[0]),
      stats: curStats,
      rawStats: stats,
    };
  }

  function log({ stats }) {
    console.log(`${stats.toString({
      colors: true,
      modules: false,
      children: false,
      chunks: false,
      chunkModules: false,
    })}\n\n`);
  }

  const compiler = webpack([
    getConfig('render'),
    getConfig('worker'),
  ]);

  signale.start('开始构建');
  compiler.run((err, stats) => {
    if (err || stats.hasErrors()) {
      log(getErrorInfo(err, stats));
      return;
    }

    log(getErrorInfo(err, stats));
    signale.complete('构建成功');
  });
};
