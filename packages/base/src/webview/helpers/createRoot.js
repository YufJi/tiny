import Nerv, { Fragment } from 'nerv';

export default function createRoot(element) {
  if (Array.isArray(element)) {
    return <Fragment>{element}</Fragment>;
  }

  return element;
}
