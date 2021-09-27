const path = require('path');
const fs= require('fs');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  entry: path.resolve(__dirname, './src/main'),
  output: {
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/',
  },
  resolve: {
    extensions: ['.js', '.json', '.jsx'],
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        use: [
          'babel-loader',
        ],
      },
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          {
            loader: 'postcss-loader',
            options: {

            },
          },
        ],
      },
      {
        test: /\.less$/,
        exclude: [/\.module\.less$/],
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              modules: false,
            },
          },
          {
            loader: 'postcss-loader',
          },
          {
            loader: 'less-loader',
            options: {

            },
          },
        ],
      },
      {
        test: /\.module\.less$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              modules: true,
            },
          },
          {
            loader: 'postcss-loader',
            options: {

            },
          },
          {
            loader: 'less-loader',
            options: {

            },
          },
        ],
      },
      {
        test: /\.(png|jpe?g|gif|ttf)$/i,
        use: [
          'url-loader',
        ],
      },
    ],
  },
  plugins: [
    new MiniCssExtractPlugin(),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      title: '小程序浏览器调试',
      template: path.join(__dirname, 'host.html'),
    }),
  ],
  devServer: {
    port: 8080,
    static: [
      path.join(__dirname, 'public'),
      path.join(__dirname, 'static'),
    ],
  },
  stats: 'minimal',
};
