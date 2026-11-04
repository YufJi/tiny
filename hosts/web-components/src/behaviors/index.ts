import type * as glassEasel from 'glass-easel'
import { createAutofillBehavior } from './autofill'
import { createBaseBehavior } from './base'
import { createClassPrefixBehavior } from './classPrefix'
import { createDataComponentBehavior } from './dataComponent'
import { createDisabledBehavior } from './disabled'
import { createGroupBehavior } from './group'
import { createHoverBehavior } from './hover'
import { createItemBehavior } from './item'
import { createLabelAriaBehavior } from './labelAria'
import { createLabelTargetBehavior } from './labelTarget'
import { createReloadBehavior } from './reload'
import { createScrollerBehavior } from './scroller'
import { createSizeNormalizerBehavior } from './sizeNormalizer'
import { createTouchTrackBehavior } from './touchTrack'

export { BUILTIN_BEHAVIOR_IDS } from './ids'
export { bindHostListeners, unbindHostListeners } from './host-listeners'
export { findAncestorWithBehavior } from './find-ancestor'
export type {
  AriaRuntime,
  GroupHandler,
  HostClassElement,
  HostEvent,
  HostListenable,
  HoverRuntime,
  ItemRuntime,
  LabelAriaRuntime,
  LabelTargetRuntime,
  ReloadState,
  TouchTrackEvent,
} from './types'

/**
 * Internal behaviors shared by the built-in component implementations.
 *
 * Each behavior lives in its own module and receives the component space once;
 * this factory is the single registry used by built-in definitions.
 */
export function createBuiltinBehaviors(space: glassEasel.ComponentSpace) {
  return {
    base: createBaseBehavior(space),
    hover: createHoverBehavior(space),
    reload: createReloadBehavior(space),
    autofill: createAutofillBehavior(space),
    labelAria: createLabelAriaBehavior(space),
    labelTarget: createLabelTargetBehavior(space),
    disabled: createDisabledBehavior(space),
    dataComponent: createDataComponentBehavior(space),
    group: createGroupBehavior(space),
    item: createItemBehavior(space),
    sizeNormalizer: createSizeNormalizerBehavior(space),
    classPrefix: createClassPrefixBehavior(space),
    touchTrack: createTouchTrackBehavior(space),
    scroller: createScrollerBehavior(space),
  }
}

export type BuiltinBehaviors = ReturnType<typeof createBuiltinBehaviors>
