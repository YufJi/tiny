import Nerv, { PureComponent } from '@/nerv';

function transformChildrenToSlots(children) {
  const slots = {};
  Nerv.Children.forEach(children, (c) => {
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

      return renderChildren;
    }
  }

  RMLTemplate.displayName = name;

  return RMLTemplate;
}
