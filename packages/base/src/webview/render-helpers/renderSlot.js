const empty = {};

export default function renderSlot(ctx, slot, fallback) {
  const { $$slots = empty } = ctx;

  const nodes = $$slots[slot] || fallback;

  return nodes;
}
