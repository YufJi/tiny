import Nerv from '@/nerv';
import createSprite from './createSprite';

function Icon(props) {
  const { size = 23, type, color } = props;

  createSprite(type);
  return (
    <svg
      className={`a-icon-svg a-icon-${type}`}
      style={{
        width: size,
        height: size,
        fill: color,
      }}
    >
      <use xlinkHref={`#${type}`} />
    </svg>
  );
}

export default Icon;
