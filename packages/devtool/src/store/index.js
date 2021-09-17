import { init } from '@rematch/core';
import nav from './models/nav';
import global from './models/global';

const store = init({
  models: {
    nav,
    global,
  },
});

export default store;
