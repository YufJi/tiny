import { init } from '@rematch/core';
import nav from './models/nav';
import global from './models/global';
import runtime from './models/runtime';

const store = init({
  models: {
    nav,
    global,
    runtime,
  },
});

export default store;
