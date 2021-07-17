/*
 * @Author: YufJ
 * @Date: 2021-07-05 20:35:03
 * @LastEditTime: 2021-07-11 14:33:11
 * @Description:
 * @FilePath: /tiny-v1/packages/base2.0/src/framework/webview/Page.js
 */
import { h, useEffect, useLayoutEffect } from './nerv';
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
} from './hooks';

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

  useEffect(()=> {
    // 插入style
  }, [])

  useFirstRendered(render);

  useLayoutEffect(() => {
    if (render) {
      if (current.initialized) {
        emitter.emit('RE_RENDER', 'patch');
      } else {
        emitter.emit('RE_RENDER', 'initial');
      }
    }
  });

  return current.result;
}
