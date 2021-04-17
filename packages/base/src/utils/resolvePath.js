
import startsWith from './startsWith';

export default function resolvePath(path, refered) {
  if (!startsWith(path, './') && !startsWith(path, '../')) {
    return path;
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
  let ret = res.join('/');
  if (startsWith(refered, '/') && !startsWith(ret, '/')) {
    ret = `/${ret}`;
  }
  return ret;
}
