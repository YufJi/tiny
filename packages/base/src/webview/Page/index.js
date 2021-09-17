/*
 * @Author: YufJ
 * @Date: 2021-07-05 20:35:03
 * @LastEditTime: 2021-08-13 17:05:02
 * @Description:
 * @FilePath: /tiny-v1/packages/base2.0/src/framework/webview/Page.js
 */
import { elementPrefix } from 'shared/config';
import { h, useLayoutEffect, useRef, transformRpx } from '../nerv';
import { ComponentHubContext } from '../context';
import { usePageFields } from '../common/hooks';
import {
  useCompileResult,
  usePageData,
  useRenderContext,
  useComponentHub,
  useRenderMode,
  useJSCoreEvent,
  useInitAction,
  useFirstRendered,
} from './hooks';

export default function Page() {
  const { render, stylesheet } = useCompileResult();
  const data = usePageData(render);
  const ctx = useRenderContext();
  const componentHub = useComponentHub();
  const mode = useRenderMode();

  useJSCoreEvent(componentHub);
  useInitAction();

  return (
    <ComponentHubContext.Provider value={componentHub}>
      {mode === 'Normal' ? (
        <NormalScene
          context={ctx}
          data={data}
          render={render}
          stylesheet={stylesheet}
        />
      ) : null}
    </ComponentHubContext.Provider>
  );
}

function NormalScene(props) {
  const { data, context, render, stylesheet } = props;

  const { emitter } = usePageFields();
  const { current } = useRef({ result: null, initialized: false });

  if (render) {
    current.result = render(data, context);
  }

  /* 插入style */
  useLayoutEffect(() => {
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
