const doc = document;
const win = window;
function getNodeQuery(node, type) {
  if (type === 'rect') {
    const clientRect = node.getBoundingClientRect();
    const rect = {};
    // rect.left    // 节点的左边界坐标
    // rect.right   // 节点的右边界坐标
    // rect.top     // 节点的上边界坐标
    // rect.bottom  // 节点的下边界坐标
    // rect.width   // 节点的宽度
    // rect.height  // 节点的高度
    const rectProps = ['left', 'right', 'top', 'bottom', 'width', 'height'];
    for (let i = 0; i < rectProps.length; i++) {
      if (clientRect[rectProps[i]] !== undefined) {
        rect[rectProps[i]] = clientRect[rectProps[i]];
      }
    }
    return rect;
  } else if (type === 'scroll') {
    return {
      scrollTop: node.scrollTop,
      scrollLeft: node.scrollLeft,
    };
  }
}

export default function createSelectorQuery(actions, callback) {
  const ret = [];
  actions.forEach((action) => {
    const { selector, type } = action;
    const { value } = selector;
    const selectorType = selector.type;

    if (value === 'viewport') {
      if (type === 'rect') {
        ret.push({
          width: win.innerWidth,
          height: win.innerHeight,
        });
      } else if (type === 'scroll') {
        ret.push({
          scrollTop: win.pageYOffset,
          scrollLeft: win.pageXOffset,
        });
      }
    } else if (selectorType === 'all') {
      const nodes = [].slice.call(doc.querySelectorAll(value), 0);
      if (nodes.length) {
        ret.push(nodes.map((node) => {
          return getNodeQuery(node, type);
        }));
      } else {
        ret.push(null);
      }
    } else {
      const node = doc.querySelector(value);
      if (node) {
        ret.push(getNodeQuery(node, type));
      } else {
        ret.push(null);
      }
    }
  });
  callback(ret);
}
