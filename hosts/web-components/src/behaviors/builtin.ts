import type * as glassEasel from 'glass-easel'
import { BUILTIN_BEHAVIOR_IDS } from './ids'

/** Public `wx://` behavior ids resolved by the render space. */
export const PUBLIC_BUILTIN_BEHAVIOR_IDS = Object.freeze({
  componentExport: 'wx://component-export',
  formField: 'wx://form-field',
  formFieldButton: 'wx://form-field-button',
  formFieldGroup: 'wx://form-field-group',
  labelTarget: 'wx://label-target',
  styleFilter: 'wx://style-filter',
} as const)

export type PublicBuiltinBehaviors = Record<string, glassEasel.GeneralBehavior>

export type PublicBuiltinBehaviorRegistry = {
  /** Public `wx://` behaviors keyed by their declared id. */
  behaviors: PublicBuiltinBehaviors
  /** Internal marker behaviors built-ins compare by identity. */
  markers: {
    formField: glassEasel.GeneralBehavior
    formFieldGroup: glassEasel.GeneralBehavior
    formFieldButton: glassEasel.GeneralBehavior
  }
}

const registries = new WeakMap<glassEasel.ComponentSpace, PublicBuiltinBehaviorRegistry>()

/** Public behaviors registered in this render space, keyed by id. */
export function getPublicBuiltinBehaviors(
  space: glassEasel.ComponentSpace,
): PublicBuiltinBehaviors | undefined {
  return registries.get(space)?.behaviors
}

type BuiltinBehaviorSource = {
  /** The internal `tiny-label-target` marker, already defined by the host. */
  labelTarget: glassEasel.GeneralBehavior
}

/**
 * Render-side registry for `wx://` built-in behaviors.
 *
 * The id set mirrors the kernel's supported list
 * (`BUILTIN_BEHAVIOR_NAMES` in `@tiny/runtime`): the same six placeholders,
 * with the semantics that must be observable in the render tree
 * (`form-field-button` re-emit, `label-target` activation) living on the
 * render-side behavior objects.
 *
 * glass-easel resolves behavior strings through URL rules, so a `wx://` id
 * cannot be looked up by string from a component whose `is` is an artifact
 * path. The registry therefore exposes behavior *objects*, and components
 * compare markers by identity.
 *
 * `wx://request-filter`, `wx://request-sender`, `wx://functional-page-behavior`
 * and the `wx://proxy-*` ids are intentionally absent: the kernel reports them
 * as `UNSUPPORTED_BEHAVIOR`, so the render side must not silently accept them.
 */
type FormFieldButtonRuntime = {
  _tinyFormFieldButtonReemitting?: boolean
  triggerEvent: (name: string, detail: unknown, options: unknown) => void
}

export function createPublicBuiltinBehaviors(
  space: glassEasel.ComponentSpace,
  builtins: BuiltinBehaviorSource,
): PublicBuiltinBehaviorRegistry {
  const formField = space.defineBehavior({ is: BUILTIN_BEHAVIOR_IDS.formField })
  const formFieldGroup = space.defineBehavior({ is: BUILTIN_BEHAVIOR_IDS.formFieldGroup })
  const formFieldButton = space.defineBehavior({
    is: BUILTIN_BEHAVIOR_IDS.formFieldButton,
    listeners: {
      // Re-emit at the component host so an enclosing `<form>` (which sits
      // outside this component's shadow tree) receives the event. The guard
      // prevents the host re-trigger from feeding the same listener again.
      formSubmit(this: FormFieldButtonRuntime, event: unknown) {
        if (this._tinyFormFieldButtonReemitting) return
        this._tinyFormFieldButtonReemitting = true
        try {
          this.triggerEvent('formSubmit', event, { bubbles: true })
        } finally {
          this._tinyFormFieldButtonReemitting = false
        }
      },
      formReset(this: FormFieldButtonRuntime, event: unknown) {
        if (this._tinyFormFieldButtonReemitting) return
        this._tinyFormFieldButtonReemitting = true
        try {
          this.triggerEvent('formReset', event, { bubbles: true })
        } finally {
          this._tinyFormFieldButtonReemitting = false
        }
      },
    },
  })

  const behaviors: PublicBuiltinBehaviors = {
    // Marker only, like the kernel. `<form>` reads the node attributes/props
    // (WeChat's view-side form does the same), so the behavior must not inject
    // `name` / `value` into the component definition.
    [PUBLIC_BUILTIN_BEHAVIOR_IDS.formField]: space.defineBehavior({
      is: PUBLIC_BUILTIN_BEHAVIOR_IDS.formField,
      behaviors: [formField],
    }),
    [PUBLIC_BUILTIN_BEHAVIOR_IDS.formFieldGroup]: space.defineBehavior({
      is: PUBLIC_BUILTIN_BEHAVIOR_IDS.formFieldGroup,
      behaviors: [formFieldGroup],
    }),
    [PUBLIC_BUILTIN_BEHAVIOR_IDS.formFieldButton]: space.defineBehavior({
      is: PUBLIC_BUILTIN_BEHAVIOR_IDS.formFieldButton,
      behaviors: [formFieldButton],
    }),
    [PUBLIC_BUILTIN_BEHAVIOR_IDS.labelTarget]: space.defineBehavior({
      is: PUBLIC_BUILTIN_BEHAVIOR_IDS.labelTarget,
      behaviors: [builtins.labelTarget],
    }),
  }
  // Marker-only ids: the render side attaches them so `hasBehavior` and
  // marker identity work, but they carry no properties/methods.
  for (const id of [
    PUBLIC_BUILTIN_BEHAVIOR_IDS.styleFilter,
    PUBLIC_BUILTIN_BEHAVIOR_IDS.componentExport,
  ]) {
    behaviors[id] = space.defineBehavior({ is: id })
  }

  const registry: PublicBuiltinBehaviorRegistry = {
    behaviors,
    markers: { formField, formFieldGroup, formFieldButton },
  }
  registries.set(space, registry)
  return registry
}
