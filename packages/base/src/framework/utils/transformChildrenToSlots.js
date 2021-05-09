import Nerv from '@/nerv';

export default function transformChildrenToSlots(children) {
  const slots = {};
  Nerv.Children.forEach(children, (c) => {
    const slot = c && c.props && c.props.slot || '$default';
    const holder = slots[slot] || [];
    holder.push(c);
    slots[slot] = holder;
  });
  return slots;
}
