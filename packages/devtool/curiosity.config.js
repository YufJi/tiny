const path = require('path');

module.exports = (env) => {
  const publicPath = '/';

  return {
    entry: path.join(__dirname, 'src/main.js'),
    html: {
      index: {
        filename: 'index.html',
        title: '小程序浏览器调试',
        template: path.join(__dirname, 'host.html'),
      },
    },
    outputPath: path.join(__dirname, 'dist'),
    publicPath,
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
    urlLoaderIncludes: [
      /\.svg$/,
    ],
    webpack(config) {
      config.stats = 'minimal';
    },
    devServer: {
      port: 8080,
      static: [
        path.join(__dirname, 'public'),
        path.join(__dirname, 'static'),
      ],
    },
    analyzer: false,
    define: {

    },
    disableCompress: false,
    stats: 'minimal',
  };
};
