import invokeWithGuardAndReThrow from '@/utils/invokeWithGuardAndReThrow';

export default function fireComponentLifecycle(componentConfig, context, method, args = []) {
  const { mixins = [] } = componentConfig;

  mixins.forEach((m) => {
    if (m[method]) {
      invokeWithGuardAndReThrow.apply(undefined, [m[method], context].concat(args));
    }
  });
  if (componentConfig[method]) {
    invokeWithGuardAndReThrow.apply(undefined, [componentConfig[method], context].concat(args));
  }
}
