# @tiny/template-compiler

Glass-easel template compiler 的 Node.js 实现版本，将 WXML 模板编译为 JavaScript 代码。

## 功能特性

- **模板解析**: 将 WXML 模板解析为 AST
- **表达式解析**: 支持完整的 JavaScript 表达式语法（包括运算符、函数调用、对象/数组字面量等）
- **代码生成**: 将 AST 编译为可执行的 JavaScript 代码
- **模板组管理**: 支持多模板管理和依赖关系处理
- **指令支持**: wx:for, wx:if, wx:elif, wx:else, import, include 等
- **WXS 支持**: 支持小程序 WXS 脚本

## 安装

```bash
pnpm install @tiny/template-compiler
```

## 使用方法

### 基础用法

```typescript
import { TmplGroup } from '@tiny/template-compiler';

const group = new TmplGroup();

// 添加模板
const warnings = group.addTmpl('index', `
  <view class="container">
    <text>{{title}}</text>
    <view wx:for="{{items}}" wx:key="id">
      {{item.name}}
    </view>
  </view>
`);

if (warnings.length > 0) {
  console.warn('编译警告:', warnings);
}

// 获取生成的代码
const code = group.getTemplateRuntime('index');
console.log(code);
```

### 模板组管理

```typescript
import { TmplGroup } from '@tiny/template-compiler';

const group = new TmplGroup();

// 添加多个模板
group.addTmpl('header', '<view>Header</view>');
group.addTmpl('footer', '<view>Footer</view>');
group.addTmpl('main', `
  <view>
    <include src="header"/>
    <text>Main Content</text>
    <include src="footer"/>
  </view>
`);

// 获取依赖关系
const deps = group.directDependencies('main');
console.log(deps); // ['header', 'footer']

// 获取所有模板运行时
const allCode = group.getAllTemplateRuntime();
```

### 开发模式

```typescript
const group = TmplGroup.newDev(); // 启用开发模式，生成格式化代码

// 或者
const group = new TmplGroup({ devMode: true });
```

## API 文档

### TmplGroup

模板组管理类，用于管理多个模板及其依赖关系。

#### 构造函数

```typescript
new TmplGroup(options?: { devMode?: boolean })
```

#### 方法

- `addTmpl(path: string, tmplStr: string): ParseError[]` - 添加模板
- `removeTmpl(path: string): boolean` - 移除模板
- `getTree(path: string): Template` - 获取模板 AST
- `containsTemplate(path: string): boolean` - 检查模板是否存在
- `listTemplateTrees(): Array<[string, Template]>` - 列出所有模板
- `len(): number` - 获取模板数量
- `directDependencies(path: string): string[]` - 获取直接依赖
- `indirectDependencies(path: string): string[]` - 获取间接依赖
- `importGroup(group: TmplGroup): void` - 导入其他模板组
- `getTemplateRuntime(path: string): string` - 获取单个模板运行时代码
- `getAllTemplateRuntime(): string` - 获取所有模板运行时代码
- `getRuntimeString(): string` - 获取运行时辅助函数
- `getWxsRuntimeString(): string` - 获取 WXS 运行时

### parseTemplate

解析单个模板字符串。

```typescript
import { parseTemplate } from '@tiny/template-compiler';

const { template, warnings } = parseTemplate('path/to/template', '<view>content</view>');
```

### parseExpression

解析表达式字符串。

```typescript
import { parseExpression, createParseState } from '@tiny/template-compiler';

const ps = createParseState('', 'a + b');
const expr = parseExpression(ps);
```

### generateCode

生成 JavaScript 代码。

```typescript
import { generateCode, parseTemplate } from '@tiny/template-compiler';

const { template } = parseTemplate('test', '<view>hello</view>');
const code = generateCode(template, { minimize: true });
```

## 支持的语法

### 数据绑定

```xml
<text>{{message}}</text>
<view id="item-{{id}}"></view>
```

### 列表渲染

```xml
<view wx:for="{{array}}" wx:key="unique">
  {{index}}: {{item.message}}
</view>

<view wx:for="{{array}}" wx:for-item="myItem" wx:for-index="myIndex">
  {{myIndex}}: {{myItem.name}}
</view>
```

### 条件渲染

```xml
<view wx:if="{{condition}}">True</view>
<view wx:elif="{{anotherCondition}}">Else If</view>
<view wx:else>Else</view>
```

### 模板

```xml
<template name="msgItem">
  <view>
    <text>{{index}}: {{msg}}</text>
  </view>
</template>

<template is="msgItem" data="{{...item}}"/>
```

### 引用

```xml
<import src="item.wxml"/>
<include src="header.wxml"/>
```

### 表达式

支持完整的 JavaScript 表达式：

- 运算符: `+`, `-`, `*`, `/`, `%`, `==`, `!=`, `===`, `!==`, `<`, `>`, `<=`, `>=`, `&&`, `||`, `!`
- 三元运算符: `condition ? a : b`
- 成员访问: `obj.prop`, `obj['prop']`
- 函数调用: `fn(arg1, arg2)`
- 数组字面量: `[1, 2, 3]`
- 对象字面量: `{a: 1, b: 2}`
- 展开运算符: `{...obj}`, `[...arr]`

## 与 glass-easel-template-compiler 的差异

1. **实现语言**: 原版本使用 Rust + WASM，本版本使用纯 TypeScript
2. **性能**: 原版本性能更优，本版本更易于集成和调试
3. **依赖**: 本版本零依赖，原版本需要 WASM 运行时
4. **API 兼容性**: 保持 API 设计一致，便于迁移

## 测试

```bash
# 运行测试
pnpm test

# 监视模式
pnpm test:watch
```

## License

MIT
