const { ModuleFilenameHelpers } = require('webpack');
const { RawSource, SourceMapSource } = require('webpack-sources');
const { transformSync } = require('esbuild');

module.exports = class ESBuildPlugin {
  constructor(options = {}) {
    this.options = options;
  }

  apply(compiler) {
    const matchObject = ModuleFilenameHelpers.matchObject.bind(undefined, {});
    const { devtool } = compiler.options;

    const plugin = 'ESBuildPlugin';
    compiler.hooks.compilation.tap(plugin, (compilation) => {
      compilation.hooks.optimizeChunkAssets.tapPromise(plugin, async (chunks) => {
        for (const chunk of chunks) {
          for (const file of chunk.files) {
            if (!matchObject(file)) {
              continue;
            }
            /* abc.mjs?sadfsaf=asf */
            if (!/\.m?js(\?.*)?$/i.test(file)) {
              continue;
            }

            const assetSource = compilation.assets[file];
            const { source, map } = assetSource.sourceAndMap();
            const result = this.transformCode({
              source,
              file,
              devtool,
            });

            compilation.updateAsset(file, () => {
              if (devtool) {
                return new SourceMapSource(
                  result.code || '',
                  file,
                  result.map,
                  source,
                  map,
                  true,
                );
              } else {
                return new RawSource(result.code || '');
              }
            });
          }
        }
      });
    });
  }

  transformCode({
    source,
    file,
    devtool,
  }) {
    const result = transformSync(source, {
      ...this.options,
      minify: true,
      sourcefile: file,
      sourcemap: !!devtool,
    });

    return result;
  }
};
