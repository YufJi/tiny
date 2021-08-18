export function getStorageSync(params) {
  const { paramsString } = params;
  const { key } = JSON.parse(paramsString);

  const data = window.localStorage.getItem(key);
  const protoType = Object.prototype.toString.call(data).split(' ')[1].split(']')[0];

  return {
    data,
    dataType: protoType,
  };
}

export function setStorageSync(params) {
  const { paramsString } = params;
  const { key, data, dataType } = JSON.parse(paramsString);

  return window.localStorage.setItem(key, dataType === 'string' ? data : JSON.stringify(data));
}
