export default function uuid() {
  const s = [];
  const ts = Date.now().toString(16);
  const hexDigits = '0123456789abcdef';

  for (let i = 0, l = 32 - ts.length; i < l; i+=1) {
    s[i] = hexDigits.substr(Math.floor(Math.random() * 16), 1);
  }

  return ts + s.join('');
}
