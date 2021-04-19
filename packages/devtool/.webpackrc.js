
const path =  require('path')

module.exports = (env) => {
  let publicPath = '/';

  return {
    entry: path.join(__dirname, 'src/main.js'),
    html: {
      index: {
        filename: 'index.html',
        title: 'devtool',
        template: path.join(__dirname, 'template/host.html'),
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
      port: 8000,
      contentBase: [
        path.join(__dirname, 'assets'),
        path.join(__dirname, 'assets/biz'),
      ]
    },
    analyzer: false,
    define: {

    },
    disableCompress: false,
  }
}
