import type { BuiltinContext, BuiltinDefinition } from '../../types'
import { builtinDefinitionName } from '../../tags'

type MapRuntime = {
  getShadowRoot?: () => {
    getElementById?: (id: string) => {
      getBackendElement?: () => HTMLElement | null
    } | null
  } | null
  getBackendElement?: () => HTMLElement | null
}

type MapMarker = {
  id?: number | string
  latitude?: number
  longitude?: number
  iconPath?: string
  width?: number | string
  height?: number | string
}

const TILE_SIZE = 256

function project(latitude: number, longitude: number, scale: number): { x: number; y: number } {
  const worldSize = TILE_SIZE * Math.pow(2, scale)
  const lat = Math.max(-85.05112878, Math.min(85.05112878, latitude)) * Math.PI / 180
  const x = ((longitude + 180) / 360) * worldSize
  const y = (1 - Math.log(Math.tan(lat) + 1 / Math.cos(lat)) / Math.PI) / 2 * worldSize
  return { x, y }
}

/**
 * Browser approximation of `wx-map`: a projected marker layer over a neutral
 * grid. There are no map tiles or native gestures; the component keeps the
 * documented marker events and exposes the same coordinate model.
 */
export function defineMap(ctx: BuiltinContext): BuiltinDefinition {
  return ctx.space.defineComponent({
    is: builtinDefinitionName('map'),
    template: ctx.template('map'),
    behaviors: [ctx.behaviors.base],
    properties: {
      latitude: { type: Number, value: 39.92, observer: 'apply' },
      longitude: { type: Number, value: 116.46, observer: 'apply' },
      scale: { type: Number, value: 16, observer: 'apply' },
      minScale: { type: Number, value: 3 },
      maxScale: { type: Number, value: 20 },
      markers: { type: Array, value: [], observer: 'apply' },
      showLocation: { type: Boolean, value: false, observer: 'apply' },
      enableZoom: { type: Boolean, value: true },
      enableScroll: { type: Boolean, value: true },
      enableRotate: { type: Boolean, value: false },
      rotate: { type: Number, value: 0 },
      skew: { type: Number, value: 0 },
      showCompass: { type: Boolean, value: false },
      showScale: { type: Boolean, value: false },
    },
    options: ctx.hostOptions('map'),
    lifetimes: {
      attached() {
        ;(this as unknown as { apply: () => void }).apply()
      },
    },
    methods: {
      markersElement(): HTMLElement | null {
        const runtime = this as unknown as MapRuntime
        return runtime.getShadowRoot?.()?.getElementById?.('markers')
          ?.getBackendElement?.() ?? null
      },
      apply() {
        const runtime = this as unknown as MapRuntime
        const host = runtime.getBackendElement?.()
        const layer = (this as unknown as { markersElement: () => HTMLElement | null })
          .markersElement()
        if (!host || !layer) return
        const width = host.clientWidth || 300
        const height = host.clientHeight || 150
        const scale = Math.max(
          Number(this.data.minScale) || 3,
          Math.min(Number(this.data.maxScale) || 20, Number(this.data.scale) || 16),
        )
        const center = project(
          Number(this.data.latitude) || 0,
          Number(this.data.longitude) || 0,
          scale,
        )
        const markers = Array.isArray(this.data.markers)
          ? (this.data.markers as MapMarker[]).slice(0, 100)
          : []
        const fragment = document.createDocumentFragment()
        for (const marker of markers) {
          const point = project(
            Number(marker.latitude) || 0,
            Number(marker.longitude) || 0,
            scale,
          )
          const left = width / 2 + point.x - center.x
          const top = height / 2 + point.y - center.y
          if (left < -40 || left > width + 40 || top < -40 || top > height + 40) continue
          const element = document.createElement('div')
          element.className = 'wx-map-marker'
          element.style.left = `${left - 8}px`
          element.style.top = `${top - 18}px`
          element.style.width = `${Number(marker.width) || 16}px`
          element.style.height = `${Number(marker.height) || 16}px`
          element.dataset.markerId = String(marker.id ?? '')
          if (marker.iconPath) {
            const image = document.createElement('img')
            image.src = ctx.options.resolveAssetUrl?.(String(marker.iconPath), this)
              ?? String(marker.iconPath)
            image.alt = ''
            element.appendChild(image)
          }
          element.addEventListener('click', () => {
            this.triggerEvent('markertap', {
              markerId: marker.id,
              latitude: marker.latitude,
              longitude: marker.longitude,
            })
          })
          fragment.appendChild(element)
        }
        layer.replaceChildren(fragment)
        if (this.data.showLocation && !layer.querySelector('.wx-map-location')) {
          const location = document.createElement('div')
          location.className = 'wx-map-location'
          layer.appendChild(location)
        } else if (!this.data.showLocation) {
          layer.querySelector('.wx-map-location')?.remove()
        }
        this.triggerEvent('updated', {})
      },
    },
  }).general()
}
