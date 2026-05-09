// Binding map — mirrors src/binding_map.rs
//
// BindingMapCollector tracks which data fields are used in templates and how many
// times each field appears (for pre-allocating the binding array slots).
// BindingMapKeys is attached to each expression node and records which fields
// the expression reads, so the code generator can write the correct `A[field][idx]=`
// assignment prefixes.

import { genLitStr } from './escape'
import type { JsExprWriter, JsFunctionScopeWriter } from './proc_gen/writer'

// ---------------------------------------------------------------------------
// BindingMapField
// ---------------------------------------------------------------------------
type BindingMapField = { kind: 'Mapped'; count: number } | { kind: 'Disabled' }

// ---------------------------------------------------------------------------
// BindingMapCollector — mirrors BindingMapCollector in binding_map.rs
// ---------------------------------------------------------------------------
export class BindingMapCollector {
  private overallDisabled: boolean = false
  private fields: Map<string, BindingMapField> = new Map()

  disableAll(): void {
    this.overallDisabled = true
  }

  /**
   * Register a field access and return the slot index for this access,
   * or `null` if the field is disabled.
   */
  addField(field: string): number | null {
    let entry = this.fields.get(field)
    if (entry === undefined) {
      entry = { kind: 'Mapped', count: 0 }
      this.fields.set(field, entry)
    }
    if (entry.kind === 'Mapped') {
      const ret = entry.count
      entry.count += 1
      return ret
    }
    return null
  }

  disableField(field: string): void {
    this.fields.set(field, { kind: 'Disabled' })
  }

  /** Returns `true` if the field is mapped (not disabled and not overall-disabled). */
  hasField(field: string): boolean {
    if (this.overallDisabled) return false
    const entry = this.fields.get(field)
    return entry !== undefined && entry.kind === 'Mapped'
  }

  /** Iterate over all mapped fields as [fieldName, count]. */
  *listFields(): IterableIterator<[string, number]> {
    if (this.overallDisabled) return
    for (const [key, field] of this.fields) {
      if (field.kind === 'Mapped') {
        yield [key, field.count]
      }
    }
  }
}

// ---------------------------------------------------------------------------
// BindingMapKeys — mirrors BindingMapKeys in binding_map.rs
// ---------------------------------------------------------------------------
export class BindingMapKeys {
  private keys: Array<[string, number]> = []

  add(key: string, index: number): void {
    this.keys.push([key, index])
  }

  isEmpty(bmc: BindingMapCollector): boolean {
    for (const [key] of this.keys) {
      if (bmc.hasField(key)) return false
    }
    return true
  }

  /**
   * Emit:
   *   `A[<key>][<idx>]=<expr>;A[<key2>][<idx2>]=<expr>;...;<fallback expr>`
   *
   * Mirrors `to_proc_gen_write_map()` in binding_map.rs.
   * `writeExpr` writes the actual expression value at the end.
   */
  toProcGenWriteMap(
    w: JsFunctionScopeWriter,
    bmc: BindingMapCollector,
    writeExpr: (w: JsFunctionScopeWriter) => void,
  ): void {
    // Generates: A[key][idx]=(D,E,T)=>{ writeExpr body }
    w.exprStmt((ew) => {
      for (const [key, index] of this.keys) {
        if (bmc.hasField(key)) {
          ew.write('A[' + genLitStr(key) + '][' + index + ']=')
        }
      }
      ew.functionArgs('D,E,T', (fw) => {
        writeExpr(fw)
      })
    })
  }
}
