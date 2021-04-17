
// Test via a getter in the options object to see if the passive property is accessed
let supportsPassive = false;
try {
  const n = null;
  const opts = Object.defineProperty({}, 'passive', {
    get() {
      supportsPassive = true;
    },
  });
  window.addEventListener('testPassive', n, opts);
  window.removeEventListener('testPassive', n, opts);
} catch (e) {}


export default supportsPassive;
