import Nerv, { createNervClass } from '@/nerv';

let test;
const cache = {};
function getLiteralText(text) {
  if (cache[text]) {
    return cache[text];
  }
  if (!test) {
    test = document.createElement('div');
  }
  test.innerHTML = text;
  cache[text] = test.textContent;
  return cache[text];
}
const validSpace = {
  ensp: 1,
  emsp: 1,
};
function transformSpace(str, o) {
  if (validSpace[o]) {
    return str.replace(/ /g, getLiteralText(`&${o};`));
  }
  return str;
}
const keys = ['&nbsp;', '&lt;', '&gt;', '&amp;', '&apos;', '&ensp;', '&emsp;'];
const replaceEncodeReg = new RegExp(keys.join('|'), 'g');
function decodeStr(str) {
  return str.replace(replaceEncodeReg, (m) => {
    return getLiteralText(m);
  });
}

export default createNervClass({
  displayName: 'Text',
  mixins: [

  ],
  render: function render() {
    const { children, style, selectable, id, space, decode, $mp, ...rest } = this.props;
    let { className = '', numberOfLines } = this.props;

    let retStyle = { WebkitUserSelect: selectable ? 'text' : 'none', ...style };
    className += ` a-text-${space ? '' : 'no'}-space`;
    if (typeof numberOfLines === 'string') {
      numberOfLines = parseInt(numberOfLines, 10);
    }
    if (numberOfLines > 0) {
      retStyle = { overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: numberOfLines, WebkitBoxOrient: 'vertical', ...retStyle };
    }
    const nodes = [];

    Nerv.Children.forEach(children, (c) => {
      if (typeof c === 'string') {
        if (decode) {
          c = decodeStr(c);
        }
        if (space && space !== 'nbsp') {
          c = transformSpace(c, space);
        }
        // compatible
        c = c.replace(/\\n/g, '\n');
      }
      nodes.push(c);
    });

    return Nerv.createElement('span', {
      className,
      style: retStyle,
      id,
      ...$mp.getAriaProps(),
      ...rest,
    }, nodes);
  },
});
