const assign = require('object-assign');
const fs = require('fs');
const StyleTransformer = require('./StyleTransformer');

exports.getStyleTransformer = (stylePath, config) => {
  if (fs.existsSync(stylePath)) {
    // in case throw ...
    return new StyleTransformer(
      () => fs.readFileSync(stylePath, 'utf-8'),
      assign(
        {
          stylePath,
        },
        config,
      ),
    );
  }
  return undefined;
};
