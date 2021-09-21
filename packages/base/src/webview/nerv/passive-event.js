export let supportPassive = false;
export let PASSIVE;

try {
  const opts = Object.defineProperty({}, 'passive', {
    get() {
      supportPassive = true;
      PASSIVE = { passive: true };

      return supportPassive;
    },
  });
  window.addEventListener('testPassive', null, opts);
  window.removeEventListener('testPassive', null, opts);
} catch (e) {
  supportPassive = false;
}
