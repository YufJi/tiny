import { isUndefined } from 'lodash';
import { TemplateTag } from 'shared';

export function requestComponentInfo(reqs, rootDom) {
  const res = [];

  reqs.forEach((req) => {
    const { selector, single, fields, root } = req;

    if (!root) return res.push(initResParams(fields));

    let result = null;
    let tree = root;

    if (isUndefined(tree)) {
      tree = rootDom;
    }

    if (single) {
      if (tree) {
        const element = (tree.shadowRoot || tree).querySelector(selector);

        result = element ? filterFields(element, fields) : null;
      } else {
        result = null;
      }
    } else {
      result = tree
        ? Array.from((tree.shadowRoot || tree).querySelectorAll(selector)).map((element) => {
          return filterFields(element, fields);
        })
        : [];
    }

    res.push(result);
  });

  return res;
}

function filterFields(element, fields) {
  const i = {};

  if (fields.id) {
    i.id = element.id || '';
  }

  if (fields.dataset) {
    i.dataset = element._dataset || {};
  }

  if (fields.rect || fields.size) {
    const rect = element.firstElementChild
      ? element.firstElementChild.getBoundingClientRect()
      : element.getBoundingClientRect();

    if (fields.rect) {
      i.left = rect.left;
      i.right = rect.right;
      i.top = rect.top;
      i.bottom = rect.bottom;
    }

    if (fields.size) {
      i.width = rect.width;
      i.height = rect.height;
    }
  }

  if (fields.properties) {
    fields.properties.forEach((property) => {
      const key = property.replace(/-([a-z])/g, (match, $1) => {
        return $1.toUpperCase();
      });

      i[key] = element[key];
    });
  }

  if (fields.scrollOffset) {
    const position = element && element.getScrollPosition && element.getScrollPosition() || {};

    const { scrollLeft = 0, scrollTop = 0 } = position;
    i.scrollLeft = scrollLeft;
    i.scrollTop = scrollTop;
  }

  if (fields.node) {
    i.nodeCanvasType = 'default';

    if (`${TemplateTag.UpperCasePerfix}-CANVAS` === (element && element.tagName)) {
      i.node = {
        isCanvas: true,
        id: element?.id,
        type: element?.type,
        canvasId: element?.canvasId,
        uniqCanvasId: element?.uniqCanvasId,
        _width: element?.clientWidth,
        _height: element?.clientHeight,
        _top: element?.clientTop,
        _left: element?.clientLeft,
        width: element?.clientWidth,
        height: element?.clientHeight,
      };
      i.nodeCanvasType = element?.type;
    }
  }

  return i;
}

function initResParams(req) {
  const res = {};

  if (req.id) {
    res.id = '';
  }

  if (req.dataset) {
    res.dataset = {};
  }

  if (req.rect) {
    res.left = 0;
    res.right = 0;
    res.top = 0;
    res.bottom = 0;
  }

  if (req.size) {
    res.width = document.documentElement.clientWidth;
    res.height = document.documentElement.clientHeight;
  }

  if (req.scrollOffset) {
    res.scrollLeft = document.documentElement.scrollLeft || document.body.scrollLeft || 0;
    res.scrollTop = document.documentElement.scrollTop || document.body.scrollTop || 0;
  }

  return res;
}
