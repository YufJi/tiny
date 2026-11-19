import type { ApiContext, ApiHost } from './context'
import { callHost, runApi } from './run-api'

/**
 * Media selection and preview.
 *
 * The host owns the file chooser, the temp-file handles and the preview
 * overlay; the service side only keeps WeChat's call shape and callback
 * contract. A host without a chooser answers `:fail` instead of pretending.
 */
export function createMediaPickerApi(context: ApiContext): ApiHost {
  const forward = (apiName: string) => (params: unknown = {}) => runApi(
    params,
    apiName,
    () => callHost(context, `media.${apiName}`, params as Record<string, unknown>),
  )
  return {
    chooseImage: forward('chooseImage'),
    chooseMedia: forward('chooseMedia'),
    chooseVideo: forward('chooseVideo'),
    chooseMessageFile: forward('chooseMessageFile'),
    compressImage: forward('compressImage'),
    checkDeviceSupportHevc: (params: unknown = {}) => runApi(
      params,
      'checkDeviceSupportHevc',
      () => callHost(context, 'media.hevcSupport', params as Record<string, unknown>),
    ),
    previewImage: forward('previewImage'),
    previewMedia: forward('previewMedia'),
    getImageInfo: forward('getImageInfo'),
    getVideoInfo: forward('getVideoInfo'),
    saveImageToPhotosAlbum: forward('saveImageToPhotosAlbum'),
    saveVideoToPhotosAlbum: forward('saveVideoToPhotosAlbum'),
  }
}
