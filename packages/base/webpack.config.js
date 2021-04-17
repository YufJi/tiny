const path = require('path');

const getConfig = (type, env) => {
  const isWorker = type === 'worker';
  const isDev = process.env.NODE_ENV !== 'production';
  
  return {
    mode: isDev ? 'development' : 'production',
    entry: isWorker ? {
      'mp.worker': path.join(__dirname, 'src/index.worker.js'),
    } : {
      mp: path.join(__dirname, 'src/index.js'),
    },
    output: {
      path: path.join(__dirname, '../devtool/public/base'),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src/'),
      },
      extensions: isWorker ? ['.worker.js', '.js', '.json'] : ['.web.js', '.js', '.json'],
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          use: {
            loader: 'babel-loader',
          }
        }
      ]
    },

    devtool: 'cheap-module-source-map',

    optimization: {
      minimize: !isDev,
    },  
  }
}

module.exports = [
  getConfig('index'), 
  getConfig('worker')
]