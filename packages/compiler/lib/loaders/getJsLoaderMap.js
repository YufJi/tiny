const { SourceMapGenerator } = require('source-map');

module.exports = function getJsLoaderMap({ code, source, path }) {
  let map;
  const prefix = code.indexOf(source);

  if (prefix !== -1) {
    const prefixCode = code.slice(0, prefix);
    if (!prefixCode.match(/\n/g)) {
      return undefined;
    }
    const startLines = prefixCode.match(/\n/g).length;
    const file = path;
    map = new SourceMapGenerator({
      file,
      sourceRoot: '/',
    });
    const lines = source.split('\n');
    const allLines = lines.length;
    for (let i = 1; i <= allLines; i++) {
      const col = lines[i - 1].search(/[A-Za-z]/g) + 1 || 1;
      map.addMapping({
        source: file,
        original: {
          line: i,
          column: col,
        },
        generated: {
          line: i + startLines,
          column: col,
        },
      });
    }
    map.setSourceContent(file, source);
    map = map.toJSON();
  }
  return map;
};
