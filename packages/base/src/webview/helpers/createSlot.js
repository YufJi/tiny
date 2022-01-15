export default function createSlot(children = []) {
  const slots = {};
  children.forEach((c) => {
    const slot = c?.attributes?.slot || '$default';
    const holder = slots[slot] || [];
    holder.push(c);
    slots[slot] = holder;
  });
  return slots;
}
