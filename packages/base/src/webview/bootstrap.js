import React from 'react';
import ReactDOM from 'react-dom';
import EventEmitter from 'eventemitter3';

import * as bridge from './bridge';
import App from './App';

export default function bootstrap() {
  const root = document.getElementById('__root__');
  const fields = {
    root,
    bridge,
    emitter: new EventEmitter(),
  };

  ReactDOM.render(<App fields={fields} />, root);
}
