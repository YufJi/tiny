
window.requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame;

export default (window.requestAnimationFrame || (window.requestAnimationFrame = function (callback) {
  typeof callback === 'function' && setTimeout(() => {
    callback();
  }, 17);
}));
