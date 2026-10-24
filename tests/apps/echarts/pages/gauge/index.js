
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
      option: {
        backgroundColor: "#ffffff",
        series: [{
          name: '业务指标',
          type: 'gauge',
          detail: {
            formatter: '{value}%'
          },
          axisLine: {
            show: true
          },
          data: [{
            value: 40,
            name: '完成率',
          }]
    
        }]
      }
    }
  },

  onReady() {
  }
});
