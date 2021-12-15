import Nerv, { Fragment } from 'nerv';

export default function useTemplate(template, data, context) {
  return (
    <Fragment>
      {template ? template(data, context) : null}
    </Fragment>
  );
}
