const path = require('path');

const testSuit = {
  name: 'suit17',
  compilerConfig: {
    cmd: ['-d', '-cc', '0', '-gn', '$gwx'],
    'FILESBASE': path.join(__dirname, './proj'),
    outputDir: path.join(__dirname, './out'),
    'FILES': [
      './pages/index/index.wxml',
      './pages/discovery/discovery.wxml',
      './pages/notify/notify.wxml',
      './pages/chat/chat.wxml',
      './pages/more/more.wxml',
      './pages/answer/answer.wxml',
      './pages/question/question.wxml'
    ]
  },
  units: [{
    name: './pages/index/index.wxml',
    renderPath: './pages/index/index.wxml',
    renderData: function () {
      let env = {"feed":[],"feed_length":0};
      let dd = {};
      let global = {};
      return {
        env: env,
        dd: dd,
        global: global
      };
    },
    global: {},
    silentLog: false
  },
  {
    name: './pages/discovery/discovery.wxml',
    renderPath: './pages/discovery/discovery.wxml',
    renderData: function () {
      let env = {"navTab":["推荐","圆桌","热门","收藏"],"currentNavtab":"0","imgUrls":["../../images/24213.jpg","../../images/24280.jpg","../../images/1444983318907-_DSC1826.jpg"],"indicatorDots":false,"autoplay":true,"interval":5000,"duration":1000,"feed":[],"feed_length":0};
      let dd = {};
      let global = {};
      return {
        env: env,
        dd: dd,
        global: global
      };
    },
    global: {},
    silentLog: false
  },
  {
    name: './pages/notify/notify.wxml',
    renderPath: './pages/notify/notify.wxml',
    renderData: function () {
      let env = {"navTab":["通知","赞与感谢","关注"],"currentNavtab":"0"};
      let dd = {};
      let global = {};
      return {
        env: env,
        dd: dd,
        global: global
      };
    },
    global: {},
    silentLog: false
  },
  {
    name: './pages/chat/chat.wxml',
    renderPath: './pages/chat/chat.wxml',
    renderData: function () {
      let env = {"focus":false,"inputValue":""};
      let dd = {};
      let global = {};
      return {
        env: env,
        dd: dd,
        global: global
      };
    },
    global: {},
    silentLog: false
  },
  {
    name: './pages/more/more.wxml',
    renderPath: './pages/more/more.wxml',
    renderData: function () {
      let env = {"motto":"Hello World","userInfo":{}};
      let dd = {};
      let global = {};
      return {
        env: env,
        dd: dd,
        global: global
      };
    },
    global: {},
    silentLog: false
  },
  {
    name: './pages/answer/answer.wxml',
    renderPath: './pages/answer/answer.wxml',
    renderData: function () {
      let env = {"motto":"知乎--微信小程序版","userInfo":{}};
      let dd = {};
      let global = {};
      return {
        env: env,
        dd: dd,
        global: global
      };
    },
    global: {},
    silentLog: false
  },
  {
    name: './pages/question/question.wxml',
    renderPath: './pages/question/question.wxml',
    renderData: function () {
      let env = {"motto":"知乎--微信小程序版","userInfo":{}};
      let dd = {};
      let global = {};
      return {
        env: env,
        dd: dd,
        global: global
      };
    },
    global: {},
    silentLog: false
  },
  {
    name: './pages/index/index.wxml',
    renderPath: './pages/index/index.wxml',
    renderData: function () {
      let env = {"feed":{"__value__":[{"question_id":1,"answer_id":3,"feed_source_id":23,"feed_source_name":"Rebecca","feed_source_txt":"赞了回答1","feed_source_img":"../../images/icon1.jpeg","question":"选择 Kindle 而不是纸质书的原因是什么？","answer_ctnt":"难道不明白纸质书更贵啊！！！ 若觉得kindle更贵，我觉得要么阅读量太少，那确实没有买kindle的必要。要么买的都是盗版的纸质书？我不清楚不加以评论。。。 另外，用kindle看小说的怎么真心不懂了...","good_num":"112","comment_num":"18"},{"question_id":2,"answer_id":25,"feed_source_id":24,"feed_source_name":"Alex","feed_source_txt":"回答了问题2","feed_source_img":"../../images/icon8.jpg","question":"如何评价周杰伦的「中文歌才是最屌的」的言论？","answer_ctnt":"不知道题主是否是学音乐的。 音乐有公认的经典，也有明显的流行趋势没有错。但归根结底，音乐是一种艺术，艺术是很主观的东西。跟画作一个道理，毕加索是大家，但很多人看不懂他的话，甚至觉得很难看...","good_num":"112","comment_num":"18"},{"question_id":3,"answer_id":61,"feed_source_id":25,"feed_source_name":"George","feed_source_txt":"赞了回答3","feed_source_img":"../../images/icon9.jpeg","question":"气象铁塔的辐射大吗？","answer_ctnt":"我不知道那个铁塔的情况，不过气象铁塔上会有一些测太阳辐射的设备，如果说辐射的话，太阳辐射那么多，大家赶紧躲进地底下呀~~~~~要不然辐射量这么大，会变异的呀~~~~","good_num":"112","comment_num":"18"},{"question_id":4,"answer_id":3,"feed_source_id":23,"feed_source_name":"Rebecca","feed_source_txt":"赞了回答4","feed_source_img":"../../images/icon1.jpeg","question":"选择 Kindle 而不是纸质书的原因是什么？","answer_ctnt":"难道不明白纸质书更贵啊！！！ 若觉得kindle更贵，我觉得要么阅读量太少，那确实没有买kindle的必要。要么买的都是盗版的纸质书？我不清楚不加以评论。。。 另外，用kindle看小说的怎么真心不懂了...","good_num":"112","comment_num":"18"},{"question_id":5,"answer_id":25,"feed_source_id":24,"feed_source_name":"Alex","feed_source_txt":"回答了问题5","feed_source_img":"../../images/icon8.jpg","question":"如何评价周杰伦的「中文歌才是最屌的」的言论？","answer_ctnt":"不知道题主是否是学音乐的。 音乐有公认的经典，也有明显的流行趋势没有错。但归根结底，音乐是一种艺术，艺术是很主观的东西。跟画作一个道理，毕加索是大家，但很多人看不懂他的话，甚至觉得很难看...","good_num":"112","comment_num":"18"},{"question_id":6,"answer_id":61,"feed_source_id":25,"feed_source_name":"George","feed_source_txt":"赞了回答6","feed_source_img":"../../images/icon9.jpeg","question":"气象铁塔的辐射大吗？","answer_ctnt":"我不知道那个铁塔的情况，不过气象铁塔上会有一些测太阳辐射的设备，如果说辐射的话，太阳辐射那么多，大家赶紧躲进地底下呀~~~~~要不然辐射量这么大，会变异的呀~~~~","good_num":"112","comment_num":"18"},{"question_id":7,"answer_id":3,"feed_source_id":23,"feed_source_name":"Rebecca","feed_source_txt":"赞了回答7","feed_source_img":"../../images/icon1.jpeg","question":"选择 Kindle 而不是纸质书的原因是什么？","answer_ctnt":"难道不明白纸质书更贵啊！！！ 若觉得kindle更贵，我觉得要么阅读量太少，那确实没有买kindle的必要。要么买的都是盗版的纸质书？我不清楚不加以评论。。。 另外，用kindle看小说的怎么真心不懂了...","good_num":"112","comment_num":"18"},{"question_id":8,"answer_id":25,"feed_source_id":24,"feed_source_name":"Alex","feed_source_txt":"回答了问题8","feed_source_img":"../../images/icon8.jpg","question":"如何评价周杰伦的「中文歌才是最屌的」的言论？","answer_ctnt":"不知道题主是否是学音乐的。 音乐有公认的经典，也有明显的流行趋势没有错。但归根结底，音乐是一种艺术，艺术是很主观的东西。跟画作一个道理，毕加索是大家，但很多人看不懂他的话，甚至觉得很难看...","good_num":"112","comment_num":"18"}],"__wxspec__":true},"feed_length":{"__value__":8,"__wxspec__":true}};
      let dd = {};
      let global = {};
      return {
        env: env,
        dd: dd,
        global: global
      };
    },
    global: {},
    silentLog: false
  },
  {
    name: './pages/discovery/discovery.wxml',
    renderPath: './pages/discovery/discovery.wxml',
    renderData: function () {
      let env = {"navTab":["推荐","圆桌","热门","收藏"],"currentNavtab":"0","imgUrls":["../../images/24213.jpg","../../images/24280.jpg","../../images/1444983318907-_DSC1826.jpg"],"indicatorDots":false,"autoplay":true,"interval":5000,"duration":1000,"feed":{"__value__":[{"question_id":1,"answer_id":3,"feed_source_id":23,"feed_source_name":"Rebecca1","feed_source_txt":"赞了回答1","feed_source_img":"../../images/icon1.jpeg","question":"选择 Kindle 而不是纸质书的原因是什么？","answer_ctnt":"难道不明白纸质书更贵啊！！！ 若觉得kindle更贵，我觉得要么阅读量太少，那确实没有买kindle的必要。要么买的都是盗版的纸质书？我不清楚不加以评论。。。 另外，用kindle看小说的怎么真心不懂了...","good_num":"112","comment_num":"18"},{"question_id":2,"answer_id":25,"feed_source_id":24,"feed_source_name":"Alex2","feed_source_txt":"回答了问题2","feed_source_img":"../../images/icon8.jpg","question":"如何评价周杰伦的「中文歌才是最屌的」的言论？","answer_ctnt":"不知道题主是否是学音乐的。 音乐有公认的经典，也有明显的流行趋势没有错。但归根结底，音乐是一种艺术，艺术是很主观的东西。跟画作一个道理，毕加索是大家，但很多人看不懂他的话，甚至觉得很难看...","good_num":"112","comment_num":"18"},{"question_id":3,"answer_id":61,"feed_source_id":25,"feed_source_name":"George3","feed_source_txt":"赞了回答3","feed_source_img":"../../images/icon9.jpeg","question":"气象铁塔的辐射大吗？","answer_ctnt":"我不知道那个铁塔的情况，不过气象铁塔上会有一些测太阳辐射的设备，如果说辐射的话，太阳辐射那么多，大家赶紧躲进地底下呀~~~~~要不然辐射量这么大，会变异的呀~~~~","good_num":"112","comment_num":"18"},{"question_id":4,"answer_id":3,"feed_source_id":23,"feed_source_name":"Rebecca4","feed_source_txt":"赞了回答4","feed_source_img":"../../images/icon1.jpeg","question":"选择 Kindle 而不是纸质书的原因是什么？","answer_ctnt":"难道不明白纸质书更贵啊！！！ 若觉得kindle更贵，我觉得要么阅读量太少，那确实没有买kindle的必要。要么买的都是盗版的纸质书？我不清楚不加以评论。。。 另外，用kindle看小说的怎么真心不懂了...","good_num":"112","comment_num":"18"},{"question_id":5,"answer_id":25,"feed_source_id":24,"feed_source_name":"Alex5","feed_source_txt":"回答了问题5","feed_source_img":"../../images/icon8.jpg","question":"如何评价周杰伦的「中文歌才是最屌的」的言论？","answer_ctnt":"不知道题主是否是学音乐的。 音乐有公认的经典，也有明显的流行趋势没有错。但归根结底，音乐是一种艺术，艺术是很主观的东西。跟画作一个道理，毕加索是大家，但很多人看不懂他的话，甚至觉得很难看...","good_num":"112","comment_num":"18"},{"question_id":6,"answer_id":61,"feed_source_id":25,"feed_source_name":"George6","feed_source_txt":"赞了回答6","feed_source_img":"../../images/icon9.jpeg","question":"气象铁塔的辐射大吗？","answer_ctnt":"我不知道那个铁塔的情况，不过气象铁塔上会有一些测太阳辐射的设备，如果说辐射的话，太阳辐射那么多，大家赶紧躲进地底下呀~~~~~要不然辐射量这么大，会变异的呀~~~~","good_num":"112","comment_num":"18"},{"question_id":7,"answer_id":3,"feed_source_id":23,"feed_source_name":"Rebecca7","feed_source_txt":"赞了回答7","feed_source_img":"../../images/icon1.jpeg","question":"选择 Kindle 而不是纸质书的原因是什么？","answer_ctnt":"难道不明白纸质书更贵啊！！！ 若觉得kindle更贵，我觉得要么阅读量太少，那确实没有买kindle的必要。要么买的都是盗版的纸质书？我不清楚不加以评论。。。 另外，用kindle看小说的怎么真心不懂了...","good_num":"112","comment_num":"18"},{"question_id":8,"answer_id":25,"feed_source_id":24,"feed_source_name":"Alex8","feed_source_txt":"回答了问题8","feed_source_img":"../../images/icon8.jpg","question":"如何评价周杰伦的「中文歌才是最屌的」的言论？","answer_ctnt":"不知道题主是否是学音乐的。 音乐有公认的经典，也有明显的流行趋势没有错。但归根结底，音乐是一种艺术，艺术是很主观的东西。跟画作一个道理，毕加索是大家，但很多人看不懂他的话，甚至觉得很难看...","good_num":"112","comment_num":"18"}],"__wxspec__":true},"feed_length":{"__value__":8,"__wxspec__":true}};
      let dd = {};
      let global = {};
      return {
        env: env,
        dd: dd,
        global: global
      };
    },
    global: {},
    silentLog: false
  },
  {
    name: './pages/discovery/discovery.wxml',
    renderPath: './pages/discovery/discovery.wxml',
    renderData: function () {
      let env = {"navTab":["推荐","圆桌","热门","收藏"],"currentNavtab":"0","imgUrls":["../../images/24213.jpg","../../images/24280.jpg","../../images/1444983318907-_DSC1826.jpg"],"indicatorDots":false,"autoplay":true,"interval":5000,"duration":1000,"feed":{"__value__":[{"question_id":1,"answer_id":3,"feed_source_id":23,"feed_source_name":"Rebecca1","feed_source_txt":"赞了回答1","feed_source_img":"../../images/icon1.jpeg","question":"选择 Kindle 而不是纸质书的原因是什么？","answer_ctnt":"难道不明白纸质书更贵啊！！！ 若觉得kindle更贵，我觉得要么阅读量太少，那确实没有买kindle的必要。要么买的都是盗版的纸质书？我不清楚不加以评论。。。 另外，用kindle看小说的怎么真心不懂了...","good_num":"112","comment_num":"18"},{"question_id":2,"answer_id":25,"feed_source_id":24,"feed_source_name":"Alex2","feed_source_txt":"回答了问题2","feed_source_img":"../../images/icon8.jpg","question":"如何评价周杰伦的「中文歌才是最屌的」的言论？","answer_ctnt":"不知道题主是否是学音乐的。 音乐有公认的经典，也有明显的流行趋势没有错。但归根结底，音乐是一种艺术，艺术是很主观的东西。跟画作一个道理，毕加索是大家，但很多人看不懂他的话，甚至觉得很难看...","good_num":"112","comment_num":"18"},{"question_id":3,"answer_id":61,"feed_source_id":25,"feed_source_name":"George3","feed_source_txt":"赞了回答3","feed_source_img":"../../images/icon9.jpeg","question":"气象铁塔的辐射大吗？","answer_ctnt":"我不知道那个铁塔的情况，不过气象铁塔上会有一些测太阳辐射的设备，如果说辐射的话，太阳辐射那么多，大家赶紧躲进地底下呀~~~~~要不然辐射量这么大，会变异的呀~~~~","good_num":"112","comment_num":"18"},{"question_id":4,"answer_id":3,"feed_source_id":23,"feed_source_name":"Rebecca4","feed_source_txt":"赞了回答4","feed_source_img":"../../images/icon1.jpeg","question":"选择 Kindle 而不是纸质书的原因是什么？","answer_ctnt":"难道不明白纸质书更贵啊！！！ 若觉得kindle更贵，我觉得要么阅读量太少，那确实没有买kindle的必要。要么买的都是盗版的纸质书？我不清楚不加以评论。。。 另外，用kindle看小说的怎么真心不懂了...","good_num":"112","comment_num":"18"},{"question_id":5,"answer_id":25,"feed_source_id":24,"feed_source_name":"Alex5","feed_source_txt":"回答了问题5","feed_source_img":"../../images/icon8.jpg","question":"如何评价周杰伦的「中文歌才是最屌的」的言论？","answer_ctnt":"不知道题主是否是学音乐的。 音乐有公认的经典，也有明显的流行趋势没有错。但归根结底，音乐是一种艺术，艺术是很主观的东西。跟画作一个道理，毕加索是大家，但很多人看不懂他的话，甚至觉得很难看...","good_num":"112","comment_num":"18"},{"question_id":6,"answer_id":61,"feed_source_id":25,"feed_source_name":"George6","feed_source_txt":"赞了回答6","feed_source_img":"../../images/icon9.jpeg","question":"气象铁塔的辐射大吗？","answer_ctnt":"我不知道那个铁塔的情况，不过气象铁塔上会有一些测太阳辐射的设备，如果说辐射的话，太阳辐射那么多，大家赶紧躲进地底下呀~~~~~要不然辐射量这么大，会变异的呀~~~~","good_num":"112","comment_num":"18"},{"question_id":7,"answer_id":3,"feed_source_id":23,"feed_source_name":"Rebecca7","feed_source_txt":"赞了回答7","feed_source_img":"../../images/icon1.jpeg","question":"选择 Kindle 而不是纸质书的原因是什么？","answer_ctnt":"难道不明白纸质书更贵啊！！！ 若觉得kindle更贵，我觉得要么阅读量太少，那确实没有买kindle的必要。要么买的都是盗版的纸质书？我不清楚不加以评论。。。 另外，用kindle看小说的怎么真心不懂了...","good_num":"112","comment_num":"18"},{"question_id":8,"answer_id":25,"feed_source_id":24,"feed_source_name":"Alex8","feed_source_txt":"回答了问题8","feed_source_img":"../../images/icon8.jpg","question":"如何评价周杰伦的「中文歌才是最屌的」的言论？","answer_ctnt":"不知道题主是否是学音乐的。 音乐有公认的经典，也有明显的流行趋势没有错。但归根结底，音乐是一种艺术，艺术是很主观的东西。跟画作一个道理，毕加索是大家，但很多人看不懂他的话，甚至觉得很难看...","good_num":"112","comment_num":"18"},{"question_id":9,"answer_id":61,"feed_source_id":25,"feed_source_name":"George9","feed_source_txt":"赞了回答9","feed_source_img":"../../images/icon9.jpeg","question":"气象铁塔的辐射大吗？","answer_ctnt":"我不知道那个铁塔的情况，不过气象铁塔上会有一些测太阳辐射的设备，如果说辐射的话，太阳辐射那么多，大家赶紧躲进地底下呀~~~~~要不然辐射量这么大，会变异的呀~~~~","good_num":"112","comment_num":"18"},{"question_id":10,"answer_id":3,"feed_source_id":23,"feed_source_name":"Rebecca10","feed_source_txt":"赞了回答10","feed_source_img":"../../images/icon1.jpeg","question":"选择 Kindle 而不是纸质书的原因是什么？","answer_ctnt":"难道不明白纸质书更贵啊！！！ 若觉得kindle更贵，我觉得要么阅读量太少，那确实没有买kindle的必要。要么买的都是盗版的纸质书？我不清楚不加以评论。。。 另外，用kindle看小说的怎么真心不懂了...","good_num":"112","comment_num":"18"},{"question_id":11,"answer_id":25,"feed_source_id":24,"feed_source_name":"Alex11","feed_source_txt":"回答了问题11","feed_source_img":"../../images/icon8.jpg","question":"如何评价周杰伦的「中文歌才是最屌的」的言论？","answer_ctnt":"不知道题主是否是学音乐的。 音乐有公认的经典，也有明显的流行趋势没有错。但归根结底，音乐是一种艺术，艺术是很主观的东西。跟画作一个道理，毕加索是大家，但很多人看不懂他的话，甚至觉得很难看...","good_num":"112","comment_num":"18"},{"question_id":12,"answer_id":61,"feed_source_id":25,"feed_source_name":"George12","feed_source_txt":"赞了回答12","feed_source_img":"../../images/icon9.jpeg","question":"气象铁塔的辐射大吗？","answer_ctnt":"我不知道那个铁塔的情况，不过气象铁塔上会有一些测太阳辐射的设备，如果说辐射的话，太阳辐射那么多，大家赶紧躲进地底下呀~~~~~要不然辐射量这么大，会变异的呀~~~~","good_num":"112","comment_num":"18"},{"question_id":13,"answer_id":3,"feed_source_id":23,"feed_source_name":"Rebecca13","feed_source_txt":"赞了回答13","feed_source_img":"../../images/icon1.jpeg","question":"选择 Kindle 而不是纸质书的原因是什么？","answer_ctnt":"难道不明白纸质书更贵啊！！！ 若觉得kindle更贵，我觉得要么阅读量太少，那确实没有买kindle的必要。要么买的都是盗版的纸质书？我不清楚不加以评论。。。 另外，用kindle看小说的怎么真心不懂了...","good_num":"112","comment_num":"18"},{"question_id":14,"answer_id":25,"feed_source_id":24,"feed_source_name":"Alex14","feed_source_txt":"回答了问题14","feed_source_img":"../../images/icon8.jpg","question":"如何评价周杰伦的「中文歌才是最屌的」的言论？","answer_ctnt":"不知道题主是否是学音乐的。 音乐有公认的经典，也有明显的流行趋势没有错。但归根结底，音乐是一种艺术，艺术是很主观的东西。跟画作一个道理，毕加索是大家，但很多人看不懂他的话，甚至觉得很难看...","good_num":"112","comment_num":"18"},{"question_id":15,"answer_id":61,"feed_source_id":25,"feed_source_name":"George15","feed_source_txt":"赞了回答15","feed_source_img":"../../images/icon9.jpeg","question":"气象铁塔的辐射大吗？","answer_ctnt":"我不知道那个铁塔的情况，不过气象铁塔上会有一些测太阳辐射的设备，如果说辐射的话，太阳辐射那么多，大家赶紧躲进地底下呀~~~~~要不然辐射量这么大，会变异的呀~~~~","good_num":"112","comment_num":"18"},{"question_id":16,"answer_id":3,"feed_source_id":23,"feed_source_name":"Rebecca16","feed_source_txt":"赞了回答16","feed_source_img":"../../images/icon1.jpeg","question":"选择 Kindle 而不是纸质书的原因是什么？","answer_ctnt":"难道不明白纸质书更贵啊！！！ 若觉得kindle更贵，我觉得要么阅读量太少，那确实没有买kindle的必要。要么买的都是盗版的纸质书？我不清楚不加以评论。。。 另外，用kindle看小说的怎么真心不懂了...","good_num":"112","comment_num":"18"}],"__wxspec__":true},"feed_length":{"__value__":16,"__wxspec__":true}};
      let dd = {};
      let global = {};
      return {
        env: env,
        dd: dd,
        global: global
      };
    },
    global: {},
    silentLog: false
  },
  {
    name: './pages/discovery/discovery.wxml',
    renderPath: './pages/discovery/discovery.wxml',
    renderData: function () {
      let env = {"navTab":["推荐","圆桌","热门","收藏"],"currentNavtab":"0","imgUrls":["../../images/24213.jpg","../../images/24280.jpg","../../images/1444983318907-_DSC1826.jpg"],"indicatorDots":false,"autoplay":true,"interval":5000,"duration":1000,"feed":{"__value__":[{"question_id":1,"answer_id":3,"feed_source_id":23,"feed_source_name":"Rebecca1","feed_source_txt":"赞了回答1","feed_source_img":"../../images/icon1.jpeg","question":"选择 Kindle 而不是纸质书的原因是什么？","answer_ctnt":"难道不明白纸质书更贵啊！！！ 若觉得kindle更贵，我觉得要么阅读量太少，那确实没有买kindle的必要。要么买的都是盗版的纸质书？我不清楚不加以评论。。。 另外，用kindle看小说的怎么真心不懂了...","good_num":"112","comment_num":"18"},{"question_id":2,"answer_id":25,"feed_source_id":24,"feed_source_name":"Alex2","feed_source_txt":"回答了问题2","feed_source_img":"../../images/icon8.jpg","question":"如何评价周杰伦的「中文歌才是最屌的」的言论？","answer_ctnt":"不知道题主是否是学音乐的。 音乐有公认的经典，也有明显的流行趋势没有错。但归根结底，音乐是一种艺术，艺术是很主观的东西。跟画作一个道理，毕加索是大家，但很多人看不懂他的话，甚至觉得很难看...","good_num":"112","comment_num":"18"},{"question_id":3,"answer_id":61,"feed_source_id":25,"feed_source_name":"George3","feed_source_txt":"赞了回答3","feed_source_img":"../../images/icon9.jpeg","question":"气象铁塔的辐射大吗？","answer_ctnt":"我不知道那个铁塔的情况，不过气象铁塔上会有一些测太阳辐射的设备，如果说辐射的话，太阳辐射那么多，大家赶紧躲进地底下呀~~~~~要不然辐射量这么大，会变异的呀~~~~","good_num":"112","comment_num":"18"},{"question_id":4,"answer_id":3,"feed_source_id":23,"feed_source_name":"Rebecca4","feed_source_txt":"赞了回答4","feed_source_img":"../../images/icon1.jpeg","question":"选择 Kindle 而不是纸质书的原因是什么？","answer_ctnt":"难道不明白纸质书更贵啊！！！ 若觉得kindle更贵，我觉得要么阅读量太少，那确实没有买kindle的必要。要么买的都是盗版的纸质书？我不清楚不加以评论。。。 另外，用kindle看小说的怎么真心不懂了...","good_num":"112","comment_num":"18"},{"question_id":5,"answer_id":25,"feed_source_id":24,"feed_source_name":"Alex5","feed_source_txt":"回答了问题5","feed_source_img":"../../images/icon8.jpg","question":"如何评价周杰伦的「中文歌才是最屌的」的言论？","answer_ctnt":"不知道题主是否是学音乐的。 音乐有公认的经典，也有明显的流行趋势没有错。但归根结底，音乐是一种艺术，艺术是很主观的东西。跟画作一个道理，毕加索是大家，但很多人看不懂他的话，甚至觉得很难看...","good_num":"112","comment_num":"18"},{"question_id":6,"answer_id":61,"feed_source_id":25,"feed_source_name":"George6","feed_source_txt":"赞了回答6","feed_source_img":"../../images/icon9.jpeg","question":"气象铁塔的辐射大吗？","answer_ctnt":"我不知道那个铁塔的情况，不过气象铁塔上会有一些测太阳辐射的设备，如果说辐射的话，太阳辐射那么多，大家赶紧躲进地底下呀~~~~~要不然辐射量这么大，会变异的呀~~~~","good_num":"112","comment_num":"18"},{"question_id":7,"answer_id":3,"feed_source_id":23,"feed_source_name":"Rebecca7","feed_source_txt":"赞了回答7","feed_source_img":"../../images/icon1.jpeg","question":"选择 Kindle 而不是纸质书的原因是什么？","answer_ctnt":"难道不明白纸质书更贵啊！！！ 若觉得kindle更贵，我觉得要么阅读量太少，那确实没有买kindle的必要。要么买的都是盗版的纸质书？我不清楚不加以评论。。。 另外，用kindle看小说的怎么真心不懂了...","good_num":"112","comment_num":"18"},{"question_id":8,"answer_id":25,"feed_source_id":24,"feed_source_name":"Alex8","feed_source_txt":"回答了问题8","feed_source_img":"../../images/icon8.jpg","question":"如何评价周杰伦的「中文歌才是最屌的」的言论？","answer_ctnt":"不知道题主是否是学音乐的。 音乐有公认的经典，也有明显的流行趋势没有错。但归根结底，音乐是一种艺术，艺术是很主观的东西。跟画作一个道理，毕加索是大家，但很多人看不懂他的话，甚至觉得很难看...","good_num":"112","comment_num":"18"}],"__wxspec__":true},"feed_length":{"__value__":8,"__wxspec__":true}};
      let dd = {};
      let global = {};
      return {
        env: env,
        dd: dd,
        global: global
      };
    },
    global: {},
    silentLog: false
  },
  {
    name: './pages/discovery/discovery.wxml',
    renderPath: './pages/discovery/discovery.wxml',
    renderData: function () {
      let env = {"navTab":["推荐","圆桌","热门","收藏"],"currentNavtab":"0","imgUrls":["../../images/24213.jpg","../../images/24280.jpg","../../images/1444983318907-_DSC1826.jpg"],"indicatorDots":false,"autoplay":true,"interval":5000,"duration":1000,"feed":{"__value__":[{"question_id":1,"answer_id":3,"feed_source_id":23,"feed_source_name":"Rebecca1","feed_source_txt":"赞了回答1","feed_source_img":"../../images/icon1.jpeg","question":"选择 Kindle 而不是纸质书的原因是什么？","answer_ctnt":"难道不明白纸质书更贵啊！！！ 若觉得kindle更贵，我觉得要么阅读量太少，那确实没有买kindle的必要。要么买的都是盗版的纸质书？我不清楚不加以评论。。。 另外，用kindle看小说的怎么真心不懂了...","good_num":"112","comment_num":"18"},{"question_id":2,"answer_id":25,"feed_source_id":24,"feed_source_name":"Alex2","feed_source_txt":"回答了问题2","feed_source_img":"../../images/icon8.jpg","question":"如何评价周杰伦的「中文歌才是最屌的」的言论？","answer_ctnt":"不知道题主是否是学音乐的。 音乐有公认的经典，也有明显的流行趋势没有错。但归根结底，音乐是一种艺术，艺术是很主观的东西。跟画作一个道理，毕加索是大家，但很多人看不懂他的话，甚至觉得很难看...","good_num":"112","comment_num":"18"},{"question_id":3,"answer_id":61,"feed_source_id":25,"feed_source_name":"George3","feed_source_txt":"赞了回答3","feed_source_img":"../../images/icon9.jpeg","question":"气象铁塔的辐射大吗？","answer_ctnt":"我不知道那个铁塔的情况，不过气象铁塔上会有一些测太阳辐射的设备，如果说辐射的话，太阳辐射那么多，大家赶紧躲进地底下呀~~~~~要不然辐射量这么大，会变异的呀~~~~","good_num":"112","comment_num":"18"},{"question_id":4,"answer_id":3,"feed_source_id":23,"feed_source_name":"Rebecca4","feed_source_txt":"赞了回答4","feed_source_img":"../../images/icon1.jpeg","question":"选择 Kindle 而不是纸质书的原因是什么？","answer_ctnt":"难道不明白纸质书更贵啊！！！ 若觉得kindle更贵，我觉得要么阅读量太少，那确实没有买kindle的必要。要么买的都是盗版的纸质书？我不清楚不加以评论。。。 另外，用kindle看小说的怎么真心不懂了...","good_num":"112","comment_num":"18"},{"question_id":5,"answer_id":25,"feed_source_id":24,"feed_source_name":"Alex5","feed_source_txt":"回答了问题5","feed_source_img":"../../images/icon8.jpg","question":"如何评价周杰伦的「中文歌才是最屌的」的言论？","answer_ctnt":"不知道题主是否是学音乐的。 音乐有公认的经典，也有明显的流行趋势没有错。但归根结底，音乐是一种艺术，艺术是很主观的东西。跟画作一个道理，毕加索是大家，但很多人看不懂他的话，甚至觉得很难看...","good_num":"112","comment_num":"18"},{"question_id":6,"answer_id":61,"feed_source_id":25,"feed_source_name":"George6","feed_source_txt":"赞了回答6","feed_source_img":"../../images/icon9.jpeg","question":"气象铁塔的辐射大吗？","answer_ctnt":"我不知道那个铁塔的情况，不过气象铁塔上会有一些测太阳辐射的设备，如果说辐射的话，太阳辐射那么多，大家赶紧躲进地底下呀~~~~~要不然辐射量这么大，会变异的呀~~~~","good_num":"112","comment_num":"18"},{"question_id":7,"answer_id":3,"feed_source_id":23,"feed_source_name":"Rebecca7","feed_source_txt":"赞了回答7","feed_source_img":"../../images/icon1.jpeg","question":"选择 Kindle 而不是纸质书的原因是什么？","answer_ctnt":"难道不明白纸质书更贵啊！！！ 若觉得kindle更贵，我觉得要么阅读量太少，那确实没有买kindle的必要。要么买的都是盗版的纸质书？我不清楚不加以评论。。。 另外，用kindle看小说的怎么真心不懂了...","good_num":"112","comment_num":"18"},{"question_id":8,"answer_id":25,"feed_source_id":24,"feed_source_name":"Alex8","feed_source_txt":"回答了问题8","feed_source_img":"../../images/icon8.jpg","question":"如何评价周杰伦的「中文歌才是最屌的」的言论？","answer_ctnt":"不知道题主是否是学音乐的。 音乐有公认的经典，也有明显的流行趋势没有错。但归根结底，音乐是一种艺术，艺术是很主观的东西。跟画作一个道理，毕加索是大家，但很多人看不懂他的话，甚至觉得很难看...","good_num":"112","comment_num":"18"},{"question_id":9,"answer_id":61,"feed_source_id":25,"feed_source_name":"George9","feed_source_txt":"赞了回答9","feed_source_img":"../../images/icon9.jpeg","question":"气象铁塔的辐射大吗？","answer_ctnt":"我不知道那个铁塔的情况，不过气象铁塔上会有一些测太阳辐射的设备，如果说辐射的话，太阳辐射那么多，大家赶紧躲进地底下呀~~~~~要不然辐射量这么大，会变异的呀~~~~","good_num":"112","comment_num":"18"},{"question_id":10,"answer_id":3,"feed_source_id":23,"feed_source_name":"Rebecca10","feed_source_txt":"赞了回答10","feed_source_img":"../../images/icon1.jpeg","question":"选择 Kindle 而不是纸质书的原因是什么？","answer_ctnt":"难道不明白纸质书更贵啊！！！ 若觉得kindle更贵，我觉得要么阅读量太少，那确实没有买kindle的必要。要么买的都是盗版的纸质书？我不清楚不加以评论。。。 另外，用kindle看小说的怎么真心不懂了...","good_num":"112","comment_num":"18"},{"question_id":11,"answer_id":25,"feed_source_id":24,"feed_source_name":"Alex11","feed_source_txt":"回答了问题11","feed_source_img":"../../images/icon8.jpg","question":"如何评价周杰伦的「中文歌才是最屌的」的言论？","answer_ctnt":"不知道题主是否是学音乐的。 音乐有公认的经典，也有明显的流行趋势没有错。但归根结底，音乐是一种艺术，艺术是很主观的东西。跟画作一个道理，毕加索是大家，但很多人看不懂他的话，甚至觉得很难看...","good_num":"112","comment_num":"18"},{"question_id":12,"answer_id":61,"feed_source_id":25,"feed_source_name":"George12","feed_source_txt":"赞了回答12","feed_source_img":"../../images/icon9.jpeg","question":"气象铁塔的辐射大吗？","answer_ctnt":"我不知道那个铁塔的情况，不过气象铁塔上会有一些测太阳辐射的设备，如果说辐射的话，太阳辐射那么多，大家赶紧躲进地底下呀~~~~~要不然辐射量这么大，会变异的呀~~~~","good_num":"112","comment_num":"18"},{"question_id":13,"answer_id":3,"feed_source_id":23,"feed_source_name":"Rebecca13","feed_source_txt":"赞了回答13","feed_source_img":"../../images/icon1.jpeg","question":"选择 Kindle 而不是纸质书的原因是什么？","answer_ctnt":"难道不明白纸质书更贵啊！！！ 若觉得kindle更贵，我觉得要么阅读量太少，那确实没有买kindle的必要。要么买的都是盗版的纸质书？我不清楚不加以评论。。。 另外，用kindle看小说的怎么真心不懂了...","good_num":"112","comment_num":"18"},{"question_id":14,"answer_id":25,"feed_source_id":24,"feed_source_name":"Alex14","feed_source_txt":"回答了问题14","feed_source_img":"../../images/icon8.jpg","question":"如何评价周杰伦的「中文歌才是最屌的」的言论？","answer_ctnt":"不知道题主是否是学音乐的。 音乐有公认的经典，也有明显的流行趋势没有错。但归根结底，音乐是一种艺术，艺术是很主观的东西。跟画作一个道理，毕加索是大家，但很多人看不懂他的话，甚至觉得很难看...","good_num":"112","comment_num":"18"},{"question_id":15,"answer_id":61,"feed_source_id":25,"feed_source_name":"George15","feed_source_txt":"赞了回答15","feed_source_img":"../../images/icon9.jpeg","question":"气象铁塔的辐射大吗？","answer_ctnt":"我不知道那个铁塔的情况，不过气象铁塔上会有一些测太阳辐射的设备，如果说辐射的话，太阳辐射那么多，大家赶紧躲进地底下呀~~~~~要不然辐射量这么大，会变异的呀~~~~","good_num":"112","comment_num":"18"},{"question_id":16,"answer_id":3,"feed_source_id":23,"feed_source_name":"Rebecca16","feed_source_txt":"赞了回答16","feed_source_img":"../../images/icon1.jpeg","question":"选择 Kindle 而不是纸质书的原因是什么？","answer_ctnt":"难道不明白纸质书更贵啊！！！ 若觉得kindle更贵，我觉得要么阅读量太少，那确实没有买kindle的必要。要么买的都是盗版的纸质书？我不清楚不加以评论。。。 另外，用kindle看小说的怎么真心不懂了...","good_num":"112","comment_num":"18"}],"__wxspec__":true},"feed_length":{"__value__":16,"__wxspec__":true}};
      let dd = {};
      let global = {};
      return {
        env: env,
        dd: dd,
        global: global
      };
    },
    global: {},
    silentLog: false
  },
  {
    name: './pages/discovery/discovery.wxml',
    renderPath: './pages/discovery/discovery.wxml',
    renderData: function () {
      let env = {"navTab":["推荐","圆桌","热门","收藏"],"currentNavtab":"0","imgUrls":["../../images/24213.jpg","../../images/24280.jpg","../../images/1444983318907-_DSC1826.jpg"],"indicatorDots":false,"autoplay":true,"interval":5000,"duration":1000,"feed":{"__value__":[{"question_id":1,"answer_id":3,"feed_source_id":23,"feed_source_name":"Rebecca1","feed_source_txt":"赞了回答1","feed_source_img":"../../images/icon1.jpeg","question":"选择 Kindle 而不是纸质书的原因是什么？","answer_ctnt":"难道不明白纸质书更贵啊！！！ 若觉得kindle更贵，我觉得要么阅读量太少，那确实没有买kindle的必要。要么买的都是盗版的纸质书？我不清楚不加以评论。。。 另外，用kindle看小说的怎么真心不懂了...","good_num":"112","comment_num":"18"},{"question_id":2,"answer_id":25,"feed_source_id":24,"feed_source_name":"Alex2","feed_source_txt":"回答了问题2","feed_source_img":"../../images/icon8.jpg","question":"如何评价周杰伦的「中文歌才是最屌的」的言论？","answer_ctnt":"不知道题主是否是学音乐的。 音乐有公认的经典，也有明显的流行趋势没有错。但归根结底，音乐是一种艺术，艺术是很主观的东西。跟画作一个道理，毕加索是大家，但很多人看不懂他的话，甚至觉得很难看...","good_num":"112","comment_num":"18"},{"question_id":3,"answer_id":61,"feed_source_id":25,"feed_source_name":"George3","feed_source_txt":"赞了回答3","feed_source_img":"../../images/icon9.jpeg","question":"气象铁塔的辐射大吗？","answer_ctnt":"我不知道那个铁塔的情况，不过气象铁塔上会有一些测太阳辐射的设备，如果说辐射的话，太阳辐射那么多，大家赶紧躲进地底下呀~~~~~要不然辐射量这么大，会变异的呀~~~~","good_num":"112","comment_num":"18"},{"question_id":4,"answer_id":3,"feed_source_id":23,"feed_source_name":"Rebecca4","feed_source_txt":"赞了回答4","feed_source_img":"../../images/icon1.jpeg","question":"选择 Kindle 而不是纸质书的原因是什么？","answer_ctnt":"难道不明白纸质书更贵啊！！！ 若觉得kindle更贵，我觉得要么阅读量太少，那确实没有买kindle的必要。要么买的都是盗版的纸质书？我不清楚不加以评论。。。 另外，用kindle看小说的怎么真心不懂了...","good_num":"112","comment_num":"18"},{"question_id":5,"answer_id":25,"feed_source_id":24,"feed_source_name":"Alex5","feed_source_txt":"回答了问题5","feed_source_img":"../../images/icon8.jpg","question":"如何评价周杰伦的「中文歌才是最屌的」的言论？","answer_ctnt":"不知道题主是否是学音乐的。 音乐有公认的经典，也有明显的流行趋势没有错。但归根结底，音乐是一种艺术，艺术是很主观的东西。跟画作一个道理，毕加索是大家，但很多人看不懂他的话，甚至觉得很难看...","good_num":"112","comment_num":"18"},{"question_id":6,"answer_id":61,"feed_source_id":25,"feed_source_name":"George6","feed_source_txt":"赞了回答6","feed_source_img":"../../images/icon9.jpeg","question":"气象铁塔的辐射大吗？","answer_ctnt":"我不知道那个铁塔的情况，不过气象铁塔上会有一些测太阳辐射的设备，如果说辐射的话，太阳辐射那么多，大家赶紧躲进地底下呀~~~~~要不然辐射量这么大，会变异的呀~~~~","good_num":"112","comment_num":"18"},{"question_id":7,"answer_id":3,"feed_source_id":23,"feed_source_name":"Rebecca7","feed_source_txt":"赞了回答7","feed_source_img":"../../images/icon1.jpeg","question":"选择 Kindle 而不是纸质书的原因是什么？","answer_ctnt":"难道不明白纸质书更贵啊！！！ 若觉得kindle更贵，我觉得要么阅读量太少，那确实没有买kindle的必要。要么买的都是盗版的纸质书？我不清楚不加以评论。。。 另外，用kindle看小说的怎么真心不懂了...","good_num":"112","comment_num":"18"},{"question_id":8,"answer_id":25,"feed_source_id":24,"feed_source_name":"Alex8","feed_source_txt":"回答了问题8","feed_source_img":"../../images/icon8.jpg","question":"如何评价周杰伦的「中文歌才是最屌的」的言论？","answer_ctnt":"不知道题主是否是学音乐的。 音乐有公认的经典，也有明显的流行趋势没有错。但归根结底，音乐是一种艺术，艺术是很主观的东西。跟画作一个道理，毕加索是大家，但很多人看不懂他的话，甚至觉得很难看...","good_num":"112","comment_num":"18"},{"question_id":9,"answer_id":61,"feed_source_id":25,"feed_source_name":"George9","feed_source_txt":"赞了回答9","feed_source_img":"../../images/icon9.jpeg","question":"气象铁塔的辐射大吗？","answer_ctnt":"我不知道那个铁塔的情况，不过气象铁塔上会有一些测太阳辐射的设备，如果说辐射的话，太阳辐射那么多，大家赶紧躲进地底下呀~~~~~要不然辐射量这么大，会变异的呀~~~~","good_num":"112","comment_num":"18"},{"question_id":10,"answer_id":3,"feed_source_id":23,"feed_source_name":"Rebecca10","feed_source_txt":"赞了回答10","feed_source_img":"../../images/icon1.jpeg","question":"选择 Kindle 而不是纸质书的原因是什么？","answer_ctnt":"难道不明白纸质书更贵啊！！！ 若觉得kindle更贵，我觉得要么阅读量太少，那确实没有买kindle的必要。要么买的都是盗版的纸质书？我不清楚不加以评论。。。 另外，用kindle看小说的怎么真心不懂了...","good_num":"112","comment_num":"18"},{"question_id":11,"answer_id":25,"feed_source_id":24,"feed_source_name":"Alex11","feed_source_txt":"回答了问题11","feed_source_img":"../../images/icon8.jpg","question":"如何评价周杰伦的「中文歌才是最屌的」的言论？","answer_ctnt":"不知道题主是否是学音乐的。 音乐有公认的经典，也有明显的流行趋势没有错。但归根结底，音乐是一种艺术，艺术是很主观的东西。跟画作一个道理，毕加索是大家，但很多人看不懂他的话，甚至觉得很难看...","good_num":"112","comment_num":"18"},{"question_id":12,"answer_id":61,"feed_source_id":25,"feed_source_name":"George12","feed_source_txt":"赞了回答12","feed_source_img":"../../images/icon9.jpeg","question":"气象铁塔的辐射大吗？","answer_ctnt":"我不知道那个铁塔的情况，不过气象铁塔上会有一些测太阳辐射的设备，如果说辐射的话，太阳辐射那么多，大家赶紧躲进地底下呀~~~~~要不然辐射量这么大，会变异的呀~~~~","good_num":"112","comment_num":"18"},{"question_id":13,"answer_id":3,"feed_source_id":23,"feed_source_name":"Rebecca13","feed_source_txt":"赞了回答13","feed_source_img":"../../images/icon1.jpeg","question":"选择 Kindle 而不是纸质书的原因是什么？","answer_ctnt":"难道不明白纸质书更贵啊！！！ 若觉得kindle更贵，我觉得要么阅读量太少，那确实没有买kindle的必要。要么买的都是盗版的纸质书？我不清楚不加以评论。。。 另外，用kindle看小说的怎么真心不懂了...","good_num":"112","comment_num":"18"},{"question_id":14,"answer_id":25,"feed_source_id":24,"feed_source_name":"Alex14","feed_source_txt":"回答了问题14","feed_source_img":"../../images/icon8.jpg","question":"如何评价周杰伦的「中文歌才是最屌的」的言论？","answer_ctnt":"不知道题主是否是学音乐的。 音乐有公认的经典，也有明显的流行趋势没有错。但归根结底，音乐是一种艺术，艺术是很主观的东西。跟画作一个道理，毕加索是大家，但很多人看不懂他的话，甚至觉得很难看...","good_num":"112","comment_num":"18"},{"question_id":15,"answer_id":61,"feed_source_id":25,"feed_source_name":"George15","feed_source_txt":"赞了回答15","feed_source_img":"../../images/icon9.jpeg","question":"气象铁塔的辐射大吗？","answer_ctnt":"我不知道那个铁塔的情况，不过气象铁塔上会有一些测太阳辐射的设备，如果说辐射的话，太阳辐射那么多，大家赶紧躲进地底下呀~~~~~要不然辐射量这么大，会变异的呀~~~~","good_num":"112","comment_num":"18"},{"question_id":16,"answer_id":3,"feed_source_id":23,"feed_source_name":"Rebecca16","feed_source_txt":"赞了回答16","feed_source_img":"../../images/icon1.jpeg","question":"选择 Kindle 而不是纸质书的原因是什么？","answer_ctnt":"难道不明白纸质书更贵啊！！！ 若觉得kindle更贵，我觉得要么阅读量太少，那确实没有买kindle的必要。要么买的都是盗版的纸质书？我不清楚不加以评论。。。 另外，用kindle看小说的怎么真心不懂了...","good_num":"112","comment_num":"18"},{"question_id":9,"answer_id":61,"feed_source_id":25,"feed_source_name":"George9","feed_source_txt":"赞了回答9","feed_source_img":"../../images/icon9.jpeg","question":"气象铁塔的辐射大吗？","answer_ctnt":"我不知道那个铁塔的情况，不过气象铁塔上会有一些测太阳辐射的设备，如果说辐射的话，太阳辐射那么多，大家赶紧躲进地底下呀~~~~~要不然辐射量这么大，会变异的呀~~~~","good_num":"112","comment_num":"18"},{"question_id":10,"answer_id":3,"feed_source_id":23,"feed_source_name":"Rebecca10","feed_source_txt":"赞了回答10","feed_source_img":"../../images/icon1.jpeg","question":"选择 Kindle 而不是纸质书的原因是什么？","answer_ctnt":"难道不明白纸质书更贵啊！！！ 若觉得kindle更贵，我觉得要么阅读量太少，那确实没有买kindle的必要。要么买的都是盗版的纸质书？我不清楚不加以评论。。。 另外，用kindle看小说的怎么真心不懂了...","good_num":"112","comment_num":"18"},{"question_id":11,"answer_id":25,"feed_source_id":24,"feed_source_name":"Alex11","feed_source_txt":"回答了问题11","feed_source_img":"../../images/icon8.jpg","question":"如何评价周杰伦的「中文歌才是最屌的」的言论？","answer_ctnt":"不知道题主是否是学音乐的。 音乐有公认的经典，也有明显的流行趋势没有错。但归根结底，音乐是一种艺术，艺术是很主观的东西。跟画作一个道理，毕加索是大家，但很多人看不懂他的话，甚至觉得很难看...","good_num":"112","comment_num":"18"},{"question_id":12,"answer_id":61,"feed_source_id":25,"feed_source_name":"George12","feed_source_txt":"赞了回答12","feed_source_img":"../../images/icon9.jpeg","question":"气象铁塔的辐射大吗？","answer_ctnt":"我不知道那个铁塔的情况，不过气象铁塔上会有一些测太阳辐射的设备，如果说辐射的话，太阳辐射那么多，大家赶紧躲进地底下呀~~~~~要不然辐射量这么大，会变异的呀~~~~","good_num":"112","comment_num":"18"},{"question_id":13,"answer_id":3,"feed_source_id":23,"feed_source_name":"Rebecca13","feed_source_txt":"赞了回答13","feed_source_img":"../../images/icon1.jpeg","question":"选择 Kindle 而不是纸质书的原因是什么？","answer_ctnt":"难道不明白纸质书更贵啊！！！ 若觉得kindle更贵，我觉得要么阅读量太少，那确实没有买kindle的必要。要么买的都是盗版的纸质书？我不清楚不加以评论。。。 另外，用kindle看小说的怎么真心不懂了...","good_num":"112","comment_num":"18"},{"question_id":14,"answer_id":25,"feed_source_id":24,"feed_source_name":"Alex14","feed_source_txt":"回答了问题14","feed_source_img":"../../images/icon8.jpg","question":"如何评价周杰伦的「中文歌才是最屌的」的言论？","answer_ctnt":"不知道题主是否是学音乐的。 音乐有公认的经典，也有明显的流行趋势没有错。但归根结底，音乐是一种艺术，艺术是很主观的东西。跟画作一个道理，毕加索是大家，但很多人看不懂他的话，甚至觉得很难看...","good_num":"112","comment_num":"18"},{"question_id":15,"answer_id":61,"feed_source_id":25,"feed_source_name":"George15","feed_source_txt":"赞了回答15","feed_source_img":"../../images/icon9.jpeg","question":"气象铁塔的辐射大吗？","answer_ctnt":"我不知道那个铁塔的情况，不过气象铁塔上会有一些测太阳辐射的设备，如果说辐射的话，太阳辐射那么多，大家赶紧躲进地底下呀~~~~~要不然辐射量这么大，会变异的呀~~~~","good_num":"112","comment_num":"18"},{"question_id":16,"answer_id":3,"feed_source_id":23,"feed_source_name":"Rebecca16","feed_source_txt":"赞了回答16","feed_source_img":"../../images/icon1.jpeg","question":"选择 Kindle 而不是纸质书的原因是什么？","answer_ctnt":"难道不明白纸质书更贵啊！！！ 若觉得kindle更贵，我觉得要么阅读量太少，那确实没有买kindle的必要。要么买的都是盗版的纸质书？我不清楚不加以评论。。。 另外，用kindle看小说的怎么真心不懂了...","good_num":"112","comment_num":"18"}],"__wxspec__":true},"feed_length":{"__value__":24,"__wxspec__":true}};
      let dd = {};
      let global = {};
      return {
        env: env,
        dd: dd,
        global: global
      };
    },
    global: {},
    silentLog: false
  },
  {
    name: './pages/discovery/discovery.wxml',
    renderPath: './pages/discovery/discovery.wxml',
    renderData: function () {
      let env = {"navTab":["推荐","圆桌","热门","收藏"],"currentNavtab":"0","imgUrls":["../../images/24213.jpg","../../images/24280.jpg","../../images/1444983318907-_DSC1826.jpg"],"indicatorDots":false,"autoplay":true,"interval":5000,"duration":1000,"feed":{"__value__":[{"question_id":1,"answer_id":3,"feed_source_id":23,"feed_source_name":"Rebecca1","feed_source_txt":"赞了回答1","feed_source_img":"../../images/icon1.jpeg","question":"选择 Kindle 而不是纸质书的原因是什么？","answer_ctnt":"难道不明白纸质书更贵啊！！！ 若觉得kindle更贵，我觉得要么阅读量太少，那确实没有买kindle的必要。要么买的都是盗版的纸质书？我不清楚不加以评论。。。 另外，用kindle看小说的怎么真心不懂了...","good_num":"112","comment_num":"18"},{"question_id":2,"answer_id":25,"feed_source_id":24,"feed_source_name":"Alex2","feed_source_txt":"回答了问题2","feed_source_img":"../../images/icon8.jpg","question":"如何评价周杰伦的「中文歌才是最屌的」的言论？","answer_ctnt":"不知道题主是否是学音乐的。 音乐有公认的经典，也有明显的流行趋势没有错。但归根结底，音乐是一种艺术，艺术是很主观的东西。跟画作一个道理，毕加索是大家，但很多人看不懂他的话，甚至觉得很难看...","good_num":"112","comment_num":"18"},{"question_id":3,"answer_id":61,"feed_source_id":25,"feed_source_name":"George3","feed_source_txt":"赞了回答3","feed_source_img":"../../images/icon9.jpeg","question":"气象铁塔的辐射大吗？","answer_ctnt":"我不知道那个铁塔的情况，不过气象铁塔上会有一些测太阳辐射的设备，如果说辐射的话，太阳辐射那么多，大家赶紧躲进地底下呀~~~~~要不然辐射量这么大，会变异的呀~~~~","good_num":"112","comment_num":"18"},{"question_id":4,"answer_id":3,"feed_source_id":23,"feed_source_name":"Rebecca4","feed_source_txt":"赞了回答4","feed_source_img":"../../images/icon1.jpeg","question":"选择 Kindle 而不是纸质书的原因是什么？","answer_ctnt":"难道不明白纸质书更贵啊！！！ 若觉得kindle更贵，我觉得要么阅读量太少，那确实没有买kindle的必要。要么买的都是盗版的纸质书？我不清楚不加以评论。。。 另外，用kindle看小说的怎么真心不懂了...","good_num":"112","comment_num":"18"},{"question_id":5,"answer_id":25,"feed_source_id":24,"feed_source_name":"Alex5","feed_source_txt":"回答了问题5","feed_source_img":"../../images/icon8.jpg","question":"如何评价周杰伦的「中文歌才是最屌的」的言论？","answer_ctnt":"不知道题主是否是学音乐的。 音乐有公认的经典，也有明显的流行趋势没有错。但归根结底，音乐是一种艺术，艺术是很主观的东西。跟画作一个道理，毕加索是大家，但很多人看不懂他的话，甚至觉得很难看...","good_num":"112","comment_num":"18"},{"question_id":6,"answer_id":61,"feed_source_id":25,"feed_source_name":"George6","feed_source_txt":"赞了回答6","feed_source_img":"../../images/icon9.jpeg","question":"气象铁塔的辐射大吗？","answer_ctnt":"我不知道那个铁塔的情况，不过气象铁塔上会有一些测太阳辐射的设备，如果说辐射的话，太阳辐射那么多，大家赶紧躲进地底下呀~~~~~要不然辐射量这么大，会变异的呀~~~~","good_num":"112","comment_num":"18"},{"question_id":7,"answer_id":3,"feed_source_id":23,"feed_source_name":"Rebecca7","feed_source_txt":"赞了回答7","feed_source_img":"../../images/icon1.jpeg","question":"选择 Kindle 而不是纸质书的原因是什么？","answer_ctnt":"难道不明白纸质书更贵啊！！！ 若觉得kindle更贵，我觉得要么阅读量太少，那确实没有买kindle的必要。要么买的都是盗版的纸质书？我不清楚不加以评论。。。 另外，用kindle看小说的怎么真心不懂了...","good_num":"112","comment_num":"18"},{"question_id":8,"answer_id":25,"feed_source_id":24,"feed_source_name":"Alex8","feed_source_txt":"回答了问题8","feed_source_img":"../../images/icon8.jpg","question":"如何评价周杰伦的「中文歌才是最屌的」的言论？","answer_ctnt":"不知道题主是否是学音乐的。 音乐有公认的经典，也有明显的流行趋势没有错。但归根结底，音乐是一种艺术，艺术是很主观的东西。跟画作一个道理，毕加索是大家，但很多人看不懂他的话，甚至觉得很难看...","good_num":"112","comment_num":"18"}],"__wxspec__":true},"feed_length":{"__value__":8,"__wxspec__":true}};
      let dd = {};
      let global = {};
      return {
        env: env,
        dd: dd,
        global: global
      };
    },
    global: {},
    silentLog: false
  },
  {
    name: './pages/discovery/discovery.wxml',
    renderPath: './pages/discovery/discovery.wxml',
    renderData: function () {
      let env = {"motto":"知乎--微信小程序版","userInfo":{}};
      let dd = {};
      let global = {};
      return {
        env: env,
        dd: dd,
        global: global
      };
    },
    global: {},
    silentLog: false
  }
]
};

module.exports = testSuit;