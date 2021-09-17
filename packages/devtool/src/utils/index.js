import qs from 'qs';

let uid = 0;

export function createGuid() {
  return ++uid;
}

export function query(key) {
  const querys = location.search ? qs.parse(location.search.substring(1)) : {};
  return key ? querys[key] : querys;
}

export function delay(time) {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
}
