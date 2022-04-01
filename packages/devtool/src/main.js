import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import store from '@/store/index';

import App from './app';
import 'normalize.css';
import 'antd-mobile/es/global';
import './global.css';

// window.addEventListener('resize', () => {
//   window.location.reload();
// });

ReactDOM.render(
  <Provider
    store={store}
  >
    <App />
  </Provider>,
  document.getElementById('root'),
);
