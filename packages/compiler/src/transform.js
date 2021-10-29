const path = require('path');
const fs = require('fs-extra');
const assign = require('object-assign');
const deleteEmpty = require('delete-empty');

const { getAllFiles } = require('./utils');
const jsLoader = require('./loaders/js-loader');
const cssLoader = require('./loaders/css-loader');
const templateLoader = require('./loaders/template-loader');
const sjsLoader = require('./loaders/sjs-loader');

function getSuffixJs(fullPath, suffix) {
  return fullPath.replace(/\.(js|ts)$/, `.${suffix}.$1`);
}

function getSuffixWorkerJs(fullPath) {
  return getSuffixJs(fullPath, 'worker');
}

module.exports = function transform(config) {
  const {
    templateExtname,
    styleExtname,
    src,
    out,
    cwd,
  } = config;

  const transformConfig = config;

  const allowedExtnames = [
    '.js',
    '.ts',
    styleExtname,
    templateExtname,
    '.json',
    '.sjs',
  ];

  const allFiles = getAllFiles(src);

  allFiles.forEach((f) => {
    const fullPath = path.join(src, f);
    const fullOutPath = path.join(out, f);
    /* 创建文件输出路径的上级文件夹 */
    fs.mkdirsSync(path.dirname(fullOutPath));
    const extname = path.extname(f);

    if (f.indexOf('node_modules/') !== -1 && f.endsWith('/package.json')) {
      fs.copySync(fullPath, fullOutPath);
      return;
    }

    if (allowedExtnames.indexOf(extname) === -1) {
      fs.copySync(fullPath, fullOutPath);
      return;
    }

    const source = fs.readFileSync(fullPath, 'utf-8');

    if (extname === '.js' || extname === '.ts') {
      const jsType = jsLoader.call(
        {
          query: {
            isWorker: true,
            cwd,
            transformConfig,
          },
          resourcePath: fullPath,
          callback(error, code) {
            if (error) {
              throw error;
            }
            fs.writeFileSync(getSuffixWorkerJs(fullOutPath), code);
          },
        },
        source,
      );

      if (jsType !== 'normal') {
        jsLoader.call(
          {
            query: {
              isWorker: false,
              cwd,
              transformConfig,
            },
            resourcePath: fullPath,
            callback(error, code) {
              if (error) {
                throw error;
              }
              fs.writeFileSync(fullOutPath, code);
            },
          },
          source,
        );
      } else {
        fs.renameSync(getSuffixWorkerJs(fullOutPath), fullOutPath);
      }
      return;
    }

    if (extname === styleExtname) {
      cssLoader.call(
        {
          query: {
            cwd,
            transformConfig: assign(
              {
                injectStyle: true,
              },
              config,
            ),
          },
          resourcePath: fullPath,
          callback(error, code) {
            if (error) {
              throw error;
            }
            fs.writeFileSync(`${fullOutPath}.js`, code);
          },
        },
        source,
      );

      return;
    }

    if (extname === templateExtname) {
      templateLoader.call(
        {
          query: {
            cwd,
            transformConfig,
          },
          resourcePath: fullPath,
          callback(error, code) {
            if (error) {
              throw error;
            }
            fs.writeFileSync(`${fullOutPath}.js`, code);
          },
        },
        source,
      );

      return;
    }

    if (extname === '.sjs') {
      sjsLoader.call(
        {
          query: {
            cwd,
          },
          resourcePath: fullPath,
          callback(error, code) {
            if (error) {
              throw error;
            }
            fs.writeFileSync(`${fullOutPath}.js`, code);
          },
        },
        source,
      );
      // return;
    }
  });

  deleteEmpty.sync(out);
};
