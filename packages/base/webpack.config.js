/*
 * @Author: YufJ
 * @Date: 2021-07-07 14:05:04
 * @LastEditTime: 2021-07-12 01:46:08
 * @Description:
 * @FilePath: /tiny-v1/packages/base2.0/webpack.config.js
 */
const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const ProgressBarPlugin = require('progress-bar-webpack-plugin');

const getConfig = (type, env) => {
  const isService = type === 'service';
  const isDev = process.env.NODE_ENV !== 'production';

  return {
    mode: isDev ? 'development' : 'production',
    entry: isService ? {
      service: path.join(__dirname, 'src/service/index.js'),
    } : {
      webview: path.join(__dirname, 'src/webview/index.js'),
    },
    output: {
      path: path.join(__dirname, '../devtool/static/base'),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src/'),
        shared: path.resolve(__dirname, 'src/shared'),
        'js-bridge': path.resolve(__dirname, 'src/js-bridge'),
      },
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
      new ProgressBarPlugin(),
      new MiniCssExtractPlugin({
        filename: 'webview.css',
      }),
    ],

    stats: 'minimal',
  };
};

module.exports = [
  getConfig('webview'),
  getConfig('service'),
];
