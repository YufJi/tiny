import React from 'react';

export default function createRoot(element) {
  if (Array.isArray(element)) {
    return <>{element}</>;
  }

  return element;
}
