import type { ApiHost, ApiContext } from './context'
import { callHost, runApi } from './run-api'

/**
 * Toast / modal / loading / action-sheet APIs. Every one is a forward to the
 * host's `ui.*` handlers; the host owns the overlay DOM (or native view).
 */
export function createUiApi(context: ApiContext): ApiHost {
  return {
    showToast: (params: unknown = {}) => runApi(params, 'showToast', () => callHost(
      context,
      'toast.show',
      params as Record<string, unknown>,
    )),
    hideToast: (params: unknown = {}) => runApi(params, 'hideToast', () => callHost(
      context,
      'ui.hideToast',
    )),
    showModal: (params: unknown = {}) => runApi(params, 'showModal', () => callHost(
      context,
      'ui.modal',
      params as Record<string, unknown>,
    )),
    showLoading: (params: unknown = {}) => runApi(params, 'showLoading', () => callHost(
      context,
      'ui.loading',
      params as Record<string, unknown>,
    )),
    hideLoading: (params: unknown = {}) => runApi(params, 'hideLoading', () => callHost(
      context,
      'ui.hideLoading',
    )),
    setTopBarText: (params: unknown = {}) => runApi(params, 'setTopBarText', () => callHost(
      context,
      'navigation.topBarText',
      { text: (params as { text?: unknown }).text ?? '' },
    )),
    setBackgroundColor: (params: unknown = {}) => runApi(params, 'setBackgroundColor', () => callHost(
      context,
      'page.backgroundColor',
      params as Record<string, unknown>,
    )),
    setBackgroundTextStyle: (params: unknown = {}) => runApi(
      params,
      'setBackgroundTextStyle',
      () => callHost(context, 'page.backgroundTextStyle', {
        textStyle: (params as { textStyle?: unknown }).textStyle ?? 'dark',
      }),
    ),
    enableAlertBeforeUnload: (params: unknown = {}) => runApi(
      params,
      'enableAlertBeforeUnload',
      () => callHost(context, 'page.alertBeforeUnload', {
        message: (params as { message?: unknown }).message ?? '',
      }),
    ),
    disableAlertBeforeUnload: (params: unknown = {}) => runApi(
      params,
      'disableAlertBeforeUnload',
      () => callHost(context, 'page.disableAlertBeforeUnload'),
    ),
    getSelectedTextRange: (params: unknown = {}) => runApi(
      params,
      'getSelectedTextRange',
      () => callHost(context, 'page.selectedTextRange'),
    ),
    checkIsPictureInPictureActive: (params: unknown = {}) => runApi(
      params,
      'checkIsPictureInPictureActive',
      () => callHost(context, 'page.pipActive'),
    ),
    loadFontFace: (params: unknown = {}) => runApi(
      params,
      'loadFontFace',
      () => callHost(context, 'font.load', params as Record<string, unknown>),
    ),
    showActionSheet: (params: unknown = {}) => runApi(params, 'showActionSheet', () => callHost(
      context,
      'ui.actionSheet',
      params as Record<string, unknown>,
    )),
  }
}
