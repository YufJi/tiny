import qs from 'qs';

let uid = 0;

export function createGuid(type) {
  return `${type}-${uid+=1}`;
}

export function query(key) {
  const querys = location.search ? qs.parse(location.search.substring(1)) : {};
  return key ? querys[key] : querys;
}
