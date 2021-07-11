export default function promisifyAPI(api) {
  return new Promise((resolve, reject) => {
    api({
      ...args,
      success: resolve,
      fail: reject,
    });
  });
}
