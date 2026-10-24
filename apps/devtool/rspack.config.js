const path = require('path');
const { rspack } = require('@rspack/core');
const HtmlRspackPlugin = require('html-rspack-plugin');

const root = path.join(__dirname);
const isDev = process.env.NODE_ENV !== 'production';
// Optional overrides let the website build package the same devtool into an
// isolated directory with only the fixtures it ships.
const outputDir = process.env.TINY_DEVTOOL_OUT_DIR
  ? path.resolve(process.env.TINY_DEVTOOL_OUT_DIR)
  : path.join(root, 'dist');
const runtimeDir = process.env.TINY_DEVTOOL_RUNTIME_ROOT
  ? path.resolve(process.env.TINY_DEVTOOL_RUNTIME_ROOT)
  : path.join(root, 'static/runtime');

module.exports = {
  mode: isDev ? 'development' : 'production',
  entry: {
    nextHost: path.join(root, 'src/next/main.jsx'),
    nextService: path.join(root, 'src/next/runtimeService.js'),
    nextRender: path.join(root, 'src/next/runtimeRender.js'),
  },
  experiments: {
    css: true,
  },
  output: {
    path: outputDir,
    filename: '[name].js',
    // A production build must stay relocatable: the website serves it from
    // /devtool/ (and GitHub Pages adds /<repo>/ in front of that), while the
    // dev server still needs root-absolute URLs for its HMR client.
    publicPath: isDev ? '/' : './',
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
          from: runtimeDir,
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
  stats: 'errors-only',
};
