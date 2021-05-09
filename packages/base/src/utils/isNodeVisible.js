// 判断两个矩阵是否相交
const isRectIntersect = function isRectIntersect(rect1, rect2, appearOffset) {
  const newLeft = Math.max(rect1.left - appearOffset, rect2.left);
  const newTop = Math.max(rect1.top - appearOffset, rect2.top);
  const newRight = Math.min(rect1.right, rect2.right);
  const newBottom = Math.min(rect1.bottom, rect2.bottom);
  return !(newLeft > newRight || newTop > newBottom);
};
export default function isNodeVisible(element, scrollParent, appearOffset = 0) {
  if (!element) {
    return false;
  }
  const elementRect = element.getBoundingClientRect();
  // 面积为0
  if (elementRect.width * elementRect.height === 0) {
    return false;
  }
  const docEl = document.documentElement;
  const viewport = {
    top: 0,
    left: 0,
    bottom: docEl.clientHeight,
    right: docEl.clientWidth,
  };
    // 没有局部滚动的父元素
  if (scrollParent === undefined) {
    return isRectIntersect(elementRect, viewport, appearOffset);
  } else {
    const parentRect = scrollParent.getBoundingClientRect();
    // 父元素是否可见
    const parentNodeIsVisible = isRectIntersect(parentRect, viewport, appearOffset);
    if (parentNodeIsVisible) {
      // 父元素 且子元素在父元素和window下都可见
      return isRectIntersect(elementRect, viewport, appearOffset) && isRectIntersect(elementRect, parentRect, appearOffset);
    } else {
      return false;
    }
  }
}
