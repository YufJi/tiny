import Nerv, { createNervClass } from '@/nerv';
import BasicEventMixin from '../mixins/BasicEventMixin';

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
  mixins: [BasicEventMixin()],
  render: function render() {
    const _props = this.props;
    const { children } = _props;
    const { style } = _props;
    const { selectable } = _props;
    const { id } = _props;
    const { space } = _props;
    const { decode } = _props;
    const _props2 = this.props;
    const _props2$className = _props2.className;
    let className = _props2$className === undefined ? '' : _props2$className;
    let { numberOfLines } = _props2;

    let retStyle = { WebkitUserSelect: selectable ? 'text' : 'none', ...style };
    className += ` a-text-${space ? '' : 'no'}-space`;
    if (typeof numberOfLines === 'string') {
      numberOfLines = parseInt(numberOfLines, 10);
    }
    if (numberOfLines > 0) {
      retStyle = { overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: numberOfLines, WebkitBoxOrient: 'vertical', ...retStyle };
    }
    let nodes;
    nodes = [];
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
    let clickable = {};
    if (this.props.onTap || this.props.catchTap) {
      clickable = {
        'data-clickable': true,
      };
    }
    return Nerv.createElement('span', { className, onClick: this.onTap, style: retStyle, id, ...clickable, ...this.props.$mp.getAriaProps() }, nodes);
  },
});
