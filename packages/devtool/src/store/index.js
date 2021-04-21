import { init } from '@rematch/core';
import nav from './models/nav';

const store = init({
  models: {
    nav,
  },
});

export default store;
