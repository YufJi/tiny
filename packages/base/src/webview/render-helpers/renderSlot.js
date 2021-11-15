import { elementPrefix } from 'shared';
import { h } from '../nerv';

const empty = {};

export default function renderSlot(ctx, slot, fallback) {
  const { $$slots = empty } = ctx;

  const nodes = $$slots[slot] || fallback;

  return h(`${elementPrefix}-slot`, {
    id: '__slot__',
    style: 'display:inherit; align-contents:inherit; align-self:inherit; flex-direction:inherit; align-items:inherit; justify-content:inherit; width:100%; display:contents;',
  }, nodes);

  // return (
  //   <span
  //     id="__slot__"
  //     // eslint-disable-next-line react/style-prop-object
  //     style="display: inherit; align-contents: inherit; align-self: inherit;flex-direction: inherit;align-items: inherit;justify-content: inherit; width: 100%; display: contents;"
  //   >
  //     {nodes}
  //   </span>
  // );
}
