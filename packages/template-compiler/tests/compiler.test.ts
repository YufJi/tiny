import { describe, it, expect } from 'vitest';
import { TmplGroup } from '../src/group';
import { parseTemplate } from '../src/parse/tag';
import { parseExpression } from '../src/parse/expression';
import { createParseState } from '../src/parse/parse-state';
import { generateCode } from '../src/codegen';

describe('Expression Parser', () => {
  it('should parse simple identifier', () => {
    const ps = createParseState('', 'foo');
    const expr = parseExpression(ps);
    expect(expr).toBeDefined();
    expect(expr?.type).toBe('DataField');
    if (expr?.type === 'DataField') {
      expect(expr.name).toBe('foo');
    }
  });

  it('should parse string literal', () => {
    const ps = createParseState('', '"hello"');
    const expr = parseExpression(ps);
    expect(expr).toBeDefined();
    expect(expr?.type).toBe('LitStr');
    if (expr?.type === 'LitStr') {
      expect(expr.value).toBe('hello');
    }
  });

  it('should parse number literal', () => {
    const ps = createParseState('', '42');
    const expr = parseExpression(ps);
    expect(expr).toBeDefined();
    expect(expr?.type).toBe('LitInt');
    if (expr?.type === 'LitInt') {
      expect(expr.value).toBe(42);
    }
  });

  it('should parse boolean literal', () => {
    const ps = createParseState('', 'true');
    const expr = parseExpression(ps);
    expect(expr).toBeDefined();
    expect(expr?.type).toBe('LitBool');
    if (expr?.type === 'LitBool') {
      expect(expr.value).toBe(true);
    }
  });

  it('should parse binary expression', () => {
    const ps = createParseState('', 'a + b');
    const expr = parseExpression(ps);
    expect(expr).toBeDefined();
    expect(expr?.type).toBe('Binary');
    if (expr?.type === 'Binary') {
      expect(expr.op).toBe('+');
      expect(expr.left.type).toBe('DataField');
      expect(expr.right.type).toBe('DataField');
    }
  });

  it('should parse conditional expression', () => {
    const ps = createParseState('', 'a ? b : c');
    const expr = parseExpression(ps);
    expect(expr).toBeDefined();
    expect(expr?.type).toBe('Conditional');
    if (expr?.type === 'Conditional') {
      expect(expr.cond.type).toBe('DataField');
      expect(expr.thenBranch.type).toBe('DataField');
      expect(expr.elseBranch.type).toBe('DataField');
    }
  });

  it('should parse member access', () => {
    const ps = createParseState('', 'obj.prop');
    const expr = parseExpression(ps);
    expect(expr).toBeDefined();
    expect(expr?.type).toBe('StaticMember');
    if (expr?.type === 'StaticMember') {
      expect(expr.fieldName).toBe('prop');
      expect(expr.obj.type).toBe('DataField');
    }
  });

  it('should parse function call', () => {
    const ps = createParseState('', 'fn(a, b)');
    const expr = parseExpression(ps);
    expect(expr).toBeDefined();
    expect(expr?.type).toBe('FuncCall');
    if (expr?.type === 'FuncCall') {
      expect(expr.args.length).toBe(2);
    }
  });

  it('should parse array literal', () => {
    const ps = createParseState('', '[1, 2, 3]');
    const expr = parseExpression(ps);
    expect(expr).toBeDefined();
    expect(expr?.type).toBe('LitArr');
    if (expr?.type === 'LitArr') {
      expect(expr.fields.length).toBe(3);
    }
  });

  it('should parse object literal', () => {
    const ps = createParseState('', '{a: 1, b: 2}');
    const expr = parseExpression(ps);
    expect(expr).toBeDefined();
    expect(expr?.type).toBe('LitObj');
    if (expr?.type === 'LitObj') {
      expect(expr.fields.length).toBe(2);
    }
  });
});

describe('Template Parser', () => {
  it('should parse simple element', () => {
    const { template, warnings } = parseTemplate('test', '<view>hello</view>');
    expect(warnings.length).toBe(0);
    expect(template.content.length).toBe(1);
    expect(template.content[0].type).toBe('Element');
  });

  it('should parse element with attributes', () => {
    const { template, warnings } = parseTemplate('test', '<view class="container" id="main">content</view>');
    expect(warnings.length).toBe(0);
    const element = template.content[0];
    expect(element.type).toBe('Element');
    if (element.type === 'Element') {
      expect(element.element.kind.type).toBe('Normal');
      if (element.element.kind.type === 'Normal') {
        expect(element.element.kind.attributes.length).toBe(2);
      }
    }
  });

  it('should parse element with data binding', () => {
    const { template, warnings } = parseTemplate('test', '<view>{{title}}</view>');
    expect(warnings.length).toBe(0);
    expect(template.content.length).toBe(1);
  });

  it('should parse wx:for directive', () => {
    const { template, warnings } = parseTemplate('test', '<view wx:for="{{items}}">{{item}}</view>');
    expect(warnings.length).toBe(0);
    const element = template.content[0];
    expect(element.type).toBe('Element');
    if (element.type === 'Element') {
      expect(element.element.kind.type).toBe('For');
    }
  });

  it('should parse wx:for with wx:key', () => {
    const { template, warnings } = parseTemplate('test', '<view wx:for="{{items}}" wx:key="id">{{item.name}}</view>');
    expect(warnings.length).toBe(0);
    const element = template.content[0];
    expect(element.type).toBe('Element');
    if (element.type === 'Element') {
      expect(element.element.kind.type).toBe('For');
      if (element.element.kind.type === 'For') {
        expect(element.element.kind.key).toBeDefined();
      }
    }
  });

  it('should parse wx:if directive', () => {
    const { template, warnings } = parseTemplate('test', '<view wx:if="{{condition}}">content</view>');
    expect(warnings.length).toBe(0);
    const element = template.content[0];
    expect(element.type).toBe('Element');
    if (element.type === 'Element') {
      expect(element.element.kind.type).toBe('If');
    }
  });

  it('should parse import statement', () => {
    const { template, warnings } = parseTemplate('test', '<import src="header.wxml"/>');
    expect(warnings.length).toBe(0);
    expect(template.globals.imports.length).toBe(1);
    expect(template.globals.imports[0].src).toBe('header.wxml');
  });

  it('should parse include statement', () => {
    const { template, warnings } = parseTemplate('test', '<include src="footer.wxml"/>');
    expect(warnings.length).toBe(0);
    expect(template.globals.includes.length).toBe(1);
    expect(template.globals.includes[0].src).toBe('footer.wxml');
  });

  it('should parse template definition', () => {
    const { template, warnings } = parseTemplate('test', '<template name="item"><text>{{name}}</text></template>');
    expect(warnings.length).toBe(0);
    expect(template.globals.subTemplates.length).toBe(1);
    expect(template.globals.subTemplates[0].name).toBe('item');
  });

  it('should parse template reference', () => {
    const { template, warnings } = parseTemplate('test', '<template is="item" data="{{...data}}"/>');
    expect(warnings.length).toBe(0);
    const element = template.content[0];
    expect(element.type).toBe('Element');
    if (element.type === 'Element') {
      expect(element.element.kind.type).toBe('TemplateRef');
    }
  });

  it('should parse slot element', () => {
    const { template, warnings } = parseTemplate('test', '<slot name="header"><text>Default</text></slot>');
    expect(warnings.length).toBe(0);
    const element = template.content[0];
    expect(element.type).toBe('Element');
    if (element.type === 'Element') {
      expect(element.element.kind.type).toBe('Slot');
    }
  });
});

describe('TmplGroup', () => {
  it('should create new group', () => {
    const group = new TmplGroup();
    expect(group.len()).toBe(0);
  });

  it('should add template', () => {
    const group = new TmplGroup();
    const warnings = group.addTmpl('test', '<view>hello</view>');
    expect(warnings.length).toBe(0);
    expect(group.len()).toBe(1);
    expect(group.containsTemplate('test')).toBe(true);
  });

  it('should remove template', () => {
    const group = new TmplGroup();
    group.addTmpl('test', '<view>hello</view>');
    expect(group.removeTmpl('test')).toBe(true);
    expect(group.len()).toBe(0);
  });

  it('should get template tree', () => {
    const group = new TmplGroup();
    group.addTmpl('test', '<view>hello</view>');
    const tree = group.getTree('test');
    expect(tree).toBeDefined();
    expect(tree.path).toBe('test');
  });

  it('should list all templates', () => {
    const group = new TmplGroup();
    group.addTmpl('a', '<view>a</view>');
    group.addTmpl('b', '<view>b</view>');
    const templates = group.listTemplateTrees();
    expect(templates.length).toBe(2);
  });

  it('should calculate direct dependencies', () => {
    const group = new TmplGroup();
    group.addTmpl('header', '<view>header</view>');
    group.addTmpl('main', '<view><include src="header"/></view>');
    const deps = group.directDependencies('main');
    expect(deps).toContain('header');
  });

  it('should import another group', () => {
    const group1 = new TmplGroup();
    group1.addTmpl('a', '<view>a</view>');
    
    const group2 = new TmplGroup();
    group2.importGroup(group1);
    
    expect(group2.containsTemplate('a')).toBe(true);
  });

  it('should generate runtime string', () => {
    const group = new TmplGroup();
    const runtime = group.getRuntimeString();
    expect(runtime).toContain('X');
    expect(runtime).toContain('Y');
    expect(runtime).toContain('Z');
  });

  it('should generate template runtime', () => {
    const group = new TmplGroup();
    group.addTmpl('test', '<view>hello</view>');
    const code = group.getTemplateRuntime('test');
    expect(code).toContain('function');
  });

  it('should generate all templates runtime', () => {
    const group = new TmplGroup();
    group.addTmpl('a', '<view>a</view>');
    group.addTmpl('b', '<view>b</view>');
    const code = group.getAllTemplateRuntime();
    expect(code).toContain('a');
    expect(code).toContain('b');
  });
});

describe('Code Generator', () => {
  it('should generate code for simple template', () => {
    const { template } = parseTemplate('test', '<view>hello</view>');
    const code = generateCode(template);
    expect(code).toContain('function');
    expect(code).toContain('view');
  });

  it('should generate minimized code', () => {
    const { template } = parseTemplate('test', '<view>hello</view>');
    const code = generateCode(template, { minimize: true });
    expect(code).not.toContain('\n');
  });

  it('should match code snapshot', () => {
    const { template } = parseTemplate('test', '<view class="container">Hello</view>');
    const code = generateCode(template);
    expect(code).toMatchSnapshot();
  });

  it('should generate text node code', () => {
    const { template } = parseTemplate('test', '<text>Hello World</text>');
    const code = generateCode(template);
    expect(code).toContain('T(Y(');
    expect(code).toContain('Hello World');
  });

  it('should generate element with attributes', () => {
    const { template } = parseTemplate('test', '<view class="container" id="main">content</view>');
    const code = generateCode(template);
    expect(code).toContain('E(');
    expect(code).toContain('view');
    expect(code).toContain('class');
    expect(code).toContain('container');
  });

  it('should generate wx:for directive code', () => {
    const { template } = parseTemplate('test', '<view wx:for="{{items}}">{{item}}</view>');
    const code = generateCode(template);
    expect(code).toContain('F(');
    expect(code).toContain('item');
    expect(code).toContain('index');
  });

  it('should generate wx:for with wx:key code', () => {
    const { template } = parseTemplate('test', '<view wx:for="{{items}}" wx:key="id">{{item}}</view>');
    const code = generateCode(template);
    expect(code).toContain('F(');
    expect(code).toContain('id');
  });

  it('should generate wx:if directive code', () => {
    const { template } = parseTemplate('test', '<view wx:if="{{condition}}">content</view>');
    const code = generateCode(template);
    expect(code).toContain('B(');
  });

  it('should generate data binding expression', () => {
    const { template } = parseTemplate('test', '<view data="{{title}}"></view>');
    const code = generateCode(template);
    expect(code).toContain('D.title');
  });

  it('should generate complex expression', () => {
    const { template } = parseTemplate('test', '<view data="{{a + b}}"></view>');
    const code = generateCode(template);
    expect(code).toContain('D.a');
    expect(code).toContain('D.b');
  });

  it('should generate member access expression', () => {
    const { template } = parseTemplate('test', '<view data="{{obj.prop}}"></view>');
    const code = generateCode(template);
    expect(code).toContain('D.obj.prop');
  });

  it('should generate conditional expression', () => {
    const { template } = parseTemplate('test', '<view>{{condition ? "yes" : "no"}}</view>');
    const code = generateCode(template);
    expect(code).toContain('?');
    expect(code).toContain('yes');
    expect(code).toContain('no');
  });

  it('should generate nested elements', () => {
    const { template } = parseTemplate('test', '<view><text>inner</text></view>');
    const code = generateCode(template);
    expect(code).toContain('view');
    expect(code).toContain('text');
  });

  it('should generate block element', () => {
    const { template } = parseTemplate('test', '<block><view>1</view><view>2</view></block>');
    const code = generateCode(template);
    expect(code).toContain('function');
  });

  it('should generate template with path', () => {
    const { template } = parseTemplate('pages/index', '<view>home</view>');
    const code = generateCode(template);
    expect(code).toContain('pages/index');
  });

  it('should generate minimized code without spaces', () => {
    const { template } = parseTemplate('test', '<view class="a">b</view>');
    const code = generateCode(template, { minimize: true });
    expect(code).not.toContain('  ');
    expect(code).not.toContain('\n');
  });
});
