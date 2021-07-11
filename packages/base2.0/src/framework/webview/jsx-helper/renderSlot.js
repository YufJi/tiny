const empty = {};

export default function renderSlot(data, slot, fallback, props) {
  const { $scopedSlots = empty, $slots = empty } = data;

  const scopedSlotFn = $scopedSlots[slot];
  let nodes;
  if (scopedSlotFn) {
    nodes = [];
    let isEmptyChildren = true;
    scopedSlotFn.forEach((f) => {
      const ret = f(props);
      if (ret) {
        isEmptyChildren = false;
      }
      nodes.push(ret);
    });
    if (isEmptyChildren) {
      nodes = fallback;
    }
  } else {
    const slotNodes = $slots[slot];
    nodes = slotNodes || fallback;
  }
  return nodes;
}
