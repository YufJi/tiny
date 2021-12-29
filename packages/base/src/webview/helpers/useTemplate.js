import React from 'react';

export default function useTemplate(template, data, context) {
  return (
    <>
      {template ? template(data, context) : null}
    </>
  );
}
