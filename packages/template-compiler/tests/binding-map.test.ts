import { describe, it, expect } from 'vitest';
import { BindingMapCollector, BindingMapKeys, extractBindingPaths } from '../src/binding-map';
import { parseExpression } from '../src/parse/expression';
import { createParseState } from '../src/parse/parse-state';

describe('Binding Map', () => {
  it('should create binding map collector', () => {
    const bmc = BindingMapCollector.new();
    expect(bmc).toBeDefined();
  });

  it('should add fields to binding map', () => {
    const bmc = BindingMapCollector.new();
    const index1 = bmc.addField('title');
    const index2 = bmc.addField('title');
    expect(index1).toBe(0);
    expect(index2).toBe(1);
  });

  it('should check if field exists', () => {
    const bmc = BindingMapCollector.new();
    bmc.addField('name');
    expect(bmc.getField('name')).toBe(true);
    expect(bmc.getField('age')).toBe(false);
  });

  it('should disable field', () => {
    const bmc = BindingMapCollector.new();
    bmc.addField('name');
    bmc.disableField('name');
    expect(bmc.getField('name')).toBe(false);
  });

  it('should disable all fields', () => {
    const bmc = BindingMapCollector.new();
    bmc.addField('name');
    bmc.addField('age');
    bmc.disableAll();
    expect(bmc.getField('name')).toBe(false);
    expect(bmc.getField('age')).toBe(false);
  });

  it('should list all fields', () => {
    const bmc = BindingMapCollector.new();
    bmc.addField('title');
    bmc.addField('title');
    bmc.addField('name');
    const fields = bmc.listFields();
    expect(fields).toContainEqual(['title', 2]);
    expect(fields).toContainEqual(['name', 1]);
  });
});

describe('Binding Map Keys', () => {
  it('should create binding map keys', () => {
    const bmk = BindingMapKeys.new();
    expect(bmk).toBeDefined();
  });

  it('should add keys', () => {
    const bmk = BindingMapKeys.new();
    bmk.add('title', 0);
    bmk.add('name', 1);
    const keys = bmk.getKeys();
    expect(keys).toHaveLength(2);
  });

  it('should check if empty', () => {
    const bmc = BindingMapCollector.new();
    const bmk = BindingMapKeys.new();
    
    bmk.add('title', 0);
    expect(bmk.isEmpty(bmc)).toBe(true);
    
    bmc.addField('title');
    expect(bmk.isEmpty(bmc)).toBe(false);
  });
});

describe('Extract Binding Paths', () => {
  it('should extract simple field', () => {
    const ps = createParseState('', 'title');
    const expr = parseExpression(ps);
    expect(expr).toBeDefined();
    if (expr) {
      const paths = extractBindingPaths(expr);
      expect(paths).toContain('title');
    }
  });

  it('should extract member access', () => {
    const ps = createParseState('', 'obj.prop');
    const expr = parseExpression(ps);
    expect(expr).toBeDefined();
    if (expr) {
      const paths = extractBindingPaths(expr);
      expect(paths).toContain('obj');
    }
  });

  it('should extract multiple fields from binary expression', () => {
    const ps = createParseState('', 'a + b');
    const expr = parseExpression(ps);
    expect(expr).toBeDefined();
    if (expr) {
      const paths = extractBindingPaths(expr);
      expect(paths).toContain('a');
      expect(paths).toContain('b');
    }
  });

  it('should extract from conditional', () => {
    const ps = createParseState('', 'condition ? a : b');
    const expr = parseExpression(ps);
    expect(expr).toBeDefined();
    if (expr) {
      const paths = extractBindingPaths(expr);
      expect(paths).toContain('condition');
      expect(paths).toContain('a');
      expect(paths).toContain('b');
    }
  });
});
