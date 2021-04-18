
import React from 'react';
import createReactClass from 'create-react-class';
import Touchable from 'rc-touchable';
import { createComponent } from '@/framework/';
import objectKeys from '@/utils/objectKeys';
import BasicEventMixin from '@/mixins/BasicEventMixin';
import { isArray } from '@/utils/types';

const codes = {
  amp: '&',
  gt: '>',
  lt: '<',
  nbsp: ' ',
  quot: '"',
  apos: "'",
};
function decode(text) {
  return text.replace(/&([a-zA-Z]*?);/g, (match, p) => {
    if (codes.hasOwnProperty(p) && codes[p]) {
      return codes[p];
    }
    if (/^#[0-9]{1,4}$/.test(p)) {
      return String.fromCharCode(p.slice(1));
    }
    if (/^#x[0-9a-f]{1,4}$/i.test(p)) {
      return String.fromCharCode(`0${p.slice(1)}`);
    }
    throw new Error(`HTML Entity "${match}" is not supported.`);
  });
}
const Rules = {
  a: 1,
  abbr: 1,
  b: 1,
  blockquote: 1,
  br: 1,
  code: 1,
  col: {
    span: 1,
    width: 1,
  },
  colgroup: {
    span: 1,
    width: 1,
  },
  dd: 1,
  del: 1,
  div: 1,
  dl: 1,
  dt: 1,
  em: 1,
  fieldset: 1,
  h1: 1,
  h2: 1,
  h3: 1,
  h4: 1,
  h5: 1,
  h6: 1,
  hr: 1,
  i: 1,
  img: {
    alt: 1,
    src: 1,
    height: 1,
    width: 1,
  },
  ins: 1,
  label: 1,
  legend: 1,
  li: 1,
  ol: {
    start: 1,
    type: 1,
  },
  p: 1,
  q: 1,
  span: 1,
  strong: 1,
  sub: 1,
  sup: 1,
  table: {
    width: 1,
  },
  tbody: 1,
  td: {
    colspan: 1,
    height: 1,
    rowspan: 1,
    width: 1,
  },
  tfoot: 1,
  th: {
    colspan: 1,
    height: 1,
    rowspan: 1,
    width: 1,
  },
  thead: 1,
  tr: 1,
  ul: 1,
};
const RichText = createComponent({
  name: 'rich-text',
})(createReactClass({
  displayName: 'RichText',
  getDefaultProps: function getDefaultProps() {
    return {
      nodes: [],
    };
  },

  mixins: [BasicEventMixin()],
  getNodeProps: function getNodeProps(node, tagName) {
    const _this = this;

    const props = {};
    if (typeof node.attrs !== 'object') {
      return {};
    }
    const rule = Rules[tagName];
    objectKeys(node.attrs).forEach((key) => {
      const attr = key.toLowerCase();
      const attrValue = decode(node.attrs[key]);
      if (attr === 'class') {
        props.className = attrValue;
      } else if (attr === 'style') {
        props.style = _this.props.$mp.getNormalizedStyle(attrValue);
      } else if (rule && rule.hasOwnProperty(attr) && rule[attr]) {
        props[attr] = attrValue;
      }
    });
    return props;
  },
  parseNodes: function parseNodes(nodes) {
    const _this2 = this;

    const res = [];
    nodes.forEach((node) => {
      if (typeof node === 'object') {
        const isNodeType = undefined === node.type || node.type === 'node' || node.type === '';
        const isTextType = node.type === 'text' && typeof node.text === 'string' && node.text !== '';
        const hasName = typeof node.name === 'string' && node.name !== '';
        if (isNodeType && hasName) {
          const TagName = node.name.toLowerCase();
          if (Rules.hasOwnProperty(TagName) && Rules[TagName]) {
            let children = null;
            const props = _this2.getNodeProps(node, TagName);
            if (isArray(node.children) && node.children.length) {
              children = _this2.parseNodes(node.children);
            }
            const n = React.createElement(
              TagName,
              props,
              children,
            );
            res.push(n);
          }
        } else if (isTextType) {
          res.push(decode(node.text));
        }
      }
    });
    return res;
  },
  renderContent: function renderContent() {
    const { nodes } = this.props;

    let content;
    if (isArray(nodes)) {
      try {
        content = this.parseNodes(nodes);
      } catch (e) {
        console.error(e);
        content = null;
      }
    } else {
      content = null;
      console.group(`${new Date()} nodes属性只支持 Array 类型`);
      console.warn('For developer:nodes属性只支持 Array 类型，请检查输入的值。');
      console.groupEnd();
    }
    return content;
  },
  render: function render() {
    const { className, style, id } = this.props;

    const props = {
      id,
      className,
      style,
    };
    const nodeEvents = {
      onClick: this.onTap,
      onTouchStart: this.onTouchStart,
      onTouchMove: this.onTouchMove,
      onTouchEnd: this.onTouchEnd,
      onTouchCancel: this.onTouchCancel,
    };
    const events = {};
    if (this.hasBubbleEvent('LongTap')) {
      events.onLongPress = this.onLongTap;
    }
    const content = React.createElement(
      'div',
      { ...props, ...nodeEvents },
      this.renderContent(),
    );
    if (objectKeys(events).length) {
      return React.createElement(
        Touchable,
        events,
        content,
      );
    }
    return content;
  },
}));

export default RichText;
