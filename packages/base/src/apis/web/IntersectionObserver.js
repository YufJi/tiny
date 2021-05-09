import { getCurrentPageImpl } from '@/framework/';
import requestAnimationFrame from '@/utils/requestAnimationFrame';

let requestAnimationFrameing = false;
const intersectionObservers = {};
const subIntersectionObservers = {};
const formatMargins = function formatMargins(margins = {}) {
  return {
    left: margins.left || 0,
    top: margins.top || 0,
    right: margins.right || 0,
    bottom: margins.bottom || 0,
  };
};
const formatRect = function formatRect(params = {}) {
  return {
    left: params.left,
    top: params.top,
    right: params.right,
    bottom: params.bottom,
    width: params.width,
    height: params.height,
  };
};
// 矩阵相交计算
const getIntersectRect = function getIntersectRect(rect1, rect2) {
  const intersectRect = {
    left: rect1.left < rect2.left ? rect2.left : rect1.left,
    top: rect1.top < rect2.top ? rect2.top : rect1.top,
    right: rect1.right > rect2.right ? rect2.right : rect1.right,
    bottom: rect1.bottom > rect2.bottom ? rect2.bottom : rect1.bottom,
    width: 0,
    height: 0,
  };
  if (intersectRect.right > intersectRect.left) {
    intersectRect.width = intersectRect.right - intersectRect.left;
  } else {
    intersectRect.right = intersectRect.left = intersectRect.bottom = intersectRect.top = 0;
  }
  if (intersectRect.bottom > intersectRect.top) {
    intersectRect.height = intersectRect.bottom - intersectRect.top;
  } else {
    intersectRect.right = intersectRect.left = intersectRect.bottom = intersectRect.top = 0;
  }
  return intersectRect;
};
// 返回所有参照节点的相交矩阵
const getRelativeIntersectRect = function getRelativeIntersectRect(relatives) {
  const _document$documentEle = document.documentElement;
  const { clientWidth, clientHeight } = _document$documentEle;

  let relativeIntersectRect = null;
  for (let i = 0; i < relatives.length; i++) {
    const _relatives$i = relatives[i];
    const { node } = _relatives$i;
    const { margins } = _relatives$i;

    const relativeRect = node ? node.getBoundingClientRect() : {
      left: 0,
      top: 0,
      right: clientWidth,
      bottom: clientHeight,
      width: clientWidth,
      height: clientHeight,
    };
    const relativeRectWithMargins = {
      left: relativeRect.left - margins.left,
      top: relativeRect.top - margins.top,
      right: relativeRect.right + margins.right,
      bottom: relativeRect.bottom + margins.bottom,
    };
    relativeIntersectRect = relativeIntersectRect ? getIntersectRect(relativeIntersectRect, relativeRectWithMargins) : relativeRectWithMargins;
  }
  return relativeIntersectRect;
};
// 判断节点是否相交
const checkIntersection = function checkIntersection(params) {
  const { targetNode, relatives, thresholds, currentRatio, intersectionObserverId } = params;

  // 执行检测的时候节点已经消失

  if (!targetNode) {
    return;
  }
  const relativeIntersectRect = getRelativeIntersectRect(relatives);
  const rect = formatRect(targetNode.getBoundingClientRect());
  const intersectRect = getIntersectRect(relativeIntersectRect, rect);
  const area = rect.width * rect.height;
  const latestCurrentRatio = area ? intersectRect.width * intersectRect.height / area : 0;
  // 有点绕，请注意
  params.currentRatio = latestCurrentRatio;
  let shouldFireIntersectionEvent = undefined === currentRatio;
  if (currentRatio !== latestCurrentRatio) {
    thresholds.forEach((threshold) => {
      if (shouldFireIntersectionEvent) return false;
      if (latestCurrentRatio <= threshold && currentRatio >= threshold) {
        shouldFireIntersectionEvent = true;
      } else if (latestCurrentRatio >= threshold && currentRatio <= threshold) {
        shouldFireIntersectionEvent = true;
      }
    });
  }
  if (shouldFireIntersectionEvent) {
    getCurrentPageImpl().callRemote('bridge', '_fireIntersectionObserver', {
      intersectionObserverId,
      info: {
        id: targetNode.id,
        dataset: targetNode.dataset,
        time: Date.now(),
        boundingClientRect: rect,
        intersectionRatio: latestCurrentRatio,
        intersectionRect: formatRect(intersectRect),
        relativeRect: relativeIntersectRect,
      },
    });
  }
};
const handleIntersectionObserver = function handleIntersectionObserver(targetNodeArr, relatives, thresholds, currentRatio, intersectionObserverId) {
  if (!targetNodeArr.length || !relatives.length) {
    return;
  }
  intersectionObservers[intersectionObserverId] = targetNodeArr.length;
  targetNodeArr.forEach((targetNode, index) => {
    const subIntersectionObserverId = `${intersectionObserverId}@${index}`;
    const IntersectionParams = {
      targetNode,
      relatives,
      thresholds,
      currentRatio,
      intersectionObserverId,
    };
    // 当执行时目标已经已经移除
    if (!targetNode) {
      delete subIntersectionObservers[subIntersectionObserverId];
      --intersectionObservers[intersectionObserverId];
    } else {
      subIntersectionObservers[subIntersectionObserverId] = IntersectionParams;
      requestAnimationFrame((_timestamp) => {
        checkIntersection(IntersectionParams);
      });
    }
  });
};
function checkAllIntersection() {
  for (const subIntersectionObserverId in subIntersectionObservers) {
    checkIntersection(subIntersectionObservers[subIntersectionObserverId]);
  }
  requestAnimationFrameing = false;
}
// 添加节点相交查询
export function addIntersectionObserver(_ref) {
  const { intersectionObserverId, options, relativeInfo, targetSelector } = _ref;

  let targetNodeArr = [];
  if (options.selectAll) {
    targetNodeArr = document.querySelectorAll(targetSelector);
  } else {
    const targetNode = document.querySelector(targetSelector);
    targetNodeArr = targetNode ? [targetNode] : [];
  }
  if (!targetNodeArr.length) {
    console.warn(`\u76EE\u6807\u8282\u70B9${targetSelector}\u672A\u627E\u5230\uFF0C\u5F53\u524D\u76D1\u542C\u672A\u751F\u6548`);
  }
  const relatives = [];
  relativeInfo.forEach((info) => {
    const { selector } = info;
    const { margins } = info;

    let node;
    if (selector == null) {
      node = null;
    } else {
      node = document.querySelector(selector);
    }
    if (node || selector == null) {
      relatives.push({
        node,
        margins: formatMargins(margins),
      });
    } else {
      console.warn(`\u53C2\u7167\u8282\u70B9${selector}\u672A\u627E\u5230\uFF0C\u6B64\u53C2\u7167\u8282\u70B9\u5C06\u4F1A\u88AB\u5FFD\u7565`);
    }
  });
  if (!relatives.length) {
    console.warn('未找到任何参照节点，当前监听未生效');
  }
  return handleIntersectionObserver(targetNodeArr, relatives, options.thresholds, options.initialRatio, intersectionObserverId);
}

export function removeIntersectionObserver(intersectionObserverId) {
  const len = intersectionObservers[intersectionObserverId];
  for (let i = 0; i < len; i++) {
    const subIntersectionObserverId = `${intersectionObserverId}@${i}`;
    delete subIntersectionObservers[subIntersectionObserverId];
  }
  delete intersectionObservers[intersectionObserverId];
}

export function scheduleIntersectionUpdate() {
  if (!requestAnimationFrameing) {
    requestAnimationFrame(() => {
      requestAnimationFrameing = true;
      checkAllIntersection();
    });
  }
}
