const api = require('../../../utils/js/api.js');
const {isArr} = require('../../../utils/js/util.js');
const app = getApp();
const UID = wx.getStorageSync("userEmpcode");

console.log(111);

Component({
  
  properties: {
    historyHeadTxt: { // 搜索历史模块标题
      type: String,
      value: '搜索历史'
    },
    title: { // 页面标题
      type: String,
      value: '选择人员'
    },
    historyKey: { // 本地存储key
      type: String,
      value: ''
    },
    inputStatus: { // 是否自动聚焦
      type: Boolean,
      value: false
    },
    isHoldOA: { // 是否是控股的
      type: Boolean,
      value: false
    },
    syscode: { // 是否是控股的
      type: "String",
      value: ""
    },
  },

  /**
   * 页面的初始数据
   */
  data: {
    // 多语言变量
    textSearchPlace: app.globalData.lang['OA_authupdateAndAdd_text_search'],  //姓名/首字母/拼音/域帐号
    btnCancel: app.globalData.lang['OA_formlist_btn_cancel'],//选择代理人

    historys:[], // 搜索历史
    inputVal: "", // 输入框内容
    lastSearch: Date.now(), // 防抖 时间戳
    associateData:[] // 搜索联想内容
  },

  lifetimes: {
    attached: function () {
      // 在组件实例进入页面节点树时执行
      let that = this;

      // 获取搜索历史
      let history = wx.getStorageSync(that.properties.historyKey);
      if (history) {
        that.setData({
          historys: history
        });
      }

      // 页面标题
      wx.setNavigationBarTitle({
        title: this.properties.title
      })

    },
  },

  methods:{
    // 选择搜索联想列表内容
    selectResult: function (e) {
      let that = this;
      
      let { text, uid } = e.currentTarget.dataset;

      // 搜索历史存至Storage
      let { historys } = that.data;
      let data = historys.concat();
      if (data.indexOf(text) === -1) {
        data.unshift(text);
      } else {
        data.splice(data.indexOf(text), 1);
        data.unshift(text);
      }
      data = data.slice(0, 10);
      wx.setStorageSync(that.properties.historyKey, data);

      let pages = getCurrentPages();
      let currPage = pages[pages.length - 1];   //当前页面
      let prevPage = pages[pages.length - 2];  //上一个页面
      // 设置当前页面的元素
      that.setData({
        inputVal: ''
      })
      // 进行跳转返回上一个页面，设置上一个页面的元素
      prevPage.setData({
        'userInfo.name': text,
        'userInfo.uid': uid
      })
      wx.navigateBack();
    },

    // 点击搜索历史内容
    changeValue: function(e) {
      
      let {value} = e.currentTarget.dataset;
      this.setData({
        inputVal: value,
        inputStatus: true
      });
      let data = {
        detail : {
          value
        }
      };
      this.inputFun(data);
    },

    // 搜索事件（输入中、点击搜索历史）
    inputFun: function (e) {
      let that = this;
      let { value } = e.detail;

      that.setData({
        inputVal: value
      });

      // 输入内容为空时，默认搜索前一个点击搜索过的内容
      if (value.length == 0) {
        that.setData({
          associateData: []
        });
      }

      if (Date.now() - that.data.lastSearch < 400) {
        return;
      }
      that.setData({
        lastSearch: Date.now()
      });
      var url = this.data.isHoldOA ? 'itapp02_getHoldingOAUserInfoList' : `itapp02_SearchEmpinfo?q=${encodeURIComponent(value)}&empcode=${UID}&pageno=1` 
      var reuquest_data = this.data.isHoldOA ? { keyword: value, syscode: this.data.syscode} : {}
      api.PostData(url, reuquest_data, function (res) {
        let list = [];
        if (that.data.isHoldOA) {
          if (res.data && (res.data.empInfoList && isArr(res.data.empInfoList))){
            res.data.empInfoList.forEach(e => {
              let org = e.cpBsDpInfo;
              list.push({
                text: e.cName, // 用户名
                org, // 用户组织信息
                uid: e.empCode // 用户工号
              })
            });
            that.setData({
              associateData: list
            });
          }
        }else{
          if (res.data && (isArr(res.data))) {
            res.data.forEach(e => {
              let arr = e.org_structure.split(">").slice(-5);
              let org = arr.join('/');
              list.push({
                text: e.displayname, // 用户名
                org, // 用户组织信息
                uid: e.empcode // 用户工号
              })
            });
            that.setData({
              associateData: list
            });
          }
        }
       
      },true)
    },

    // 搜索框聚焦
    focusFun: function () {
      this.setData({
        inputStatus: true
      });
    },

    // 清空搜索框
    clearValue: function () {
      this.setData({
        inputVal: "",
        associateData: []
      });
    },

    // 取消
    cancelFun: function(){
      this.setData({
        inputStatus: false,
        inputVal: "",
        associateData: []
      });
    }, 

    // 清空搜索历史
    clearHistory: function() {
      let that = this;
      wx.showModal({
        title: '提示',
        content: `确认要清空${that.properties.historyHeadTxt}吗？`,
        success(res) {
          if (res.confirm) {
            that.setData({
              historys: []
            });
            wx.setStorageSync(that.properties.historyKey, []);
          } else if (res.cancel) {
            // console.log('用户点击取消')
          }
        }
      })
    } 
  }
})