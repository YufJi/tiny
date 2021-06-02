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
      },
      extensions: isWorker ? ['.worker.js', '.js', '.ts', '.json'] : ['.web.js', '.js', '.ts', '.json'],
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          use: {
            loader: 'babel-loader',
          },
        },
        {
          test: /\.ts$/,
          use: {
            loader: 'ts-loader',
          },
        },
        {
          test: /\.(less|css)$/,
          use: [
            MiniCssExtractPlugin.loader,
            'css-loader',
            {
              loader: 'postcss-loader',
              options: {
                plugins: () => [
                  require('autoprefixer')(),
                ],
              },
            }, {
              loader: 'less-loader',
              options: {
                javascriptEnabled: true,
              },
            },
          ],
        },
      ],
    },

    devtool: 'cheap-module-source-map',

    optimization: {
      minimize: !isDev,
    },

    plugins: [
      new MiniCssExtractPlugin({
        filename: 'mp.css',
      }),
    ],

    stats: 'normal',
  };
};

module.exports = [
  getConfig('index'),
  getConfig('worker'),
];
