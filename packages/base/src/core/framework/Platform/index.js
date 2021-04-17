
const ua = navigator.swuserAgent || navigator.userAgent;
const ios = /iPhone|iPad/i;
// android can change ua?!

const Platform = {
  OS: 'web',
  ide: ua.indexOf('IDE') > -1,
  browser: ua.indexOf('Android') > -1 ? 'android' : ua.match(ios) ? 'ios' : 'unknown',
};

export default Platform;
