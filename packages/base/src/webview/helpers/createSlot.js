export default function createSlot(children = []) {
  const slots = {};
  children.forEach((child) => {
    const slot = child?.attributes?.slot || '$default';
    slots[slot] = slots[slot] || [];
    slots[slot].push(child);
  });
  return slots;
}
