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
