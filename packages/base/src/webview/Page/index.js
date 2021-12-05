import { TemplateTag } from 'shared';
import { h, useLayoutEffect, useEffect, useRef, transformRpx } from '../nerv';
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
  usePageReady,
  usePageShow,
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

  usePageShow(stylesheet);
  usePageReady(render);

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

  return h(`${TemplateTag.LowerCasePrefix}-page`, {}, current.result);
}
