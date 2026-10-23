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
  'scroll-view',
  'slider',
  'progress',
  'switch',
  'swiper',
  'swiper-item',
  'canvas',
] as const

export type BuiltinComponentTag = typeof BUILTIN_COMPONENT_TAGS[number]
