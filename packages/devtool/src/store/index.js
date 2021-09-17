import { init } from '@rematch/core';
import nav from './models/nav';
import route from './models/route';

const store = init({
  models: {
    nav,
    route,
  },
});

export default store;
