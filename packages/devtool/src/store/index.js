import { init } from '@rematch/core';
import runtime from './models/runtime';

const store = init({
  models: {
    runtime,
  },
});

export default store;
