import EventEmitter from 'eventemitter3';
import Nerv, { hydrate } from 'nerv';
import * as bridge from './bridge';
import App from './App';

export default function bootstrap() {
  const root = document.getElementById('__root__');
  const fields = {
    root,
    bridge,
    emitter: new EventEmitter(),
  };

  hydrate(<App fields={fields} />, root);
}
