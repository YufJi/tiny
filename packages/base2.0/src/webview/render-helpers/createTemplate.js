/*
 * @Author: YufJ
 * @Date: 2021-07-03 20:23:17
 * @LastEditTime: 2021-07-12 10:48:11
 * @Description:
 * @FilePath: /tiny-v1/packages/base2.0/src/framework/webview/runtime-helpers/createTemplate.js
 */
import { h, PureComponent, Children } from '../nerv';

export function transformChildrenToSlots(children) {
  const slots = {};
  Children.forEach(children, (c) => {
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
