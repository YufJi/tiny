const path = require('path');

const testSuit = {
  name: 'suit40',
  compilerConfig: {
    cmd: ['-d', '-cc', '0', '-gn', '$gwx'],
    'FILESBASE': path.join(__dirname, './proj'),
    outputDir: path.join(__dirname, './out'),
    'FILES': [
      './index/index.wxml'
    ]
  },
  units: [{
    name: './index/index.wxml',
    renderPath: './index/index.wxml',
    renderData: function () {
      let env = {"array":["美国","中国","巴西","日本"],"objectArray":[{"id":0,"name":"美国"},{"id":1,"name":"中国"},{"id":2,"name":"巴西"},{"id":3,"name":"日本"}],"index":0,"multiArray":[["无脊柱动物","脊柱动物"],["扁性动物","线形动物","环节动物","软体动物","节肢动物"],["猪肉绦虫","吸血虫"]],"objectMultiArray":[[{"id":0,"name":"无脊柱动物"},{"id":1,"name":"脊柱动物"}],[{"id":0,"name":"扁性动物"},{"id":1,"name":"线形动物"},{"id":2,"name":"环节动物"},{"id":3,"name":"软体动物"},{"id":3,"name":"节肢动物"}],[{"id":0,"name":"猪肉绦虫"},{"id":1,"name":"吸血虫"}]],"multiIndex":[0,0,0],"date":"2016-09-01","time":"12:01","region":["广东省","广州市","海珠区"],"customItem":"全部"};
      let dd = {};
      let global = {};
      return {
        env: env,
        dd: dd,
        global: global
      };
    },
    global: {}
  },
  {
    name: './index/index.wxml',
    renderPath: './index/index.wxml',
    renderData: function () {
      let env = {"array":["美国","中国","巴西","日本"],"objectArray":[{"id":0,"name":"美国"},{"id":1,"name":"中国"},{"id":2,"name":"巴西"},{"id":3,"name":"日本"}],"index":"3","multiArray":[["无脊柱动物","脊柱动物"],["扁性动物","线形动物","环节动物","软体动物","节肢动物"],["猪肉绦虫","吸血虫"]],"objectMultiArray":[[{"id":0,"name":"无脊柱动物"},{"id":1,"name":"脊柱动物"}],[{"id":0,"name":"扁性动物"},{"id":1,"name":"线形动物"},{"id":2,"name":"环节动物"},{"id":3,"name":"软体动物"},{"id":3,"name":"节肢动物"}],[{"id":0,"name":"猪肉绦虫"},{"id":1,"name":"吸血虫"}]],"multiIndex":[0,0,0],"date":"2016-12-01","time":"12:05","region":{"__value__":["广东省","汕头市","濠江区"],"__wxspec__":true},"customItem":"全部"};
      let dd = {};
      let global = {};
      return {
        env: env,
        dd: dd,
        global: global
      };
    },
    global: {}
  }
]
};

module.exports = testSuit;