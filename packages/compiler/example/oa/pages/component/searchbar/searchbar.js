
"use strict";

const api = require('../../../utils/js/api.js');
const app = getApp();

console.log(222);
Component({
    options: {
        addGlobalClass: true
    },
    properties: {
        extClass: {
            type: String,
            value: ''
        },
        focus: {
            type: Boolean,
            value: false
        },
        placeholder: {
            type: String,
            value: app.globalData.lang['OA_formlist_btn_search']  //搜索
        },
        value: {
            type: String,
            value: ''
        },
        search: {
            type: Function,
            value: null
        },
        throttle: {
            type: Number,
            value: 500
        },
        cancelText: {
            type: String,
            value: app.globalData.lang['OA_formlist_btn_cancel']  //取消
        },
        cancel: {
            type: Boolean,
            value: true
        },
        cancelFunc:{
          type: Function,
          value: null
        },
        searchState:{
          type: Boolean,
          value: false
        },
        focusFunc:{
          type: Function,
          value: null
        }
    },
    data: {
        // 多语言变量
        btnSearch: app.globalData.lang['OA_formlist_btn_search'],   //搜索
        result: []
    },
    lastSearch: Date.now(),
    lifetimes: {
        attached: function attached() {
            if (this.data.focus) {
                this.setData({
                    searchState: true
                });
            }
        }
    },
    methods: {
        clearInput: function clearInput() {
            this.setData({
              value: '',
              result:[],
              showCell:false
            });
            this.triggerEvent('clear');
        },
        inputFocus: function inputFocus(e) {
          this.triggerEvent('focus', e.detail);
          // focus的时候，我希望也能够请求事件
          var _this = this;
          this.setData({
            value: e.detail.value,
            showCell: true,
          });
          this.triggerEvent('input', e.detail);
          if (typeof this.data.focusFunc !== 'function') {
            return;
          }
          this.lastSearch = Date.now();
          this.timerId = setTimeout(function () {
            _this.data.focusFunc(e.detail.value).then(function (json) {
              _this.setData({
                result: json
              });
            }).catch(function (err) {
              // console.log('search error', err);
            });
          }, this.data.throttle);
        },
        inputBlur: function inputBlur(e) {
            this.setData({
                focus: false
            });
            this.triggerEvent('blur', e.detail);
        },
        showInput: function showInput() {
            this.setData({
                focus: true,
                searchState: true
            });
        },
        hideInput: function hideInput() {
          this.setData({
            searchState: false,
            result:[],
            showCell:false
          });
          if (typeof this.data.cancelFunc !== 'function') {
            return;
          }
          this.data.cancelFunc()
        },
        inputChange: function inputChange(e) {
            var _this = this;
            this.setData({
                value: e.detail.value,
                showCell: true,
            });
            this.triggerEvent('input', e.detail);
            if (typeof this.data.search !== 'function') {
                return;
            }
            this.lastSearch = Date.now();
            clearTimeout(this.timerId);
            this.timerId = setTimeout(function () {
                _this.data.search(e.detail.value).then(function (json) {
                    _this.setData({
                        result: json
                    });
                }).catch(function (err) {
                    // console.log('search error', err);
                });
            }.bind(this), this.data.throttle);
        },
        selectResult: function selectResult(e) {
            var index = e.currentTarget.dataset.index;

            var item = this.data.result[index];
            this.triggerEvent('selectresult', { index: index, item: item });
            this.setData({
              showCell:false,
            })
        }
    }
});
