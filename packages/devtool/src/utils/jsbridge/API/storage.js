export function getStorageSync(params) {
  const { key } = params;

  const data = window.localStorage.getItem(key);
  const protoType = Object.prototype.toString.call(data).split(' ')[1].split(']')[0];

  return {
    data,
    dataType: protoType,
  };
}

export function setStorageSync(params) {
  const { key, data, dataType } = params;

  return window.localStorage.setItem(key, dataType === 'string' ? data : JSON.stringify(data));
}
