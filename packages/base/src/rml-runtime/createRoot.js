import React, { Fragment } from 'react';

export default function createRoot(element) {
  if (Array.isArray(element) && Fragment) {
    return <Fragment>{element}</Fragment>;
  }
  return element;
}
