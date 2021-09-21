import EventEmitter from 'eventemitter3';
import { h, hydrate as render } from './nerv';
import * as bridge from './bridge';
import App from './App';

export default function bootstrap() {
  const root = document.getElementById('__root__');
  const fields = {
    root,
    bridge,
    emitter: new EventEmitter(),
  };

  render(<App fields={fields} />, root);
}
