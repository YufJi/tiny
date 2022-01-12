var option = {
  backgroundColor: "#ffffff",
  series: [{
    label: {
      normal: {
        fontSize: 14
      }
    },
    type: 'pie',
    center: ['50%', '50%'],
    radius: ['20%', '40%'],
    data: [{
      value: 55,
      name: '北京'
    }, {
      value: 20,
      name: '武汉'
    }, {
      value: 10,
      name: '杭州'
    }, {
      value: 20,
      name: '广州'
    }, {
      value: 38,
      name: '上海'
    }]
  }]
};

Page({
  onShareAppMessage: function (res) {
    return {
      title: 'ECharts 可以在微信小程序中使用啦！',
      path: '/pages/index/index',
      success: function () { },
      fail: function () { }
    }
  },
  data: {
    ec: {
      option
    }
  },

  onReady() {
  }
});
