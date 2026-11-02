import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import store from '@/store/index';
import MobileNotice from './components/MobileNotice';
import { shouldShowMobileGate } from './device';
import RuntimePanel from './runtimePanel';
import { createWasmHostCoreFactory } from './wasmHostCore';

// Warm the wasm module before a deep link can launch an app synchronously.
if (!shouldShowMobileGate()) {
  void createWasmHostCoreFactory().catch((error) => {
    console.error('[devtool] failed to load the Rust HostCore', error);
  });
}

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
