import type * as glassEasel from 'glass-easel'
import { DEFAULT_BEHAVIOR_SCHEME } from '@tiny/manifest'
import { BUILTIN_BEHAVIOR_IDS } from './ids'

export const PUBLIC_BUILTIN_BEHAVIOR_NAMES = [
  'componentExport',
  'formField',
  'formFieldButton',
  'formFieldGroup',
  'labelTarget',
  'styleFilter',
] as const

export type PublicBuiltinBehaviorName = (typeof PUBLIC_BUILTIN_BEHAVIOR_NAMES)[number]

const PUBLIC_BUILTIN_BEHAVIOR_SUFFIX: Record<PublicBuiltinBehaviorName, string> = {
  componentExport: 'component-export',
  formField: 'form-field',
  formFieldButton: 'form-field-button',
  formFieldGroup: 'form-field-group',
  labelTarget: 'label-target',
  styleFilter: 'style-filter',
}

/**
 * Public behavior ids for a compatibility scheme.
 *
 * The scheme is part of the runtime compatibility config (`wx://` by default),
 * so it must come from the service rather than from a literal here.
 */
export function publicBuiltinBehaviorIds(
  scheme: string = DEFAULT_BEHAVIOR_SCHEME,
): Record<PublicBuiltinBehaviorName, string> {
  return Object.fromEntries(
    PUBLIC_BUILTIN_BEHAVIOR_NAMES.map((name) => [name, `${scheme}${PUBLIC_BUILTIN_BEHAVIOR_SUFFIX[name]}`]),
  ) as Record<PublicBuiltinBehaviorName, string>
}

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

const registries = new WeakMap<glassEasel.ComponentSpace, Map<string, PublicBuiltinBehaviorRegistry>>()
const sources = new WeakMap<glassEasel.ComponentSpace, BuiltinBehaviorSource>()

/**
 * Public behaviors registered in this render space for a scheme, keyed by id.
 *
 * A different scheme (from the service's compatibility config) registers a
 * second registry in the same space; the default one stays for built-ins.
 */
export function getPublicBuiltinBehaviors(
  space: glassEasel.ComponentSpace,
  scheme: string = DEFAULT_BEHAVIOR_SCHEME,
): PublicBuiltinBehaviors | undefined {
  const byScheme = registries.get(space)
  if (!byScheme) return undefined
  const existing = byScheme.get(scheme)
  if (existing) return existing.behaviors
  const source = sources.get(space)
  if (!source) return undefined
  return createPublicBuiltinBehaviors(space, source, scheme).behaviors
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
  scheme: string = DEFAULT_BEHAVIOR_SCHEME,
): PublicBuiltinBehaviorRegistry {
  const ids = publicBuiltinBehaviorIds(scheme)
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
    [ids.formField]: space.defineBehavior({
      is: ids.formField,
      behaviors: [formField],
    }),
    [ids.formFieldGroup]: space.defineBehavior({
      is: ids.formFieldGroup,
      behaviors: [formFieldGroup],
    }),
    [ids.formFieldButton]: space.defineBehavior({
      is: ids.formFieldButton,
      behaviors: [formFieldButton],
    }),
    [ids.labelTarget]: space.defineBehavior({
      is: ids.labelTarget,
      behaviors: [builtins.labelTarget],
    }),
  }
  // Marker-only ids: the render side attaches them so `hasBehavior` and
  // marker identity work, but they carry no properties/methods.
  for (const id of [ids.styleFilter, ids.componentExport]) {
    behaviors[id] = space.defineBehavior({ is: id })
  }

  const registry: PublicBuiltinBehaviorRegistry = {
    behaviors,
    markers: { formField, formFieldGroup, formFieldButton },
  }
  sources.set(space, builtins)
  const byScheme = registries.get(space) ?? new Map<string, PublicBuiltinBehaviorRegistry>()
  byScheme.set(scheme, registry)
  registries.set(space, byScheme)
  return registry
}
