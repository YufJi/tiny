__webpack_require__.r(__webpack_exports__);
/* harmony import */ const babel_runtime_helpers_extends__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! babel-runtime/helpers/extends */ './node_modules/babel-runtime-loose/helpers/extends.js');
/* harmony import */ const babel_runtime_helpers_extends__WEBPACK_IMPORTED_MODULE_0___default = /* #__PURE__ */__webpack_require__.n(babel_runtime_helpers_extends__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ const _utils_bridge__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../utils/bridge */ './src/utils/bridge.tsx');
/* harmony import */ const _framework_dev__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../framework/dev */ './src/framework/dev.tsx');
/* harmony import */ const _wrapNamespace__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../wrapNamespace */ './src/bridge/wrapNamespace.tsx');

/* harmony default export */ __webpack_exports__.default = (function (ap) {
  const { callBridge } = ap;

  const bizAppId = '20000021';
  function deleteAB(opt) {
    if (opt.a) {
      delete opt.a;
    }
    if (opt.b) {
      delete opt.b;
    }
  }
  function doStartApp(opt, cb, a, b) {
    callBridge('startApp', {
      appId: bizAppId,
      param: { a,
        b,
        ...opt },
    }, cb);
  }
  // 卡券票
  const cardApiImpl = {
    openCardList: {
      b: function b(opt) {
        deleteAB(opt);
      },
      d: function d(opt, cb) {
        doStartApp(opt, cb, 'lb', 'm');
      },

      callback: false,
    },
    openVoucherList: {
      b: function b(opt) {
        deleteAB(opt);
      },
      d: function d(opt, cb) {
        doStartApp(opt, cb, 'lb', 'c');
      },

      callback: false,
    },
    openTicketList: {
      b: function b(opt) {
        deleteAB(opt);
      },
      d: function d(opt, cb) {
        doStartApp(opt, cb, 'lb', 't');
      },

      callback: false,
    },
    openCardDetail: {
      b: function b(opt) {
        Object(_utils_bridge__WEBPACK_IMPORTED_MODULE_1__.mapping)(opt, {
          passId: 'p',
        });
        if (opt.b) {
          delete opt.b;
        }
      },
      d: function d(opt, cb) {
        callBridge('startApp', {
          appId: bizAppId,
          param: { b: 'm', ...opt },
        }, cb);
      },

      callback: false,
    },
    openVoucherDetail: {
      b: function b(opt) {
        Object(_utils_bridge__WEBPACK_IMPORTED_MODULE_1__.mapping)(opt, {
          passId: 'p',
        });
        if (opt.b) {
          delete opt.b;
        }
      },
      d: function d(opt, cb) {
        callBridge('startApp', {
          appId: bizAppId,
          param: { b: 'c', ...opt },
        }, cb);
      },

      callback: false,
    },
    openTicketDetail: {
      b: function b(opt) {
        Object(_utils_bridge__WEBPACK_IMPORTED_MODULE_1__.mapping)(opt, {
          passId: 'p',
        });
        if (opt.b) {
          delete opt.b;
        }
      },
      d: function d(opt, cb) {
        callBridge('startApp', {
          appId: bizAppId,
          param: { b: 't', ...opt },
        }, cb);
      },

      callback: false,
    },
    openMerchantCardList: {
      b: function b(opt) {
        deleteAB(opt);
      },
      d: function d(opt, cb) {
        doStartApp(opt, cb, 'lb', 'm');
      },

      callback: false,
    },
    openMerchantVoucherList: {
      b: function b(opt) {
        deleteAB(opt);
      },
      d: function d(opt, cb) {
        doStartApp(opt, cb, 'lb', 'c');
      },

      callback: false,
    },
    openMerchantTicketList: {
      b: function b(opt) {
        deleteAB(opt);
      },
      d: function d(opt, cb) {
        doStartApp(opt, cb, 'lb', 't');
      },

      callback: false,
    },
    openKBVoucherDetail: {
      b: function b(opt) {
        if (opt.target) {
          delete opt.target;
        }
        if (opt.type) {
          delete opt.type;
        }
      },
      d: function d(opt, cb) {
        callBridge('startApp', {
          appId: '20000238',
          param: { target: 'commodity', type: 'market', ...opt },
        }, cb);
      },

      callback: false,
    },
  };
  const api = { // 跳转到口碑卡券详情接口
    navigateToCouponDetail: {
      a: function a(res) {
        if (res.resultStatus) {
          switch (res.resultStatus) {
            case '9000':
              break;
            case '6001':
              res.errorMessage = res.errMsg || '用户取消操作';
              res.error = '6001';
              break;
            case '6002':
              res.errorMessage = res.errMsg || '网络异常';
              res.error = '6002';
              break;
            case '4000':
              res.errorMessage = res.errMsg || '系统异常';
              res.error = '4000';
              break;
            default:
              res.errorMessage = res.errMsg || '未知异常';
              res.error = res.resultStatus;
              break;
          }
          delete res.resultStatus;
          if (res.errMsg) {
            delete res.errMsg;
          }
        }
      },
      d: function d(opt, cb) {
        callBridge('startBizService', {
          name: 'coupon-detail',
          param: JSON.stringify(opt),
        }, cb);
      },
    },
    ...cardApiImpl, // 代扣
    paySignCenter: {
      d: function d(opt, cb) {
        callBridge('startBizService', {
          name: 'deduct',
          param: JSON.stringify({
            sign_params: opt.signStr,
          }),
        }, cb);
      },
    },
    // 信用借还
    zmCreditBorrow: {
      d: function d(opt, cb) {
        callBridge('startBizService', {
          name: 'zm-borrow',
          param: JSON.stringify({ ...opt }),
        }, cb);
      },
    },
    textRiskIdentification: {},
    openCarService: {
      v: function v(opt) {
        if (!('serviceId' in opt)) {
          return {
            error: 2,
            errorMessage: 'serviceId is required',
          };
        } else if (typeof opt.serviceId === 'number') {
          return {
            error: 2,
            errorMessage: "serviceId is 'String' type",
          };
        }
      },
      b: function b(opt) {
        switch (opt.serviceId) {
          case '0':
            // 保养服务
            opt.serviceId = 'CARLIFE016';
            break;
          case '1':
            // 爱车估值
            opt.serviceId = 'CARLIFE020';
            break;
          case '2':
            // 加油充值
            opt.serviceId = 'CARLIFE011';
            break;
        }
      },
      d: function d(opt, cb) {
        function doOpenCarService(addressCode, serviceId) {
          const url = `https://mycar-vbizplatformsit.alipay-eco.com/vbizplatform/category/index?cityCode=${addressCode}&serviceId=${serviceId}`;
          callBridge('startApp', {
            appId: '20000919',
            param: {
              url,
            },
          });
        }
        if (opt.addressCode) {
          doOpenCarService(opt.addressCode, opt.serviceId);
        } else {
          callBridge('getCurrentLocation', {
            requestType: 1,
            bizType: Object(_framework_dev__WEBPACK_IMPORTED_MODULE_2__.getStartupParams)().appId,
            cacheTimeout: 3600,
          }, (res) => {
            if (res.error) {
              res.error = 2;
              res.errorMessage = 'addressCode is required';
              cb(res);
            } else {
              doOpenCarService(res.cityAdcode, opt.serviceId);
            }
          });
        }
      },
    },
    openChatWindow: {
      v: function v(opt) {
        if (!('userId' in opt)) {
          return {
            error: 2,
            errorMessage: 'userId is required',
          };
        } else if (typeof opt.userId !== 'string') {
          return {
            error: 2,
            errorMessage: "userId is 'String' type",
          };
        }
      },
      d: function d(opt) {
        callBridge('startApp', {
          appId: '20000167',
          param: {
            tUserType: '1',
            tUserId: opt.userId,
            returnAppId: 'back',
          },
        });
      },
    },
    __openLifePayment: {
      v: function v(opt) {
        if (!('instId' in opt)) {
          return {
            error: 2,
            errorMessage: 'addressCode and instId is required',
          };
        } else if (typeof opt.addressCode === 'number' || typeof opt.instId === 'number') {
          return {
            error: 2,
            errorMessage: "addressCode and instId is 'String' type",
          };
        }
      },
      d: function d(opt, cb) {
        function doOpenLifePayment(addressCode, cityName, instId) {
          const url = `/www/setNewAccount.htm?subBizType=ELECTRIC&adcode=${addressCode}&city=${cityName}&instId=${instId}`;
          callBridge('startApp', {
            appId: '20000193',
            param: {
              url,
            },
          });
        }
        if (opt.addressCode && opt.cityName) {
          doOpenLifePayment(opt.addressCode, opt.cityName, opt.instId);
        } else {
          callBridge('getCurrentLocation', {
            requestType: 1,
            bizType: Object(_framework_dev__WEBPACK_IMPORTED_MODULE_2__.getStartupParams)().appId,
            cacheTimeout: 3600,
          }, (res) => {
            if (res.error) {
              res.error = 2;
              res.errorMessage = 'addressCode is required';
              cb(res);
            } else {
              doOpenLifePayment(res.cityAdcode, encodeURIComponent(res.city), opt.instId);
            }
          });
        }
      },
    },
    chooseAddress: {
      d: function d(_opt, cb) {
        callBridge('startBizService', {
          name: 'shopping-address',
          param: JSON.stringify({
            sceneCode: 'TINY-APP',
          }),
        }, cb);
      },
    },
    startZMCreditRent: {
      d: function d(opt, cb) {
        callBridge('startBizService', {
          name: 'credit-rent',
          param: JSON.stringify({ creditRentType: 'rent', ...opt }),
        }, cb);
      },
    },
    zmRentTransition: {
      d: function d(opt, cb) {
        callBridge('startBizService', {
          name: 'rent-transition',
          param: JSON.stringify({ creditRentType: 'signPay', ...opt }),
        }, cb);
      },
    },
    chooseInvoiceTitle: {
      d: function d(opt, cb) {
        callBridge('startBizService', {
          name: 'invoice-title',
          param: JSON.stringify(opt),
        }, cb);
      },
    },
    zmFreeDeposit: {
      d: function d(opt, cb) {
        callBridge('startBizService', {
          name: 'zmep-freedeposit',
          param: JSON.stringify(opt),
        }, cb);
      },
    } };
  return Object(_wrapNamespace__WEBPACK_IMPORTED_MODULE_3__.default)(api);
});
