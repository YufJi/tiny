// resolves . and .. elements in a path array with directory names there
// must be no slashes or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
  const res = [];
  for (let i = 0; i < parts.length; i++) {
    const p = parts[i];

    // ignore empty parts
    if (!p || p === '.') { continue; }

    if (p === '..') {
      if (res.length && res[res.length - 1] !== '..') {
        res.pop();
      } else if (allowAboveRoot) {
        res.push('..');
      }
    } else {
      res.push(p);
    }
  }

  return res;
}

// returns an array with empty elements removed from either end of the input
// array or the original array if no elements need to be removed
function trimArray(arr) {
  const lastIndex = arr.length - 1;
  let start = 0;
  for (; start <= lastIndex; start++) {
    if (arr[start]) { break; }
  }

  let end = lastIndex;
  for (; end >= 0; end--) {
    if (arr[end]) { break; }
  }

  if (start === 0 && end === lastIndex) { return arr; }
  if (start > end) { return []; }
  return arr.slice(start, end + 1);
}

// Split a filename into [root, dir, basename, ext], unix version
// 'root' is just a slash, or nothing.
const splitPathRe = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
const posix: any = {};

function posixSplitPath(filename) {
  return splitPathRe.exec(filename).slice(1);
}

// path.resolve([from ...], to)
// posix version
posix.resolve = function () {
  let resolvedPath = '';
  let resolvedAbsolute = false;

  for (let i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
    const path = (i >= 0) ? arguments[i] : process.cwd();

    // Skip empty and invalid entries
    if (typeof path !== 'string') {
      throw new TypeError('Arguments to path.resolve must be strings');
    } else if (!path) {
      continue;
    }

    resolvedPath = `${path}/${resolvedPath}`;
    resolvedAbsolute = path[0] === '/';
  }

  // At this point the path should be resolved to a full absolute path, but
  // handle relative paths to be safe (might happen when process.cwd() fails)

  // Normalize the path
  resolvedPath = normalizeArray(resolvedPath.split('/'),
    !resolvedAbsolute).join('/');

  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
};

// path.normalize(path)
// posix version
posix.normalize = function (path) {
  const isAbsolute = posix.isAbsolute(path);
  const trailingSlash = path && path[path.length - 1] === '/';

  // Normalize the path
  path = normalizeArray(path.split('/'), !isAbsolute).join('/');

  if (!path && !isAbsolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }

  return (isAbsolute ? '/' : '') + path;
};

// posix version
posix.isAbsolute = function (path) {
  return path.charAt(0) === '/';
};

// posix version
posix.join = function () {
  let path = '';
  for (let i = 0; i < arguments.length; i++) {
    const segment = arguments[i];
    if (typeof segment !== 'string') {
      throw new TypeError('Arguments to path.join must be strings');
    }
    if (segment) {
      if (!path) {
        path += segment;
      } else {
        path += `/${segment}`;
      }
    }
  }
  return posix.normalize(path);
};

// path.relative(from, to)
// posix version
posix.relative = function (from, to) {
  from = posix.resolve(from).substr(1);
  to = posix.resolve(to).substr(1);

  const fromParts = trimArray(from.split('/'));
  const toParts = trimArray(to.split('/'));

  const length = Math.min(fromParts.length, toParts.length);
  let samePartsLength = length;
  for (let i = 0; i < length; i++) {
    if (fromParts[i] !== toParts[i]) {
      samePartsLength = i;
      break;
    }
  }

  let outputParts = [];
  for (let i = samePartsLength; i < fromParts.length; i++) {
    outputParts.push('..');
  }

  outputParts = outputParts.concat(toParts.slice(samePartsLength));

  return outputParts.join('/');
};

posix.dirname = function (path) {
  const result = posixSplitPath(path);
  const root = result[0];
  let dir = result[1];

  if (!root && !dir) {
    // No dirname whatsoever
    return '.';
  }

  if (dir) {
    // It has a dirname, strip trailing slash
    dir = dir.substr(0, dir.length - 1);
  }

  return root + dir;
};

posix.basename = function (path, ext) {
  let f = posixSplitPath(path)[2];
  // TODO: make this comparison case-insensitive on windows?
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};

posix.extname = function (path) {
  return posixSplitPath(path)[3];
};

posix.format = function (pathObject) {
  if (typeof pathObject !== 'object' || pathObject === null) {
    throw new TypeError(
      `Parameter 'pathObject' must be an object, not ${typeof pathObject}`,
    );
  }

  const root = pathObject.root || '';

  if (typeof root !== 'string') {
    throw new TypeError(
      `'pathObject.root' must be a string or undefined, not ${
        typeof pathObject.root}`,
    );
  }

  const dir = pathObject.dir ? pathObject.dir + posix.sep : '';
  const base = pathObject.base || '';
  return dir + base;
};

posix.parse = function (pathString) {
  if (typeof pathString !== 'string') {
    throw new TypeError(
      `Parameter 'pathString' must be a string, not ${typeof pathString}`,
    );
  }
  const allParts = posixSplitPath(pathString);
  if (!allParts || allParts.length !== 4) {
    throw new TypeError(`Invalid path '${pathString}'`);
  }
  allParts[1] = allParts[1] || '';
  allParts[2] = allParts[2] || '';
  allParts[3] = allParts[3] || '';

  return {
    root: allParts[0],
    dir: allParts[0] + allParts[1].slice(0, -1),
    base: allParts[2],
    ext: allParts[3],
    name: allParts[2].slice(0, allParts[2].length - allParts[3].length),
  };
};

posix.sep = '/';
posix.delimiter = ':';

export default posix;
