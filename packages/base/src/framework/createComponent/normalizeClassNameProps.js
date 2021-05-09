export default function normalizeClassNameProps(props) {
  const { className = '' } = props;
  const { tagName } = props.$mp;
  if (tagName && className.indexOf(` a-${tagName}`) === -1) {
    props.className = ` a-${tagName} ${className}`;
  }
}
