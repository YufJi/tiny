export * from './mergeData';
export * from './transformRpx';

export function getRealRoute(relative = '', path = '') {
  if (path.indexOf('/') === 0) {
    return path.substr(1);
  }

  if (path.indexOf('./') === 0) {
    return getRealRoute(relative, path.substr(2));
  }

  let count = 0;
  const pathParts = path.split('/');

  for (let i = 0; i < pathParts.length; i+=1) {
    if (pathParts[i] === '..') {
      count+=1;
    } else {
      break;
    }
  }

  pathParts.splice(0, count);

  const relativeParts = relative.length > 0 ? relative.split('/') : [];

  relativeParts.splice(relativeParts.length - count, count);

  return relativeParts.concat(pathParts).join('/');
}
