export function measureText(params) {
  const { fontSize, font, text } = params;
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');

  ctx.font = `${fontSize}px ${font.join(' ')}`;

  const { width } = ctx.measureText(text);

  return {
    data: {
      width,
    },
  };
}
