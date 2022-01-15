import { define, WeElement } from 'omi';
import { TemplateTag, CustomEvent } from 'shared';
import { transformRpx } from '@/webview/util';

import {
  onComponentDataChange,
  onDisableScroll,
  onPageScrollTo,
  onRequestComponentObserver,
  onRequestComponentInfo,
  onGetRelationNode,
  onSelectComponent,
  onSelectComponentInPage,
  onTriggerComponentEvent,
  onAppLoadStatusChange,
  onAnimationStatusChange,
  enableScroll,
} from '../api';
import registryCustomComponent from '../Component';
import { mergeData } from '../util';

const { AppDataChange, PageEvent, PageReady, PageShow } = CustomEvent;

const tag = `${TemplateTag.LowerCasePrefix}-page`;

export default function renderPage(provide, data, generateFunc) {
  const { fields } = provide;
  const { root } = fields;

  registryCustomComponent(provide);
  registryPage(provide, data, generateFunc);

  const page = document.createElement(tag);

  if (root !== null) {
    let dom = root.lastChild;
    while (dom) {
      const next = dom.previousSibling;
      root.removeChild(dom);
      dom = next;
    }
  }

  root.appendChild(page);
}

function registryPage(provide, data, generateFunc) {
  const { bridge, fields, componentHub } = provide;
  const { render: vdom, stylesheet } = generateFunc;

  define(tag, class extends WeElement {
    static css = transformRpx(stylesheet.toString())

    static isLightDom = true

    constructor() {
      super();

      this._type_ = 'page';

      this.data = data;

      this.listenDataChange();
      this.listenJSCoreEvent(componentHub);
    }

    provide = provide

    attached() {
      const { publish } = bridge;
      publish(PageShow, {});
    }

    ready() {
      const { publish } = bridge;
      publish(PageReady, {});
    }

    listenDataChange() {
      const { replyService } = bridge;
      replyService(AppDataChange)(async (params) => {
        const { data, options } = params;

        this.setData(data);
      });
    }

    listenJSCoreEvent(componentHub) {
      const { emitter, root } = fields;

      onComponentDataChange(bridge, componentHub);
      onTriggerComponentEvent(bridge, componentHub);
      onRequestComponentObserver(bridge, componentHub, emitter, root);
      onSelectComponentInPage(bridge, root);
      onSelectComponent(bridge, componentHub);
      onRequestComponentInfo(bridge, componentHub, root);
      onGetRelationNode(bridge, componentHub);
      onAnimationStatusChange(emitter);
      onAppLoadStatusChange(bridge);
      onDisableScroll(bridge);
      onPageScrollTo(bridge);
    }

    eventBinder(methodName) {
      const { publish } = bridge;

      const handler = function (data) {
        return publish(PageEvent, { type: methodName, data, nodeId: 0 });
      };
      handler.displayName = methodName;
      return handler;
    }

    render() {
      return vdom(this.data, {
        $$class(t) {
          return `${String(t)}`;
        },
        $$eventBinder: this.eventBinder.bind(this),
      });
    }
  });
}
