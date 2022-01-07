import { h, Fragment } from 'omi';

export default function createRoot(element) {
  if (Array.isArray(element)) {
    return <Fragment>{element}</Fragment>;
  }

  return element;
}
