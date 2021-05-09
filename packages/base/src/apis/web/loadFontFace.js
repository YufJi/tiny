export default ({
  loadFontFace: function loadFontFace(data = {}, success, fail) {
    const { family = '', source = '', desc = {} } = data;
    const { fonts } = document;
    if (fonts) {
      const fontFace = new FontFace(family, source, desc);
      fontFace.load().then((res) => {
        success({ status: res.status });
        fonts.add(fontFace);
      }, () => {
        fail({
          status: fontFace.status,
        });
      });
    } else {
      if (!family || !source) {
        fail({ status: 'error' });
        return;
      }
      const style = document.createElement('style');
      const node = `@font-face {font-family: "${family}"; src: ${source}; font-weight: ${desc.weight}; font-stretch: ${desc.stretch}; font-variant: ${desc.variant}; font-feature-setting:${desc.featureSetting}; unicode-range: ${desc.unicodeRange}; font-style: ${desc.style}; }`;
      style.appendChild(document.createTextNode(node));
      document.head.appendChild(style);
      success({
        status: 'loaded',
      });
    }
  },
});
