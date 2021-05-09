const assign = require('object-assign');
const fs = require('fs-extra');
const path = require('path');
const webpack = require('webpack');
const CopyPlugin = require('copy-webpack-plugin');
const generateEntries = require('./generateEntries');
const generateAppJson = require('./generateAppJson');
const generateAppConfigJson = require('./generateAppConfigJson');

/* 完全转译出文件 */
const transform = require('./transform');

/**
 * 小程序应用转译入口
 * @param {*} config
 */
module.exports = function run(config) {
  const {
    importScripts, /* 需要注入的外链 */
    injectScript, /* 需要注入的脚本 */
    mergeSubPackages,
    injectScriptForNative,
    indexPage = 'render.html',
    src, /* 小程序目录 */
    out, /* 转译输出目录 */
    injectScriptAfterWorkerImportScripts,
    pluginInjection,
    baseDir,
    native = false, /* 是否需要生成RN */
    runtimeConfig = {},
  } = config;

  const transformConfig = config;
  const { contextPath } = runtimeConfig;

  if (typeof transformConfig.showFileNameInError === 'undefined') {
    transformConfig.showFileNameInError = true;
  }

  /* 同步创建输出目录 */
  if (out) {
    fs.mkdirsSync(out);
  }

  /* 生成app.json */
  const appJson = generateAppJson({
    src,
    out,
    mergeSubPackages,
    transformConfig,
  });

  /* 生成入口文件 index.web 和 index.worker */
  generateEntries({
    src,
    appJson,
    web: true,
    native,
    out,
    injectScript,
    importScripts,
    injectScriptForNative,
    injectScriptAfterWorkerImportScripts,
    pluginInjection,
    baseDir,
    transformConfig,
  });

  /* 生成appConfigJson */
  generateAppConfigJson({
    appJson,
    out,
    indexPage,
    src,
    contextPath,
  });

  // // todo 这里开始走webpack构建入口文件为index.web 和 index.worker
  // transform(assign({}, transformConfig, { cwd: src }));
  // return;

  const assetTypes = ['*.eot', '*.woff', '*.ttf', '*.text', '*.png', '*.jpg', '*.jpeg', '*.gif', '*.bmp', '*.svg', '*.webp'];
  const isDev = true;
  const getConfig = (type) => {
    const isWorker = type === 'worker';
    const config = assign({}, transformConfig, { cwd: src });

    return {
      entry: isWorker ? {
        'index.worker': path.join(out, 'index$.worker.js'),
      } : {
        'index.web': path.join(out, 'index$.web.js'),
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
              cwd: src,
              transformConfig: config,
            },
          }],
        }, {
          test: new RegExp(`\.${transformConfig.styleExtname}$`),
          use: [{
            loader: path.resolve(__dirname, 'loaders/css-loader'),
            options: {
              cwd: src,
              transformConfig: assign(
                {
                  injectStyle: true,
                },
                config,
              ),
            },
          }],
        }, {
          test: new RegExp(`\.${transformConfig.templateExtname}$`),
          use: [{
            loader: require.resolve('babel-loader'),
            options: {
              presets: [
                [require.resolve('@babel/preset-env'), {

                }],
                [require.resolve('@babel/preset-react'), {
                  pragma: 'Nerv.createElement', // default pragma is React.createElement (only in classic runtime)
                }],
              ],
              plugins: [

              ],
            },
          }, {
            loader: path.resolve(__dirname, 'loaders/template-loader'),
            options: {
              cwd: src,
              transformConfig: config,
            },
          }],
        }, {
          test: /\.sjs$/,
          use: [{
            loader: path.resolve(__dirname, 'loaders/sjs-loader'),
            options: {
              cwd: src,
            },
          }],
        }],
      },
      plugins: [
        new webpack.ProgressPlugin(),
        new CopyPlugin(assetTypes.map((type) => {
          return {
            from: path.join(src, `**/${type}`),
            transformPath(targetPath, absolutePath) {
              return absolutePath.replace(src, '');
            },
          };
        })),
      ],
      externals: {
        nerv: 'self.Nerv',
      },
      stats: 'minimal',
    };
  };

  function getErrorInfo(err, stats) {
    if (!stats.stats) {
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

  compiler.run((err, stats) => {
    if (err || stats.hasErrors()) {
      log(getErrorInfo(err, stats));
    }

    log(getErrorInfo(err, stats));
  });
};
