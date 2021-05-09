const loadedScripts = {};
export default function loadScript(src, callback) {
  let info = loadedScripts[src];
  if (info) {
    if (info.done) {
      callback();
      return;
    }
    info.queue.push(callback);
    return;
  }
  info = loadedScripts[src] = {
    done: false,
    queue: [callback],
  };
  const loadNode = document.createElement('script');
  document.head.appendChild(loadNode);
  loadNode.addEventListener('load', () => {
    setTimeout(() => {
      info.done = true;
      info.queue.forEach((c) => {
        return c();
      });
      info.queue = [];
    }, 100);
  });
  loadNode.src = src;
}
