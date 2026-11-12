let systemInfo;

function getSystemInfoSync() {
  if (systemInfo == null) {
    systemInfo = wx.getSystemInfoSync();
  }
  return systemInfo;
}

function compareVersion(v1, v2) {
  const left = v1.split('.');
  const right = v2.split('.');
  const length = Math.max(left.length, right.length);

  while (left.length < length) left.push('0');
  while (right.length < length) right.push('0');

  for (let index = 0; index < length; index += 1) {
    const leftNumber = Number.parseInt(left[index], 10);
    const rightNumber = Number.parseInt(right[index], 10);
    if (leftNumber > rightNumber) return 1;
    if (leftNumber < rightNumber) return -1;
  }
  return 0;
}

function gte(version) {
  return compareVersion(getSystemInfoSync().SDKVersion, version) >= 0;
}

function canIUseModel() {
  return gte('2.9.3');
}

function canIUseFormFieldButton() {
  return gte('2.10.3');
}

function canIUseAnimate() {
  return gte('2.9.0');
}

function canIUseGroupSetData() {
  return gte('2.4.0');
}

function canIUseNextTick() {
  try {
    return wx.canIUse('nextTick');
  } catch (error) {
    return gte('2.7.1');
  }
}

function canIUseCanvas2d() {
  return gte('2.9.0');
}

function canIUseGetUserProfile() {
  return Boolean(wx.getUserProfile);
}

module.exports = {
  getSystemInfoSync,
  canIUseModel,
  canIUseFormFieldButton,
  canIUseAnimate,
  canIUseGroupSetData,
  canIUseNextTick,
  canIUseCanvas2d,
  canIUseGetUserProfile,
};
