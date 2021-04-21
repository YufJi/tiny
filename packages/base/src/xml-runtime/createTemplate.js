
import React, { PureComponent } from 'react';

const version = parseInt(React.version, 10);

function transformChildrenToSlots(children) {
  const slots = {};
  React.Children.forEach(children, (c) => {
    const slot = c && c.props && c.props.slot || '$default';
    const holder = slots[slot] || [];
    holder.push(c);
    slots[slot] = holder;
  });
  return slots;
}

export default function (name, elementFactory) {
  class RMLTemplate extends PureComponent {
    render() {
      const { $context, slot, children, ...props } = this.props;

      props.$slots = transformChildrenToSlots(children);
      const renderChildren = elementFactory.call($context, props);
      if (version < 16 && React.Children.count(renderChildren) > 1) {
        setTimeout(() => {
          throw new Error(`template ${name} can only has one render child!`);
        }, 0);
        return null;
      }
      return renderChildren;
    }
  }

  RMLTemplate.displayName = name;

  // function RMLTemplate() {
  //   PureComponent.apply(this, arguments);
  // }

  // RMLTemplate.displayName = name;
  // const proto = RMLTemplate.prototype = Object.create(PureComponent.prototype);
  // proto.render = function render() {
  //   const _props = this.props;
  //   const { $context } = _props;
  //   const { slot } = _props;
  //   const { children } = _props;
  //   const props = _objectWithoutProperties(_props, ['$context', 'slot', 'children']);

  //   props.$slots = transformChildrenToSlots(children);
  //   const renderChildren = elementFactory.call($context, props);
  //   if (version < 16 && React.Children.count(renderChildren) > 1) {
  //     setTimeout(() => {
  //       throw new Error(`template ${name} can only has one render child!`);
  //     }, 0);
  //     return null;
  //   }
  //   return renderChildren;
  // };
  return RMLTemplate;
}
