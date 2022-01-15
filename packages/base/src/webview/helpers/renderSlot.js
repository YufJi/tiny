import { h, Fragment } from 'omi';

export default function renderSlot(ctx, slot) {
  const { $$slots = {} } = ctx;

  const nodes = $$slots[slot] || [];

  return (
    <Fragment>
      {nodes}
    </Fragment>
  );
}
