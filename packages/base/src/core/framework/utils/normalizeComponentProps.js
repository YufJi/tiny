
export default function normalizeComponentProps(props) {
  const { children, $scopedSlots, slot, ...ret } = props;

  return ret;
}
