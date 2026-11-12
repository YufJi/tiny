# 内置组件样式：三条不命中的选择器

## Status

Open。已在浏览器中确认（`c4a769f3`），尚未修复。

## 现象

内置组件的内部样式表里有三处选择器在真实 DOM 上不会命中：

1. `text` 内部样式 `tiny-text > span`（[hosts/web-components/src/components/text/index.css:11](../../hosts/web-components/src/components/text/index.css#L11)）；
2. `button` 内部样式 `tiny-button tiny-cover-view`（[hosts/web-components/src/components/button/index.css:201](../../hosts/web-components/src/components/button/index.css#L201)）；
3. `button` 宿主样式 `tiny-button[native] .tiny-button-cover-view-wrapper` / `.tiny-button-cover-view-inner`（[hosts/web-components/src/components/button/index.css:185](../../hosts/web-components/src/components/button/index.css#L185)）。

其中第 3 条有可见后果：`native` button 的内部 padding 和继承边框不生效。

## 证据

用 Playwright 加载 `tests/host`（demo fixture），在 render iframe 里读取真实 DOM：

```text
tiny-text 宿主 class:
  title tiny-tag-text tiny-scope tiny-pages-todos-todos--title
  tiny-pages-todos-todos--tiny-tag-text tiny-pages-todos-todos--tiny-scope

tiny-text 宿主 matches(
  'tiny-text:where(.tiny-builtin-text--tiny-builtin-tag-tiny-text)'
) -> false

页面中带 tiny-builtin-tag-tiny-text 的元素数 -> 0
```

```text
native button 宿主 class:
  tiny-tag-button tiny-scope tiny-pages-semantics-semantics--tiny-tag-button
  tiny-pages-semantics-semantics--tiny-scope

wrapper class:
  tiny-builtin-button--tiny-button-cover-view-wrapper
  tiny-builtin-button--tiny-builtin-tag-cover-view
  tiny-builtin-button--tiny-builtin-scope

wrapper.matches('tiny-button[native] .tiny-button-cover-view-wrapper') -> false
wrapper computed padding-left -> 0px   /* 规则期望 14px */
wrapper computed border-left-width -> 0px
```

该用例的宿主本身没有边框，所以 padding 是最直接的可对照证据；`matches()` 为 `false` 已经说明规则整体不命中。

编译产物中的对应规则：

```css
/* 内置组件内部样式（scope = tiny-builtin-text） */
tiny-text:where(.tiny-builtin-text--tiny-builtin-tag-tiny-text)
  > span:where(.tiny-builtin-text--tiny-builtin-tag-span) { display: inline; }

/* 内置组件内部样式（scope = tiny-builtin-button） */
tiny-button:where(.tiny-builtin-button--tiny-builtin-tag-tiny-button)
  tiny-cover-view:where(.tiny-builtin-button--tiny-builtin-tag-tiny-cover-view) {
    line-height: inherit; white-space: inherit;
}

/* 全局宿主样式（无 scope 前缀） */
tiny-button[native] .tiny-button-cover-view-wrapper { border: inherit; … }
tiny-button[native] .tiny-button-cover-view-inner { padding: 0 14px; }
```

## 根因

### 1. 宿主没有内部 scope

`build-templates` 给内置模板的每个元素注入 `tiny-builtin-tag-<hostTag>`，由 glass-easel 加 `tiny-builtin-<tag>` 前缀；但**宿主元素本身不是模板产物**。逻辑树的 `createComponent` 只把 `styleScope` 放进 shadowRoot 子树（[packages/runtime/src/service/logic-tree/backend.ts](../../packages/runtime/src/service/logic-tree/backend.ts)），宿主只拿到使用处 class 和页面 scope。

所以任何「要求宿主带 `tiny-builtin-<tag>--…` marker」的内部选择器都不会命中。

### 2. `startsWithHostTag` 用前缀而不是主语分类

[hosts/web-components/scripts/build-styles.mjs:28](../../hosts/web-components/scripts/build-styles.mjs#L28) 只检查选择器是否以 `tiny-<tag>` 开头：

- `tiny-button[native] .tiny-button-cover-view-wrapper` 被当成宿主样式，整条规则放进全局表，class 不做任何前缀；
- 但内部元素的 class 实际是 `tiny-builtin-button--tiny-button-cover-view-wrapper`，全局规则里的无前缀 class 匹配不到；
- 反过来，`tiny-text > span` 的宿主 tag 后面跟的是后代组合子，不满足 `startsWithHostTag` 的几种前缀形式，被归到内部表并加上宿主 marker，同样匹配不到。

正确的判据应该是**选择器的主语（最后一个 compound）是否就是宿主本身**，而不是字符串前缀。

### 3. 模板与样式的类名不一致

`button` 模板内部元素用的是 `tiny-button-cover-view`（[hosts/web-components/src/components/button/template.wxml:4](../../hosts/web-components/src/components/button/template.wxml#L4)），但样式里写的是 `tiny-button-cover-view-inner`。因此即使把作用域问题修好，`-inner` 这几条规则仍然不会命中。

## 影响

| 规则 | 影响 |
| --- | --- |
| `tiny-text > span` | 无可见影响：`span` 默认就是 `display: inline` |
| `tiny-button tiny-cover-view` | 基本无可见影响：`line-height` / `white-space` 默认继承 |
| `tiny-button[native] .tiny-button-cover-view-wrapper` | 可见：原生 button 内部容器丢失继承边框、圆角和背景 |
| `tiny-button[native] .tiny-button-cover-view-inner` | 可见：原生 button 内部丢失左右 14px padding；`plain` 的 padding 归零也失效 |

## 修复建议

1. `text/index.css`：删除 `tiny-text > span`，或改成 `.tiny-text-main` 的 class 规则（`raw` 已有 `display: none`）。
2. `button/index.css`：把 cover-view 相关规则改成**内部 class 选择器**，不要再引用宿主 tag 或 `[native]`：
   - `.tiny-button-cover-view-wrapper` 上补 `border: inherit` / `border-radius: inherit` / `background-color: inherit`；
   - 把 `-inner` 改名为模板实际使用的 `.tiny-button-cover-view`，并在这里写 padding；
   - `[plain][native]` 的 padding 归零改成模板上的状态类（例如 `{{plain ? 'is-plain' : ''}}`），由内部 class 规则消费。
3. `build-styles.mjs`：在分流处加断言，拒绝两类写法，避免回归：
   - 「宿主选择器」含后代/组合子（说明它想穿透到内部）；
   - 「内部选择器」的首个 compound 是宿主 tag（说明它依赖宿主 marker）。
4. `hosts/web-components/tests/builtin-components.test.ts`：补一条 `native` button 的断言，检查 wrapper 的 `padding-left` / `border-left-width`；再补一条「内部样式不含宿主 marker 选择器」的静态断言。

## 验证方式

```bash
pnpm --filter @tiny/host-web-components test
pnpm accept:glass-easel   # 至少跑 P0 浏览器阶段
```

修复前可用以下方式复现：临时在 `tests/apps/demo/pages/semantics/semantics.wxml` 加一个 `<button native>`，`pnpm compile:glass-easel` 后在 render iframe 里读 wrapper 的 computed style。

## 相关文档

- [docs/style-isolation.md](../style-isolation.md)
- [docs/known-issues/glass-easel-naming.md](glass-easel-naming.md)
