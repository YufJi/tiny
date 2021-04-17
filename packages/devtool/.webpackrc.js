
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
    chainConfig(config) {

    },

    devServer: {
      port: 8000,
    },
    analyzer: false,
    define: {
      APPCONFIG: {
        "window": {
          "defaultTitle": "Todo App",
          "titleBarColor": 3289657
        },
        "pages": [
          "pages/todos/todos",
          "pages/add-todo/add-todo"
        ],
        "launchParams": {
          "pages/todos/todos": {
            "defaultTitle": "Todo App",
            "titleBarColor": 3289657
          },
          "pages/add-todo/add-todo": {
            "defaultTitle": "Todo App",
            "titleBarColor": 3289657
          }
        },
        "prerenderPage": "index.html"
      }
    },
    disableCompress: false,
  }
}
