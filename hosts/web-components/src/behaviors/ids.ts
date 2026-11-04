import { TINY_ENGINE_NAMING } from '@tiny/manifest'

/** Fixed ids for behaviors shared by Tiny's built-in components. */
export const BUILTIN_BEHAVIOR_IDS = Object.freeze({
  base: `${TINY_ENGINE_NAMING.behaviorPrefix}base`,
  hover: `${TINY_ENGINE_NAMING.behaviorPrefix}hover`,
  reload: `${TINY_ENGINE_NAMING.behaviorPrefix}reload`,
  touchTrack: `${TINY_ENGINE_NAMING.behaviorPrefix}touchtrack`,
  positioningTarget: `${TINY_ENGINE_NAMING.behaviorPrefix}positioning-target`,
  positioningContainer: `${TINY_ENGINE_NAMING.behaviorPrefix}positioning-container`,
  native: `${TINY_ENGINE_NAMING.behaviorPrefix}native`,
  nativeCover: `${TINY_ENGINE_NAMING.behaviorPrefix}native-cover`,
  nativeHover: `${TINY_ENGINE_NAMING.behaviorPrefix}native-hover`,
  htmlParse: `${TINY_ENGINE_NAMING.behaviorPrefix}html-parse`,
  quillCore: `${TINY_ENGINE_NAMING.behaviorPrefix}quill-core`,
  scroller: `${TINY_ENGINE_NAMING.behaviorPrefix}scroller`,
  sizeNormalizer: `${TINY_ENGINE_NAMING.behaviorPrefix}size-normalizer`,
  classPrefix: `${TINY_ENGINE_NAMING.behaviorPrefix}class-prefix`,
  disabled: `${TINY_ENGINE_NAMING.behaviorPrefix}disabled`,
  dataComponent: `${TINY_ENGINE_NAMING.behaviorPrefix}data-component`,
  autofill: `${TINY_ENGINE_NAMING.behaviorPrefix}autofill`,
  group: `${TINY_ENGINE_NAMING.behaviorPrefix}group`,
  item: `${TINY_ENGINE_NAMING.behaviorPrefix}item`,
  labelTarget: `${TINY_ENGINE_NAMING.behaviorPrefix}label-target`,
  labelAria: `${TINY_ENGINE_NAMING.behaviorPrefix}label-aria`,
} as const)
