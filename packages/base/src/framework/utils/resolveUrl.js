/*
 * @Author: YufJ
 * @Date: 2021-04-14 11:07:18
 * @LastEditTime: 2021-07-14 19:45:19
 * @Description:
 * @FilePath: /tiny-v1/packages/base/src/framework/utils/resolveUrl.js
 */
import startsWith from '@/utils/startsWith';

export default function resolveUrl(path, refered) {
  if (startsWith(path, '/')) {
    return path;
  }
  if (!startsWith(path, './') && !startsWith(path, '../')) {
    path = `./${path}`;
  }
  const referedParts = refered.split('/');

  if (referedParts[referedParts.length - 1]) {
    referedParts.pop();
  }
  const parts = referedParts.concat(path.split('/'));
  const res = [];
  parts.forEach((p) => {
    // ignore empty parts
    if (!p || p === '.') {
      return;
    }
    if (p === '..') {
      res.pop();
    } else {
      res.push(p);
    }
  });
  return res.join('/');
}
