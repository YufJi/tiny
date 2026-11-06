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
    showActionSheet: (params: unknown = {}) => runApi(params, 'showActionSheet', () => callHost(
      context,
      'ui.actionSheet',
      params as Record<string, unknown>,
    )),
  }
}
