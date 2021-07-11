import Nerv from '@/nerv';

export default function useTemplate(template, data, key, context) {
  const Component = template && template.Component;
  return Component ? Nerv.createElement(Component, { ...data, $context: context, key }) : null;
}
