import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import store from '@/store/index';
import RuntimePanel from './runtimePanel';

ReactDOM.render(
  <Provider store={store}>
    <RuntimePanel />
  </Provider>,
  document.getElementById('root'),
);
