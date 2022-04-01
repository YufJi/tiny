import { h, Fragment } from 'omi';

export default function createBlock(element, props) {
  let arrayElements = element;
  if (!Array.isArray(arrayElements)) {
    arrayElements = [arrayElements];
  }

  return (
    <Fragment {...props}>
      {arrayElements}
    </Fragment>
  );
}
