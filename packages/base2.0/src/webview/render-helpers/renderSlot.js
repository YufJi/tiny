import { h, Fragment } from '../nerv';

const empty = {};

export default function renderSlot(ctx, slot, fallback) {
  const { $$slots = empty } = ctx;

  const nodes = $$slots[slot];

  // return h(Fragment, {}, nodes);
  return nodes || [fallback];
}
