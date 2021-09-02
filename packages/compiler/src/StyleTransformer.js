const css = require('css');
const assign = require('object-assign');
const autoprefixer = require('autoprefixer');
const defaultLib = require('./defaultLib');
const {
  relative,
  isNumber,
  escapeQuote,
  selectorTransformer,
  normalizePathForWin,
  checkImport,
} = require('./utils');

function resolveUrl(path, refered) {
  if (path.startsWith('/')) {
    return path;
  }
  if (!path.startsWith('./') && !path.startsWith('../')) {
    path = `./${path}`;
  }
  const referedParts = refered.split('/');
  if (referedParts[referedParts.length - 1]) {
    referedParts.pop();
  }
  const parts = referedParts.concat(path.split('/'));
  const res = [];
  for (const p of parts) {
    // ignore empty parts
    if (!p || p === '.') {
      // eslint-disable-next-line
      continue;
    }
    if (p === '..') {
      res.pop();
    } else {
      res.push(p);
    }
  }
  return `/${res.join('/')}`;
}

const transformedAssetsProperties = ['background-image', 'background'];

function processDeclarations(r, { source, pluginId } = {}) {
  const rules = ['{'];
  r.declarations.forEach((d) => {
    if (d.type === 'comment') {
      return;
    }
    if (d.type === 'declaration') {
      let value = String(d.value)
        .replace(/\\/g, '\\\\');
        // .replace(
        //   /\b((?:\d*\.\d+)|(?:\d+))rpx\b/g,
        //   (m, num) => `${parseFloat(num) / 100}rem`,
        // );
      if (pluginId && transformedAssetsProperties.indexOf(d.property) !== -1) {
        const pluginPrefix = `/__plugins__/${pluginId}`;
        value = value.replace(
          /url\((?!['"]?(?:data|https?):)['"]?([^'"\)]*)['"]?\)/g,
          (m, url) => {
            if (!m || !url) {
              return m;
            }
            const index = m.indexOf(url);
            const prefix = m.slice(0, index);
            const postfix = m.slice(index + url.length);
            return prefix + pluginPrefix + resolveUrl(url, source) + postfix;
          },
        );
      }
      rules.push(`    ${d.property}: ${value};`);
    }
  });
  rules.push('  }');
  return rules.join('\n');
}

function StyleTransformer(ss, config_) {
  this.ss = ss;
  const config = config_ || {};
  this.config = config;
  this.code = [];

  const { code } = this;
  const {
    appStyleTransformer,
    componentStyles,
    source,
  } = config;

  code.push(
    'const { TinyStyleSheet } = self;',
  );
  code.push(
    `const stylesheet = new TinyStyleSheet({ stylePath: '${escapeQuote(
      source,
      true,
      true,
    )}' });`,
  );
  if (
    appStyleTransformer
    && config.stylePath
    && config.stylePath !== appStyleTransformer.config.stylePath
  ) {
    code.push(
      `import appStyle from '${escapeQuote(
        normalizePathForWin(
          relative(config.stylePath, appStyleTransformer.config.stylePath),
        ),
        true,
        true,
      )}';`,
    );
    code.push('stylesheet.imports(appStyle);');
  }

  if (componentStyles && config.stylePath) {
    componentStyles.forEach((cs, index) => {
      code.push(
        `import cs${index} from '${escapeQuote(
          normalizePathForWin(relative(config.stylePath, cs.config.stylePath)),
          true,
          true,
        )}';`,
      );
      code.push(`stylesheet.imports(cs${index});`);
    });
  }
}

assign(StyleTransformer.prototype, {
  getCode() {
    if (this.codeStr) {
      return this.codeStr;
    }
    if (typeof this.ss === 'function') {
      this.ss = this.ss();
    }
    if (this.config.injectStyle) {
      this.transformInject();
    } else {
      this.transform();
    }
    return this.codeStr;
  },
  transformInject() {
    const { src, source, stylePath, styleExtname } = this.config;
    const { code } = this;
    const ast = css.parse(this.ss, {
      source,
    }).stylesheet.rules;
    const deps = [];
    this.ast = ast;
    const obj = [];
    const processRule = (r) => {
      if (r.type === 'comment') {
        return;
      }
      if (r.type === 'media') {
        obj.push(`@media ${r.media} {`);
        (r.rules || []).forEach((rule) => processRule(rule));
        obj.push('}');
      } else if (r.type === 'rule') {
        const { selectors } = r;
        const ts = selectors.map((selector) => selectorTransformer(selector, this.config));
        obj.push(`  ${ts.join(', ')} ${processDeclarations(r, this.config)}`);
      } else if (r.type === 'import') {
        deps.push(checkImport(r.import.slice(1, -1), styleExtname, stylePath, src));
      } else if (r.type === 'keyframes') {
        // console.log(JSON.stringify(r, null, 2));
        obj.push(`  @keyframes ${r.name} {`);
        r.keyframes.forEach((k) => {
          obj.push(
            `    ${k.values.join(',')} ${processDeclarations(k, this.config)}`,
          );
        });
        obj.push('  }');
      } else {
        obj.push(
          css.stringify({
            stylesheet: {
              rules: [r],
            },
          }),
        );
      }
    };

    ast.forEach(processRule);

    let cssCode = autoprefixer.process(obj.join('\n').trim(), {
      browsers: ['Android >= 4.0', 'iOS >= 8'],
    });

    if (cssCode.error) {
      throw cssCode.error;
    }

    cssCode = cssCode.css;
    const styles = [];
    deps.forEach((dep, index) => {
      code.push(`import style${index} from '${escapeQuote(dep, true, true)}';`);
      styles.push(`style${index}`);
    });
    if (styles.length) {
      code.push(`stylesheet.imports(${styles.join(',')});`);
    }
    code.push(
      `export default stylesheet.exports(\`${escapeQuote(cssCode, 1)}\`);`,
    );
    this.codeStr = this.code.join('\n');
  },
  transform() {
    const { src, source, stylePath } = this.config;
    const styleObj = {};
    const { code } = this;
    const ast = css.parse(this.ss, {
      source,
    }).stylesheet.rules;
    const deps = [];
    const common = [];
    ast.forEach((r) => {
      if (r.type === 'rule') {
        const { selectors } = r;
        const rules = ['{'];
        const allD = {};
        r.declarations.forEach((d) => {
          if (d.type === 'declaration') {
            allD[d.property] = 1;
            let { value } = d;
            if (!isNumber(value) || d.property === 'font-weight') {
              // rn requires string
              value = JSON.stringify(value);
            }
            rules.push(`  ${JSON.stringify(d.property)}: ${value},`);
          }
        });
        rules.push('  }');
        let v = rules.join('\n');
        if (selectors.length > 1) {
          common.push(v);
          v = `$${common.length}`;
        }
        selectors.forEach((selector) => {
          const normSelectorName = selectorTransformer(selector, this.config);
          if (styleObj[normSelectorName]) {
            styleObj[normSelectorName].push(v);
          } else {
            styleObj[normSelectorName] = [v];
          }
        });
      } else if (r.type === 'import') {
        deps.push(checkImport(r.import.slice(1, -1), '.wxss', stylePath, src));
      }
    });

    const styles = [];
    deps.forEach((dep, index) => {
      this.code.push(`import style${index} from ${JSON.stringify(dep)};`);
      styles.push(`style${index}`);
    });
    if (styles.length) {
      code.push(`stylesheet.imports(${styles.join(',')});`);
    }
    common.forEach((c, index) => {
      code.push(`const $${index + 1} = ${c};`);
    });
    const styleStr = ['{'];
    Object.keys(styleObj).forEach((sel) => {
      const vs = styleObj[sel];
      if (vs.length === 1) {
        styleStr.push(`  ${JSON.stringify(sel)}: ${vs[0]},`);
      } else {
        styleStr.push(
          `  ${JSON.stringify(sel)}: {\n${vs
            .map((v) => `    ...${v}`)
            .join(',\n')}\n    },`,
        );
      }
    });
    styleStr.push('}');
    code.push(`export default stylesheet.exports(${styleStr.join('\n')});`);
    this.codeStr = code.join('\n');
  },
});

module.exports = StyleTransformer;
