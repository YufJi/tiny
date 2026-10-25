/**
 * Built-in component tags and their DOM host naming.
 *
 * The list is shared by the component runtime, the compiler, and the
 * stylesheet transformer so tag selectors and template markers stay in sync.
 */
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
  'textarea',
  'form',
  'picker',
  'picker-view',
  'picker-view-column',
] as const

export type BuiltinComponentTag = (typeof BUILTIN_COMPONENT_TAGS)[number]

/**
 * Prefix of the real DOM host element for every built-in component, e.g.
 * `<view>` renders `<tiny-view>`.
 */
export const BUILTIN_HOST_TAG_PREFIX = 'tiny-'
