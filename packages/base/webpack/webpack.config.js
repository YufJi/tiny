const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const ProgressBarPlugin = require('progress-bar-webpack-plugin');
const ESBuildPlugin = require('./plugins/esbuild');

const root = path.join(__dirname, '..');
const isDev = process.env.NODE_ENV !== 'production';

module.exports = {
  mode: isDev ? 'development' : 'production',
  entry: {
    webview: path.join(root, 'src/webview/index'),
    service: path.join(root, 'src/service/index'),
  },
  output: {
    path: path.join(root, '../devtool/static/base'),
  },
  resolve: {
    alias: {
      '@': path.resolve(root, 'src'),
      shared: path.resolve(root, 'src/shared'),
      'js-bridge': path.resolve(root, 'src/js-bridge'),
      nerv: path.resolve(root, 'src/webview/nerv'),
      react: path.resolve(root, 'src/webview/nerv'),
      'react-dom': path.resolve(root, 'src/webview/nerv'),
    },
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        use: [
          'swc-loader',
        ],
      },
      {
        test: /\.tsx?$/,
        use: [
          'swc-loader',
          {
            loader: 'ts-loader',
            options: {
              transpileOnly: true,
            },
          },
        ],
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
                require('cssnano')(),
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
    minimizer: [
      new ESBuildPlugin(),
    ],
  },

  plugins: [
    new ProgressBarPlugin(),
    new MiniCssExtractPlugin({
      filename: 'webview.css',
    }),
  ],

  stats: 'minimal',
};
