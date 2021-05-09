export default function rgba2Color(rgba) {
  // 如果是rgba颜色表示
  if (/^(rgb|RGB)/.test(rgba)) {
    const aColor = rgba.replace(/(?:\(|\)|rgba|RGBA)*/g, '').replace(/(?:\(|\)|rgb|RGB)*/g, '').split(',');
    let strHex = '#';
    for (let i = 0; i < aColor.length; i++) {
      let color = Number(aColor[i]);
      if (i === 3) {
        color = parseInt(`${color * 255}`);
      }
      let hex = color.toString(16);
      if (hex.length < 2) {
        hex = `0${hex}`;
      }
      strHex += hex;
    }
    if (strHex.length === 7) {
      strHex += 'ff';
    }
    if (strHex.length !== 9) {
      strHex = rgba;
    }
    return strHex;
  }
  return rgba;
}
