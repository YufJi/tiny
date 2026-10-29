import { TINY_ENGINE_NAMING } from './engine-naming'

export const BUILTIN_COMPONENT_TAGS = [
  'view',
  'button',
  'text',
  'label',
  'input',
  'checkbox',
  'checkbox-group',
  'radio',
  'radio-group',
  'icon',
  'image',
  'navigator',
  'scroll-view',
  'slider',
  'progress',
  'switch',
  'swiper',
  'swiper-item',
  'canvas',
  'textarea',
  'form',
  'picker',
  'picker-view',
  'picker-view-column',
] as const

export type BuiltinComponentTag = (typeof BUILTIN_COMPONENT_TAGS)[number]

export const BUILTIN_HOST_TAG_PREFIX = TINY_ENGINE_NAMING.hostTagPrefix
