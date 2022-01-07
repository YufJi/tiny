import { h } from 'omi';
import { TemplateTag } from 'shared';

const empty = {};

export default function renderSlot(ctx, slot, fallback) {
  const { $$slots = empty } = ctx;

  const nodes = $$slots[slot] || fallback;

  return h(`${TemplateTag.LowerCasePrefix}-slot`, {
    id: '__slot__',
    style: `
      display:inherit; 
      align-contents:inherit; 
      align-self:inherit; 
      flex-direction:inherit; 
      align-items:inherit; 
      justify-content:inherit; 
      width:100%; 
      display:contents;
    `,
  }, nodes);
}
