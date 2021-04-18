
export default function resolveScopedSlots(arrScopedSlots) {
  const objScopedSlots = {};
  arrScopedSlots.forEach((arr) => {
    const { fn, slot = '$default' } = arr;

    objScopedSlots[slot] = objScopedSlots[slot] || [];
    objScopedSlots[slot].push(fn);
  });
  return objScopedSlots;
}
