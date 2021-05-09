import Nerv from '@/nerv';

export default function EmptyComponent(props) {
  const { children = null } = props || {};

  return children;
}
