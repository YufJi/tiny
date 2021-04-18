
import React from 'react';

export default function transformChildrenToSlots(children) {
  const slots = {};
  React.Children.forEach(children, (c) => {
    const slot = c && c.props && c.props.slot || '$default';
    const holder = slots[slot] || [];
    holder.push(c);
    slots[slot] = holder;
  });
  return slots;
}
