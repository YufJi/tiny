const assign = require('object-assign');
const fs = require('fs-extra');
const path = require('path');
const webpack = require('webpack');
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
    importScripts,  /* 需要注入的外链 */
    injectScript,   /* 需要注入的脚本 */
    mergeSubPackages,
    injectScriptForNative,
    indexPage = 'index.html',
    src,  /* 小程序目录 */
    out,  /* 转译输出目录 */
    injectScriptAfterWorkerImportScripts,
    runtimeConfig = {},
    pluginInjection,
    css2,
    baseDir,
    native = false, /* 是否需要生成RN */
  } = config;

  const transformConfig = config;

  if (typeof transformConfig.showFileNameInError === 'undefined') {
    transformConfig.showFileNameInError = true;
  }

  /* 同步创建输出目录 */
  if (out) {
    fs.mkdirsSync(out);
  }

  const { contextPath } = runtimeConfig;

  /* 生成app.json */
  const appJson = generateAppJson({
    src,
    out,
    mergeSubPackages,
    css2
  });

  /* 生成入口文件 index.web 和 index.worker */
  generateEntries({
    css2,
    runtimeConfig,
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
  });

  /* 生成appConfigJson */
  generateAppConfigJson({
    appJson,
    out,
    indexPage,
    contextPath,
    css2,
    src,
  });

  // todo 这里开始走webpack构建入口文件为index.web 和 index.worker
  transform(assign({}, transformConfig, { cwd: src }));

  // const isDev = true
  // const getConfig = (type) => {
  //   const isWorker = type === 'worker';
  //   const config = assign({}, transformConfig, { cwd: src });

  //   return {
  //     entry: isWorker ? {
  //       'index.worker': path.join(out, 'index$.worker.js'),
  //     } : {
  //       'index.web': path.join(out, 'index$.web.js'),
  //     },
  //     resolve: {
  //       extensions: isWorker ? ['.worker.js', '.js', '.json'] : ['.web.js', '.js', '.json']
  //     },
  //     output: {
  //       path: path.join(out),
  //     },
  //     mode: isDev ? 'development' : 'production',
  //     devtool: false,
  //     module: {
  //       rules: [{
  //         test: /\.(j|t)s$/,
  //         use:[{
  //           loader: path.resolve(__dirname, 'loaders/js-loader'),
  //           options: {
  //             isWorker,
  //             cwd: src,
  //             transformConfig: config,
  //           }
  //         }]
  //       }, {
  //         test: new RegExp(`\.${transformConfig.styleExtname}$`),
  //         use:[{
  //           loader: path.resolve(__dirname, 'loaders/css-loader'),
  //           options: {
  //             cwd: src,
  //             transformConfig: assign(
  //               {
  //                 injectStyle: true,
  //               },
  //               config,
  //             ),
  //           }
  //         }]
  //       }, {
  //         test: new RegExp(`\.${transformConfig.templateExtname}$`),
  //         use:[{
  //             loader: require.resolve('babel-loader'),
  //             options: {
  //               presets: [
  //                 [require.resolve("babel-preset-env"), {

  //                 }],
  //                 [require.resolve("babel-preset-react")],
  //               ],
  //               plugins: [
  //                 [require.resolve('babel-plugin-transform-object-rest-spread'), { "useBuiltIns": true }],
  //               ]
  //             }
  //           }, {
  //           loader: path.resolve(__dirname, 'loaders/template-loader'),
  //           options: {
  //             cwd: src,
  //             transformConfig: config,
  //           }
  //         }]
  //       }, {
  //         test: /\.sjs$/,
  //         use: [{
  //           loader: path.resolve(__dirname, 'loaders/sjs-loader'),
  //           options: {
  //             cwd: src,
  //           }
  //         }]
  //       }]
  //     },
  //     plugins: [
  //       new webpack.ProgressPlugin()
  //     ],
  //     externals: {
  //       react: 'self.React',
  //       'react-dom': 'self.ReactDOM',
  //       'create-react-class': 'self.createReactClass',
  //     },
  //     stats: 'normal',
  //   }
  // }


  // function getErrorInfo(err, stats) {
  //   if (!stats.stats) {
  //     return {
  //       err: err || (stats.compilation && stats.compilation.errors && stats.compilation.errors[0]),
  //       stats,
  //       rawStats: stats,
  //     };
  //   }
  //   const [curStats] = stats.stats;
  //   return {
  //     err:
  //       err
  //       || (curStats.compilation && curStats.compilation.errors && curStats.compilation.errors[0]),
  //     stats: curStats,
  //     rawStats: stats,
  //   };
  // }

  // function log({ stats }) {
  //   console.log(`${stats.toString({
  //     colors: true,
  //     modules: false,
  //     children: false,
  //     chunks: false,
  //     chunkModules: false,
  //   })}\n\n`);
  // }

  // const compiler = webpack([
  //   getConfig('render'),
  //   getConfig('worker')
  // ]);

  // compiler.run((err, stats) => {
  //   if (err || stats.hasErrors()) {
  //     log(getErrorInfo(err, stats));
  //   }

  //   log(getErrorInfo(err, stats));
  // })
};
