const path = require('path');
const { rspack } = require('@rspack/core');
const HtmlRspackPlugin = require('html-rspack-plugin');

const root = path.join(__dirname);
const isDev = process.env.NODE_ENV !== 'production';

module.exports = {
  mode: isDev ? 'development' : 'production',
  entry: {
    nextHost: path.join(root, 'src/next/main.jsx'),
    nextService: path.join(root, 'src/next/runtimeService.js'),
    nextRender: path.join(root, 'src/next/runtimeRender.js'),
  },
  output: {
    path: path.join(root, 'dist'),
    filename: '[name].js',
    publicPath: '/',
    clean: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(root, 'src'),
    },
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        use: [
          {
            loader: 'builtin:swc-loader',
            options: {
              jsc: {
                target: 'es2015',
                parser: {
                  syntax: 'ecmascript',
                  jsx: true,
                },
                transform: {
                  react: {
                    runtime: 'classic',
                    pragma: 'React.createElement',
                    pragmaFrag: 'React.Fragment',
                  },
                },
              },
            },
          },
        ],
      },
    ],
  },
  devtool: isDev ? 'cheap-module-source-map' : false,
  optimization: {
    minimize: !isDev,
    minimizer: [
      new rspack.SwcJsMinimizerRspackPlugin(),
    ],
  },
  plugins: [
    new rspack.CopyRspackPlugin({
      patterns: [
        {
          from: path.join(root, 'static/runtime'),
          to: 'runtime',
          noErrorOnMissing: true,
        },
      ],
    }),
    new HtmlRspackPlugin({
      title: 'Tiny Runtime Debugger',
      template: path.join(root, 'next.html'),
      filename: 'index.html',
      chunks: ['nextHost'],
    }),
    new HtmlRspackPlugin({
      title: 'Tiny service thread',
      template: path.join(root, 'next-service.html'),
      filename: 'next-service.html',
      chunks: ['nextService'],
    }),
    new HtmlRspackPlugin({
      title: 'Tiny render thread',
      template: path.join(root, 'next-render.html'),
      filename: 'next-render.html',
      chunks: ['nextRender'],
    }),
    new rspack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
    }),
  ],
  devServer: isDev ? {
    port: Number(process.env.TINY_DEVTOOL_PORT || 8080),
    static: [
      path.join(root, 'static'),
    ],
    hot: true,
    historyApiFallback: true,
  } : undefined,
  stats: 'normal',
};
