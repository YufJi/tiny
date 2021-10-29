const storage = new Map();

export function getStorageSync(params) {
  const { key } = params;

  const data = storage.get(key);
  const protoType = Object.prototype.toString.call(data).split(' ')[1].split(']')[0];

  return {
    data,
    dataType: protoType,
  };
}

export function setStorageSync(params) {
  const { key, data, dataType } = params;

  return storage.set(key, dataType === 'string' ? data : JSON.stringify(data));
}
