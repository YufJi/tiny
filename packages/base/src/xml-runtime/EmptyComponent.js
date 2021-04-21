import React from 'react';

export default function EmptyComponent(props) {
  const { children = null } = props || {};

  return children;
}
