
import { mapping } from '../../utils/bridge';
import { isAndroid } from '../../utils/system';

export const openLocation = {
  b: function b(opt) {
    opt.scale = opt.scale || 15; // 默认缩放15级
    opt.hidden = '1';
  },
};

export function getLocation(appId) {
  return {
    m: 'getCurrentLocation',
    b: function b(opt) {
      mapping(opt, {
        accuracy: 'horizontalAccuracy',
        type: 'requestType',
      });
      if (!opt.requestType) {
        opt.requestType = 0;
        opt.useDefault = true;
      }
      opt.bizType = appId;
      if (isAndroid) {
        if (typeof opt.isHighAccuracy === 'undefined') {
          opt.isHighAccuracy = true;
        }
        if (typeof opt.isNeedSpeed === 'undefined') {
          opt.isNeedSpeed = true;
        }
      }
    },
    a: function a(res) {
      mapping(res, {
        citycode: 'cityCode',
        adcode: 'adCode',
      });
      if (!res.city && res.province) {
        res.city = res.province;
      }
      if (res.latitude) {
        res.latitude += '';
      }
      if (res.longitude) {
        res.longitude += '';
      }
      if (res.accuracy) {
        res.accuracy += '';
        res.horizontalAccuracy = res.accuracy;
      }
      delete res.speed;
    },
  };
}
