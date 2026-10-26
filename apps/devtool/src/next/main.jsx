import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import store from '@/store/index';
import MobileNotice from './components/MobileNotice';
import { shouldShowMobileGate } from './device';
import RuntimePanel from './runtimePanel';

const mobileGate = shouldShowMobileGate();

ReactDOM.render(
  mobileGate ? (
    <MobileNotice />
  ) : (
    <Provider store={store}>
      <RuntimePanel />
    </Provider>
  ),
  document.getElementById('root'),
);
