import type * as glassEasel from 'glass-easel'
import { createAutofillBehavior } from './autofill'
import { createBaseBehavior } from './base'
import { createPublicBuiltinBehaviors } from './builtin'
import { createClassPrefixBehavior } from './classPrefix'
import { createDataComponentBehavior } from './dataComponent'
import { createDisabledBehavior } from './disabled'
import { createGroupBehavior } from './group'
import { createHoverBehavior } from './hover'
import { createHtmlParseBehavior } from './htmlParse'
import { createNativeBehavior } from './native'
import { createNativeCoverBehavior } from './nativeCover'
import { createNativeHoverBehavior } from './nativeHover'
import { createPositioningContainerBehavior } from './positioningContainer'
import { createQuillCoreBehavior } from './quillCore'
import { createPositioningTargetBehavior } from './positioningTarget'
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
export type { PositionBox, PositioningContainerHost } from './positioningTarget'
export {
  createPublicBuiltinBehaviors,
  getPublicBuiltinBehaviors,
  publicBuiltinBehaviorIds,
} from './builtin'
export type { PublicBuiltinBehaviorRegistry, PublicBuiltinBehaviors } from './builtin'

/**
 * Internal behaviors shared by the built-in component implementations.
 *
 * Each behavior lives in its own module and receives the component space once;
 * this factory is the single registry used by built-in definitions.
 */
export function createBuiltinBehaviors(space: glassEasel.ComponentSpace) {
  const behaviors = {
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
    positioningTarget: createPositioningTargetBehavior(space),
    positioningContainer: createPositioningContainerBehavior(space),
    native: createNativeBehavior(space),
    nativeCover: createNativeCoverBehavior(space),
    nativeHover: createNativeHoverBehavior(space),
    htmlParse: createHtmlParseBehavior(space),
    quillCore: createQuillCoreBehavior(space),
    scroller: createScrollerBehavior(space),
  }
  // `wx://` ids are a separate (public) registry; built-ins compare the marker
  // behaviors by identity because glass-easel resolves behavior strings by URL.
  const publicBehaviors = createPublicBuiltinBehaviors(space, behaviors)
  return {
    ...behaviors,
    formField: publicBehaviors.markers.formField,
    formFieldGroup: publicBehaviors.markers.formFieldGroup,
    formFieldButton: publicBehaviors.markers.formFieldButton,
  }
}

export type BuiltinBehaviors = ReturnType<typeof createBuiltinBehaviors>
