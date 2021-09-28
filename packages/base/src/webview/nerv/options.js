import { noop } from './utils';

const options = {
  afterMount: noop,
  afterUpdate: noop,
  beforeUpdate: noop,
  beforeUnmount: noop,
  beforeRender: noop,
  beforeMount: noop,
  afterCreate: noop,
  roots: [],
  debug: false,
};

export default options;
