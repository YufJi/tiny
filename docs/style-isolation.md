# 样式隔离与内置组件样式

面向维护者。说明 Tiny 在不使用真实 Shadow DOM 的前提下，如何对齐微信 WebView 的样式隔离语义，以及内置组件（`tiny-*`）的样式边界在哪里。

结论对应的浏览器断言在 [scripts/glass-easel-browser.mjs:230](../scripts/glass-easel-browser.mjs#L230) 和 [scripts/glass-easel-browser.mjs:430](../scripts/glass-easel-browser.mjs#L430)。

## 1. 模型

Tiny 采用 **Flat DOM + scoped CSS**，隔离来自编译期改写、glass-easel 的 style scope 前缀和宿主渲染树的 class 写入，不依赖浏览器原生 Shadow DOM。

| 层 | 负责 | 不负责 |
| --- | --- | --- |
| 编译器 | 生成 scoped CSS、cascade role、scope 名称 | 不判断某个页面实际用了哪些组件 |
| service 逻辑树 | 注册样式、按页面计算 scope、决定下发的样式文本 | 不接触 DOM |
| 宿主渲染树 | 把样式文本写进 `<style>`，按 scope 写真实 class | 不根据文件名猜样式类型 |

三条不变量：

- scope 名称在编译期固定，运行时不再解析选择器；唯一的文本级改写是 `shared` 组件的 scope 替换。
- 页面/组件自己的元素只带**带前缀的 class**；页面元素额外保留无前缀 class，供 `app.wxss` 的全局规则命中。
- 内置组件的 `tiny-*` 宿主是公开边界；内部 DOM 只接受该组件自己的 `tiny-builtin-<tag>` scope。

固定的引擎命名集中在 [packages/manifest/src/engine-naming.ts:7](../packages/manifest/src/engine-naming.ts#L7)：`tiny-` 前缀、`tiny-scope` 通用 marker、`tiny-tag-` tag marker、`tiny-builtin-` 内置 scope、`wx-host` / `wx-style-scope`（后两个是 glass-easel 1.1.0 的临时同步，见 [docs/known-issues/glass-easel-naming.md](known-issues/glass-easel-naming.md)）。

## 2. 编译期

### 2.1 scope 命名

页面和组件各有一份 scope：`tiny-` + 源路径（非字母数字换成 `-`）。例如 `pages/todos/todos.wxss` → `tiny-pages-todos-todos`。`app.wxss` 没有 scope，按全局样式注册。见 [tools/cli/src/compiler/styles.ts:48](../tools/cli/src/compiler/styles.ts#L48)。

### 2.2 选择器改写

| 输入 | 输出 | 说明 |
| --- | --- | --- |
| `.card` | `.tiny-pages-todos-todos--card` | class 前缀 |
| `button` | `tiny-button:where(.tiny-pages-todos-todos--tiny-tag-button)` | tag 换成宿主 tag + marker class |
| `page`（页面样式） | `tiny-page:where([wx-host="tiny-pages-todos-todos"])` | 页面根用 host 属性锚定 |
| `page`（组件样式） | `tiny-page:where(.tiny-components-x-x--tiny-tag-page)` | 组件里的 `page` 不会命中页面根，见 6.2 |
| `*` / `#id` / 裸伪类 | `*:where(.tiny-pages-todos-todos--tiny-scope, [wx-host="tiny-pages-todos-todos"])` | 无锚 compound 补 scope 锚点 |
| `.card`（app） | `:where(.tiny-scope).card` | app 全局，但按应用 marker 锚定 |
| `page`（app） | `tiny-page:where(.tiny-scope)` | 页面根在挂载时被加上 `tiny-scope` |
| `:host {}` | `[wx-host="<scope>"] {}`，写入 `*.low.css` | 低优先级输出 |
| `75rpx` | `10vw` | 固定 750 基准 |

实现分别在 [packages/stylesheet-compiler/src/transformer.ts:101](../packages/stylesheet-compiler/src/transformer.ts#L101)（scope 锚点）、[:208](../packages/stylesheet-compiler/src/transformer.ts#L208)（class 前缀）、[:220](../packages/stylesheet-compiler/src/transformer.ts#L220)（tag 改写）、[:703](../packages/stylesheet-compiler/src/transformer.ts#L703)（`:host`）。`@import` 在编译期展开内联（[tools/cli/src/compiler/styles.ts:146](../tools/cli/src/compiler/styles.ts#L146)）。

`:host` 只在页面/组件样式里处理（`convertHost` 仅在存在 scope 时打开），`app.wxss` 里的 `:host` 不会产生低优先级规则。

锚点统一用 `:where()`，不改变原有特异性；tag 选择器保持 tag 级别的特异性（不会被 marker class 抬成 class 级别），因此组件的 tag 规则不会意外压过页面/组件的 class 规则。

### 2.3 app 样式的两份产物

`app.wxss` 保持全局，但 `apply-shared` / `shared` 组件的内部节点拿不到全局类名，所以编译期额外生成一份 **page-scope 模板**（[tools/cli/src/compiler/styles.ts:107](../tools/cli/src/compiler/styles.ts#L107)）：

```css
tiny-page:where(.__TINY_APP_PAGE_SCOPE__, [wx-host="__TINY_APP_PAGE_SCOPE__"]) { … }
:where(.__TINY_APP_PAGE_SCOPE__, …)./*__TINY_APP_PAGE_SCOPE__*/app-probe { … }
```

运行时按页面 scope 做纯字符串展开（[packages/runtime/src/tree/logic/glass-easel-adapter.ts:535](../packages/runtime/src/tree/logic/glass-easel-adapter.ts#L535)）：`.SIGN` → `.<pageScope>--tiny-scope`、`="SIGN"` → `="<pageScope>"`、`/*SIGN*/` → `<pageScope>--`。只有该页确实用到 `apply-shared` / `shared` 组件时才生成（[:451](../packages/runtime/src/tree/logic/glass-easel-adapter.ts#L451)）。

### 2.4 模板 marker

模板编译会给每个渲染元素加两个 class（[tools/cli/src/compiler/template-source.ts:87](../tools/cli/src/compiler/template-source.ts#L87)）：

```html
<button class="submit tiny-tag-button tiny-scope">
```

`tiny-tag-<tag>` 供 tag 选择器命中，`tiny-scope` 供 `*` / id / 裸伪类锚点命中。glass-easel 渲染时会再给它们加当前 scope 前缀，例如页面里实际得到 `tiny-pages-todos-todos--tiny-tag-button`。内置组件的模板用同一机制，前缀换成 `tiny-builtin-tag-`（见 4.3）。

## 3. 运行时

### 3.1 cascade role 与追加顺序

样式表按 role 分类，追加顺序固定为 **low-priority → app → page-scope → page/component**（[packages/runtime/src/tree/logic/glass-easel-adapter.ts:261](../packages/runtime/src/tree/logic/glass-easel-adapter.ts#L261)）：

`builtin` / `low-priority` / `app` / `page` / `component` / `page-scope` / `shared`（[packages/runtime/src/tree/logic/backend.ts:279](../packages/runtime/src/tree/logic/backend.ts#L279)）。

### 3.2 页面根

- 普通 Page 固定 `shared`；Component-as-page 读显式 `styleIsolation`，否则也是 `shared`（[packages/runtime/src/tree/logic/glass-easel-adapter.ts:374](../packages/runtime/src/tree/logic/glass-easel-adapter.ts#L374)）。
- 页面 definition 额外挂 `extraStyleScope: globalScope`，让页面元素**同时保留无前缀 class**，`app.wxss` 的 `.container` 才生效（[:293](../packages/runtime/src/tree/logic/glass-easel-adapter.ts#L293)）。
- 页面根在挂载时被加上 `tiny-scope`，app 的 `page` 规则因此可以只按 marker 锚定（[:797](../packages/runtime/src/tree/logic/glass-easel-adapter.ts#L797)）。

### 3.3 组件 isolation

schema 侧默认值：显式 `styleIsolation` → `addGlobalClass`（等价 `apply-shared`）→ JSON `styleIsolation` → 默认 `isolated`（[packages/runtime/src/component/component-schema.ts:51](../packages/runtime/src/component/component-schema.ts#L51)）。

| 配置 | `styleScope` | `extraStyleScope` | 效果 |
| --- | --- | --- | --- |
| `isolated`（默认） | 组件自己的 scope | 无 | 不接收页面/app 规则 |
| `apply-shared` / `addGlobalClass` | 组件自己的 scope | 当前 page scope | 接收页面/app 规则，自身样式不外泄 |
| `shared` | 组件自己的 scope | 当前 page scope | 同上，且组件 CSS 额外生成一份 page scope 副本 |

组件注册见 [packages/runtime/src/tree/logic/glass-easel-adapter.ts:884](../packages/runtime/src/tree/logic/glass-easel-adapter.ts#L884)。逻辑树后端把 `extraStyleScope` 与组件自身 `styleScope` 一起交给组件的 shadowRoot 子树，`isolated` 组件不继承 owner 的 scope（[packages/runtime/src/tree/logic/backend.ts:235](../packages/runtime/src/tree/logic/backend.ts#L235)）。

### 3.4 `shared` 的 CSS 重写

`shared` 组件的样式文本会把 `componentScope` 直接替换成 `pageScope`，注册成 `role: shared`（[packages/runtime/src/tree/logic/glass-easel-adapter.ts:404](../packages/runtime/src/tree/logic/glass-easel-adapter.ts#L404)）。这是纯字符串替换，scope 名不会出现在声明值里，但不要在组件样式里手写自己的 scope 名。

### 3.5 下发

service 把当前页的 `styles`（已按 role 过滤）和可选的 `fallbackAppStyles` 放进 `tree.flow` / `tree.snapshot`（[packages/runtime/src/service/thread.ts:328](../packages/runtime/src/service/thread.ts#L328)）。`app` 与 `builtin` 两类**不随 flow 下发**（[packages/runtime/src/tree/logic/backend.ts:374](../packages/runtime/src/tree/logic/backend.ts#L374)）：app 走 page-scope 副本或 fallback，builtin 归宿主。

渲染线程只把收到的文本交给 `applyStyles`（[packages/runtime/src/tree/render/thread.ts:153](../packages/runtime/src/tree/render/thread.ts#L153)）。

### 3.6 渲染树写 class

`applyClassProps`（[hosts/web-components/src/render-tree.ts:168](../hosts/web-components/src/render-tree.ts#L168)）负责把逻辑树快照里的 class 写成真实 DOM：

- 普通 class：写无前缀名 + 每个 scope 的 `<scope>--<class>`；
- `~class`：只按 page scope 展开（用于从组件内部显式引用页面样式）；
- `^class` / `^^class`：按 `scopeChain` 向上取父/祖先 scope；
- `externalClasses`：外部传入的 class 名同时按当前组件 scope 与 page scope 展开。

样式文本统一写进一个 `<style data-tiny-tree-styles wx-style-scope>`（[hosts/web-components/src/render-tree.ts:1543](../hosts/web-components/src/render-tree.ts#L1543)）。

## 4. 内置组件样式

### 4.1 构建期拆成两份

内置样式按微信 WebView 2.30.1 的 `WAWebview.css` / `WAWebview.js` 重构，`wx-*` 选择器按引擎命名规则机械替换为 `tiny-*`。公共基线（文档 `html`/`body`/`:root`、`* { margin: 0 }`、weui `@font-face`）已迁移到 [hosts/web-components/src/styles/index.css](../hosts/web-components/src/styles/index.css)；组件级样式在各 `src/components/<tag>/index.css`，按组件逐个替换。

[hosts/web-components/scripts/build-styles.mjs:28](../hosts/web-components/scripts/build-styles.mjs#L28) 按选择器是否以 `tiny-<tag>` 开头分流（这个前缀判据本身有已知缺陷，见 [known-issues/builtin-style-selectors.md](known-issues/builtin-style-selectors.md)）：

- **公开宿主样式** → 全局 `BUILTIN_HOST_STYLES`：`tiny-*` 的默认外观、`tiny-*[hidden]`（[hosts/web-components/src/styles/index.css:1](../hosts/web-components/src/styles/index.css#L1)）、weui `@font-face`。app/page/component 规则可以正常定制宿主。
- **私有内部样式** → 每个组件一份 `tiny-builtin-<tag>.css`，用 `classPrefix = tiny-builtin-<tag>`、`tagClassPrefix = tiny-builtin-<tag>--tiny-builtin-tag-`、`scopeMarkerClass = tiny-builtin-scope` 编译（[hosts/web-components/scripts/shared.mjs:1](../hosts/web-components/scripts/shared.mjs#L1)）。

生成物形态（[hosts/web-components/src/generated/styles.ts](../hosts/web-components/src/generated/styles.ts)，构建产物）：

```css
/* 宿主：全局、公开 */
tiny-button { … }

/* 内部：scope = tiny-builtin-button */
.tiny-builtin-button--tiny-button-cover-view-wrapper { … }
.tiny-builtin-text--tiny-text-raw { display: none; }
```

### 4.2 scope 注册与宿主边界

每个内置组件注册自己的 scope，并作为 `styleScope` 挂在定义上（[hosts/web-components/src/index.ts:82](../hosts/web-components/src/index.ts#L82)）：

```ts
hostOptions: () => ({
  virtualHost: false,
  hostNodeTagName: 'tiny-*',
  reflectToAttributes: true,
  styleScope: styleScopeFor(tag), // tiny-builtin-<tag>
})
```

逻辑树的 `createComponent` 只把组件**自己的** `styleScope`（以及 `extraStyleScope`）放进它的 shadowRoot 子树（[packages/runtime/src/tree/logic/backend.ts:235](../packages/runtime/src/tree/logic/backend.ts#L235)）。因此：

- 宿主元素拿不到 `tiny-builtin-<tag>`，它是页面/父组件的节点，属于公开边界；
- 内部节点带 `tiny-builtin-<tag>--` 前缀，全局选择器无法直接命中。

### 4.3 内部模板 marker

内置模板构建时给每个元素注入 `tiny-builtin-tag-<hostTag> tiny-builtin-scope`（[hosts/web-components/scripts/build-templates.mjs:25](../hosts/web-components/scripts/build-templates.mjs#L25)），再由 glass-easel 加 scope 前缀。因此内部 tag 选择器形如：

```css
tiny-text:where(.tiny-builtin-text--tiny-builtin-tag-tiny-text) > span:where(.tiny-builtin-text--tiny-builtin-tag-span)
```

这种写法要求宿主带内部 marker，目前不会命中，见 [docs/known-issues/builtin-style-selectors.md](known-issues/builtin-style-selectors.md)。

### 4.4 安装位置

宿主在 render 入口一次性安装，早于线程 ready（[hosts/web-components/src/render-entry.ts:28](../hosts/web-components/src/render-entry.ts#L28)）：

```ts
style.textContent = [BUILTIN_BASE_STYLES, BUILTIN_HOST_STYLES,
  ...BUILTIN_COMPONENT_STYLES.map(s => s.content)].join('\n')
```

`webBuiltinComponents.styles`（[hosts/web-components/src/index.ts:127](../hosts/web-components/src/index.ts#L127)）声明了同样内容的注册接口，但当前浏览器宿主实际走的是 `createGlassRenderEntry().prepare()` 这条路径；service 侧的 `role: 'builtin'` 会被显式过滤，不随页面下发。

### 4.5 受控穿透

- `externalClasses`：`input` / `textarea` 的 `placeholder-class`、通用 `hover-class`（[hosts/web-components/src/render-tree.ts:1079](../hosts/web-components/src/render-tree.ts#L1079)）。
- 继承属性与 CSS 变量：`--tiny-switch-color`、`--tiny-radio-color`、`--picker-item-height` 等由宿主 `style` 设置、内部消费。
- 宿主属性反射：`disabled`、`type=primary`、`hidden` 等变体都写在 `tiny-*` 宿主上。

### 4.6 与页面/组件规则的关系

- 页面/app 规则可以改 `tiny-*` 宿主的外观（公开边界）。
- 内部节点只有 class 规则可用；tag/属性选择器即使写对了 marker 也依赖宿主，不能穿透。
- `page` 选择器写在组件 WXSS 里不会命中页面根（见 6.2）。

## 5. 验收断言

[scripts/glass-easel-browser.mjs:230](../scripts/glass-easel-browser.mjs#L230) 覆盖：app `page` 规则、`wx-host` / `wx-style-scope` 临时边界、页面 scope marker、app 全局 `*` 不能进入内置组件内部、组件里的 `page` 规则不泄漏到页面根。

[scripts/glass-easel-browser.mjs:430](../scripts/glass-easel-browser.mjs#L430) 覆盖：isolated 不接收页面样式、`~`/`^`/`^^` 的 scope 解析、apply-shared/shared 能收到页面与 app 规则、shared 组件样式回写页面但不进 isolated、`:host` 生效（3px 边框）。

## 6. 边界与已知问题

### 6.1 Flat DOM 的边界

隔离依赖编译期 marker 和 scope 前缀。运行时动态写入、绕过编译器的 CSS 不在保证范围内；宿主 DOM 是扁平树，不是浏览器原生 Shadow DOM。

### 6.2 组件里的 `page` 选择器

组件 WXSS 里的 `page {}` 会被改写成 `tiny-page:where(.<componentScope>--tiny-tag-page)`，而页面根只带 `.tiny-scope` 和 `wx-host`，因此不会命中。这是有意行为，验收里以 `--tiny-component-page-probe` 断言为空。需要页面级样式时写到页面 WXSS 或 `app.wxss`。

### 6.3 已确认的选择器不命中

内置样式里有三条规则在当前产物下不会生效（`tiny-text > span`、`tiny-button tiny-cover-view`、`tiny-button[native] …`），原因、影响和修法见 [docs/known-issues/builtin-style-selectors.md](known-issues/builtin-style-selectors.md)。

## 7. 代码索引

| 关注点 | 位置 |
| --- | --- |
| 选择器改写引擎 | [packages/stylesheet-compiler/src/transformer.ts](../packages/stylesheet-compiler/src/transformer.ts) |
| 页面/组件样式与 app page-scope 模板 | [tools/cli/src/compiler/styles.ts](../tools/cli/src/compiler/styles.ts) |
| 模板 marker 注入 | [tools/cli/src/compiler/template-source.ts](../tools/cli/src/compiler/template-source.ts) |
| scope / role / 下发 | [packages/runtime/src/tree/logic/glass-easel-adapter.ts](../packages/runtime/src/tree/logic/glass-easel-adapter.ts) |
| 逻辑树视图描述与 role | [packages/runtime/src/tree/logic/backend.ts](../packages/runtime/src/tree/logic/backend.ts) |
| 内置样式拆分 | [hosts/web-components/scripts/build-styles.mjs](../hosts/web-components/scripts/build-styles.mjs) |
| 内置组件 scope 注册 | [hosts/web-components/src/index.ts](../hosts/web-components/src/index.ts) |
| 内置样式安装 | [hosts/web-components/src/render-entry.ts](../hosts/web-components/src/render-entry.ts) |
| class 写入与样式注入 | [hosts/web-components/src/render-tree.ts](../hosts/web-components/src/render-tree.ts) |
| 浏览器验收 | [scripts/glass-easel-browser.mjs](../scripts/glass-easel-browser.mjs) |
