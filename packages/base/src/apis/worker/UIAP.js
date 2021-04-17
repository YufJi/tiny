
import { isArray } from '../../utils/types';
import getCurrentViewId from '../../utils/getCurrentViewId';
import { mapping } from '../../utils/bridge';
import { $global, getStartupParams, getCurrentPageImpl } from '../../framework/dev';
import objectKeys from '../../utils/objectKeys';
import { alert, hideLoading, showLoading } from '../shared/UI';
import { compareSystemVersion} from '../../utils/system';
import endsWith from '../../utils/endsWith';
import getHomePage from '@hulk/mp-core/es/utils/getHomePage';

const g10_1_35 = compareSystemVersion('10.1.35') >= 0;
const g10_1_50 = compareSystemVersion('10.1.50') >= 0;
const tabBarActions = [
  'setTabBarBadge',
  'removeTabBarBadge',
  'showTabBarRedDot',
  'hideTabBarRedDot',
  'setTabBarStyle',
  'setTabBarItem',
  'showTabBar',
  'hideTabBar'
];

const api10_1_35 = g10_1_35 ? tabBarActions.reduce((a, c) => {
  let _extends2;

  return { ...a,
    ...(_extends2 = {}, _extends2[c] = {
      m: 'setTabBar',
      b: function b(opt) {
        opt.actionType = c;
      },
    }, _extends2) };
}, {}) : {};

if (g10_1_35) {
  Object.assign(api10_1_35, {
    startPullDownRefresh: {},
    setTransparentTitle: {},
    showBackToHomepage: {
      b: function b(opt) {
        const page = getCurrentPageImpl();
        const pagePath = page && page.getPagePath();
        const homepage = getHomePage();
        const tabs = objectKeys($global.tabsConfig);
        opt.isHomePage = pagePath === homepage || tabs.indexOf(pagePath) > -1;
        opt.viewId = getCurrentViewId();
      },
    },
  });
}

const starBucksApi = g10_1_35 ? {
  setViewTop: {
    m: 'setWebViewTop',
  },
  setCanPullDown: {},
  setBackgroundImage: {},
  removeBackgroundImage: {},
} : {};

const backgroundApi = g10_1_35 ? {
  setBackgroundColor: {},
  setBackgroundTextStyle: {},
  setBackButton: {},
} : {};

const taopiaopiaoApi = g10_1_35 ? {
  setLocatedCity: {},
  onLocatedComplete: {},
} : {};

const api50 = g10_1_50 ? {
  getTitleColor: {},
} : {};

export default function (ap) {
  const { callBridge } = ap;

  function commaCount(str) {
    const m = str.match(/:/g);
    if (!m) {
      return 0;
    }
    return m.length;
  }
  function removeSS(str) {
    return str.replace(/:\d+$/, '');
  }
  return {
    showAuthGuide: {
      b: function b(opt) {
        opt.bizType = 'AppletPG';
        opt.source = getStartupParams().appId;
      },
    },
    /**
     * 接口可直接传入一个字符串（opt.content）
     * 统一 alert 和 confirm 的内容字段为 content
     */
    alert: alert,
    /**
     * 接口可直接传入一个字符串（opt.content）
     * 统一 alert 和 confirm 的内容字段为 content
     */
    confirm: {
      b: function b(opt) {
        mapping(opt, {
          content: 'message%s',
          confirmButtonText: 'okButton%s',
          cancelButtonText: 'cancelButton%s',
        });
      },
      a: function a(res) {
        mapping(res, {
          ok: 'confirm',
        });
      },
    },
    prompt: {
      b: function b(opt) {
        opt.message = opt.message || '请输入内容';
        opt.okButtonText = opt.okButtonText || '确定';
        opt.cancelButtonText = opt.cancelButtonText || '取消';
        mapping(opt, {
          okButtonText: 'okButton%s',
          cancelButtonText: 'cancelButton%s',
        });
      },
    },
    /**
     * 接口可直接传入一个字符串（opt.content）
     */
    showToast: {
      m: 'toast',
    },
    hideToast: {},
    /**
     * 接口可直接传入一个字符串（opt.content）
     * 接口改造 opt.content => opt.text
     */
    showLoading: showLoading,
    hideLoading: hideLoading,
    showNavigationBarLoading: {
      m: 'showTitleLoading',
      callback: false,
    },
    hideNavigationBarLoading: {
      m: 'hideTitleLoading',
      callback: false,
    },
    /**
         * 整合了 setTitle, setTitleColor, setBarBottomLineColor 三个接口
         * @type {Object}
         */
    setNavigationBar: {
      b: function b(opt) {
      // JSAPI 名称太长又多次引用，不利于代码压缩，固单独记录
        const st = 'setTitle';
        const stc = 'setTitleColor';
        const sblc = 'setBarBottomLineColor';
        const _opt = {
          success: opt.success,
          fail: opt.fail,
          complete: opt.complete,
        };
        _opt[st] = {};
        _opt[stc] = {};
        _opt[sblc] = {};
        // 映射不同 JSAPI 的入参
        _opt[st] = mapping(_opt[st], {
          title: 'title%s',
          image: 'image%b',
        }, opt);
        _opt[stc] = mapping(_opt[stc], {
          backgroundColor: 'color%c',
          reset: 'reset',
        }, opt);
        _opt[sblc] = mapping(_opt[sblc], {
          borderBottomColor: 'color%c',
        }, opt);
        return _opt;
      },
      d: function d(_opt, cb) {
        const { viewId } = _opt;

        const st = 'setTitle';
        const stc = 'setTitleColor';
        const sblc = 'setBarBottomLineColor';
        let res = {};
        // setTitle
        if (objectKeys(_opt[st]).length !== 0) {
          callBridge(st, { ..._opt[st], viewId });
        }
        // setBarBottomLineColor
        if (objectKeys(_opt[sblc]).length !== 0) {
          if (isNaN(_opt[sblc].color)) {
            res.error = 2;
            res.errorMessage = '颜色值不合法';
          } else {
            callBridge(sblc, { ..._opt[sblc], viewId });
          }
        }
        // setTitleColor
        if (objectKeys(_opt[stc]).length !== 0) {
          if (isNaN(_opt[stc].color) && !_opt[stc].reset) {
            res.error = 2;
            res.errorMessage = '颜色值不合法';
            cb(res);
          } else {
            callBridge(stc, { ..._opt[stc], viewId }, (result) => {
              res = { ...result, ...res };
              cb(res);
            });
          }
        } else {
        // setTitle 和 setBarBottomLineColor 本身没有回调
        // 为保持接口一致性要模拟一个异步回调
          cb(res);
        }
      },
    },
    showActionSheet: {
      m: 'actionSheet',
      v: function v(opt) {
        if (!opt.items) {
          return {
            error: '99',
            errorMessage: 'items is required!',
          };
        }
      },
      b: function b(opt) {
        mapping(opt, {
          items: 'btns',
          cancelButtonText: 'cancelBtn%s',
        });
        // 把按钮字段转成字符串，非字符串会导致钱包闪退
        if (isArray(opt.btns)) {
          const { btns } = opt;
          opt.btns = [];
          btns.forEach((item) => {
            return opt.btns.push(`${item}`);
          });
        }
        // 把取消按钮字段转成字符串，非字符串会导致 actionSheet 全屏
        if (!opt.cancelBtn) {
          opt.cancelBtn = '取消';
        }
      },
      a: function a(res, _opt) {
        if (isArray(_opt.btns) && res.index === _opt.btns.length) {
          res.index = -1;
        }
      },
    },
    choosePhoneContact: {
      m: 'contact',
    },
    /**
     * 最多选择10个联系人，只露出 count 参数，其他屏蔽
     */
    chooseAlipayContact: {
      m: 'chooseContact',
      b: function b(opt) {
        const multi = 'multi';
        const single = 'single';
        if (!opt.count) {
          opt.count = 1;
        }
        if (opt.count === 1) {
          opt.type = single;
        } else {
          opt.type = multi;
          if (opt.count <= 0 || opt.count > 10) {
            opt.multiMax = 10;
          } else {
            opt.multiMax = opt.count;
          }
        }
        delete opt.count;
      },
      a: function a(res) {
        if (isArray(res.contacts)) {
          res.contacts.forEach((contact) => {
            mapping(contact, {
              headImageUrl: 'avatar',
              name: 'realName',
            });
            delete contact.from;
          });
        }
      },
    },
    datePicker: {
      b: function b(opt) {
        function addSS() {
          ['beginDate', 'minDate', 'maxDate'].forEach((f) => {
            if (opt[f]) {
              if (commaCount(opt[f]) === 1) {
                opt[f] += ':00';
              }
            }
          });
        }
        mapping(opt, {
          format: 'mode',
          currentDate: 'beginDate',
          startDate: 'minDate',
          endDate: 'maxDate',
        });
        switch (opt.mode) {
          case 'HH:mm:ss':
            opt.mode = 0;
            break;
          case 'HH:mm':
            opt.mode = 0;
            addSS();
            break;
          case 'yyyy-MM-dd':
            opt.mode = 1;
            break;
          case 'yyyy-MM-dd HH:mm:ss':
            opt.mode = 2;
            break;
          case 'yyyy-MM-dd HH:mm':
            opt.mode = 2;
            addSS();
            break;
          case 'yyyy-MM':
            opt.mode = 3;
            break;
          case 'yyyy':
            opt.mode = 4;
            break;
          default:
            opt.mode = 1;
        }
      },
      a: function a(res, _opt, opt) {
        if (typeof res.date === 'string') {
          if (endsWith(opt.format, ':mm')) {
            if (commaCount(res.date) === 2) {
              res.date = removeSS(res.date);
            }
          }
          // 返回格式为yyyy-MM-dd
          res.date = res.date.replace(/\//g, '-').trim();
        }
      },
    },
    chooseCity: {
      m: 'getCities',
      b: function b(opt) {
        let customCities;
        let customHotCities;
        let customHistoryCities;
        mapping(opt, {
          showHotCities: 'needHotCity',
          cities: 'customCities',
          hotCities: 'customHotCities',
        });
        // 显示定位城市
        if (opt.showLocatedCity === true) {
          opt.currentCity = '';
          opt.adcode = '';
        } else {
          delete opt.currentCity;
          delete opt.adcode;
        }
        delete opt.showLocatedCity;
        // 自定义城市
        customCities = opt.customCities;
        if (opt.customCities) {
          opt.customCities = mapArray(customCities);
        }
        // 自定义热门城市
        customHotCities = opt.customHotCities;
        if (opt.customHotCities) {
          opt.customHotCities = mapArray(customHotCities);
        }
        // 自定义历史记录城市
        customHistoryCities = opt.customHistoryCities;
        if (opt.customHistoryCities) {
          opt.customHistoryCities = mapArray(customHistoryCities);
        }
        function mapArray(arr) {
          let tempArr;
          if (isArray(arr)) {
            tempArr = [];
            arr.forEach((city) => {
              tempArr.push(mapping({}, {
                city: 'name',
                adCode: 'adcode%s',
                spell: 'pinyin',
              }, city));
            });
            arr = tempArr;
          }
          return arr;
        }
      },
      a: function a(res) {
        mapping(res, {
          adcode: 'adCode',
        });
      },
    },
    multiLevelSelect: {
    // 此API是从高德小程序开始使用，后续其他MPASS客户端升级框架时需要确保对应的JSAPI已经可用。
      m: false ? undefined : 'beehiveMultilevelSelect',
    },
    optionsSelect: {
    // 此API是从高德小程序开始使用，后续其他MPASS客户端升级框架时需要确保对应的JSAPI已经可用。
      m: false ? undefined : 'beehiveOptionsPicker',
    },
    chooseContact: {
      m: 'APSocialNebulaPlugin.selectContactJSAPI',
      b: function b(opt) {
        mapping(opt, {
          chooseType: 'type',
          includeMe: 'withMe',
          multiChooseMax: 'multiMax',
          multiChooseMaxTips: 'multiMaxTips',
        });
        opt.model = 'friend';
        switch (opt.includeMobileContactMode) {
          case 'known':
          // 包含双向手机联系人
            opt.showKnownMobileContact = true;
            break;
          case 'all':
          // 包含所有手机联系人
            opt.showMobileContact = true;
            break;
          default:
            break;
        }
      },
      a: function a(res) {
        if (res.contactsDicArray && res.contactsDicArray.length > 0) {
          for (let i = 0; i < res.contactsDicArray.length; ++i) {
            mapping(res.contactsDicArray[i], {
              headUrl: 'avatar',
              phoneString: 'mobile',
              name: 'realName',
              userID: 'userId',
            });
            delete res.contactsDicArray[i].account;
          }
        }
      },
    },
    hideShareMenu: {},
    ...api10_1_35,
    ...backgroundApi,
    ...starBucksApi,
    ...taopiaopiaoApi,
    ...api50,
  };
}
