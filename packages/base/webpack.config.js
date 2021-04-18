const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

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
      path: path.join(__dirname, '../devtool/assets/base'),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src/'),
        'components': path.resolve(__dirname, '../components/src'),
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
        },
        {
          test: /\.less$/,
          use: [
            MiniCssExtractPlugin.loader,
            'css-loader',
            {
                loader: 'postcss-loader',
                options: {
                  plugins: () => [
                    require('autoprefixer')(),
                  ]
                }
            }, {
                loader: 'less-loader',
                options: {
                  javascriptEnabled: true,
                }
            }
          ]
        }
      ]
    },

    devtool: 'cheap-module-source-map',

    optimization: {
      minimize: !isDev,
    },  

    plugins: [
      new MiniCssExtractPlugin({
        filename: 'mp.css'
      }),
    ]
  }
}

module.exports = [
  getConfig('index'), 
  getConfig('worker')
]