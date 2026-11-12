const Page = require('../../common/page');
const icons = require('./config');
Page({
  data: {
    icons,
    active: 0,
    demoIcon: 'chat-o',
    demoImage: 'https://b.yzcdn.cn/vant/icon-demo-1126.png',
  },
  methods: {
    onSwitch(event) {
      this.setData({
        active: event.detail.index,
      });
    },
  },
});
