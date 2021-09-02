
const path =  require('path')

module.exports = (env) => {
  let publicPath = '/';

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
      /\.svg$/
    ],
    chainConfig(config) {

    },
    devServer: {
      port: 8080,
      contentBase: [
        path.join(__dirname, 'static'),
      ]
    },
    analyzer: false,
    define: {

    },
    disableCompress: false,
  }
}
