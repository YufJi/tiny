import { describe, it, expect } from 'vitest';
import { TmplGroup } from '../src/group';
import { stringifyTemplate } from '../src/stringify';
import { parseTemplate } from '../src/parse/tag';

describe('GlassEasel Group Tests', () => {
  it('basic_include', () => {
    const SRC_A = '<b a="{{a}}" /> <template name="a" />';
    const SRC_B = '<c a="{{a}}"> <include src="b/.././a" /> </c>';
    const group = new TmplGroup();
    group.addTmpl('a', SRC_A);
    group.addTmpl('b', SRC_B);
    expect(group.directDependencies('a')).toEqual([]);
    expect(group.directDependencies('b')).toEqual(['a']);
  });

  it('basic_import', () => {
    const SRC_A = '<b a="{{a}}" /> <template name="aa"><d a1="{{bb}}" a2="{{a}}" /></template>';
    const SRC_B = '<c a="{{a}}"> <import src="/a" /> <template is="aa" data="{{ bb: a + 1, cc: false }}" /> </c>';
    const group = new TmplGroup();
    group.addTmpl('a', SRC_A);
    group.addTmpl('b', SRC_B);
    expect(group.directDependencies('a')).toEqual([]);
    expect(group.directDependencies('b')).toEqual(['a']);
  });
});

describe('GlassEasel Script Tests', () => {
  it('external_script', () => {
    const SRC_A = '<wxs module="modA" src="/script/a" /> <wxs module="modB" src="../script/b" /> {{ modA.a + modB.b }}';
    const SRC_SCRIPT = '(function(){return 0})()';
    const group = new TmplGroup();
    group.addTmpl('tmpl/a', SRC_A);
    group.addScript('script/a', SRC_SCRIPT);
    group.addScript('script/b', SRC_SCRIPT);
    const deps = group.scriptDependencies('tmpl/a');
    expect(deps).toEqual(['script/a', 'script/b']);
  });

  it('inline_script', () => {
    const SRC_A = '<div>{{ modA.hi }}</div> <wxs module="modA"> exports.hi = 1 < 2 </wxs> <wxs module="modB" />';
    const group = new TmplGroup();
    group.addTmpl('tmpl/a', SRC_A);
    expect(group.scriptDependencies('tmpl/a')).toEqual([]);
    expect(group.inlineScriptModuleNames('tmpl/a')).toEqual(['modA', 'modB']);
    expect(group.inlineScriptContent('tmpl/a', 'modA')).toBe(' exports.hi = 1 < 2 ');
    expect(group.inlineScriptContent('tmpl/a', 'modB')).toBe('');
  });
});

describe('GlassEasel Stringify Tests', () => {
  it('stringifier', () => {
    const SRC_A = '<div><span> Hello world! </span></div>';
    const { template } = parseTemplate('a', SRC_A, { preserveWhitespace: true });
    const out = stringifyTemplate(template, { indent: 4 });
    expect(out).toBe('<div>\n    <span> Hello world! </span>\n</div>\n');
  });
});
