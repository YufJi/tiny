import { isNil } from 'lodash';
import { guid } from '../../util';
import { querySelector } from './query';

let scheduleLock = false;
const observeTriggerMap = new Map();

export function requestObserver(root, req, cb) {
  const { targetSelector, relativeInfo, options = {} } = req;

  if (isNil(root) || !relativeInfo || !targetSelector) return '';

  const observelist = queryTargets(root, targetSelector, options && options.observeAll);

  if (observelist.length === 0) return '';

  const relativeInfolist = queryRelativeTargets(root, relativeInfo);

  if (relativeInfolist.length === 0) return '';

  const observerId = registerObserver(observelist, relativeInfolist, cb, options);
  scheduleIntersectionCompute();

  return observerId;
}

function queryTargets(root, targetSelector, observeAll) {
  let targets;
  if (observeAll) {
    targets = querySelectorAll(targetSelector, root);
  } else {
    const target = querySelector(targetSelector, root);
    targets = target ? [target] : [];
  }

  return targets;
}

export function initTriggerListener(emitter) {
  if (window && document) {
    emitter.on('RE_RENDER', scheduleIntersectionCompute);

    window.addEventListener('scroll', () => {
      scheduleIntersectionCompute();
    }, { capture: true, passive: true });
  }
}

function scheduleIntersectionCompute() {
  if (!scheduleLock) {
    scheduleLock = true;
    requestAnimationFrame(() => {
      scheduleLock = false;
      getTargets().forEach((target) => {
        trigger(target);
      });
    });
  }
}

function getTargets() {
  return Array.from(observeTriggerMap.values());
}

function registerObserver(observelist, relatives, callback, options = {}) {
  const { thresholds = [0], initialRatio = 0 } = options;
  const id = guid();

  observelist.forEach((targetNode) => {
    const result = {
      options: { thresholds, initialRatio },
      targetNode,
      relatives,
      callback,
    };
    observeTriggerMap.set([id, targetNode], result);
  });

  return id;
}

export function removeObserver(observerId) {
  Array.from(observeTriggerMap.keys()).forEach((key) => {
    const [id, node] = key;
    id === observerId && observeTriggerMap.delete([id, node]);
  });
}

const MIN_WIDTH_OR_HEIGHT = 0;

function trigger(result) {
  const { targetNode, relatives, options, callback } = result;
  const { thresholds, initialRatio } = options;

  const minRelativeRect = getMinRelativeRect(relatives);

  const observeRect = cloneValue(targetNode.getBoundingClientRect());

  if (observeRect.right - observeRect.left < MIN_WIDTH_OR_HEIGHT) {
    observeRect.right = observeRect.left + MIN_WIDTH_OR_HEIGHT;
    observeRect.width = MIN_WIDTH_OR_HEIGHT;
  }

  if (observeRect.bottom - observeRect.top < MIN_WIDTH_OR_HEIGHT) {
    observeRect.bottom = observeRect.top + MIN_WIDTH_OR_HEIGHT;
    observeRect.height = MIN_WIDTH_OR_HEIGHT;
  }

  const intersectionRect = computeIntersection(minRelativeRect, observeRect);
  const observeArea = observeRect.width * observeRect.height;
  const newRatio = observeArea ? intersectionRect.width * intersectionRect.height / observeArea : 0;

  result.initialRatio = newRatio;
  let triggerFlag = initialRatio === undefined;

  if (newRatio !== initialRatio) {
    thresholds.forEach((threshold) => {
      if (triggerFlag) {
        return false;
      }

      if (newRatio <= threshold && threshold <= initialRatio) {
        triggerFlag = true;
      } else if (threshold <= newRatio && initialRatio <= threshold) {
        triggerFlag = true;
      }
    });
  }

  if (triggerFlag) {
    callback.call(targetNode, {
      id: targetNode.id,
      dataset: targetNode._dataset || {},
      time: Date.now(),
      intersectionRatio: newRatio,
      boundingClientRect: observeRect,
      intersectionRect,
      relativeRect: minRelativeRect,
    });
  }
}

function cloneValue(rect = {}) {
  return {
    left: rect.left,
    top: rect.top,
    right: rect.right,
    bottom: rect.bottom,
    width: rect.width,
    height: rect.height,
  };
}

function computeIntersection(relativeRect, rect) {
  const intersectionRect = {
    left: Math.max(relativeRect.left, rect.left),
    top: Math.max(relativeRect.top, rect.top),
    right: Math.min(relativeRect.right, rect.right),
    bottom: Math.min(relativeRect.bottom, rect.bottom),
    width: 0,
    height: 0,
  };

  if (intersectionRect.right > intersectionRect.left) {
    intersectionRect.width = intersectionRect.right - intersectionRect.left;
  } else {
    intersectionRect.right = 0;
    intersectionRect.left = 0;
    intersectionRect.bottom = 0;
    intersectionRect.top = 0;
  }

  if (intersectionRect.bottom > intersectionRect.top) {
    intersectionRect.height = intersectionRect.bottom - intersectionRect.top;
  } else {
    intersectionRect.right = 0;
    intersectionRect.left = 0;
    intersectionRect.bottom = 0;
    intersectionRect.top = 0;
  }

  return intersectionRect;
}

function getMinRelativeRect(relatives) {
  const { clientWidth, clientHeight } = document.documentElement;
  let relativeRect = null;

  for (let i = 0, l = relatives.length; i < l; i+=1) {
    const { node, margins } = relatives[i];
    const currentRect = node ? node.getBoundingClientRect() : {
      left: 0,
      top: 0,
      right: clientWidth,
      bottom: clientHeight,
      width: clientWidth,
      height: clientHeight,
    };
    const currentRectMargin = {
      left: currentRect.left - margins.left,
      top: currentRect.top - margins.top,
      right: currentRect.right + margins.right,
      bottom: currentRect.bottom + margins.bottom,
    };
    relativeRect = relativeRect ? computeIntersection(relativeRect, currentRectMargin) : currentRectMargin;
  }

  return relativeRect;
}

function queryRelativeTargets(rootdom, relativeInfo) {
  const relativeInfolist = [];
  relativeInfo.forEach(({ selector = null, margins = {} }) => {
    const {
      left = 0,
      top = 0,
      right = 0,
      bottom = 0,
    } = margins;
    const node = selector === null ? null : querySelector(selector, rootdom);

    if (selector === null || node) {
      relativeInfolist.push({
        node: node ? node.dom : node,
        margins: {
          left,
          top,
          right,
          bottom,
        },
      });
    } else {
      console.warn(`For developer:Node ${selector} is not found. The relative node for intersection observer will be ignored.`);
    }
  });
}
