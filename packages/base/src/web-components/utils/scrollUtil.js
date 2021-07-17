/*
 * @Author: YufJ
 * @Date: 2021-06-02 23:52:03
 * @LastEditTime: 2021-07-14 13:35:09
 * @Description:
 * @FilePath: /tiny-v1/packages/base/src/web-components/utils/scrollUtil.js
 */
import debounce from '@/utils/debounce';
import { elementPrefix, UpperCasePerfix } from '@/utils/config';

const registeredImages = {};

let uid = 0;

const i = () => {
  for (const id in registeredImages) {
    const n = registeredImages[id];
    hasScrollViewParent(n) && isNodeVisible(n) && n._showImage(n._changeId);
  }
};

const checkUnloadedImages = debounce(() => {
  for (const id in registeredImages) {
    const n = registeredImages[id];
    isNodeVisible(n) && n._showImage(n._changeId);
  }
}, 200);

document.addEventListener(`${elementPrefix}-scroll-view`, debounce(i, 200));
document.addEventListener('h5-scroll', checkUnloadedImages);
document.addEventListener('scroll', checkUnloadedImages);

const hasScrollViewParent = (t) => {
  const n = t.parentNode;

  if (!n) {
    return false;
  }

  if (n.tagName === `${UpperCasePerfix}-SCROLL-VIEW`) {
    return true;
  }

  return hasScrollViewParent(n);
};

const l = function l(e, t) {
  return !(e.left > t.right || e.top > t.bottom || t.left > e.right || t.top > e.bottom);
};

const isNodeVisible = (e) => {
  const t = 2 * document.documentElement.clientWidth;
  const n = 2 * document.documentElement.clientHeight;

  return l(e.getBoundingClientRect(), {
    top: -n,
    right: document.documentElement.clientWidth + t,
    bottom: document.documentElement.clientHeight + n,
    left: -t,
  });
};

const scrollUtil = {
  registerInstance(item) {
    if (!item._imageInstanceId) {
      item._imageInstanceId = uid++;

      const id = item._imageInstanceId;

      registeredImages[id] = item;
    }
  },
  deregisterInstance(item) {
    if (item._imageInstanceId) {
      delete registeredImages[item._imageInstanceId];
      item._imageInstanceId = undefined;
    }
  },
  hasScrollViewParent,
  isNodeVisible,
  checkUnloadedImages,
};

export default scrollUtil;
