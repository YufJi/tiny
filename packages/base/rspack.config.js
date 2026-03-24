const path = require('path');
const { rspack } = require('@rspack/core');

const root = path.join(__dirname, '..');

const getConfig = (type) => {
  const isService = type === 'service';
  const isDev = process.env.NODE_ENV !== 'production';

  return {
    mode: isDev ? 'development' : 'production',
    entry: isService ? {
      service: path.join(root, 'src/service/index.js'),
    } : {
      webview: path.join(root, 'src/webview/index.js'),
    },
    output: {
      path: path.join(root, '../devtool/static/base'),
    },
    resolve: {
      alias: {
        '@': path.resolve(root, 'src/'),
        shared: path.resolve(root, 'src/shared'),
        'js-bridge': path.resolve(root, 'src/js-bridge'),
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
                },
              },
            },
          ],
        },
        {
          test: /\.tsx?$/,
          use: [
            {
              loader: 'builtin:swc-loader',
              options: {
                jsc: {
                  target: 'es2015',
                  parser: {
                    syntax: 'typescript',
                    tsx: true,
                  },
                },
              },
            },
          ],
        },
        {
          test: /\.(less|css)$/,
          use: [
            rspack.CssExtractRspackPlugin.loader,
            'css-loader',
            {
              loader: 'postcss-loader',
              options: {
                postcssOptions: {
                  plugins: [
                    require('autoprefixer')(),
                    require('cssnano')(),
                  ],
                },
              },
            },
            {
              loader: 'less-loader',
              options: {
                lessOptions: {
                  javascriptEnabled: true,
                },
              },
            },
          ],
          type: 'javascript/auto',
        },
      ],
    },

    devtool: 'cheap-module-source-map',

    optimization: {
      minimize: !isDev,
      minimizer: [
        new rspack.SwcJsMinimizerRspackPlugin(),
        new rspack.LightningCssMinimizerRspackPlugin(),
      ],
    },

    plugins: [
      new rspack.CssExtractRspackPlugin({
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
