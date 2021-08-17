/*
 * @Author: YufJ
 * @Date: 2021-07-05 20:35:03
 * @LastEditTime: 2021-08-13 17:05:02
 * @Description:
 * @FilePath: /tiny-v1/packages/base2.0/src/framework/webview/Page.js
 */
import { elementPrefix } from '@/utils/config';
import { h, useEffect, useLayoutEffect, useRef } from './nerv';
import { ComponentHubContext } from './context';
import {
  useCompileResult,
  usePageData,
  useRenderContext,
  useJSCoreEvent,
  useInitAction,
  useRenderMode,
  usePageFields,
  useFirstRendered,
  useComponentHub,
} from './hooks';
import { transformRpx } from './nerv/vdom/patch';

const Fallback = null;

export default function Page() {
  const { render, stylesheet } = useCompileResult();
  const data = usePageData(render);
  const ctx = useRenderContext();
  const componentHub = useComponentHub();

  useJSCoreEvent(componentHub);
  useInitAction();

  return (
    <ComponentHubContext.Provider value={componentHub}>
      <Scene
        context={ctx}
        data={data}
        render={render}
        stylesheet={stylesheet}
      />
    </ComponentHubContext.Provider>
  );
}

function Scene(props) {
  const mode = useRenderMode();

  if (mode === 'Normal') {
    return <NormalScene {...props} />;
  } else {
    return Fallback;
  }
}

function NormalScene(props) {
  const { data, context, render, stylesheet } = props;

  const { emitter } = usePageFields();
  const { current } = useRef({ result: null, initialized: false });

  if (render) {
    if (current.initialized) {
      // patch
    } else {
      // first
    }

    current.result = render(data, context);
  }

  useEffect(() => {
    // 插入style
    if (stylesheet) {
      const headNode = document.getElementsByTagName('head')[0];
      const styleNode = document.createElement('style');
      let styleString = stylesheet.toString();

      styleString = transformRpx(styleString);

      styleNode.innerHTML = styleString;
      headNode.appendChild(styleNode);
    }
  }, []);

  useFirstRendered(render);

  useLayoutEffect(() => {
    if (render) {
      if (current.initialized) {
        emitter.emit('RE_RENDER', 'patch');
      } else {
        current.initialized = true;
        emitter.emit('RE_RENDER', 'initial');
      }
    }
  });

  return h(`${elementPrefix}-page`, {}, current.result);
}
