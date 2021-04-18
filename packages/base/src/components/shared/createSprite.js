
import svgData from './assets/svgData';

let sprite;
const SymbolObj = {};
export default function createSprite(id) {
  if (id && !SymbolObj[id]) {
    if (!sprite) {
      const aIconSpriteNode = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      aIconSpriteNode.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      aIconSpriteNode.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
      aIconSpriteNode.setAttribute('style', 'position: absolute; width: 0; height: 0');
      aIconSpriteNode.setAttribute('id', 'a-icon-sprite-node');
      sprite = document.body.insertBefore(aIconSpriteNode, document.body.firstChild || null);
    }
    const symbolNode = document.createElementNS('http://www.w3.org/2000/svg', 'symbol');
    symbolNode.setAttribute('id', id);
    symbolNode.setAttribute('viewBox', svgData[id].size);
    const svgNode = new DOMParser().parseFromString(svgData[id].content, 'image/svg+xml').documentElement;
    symbolNode.appendChild(svgNode);
    sprite.appendChild(symbolNode);
    // SymbolObj[params.id] not be undefined is OK.
    SymbolObj[id] = 1;
  }
}
