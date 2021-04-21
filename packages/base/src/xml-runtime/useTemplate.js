
import React from 'react';

export default function useTemplate(template, data, key, context) {
  const Component = template && template.Component;
  return Component ? React.createElement(Component, { ...data, $context: context, key }) : null;
}
