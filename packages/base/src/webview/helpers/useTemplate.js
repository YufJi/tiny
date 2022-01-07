import { h, Fragment } from 'omi';

export default function useTemplate(template, data, context) {
  return (
    <Fragment>
      {template ? template(data, context) : null}
    </Fragment>
  );
}
