import { Expression } from './parse/expression';

export interface BindingMapField {
  type: 'Mapped' | 'Disabled';
  index?: number;
}

export class BindingMapCollector {
  private overallDisabled: boolean = false;
  private fields: Map<string, BindingMapField> = new Map();

  static new(): BindingMapCollector {
    return new BindingMapCollector();
  }

  disableAll(): void {
    this.overallDisabled = true;
  }

  addField(field: string): number | undefined {
    const existing = this.fields.get(field);
    if (existing) {
      if (existing.type === 'Disabled') return undefined;
      const index = existing.index || 0;
      this.fields.set(field, { type: 'Mapped', index: index + 1 });
      return index;
    }
    this.fields.set(field, { type: 'Mapped', index: 1 });
    return 0;
  }

  disableField(field: string): void {
    this.fields.set(field, { type: 'Disabled' });
  }

  getField(field: string): boolean {
    if (this.overallDisabled) return false;
    const f = this.fields.get(field);
    return f?.type === 'Mapped';
  }

  listFields(): Array<[string, number]> {
    if (this.overallDisabled) return [];
    const result: Array<[string, number]> = [];
    for (const [key, field] of this.fields) {
      if (field.type === 'Mapped') {
        result.push([key, field.index || 0]);
      }
    }
    return result;
  }
}

export interface BindingPath {
  field: string;
  index?: number;
}

export class BindingMapKeys {
  private keys: Array<[string, number]> = [];

  static new(): BindingMapKeys {
    return new BindingMapKeys();
  }

  add(key: string, index: number): void {
    this.keys.push([key, index]);
  }

  isEmpty(bmc: BindingMapCollector): boolean {
    for (const [key] of this.keys) {
      if (bmc.getField(key)) return false;
    }
    return true;
  }

  getKeys(): Array<[string, number]> {
    return this.keys;
  }
}

export function extractBindingPaths(expr: Expression): string[] {
  const paths: string[] = [];
  
  function extract(e: Expression, currentPath: string[] = []): void {
    switch (e.type) {
      case 'DataField':
        paths.push(e.name);
        break;
      case 'StaticMember':
        extract(e.obj, currentPath);
        if (currentPath.length > 0) {
          paths.push(`${currentPath.join('.')}.${e.fieldName}`);
        }
        break;
      case 'DynamicMember':
        extract(e.obj, currentPath);
        extract(e.fieldName, currentPath);
        break;
      case 'Binary':
        extract(e.left, currentPath);
        extract(e.right, currentPath);
        break;
      case 'Unary':
        extract(e.operand, currentPath);
        break;
      case 'Conditional':
        extract(e.cond, currentPath);
        extract(e.thenBranch, currentPath);
        extract(e.elseBranch, currentPath);
        break;
      case 'FuncCall':
        extract(e.func, currentPath);
        for (const arg of e.args) {
          extract(arg, currentPath);
        }
        break;
    }
  }
  
  extract(expr);
  return [...new Set(paths)];
}
