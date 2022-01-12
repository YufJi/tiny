## 基础库


## 目前主要问题

生命周期与微信不一致

微信
- component created 
- component attached 
- page load 
- page show 
- component ready 
- page ready

tiny
- page load 
- component created 
- component attached 
- component ready 
- page show 
- page ready

## 解决方案（猜想阶段）

* 渲染全部web-component化
* 使用lit库
* fork源码使用

## 与此同时需要解决的问题

- 事件系统问题
- style属性
- animation属性


## 编译层处理事项

- 模板引用
```
import { html } from 'lit';

import b from './b.wxml'
import c from './c.wxml'

// 自己定义的template
export const _ownTemplates = {}
// 自己定义的template + 外部import的template
const _templates = { ..._ownTemplates, ...c._ownTemplates }

const _html = html`
  <view>1212</view>
  ${b}
  ${_templates.a}
  ${_templates.c}
`

export default _html;
```

- template定义
```
const templateName = ''

customElements.define(templateName, class extends PolymerElement {
  static get is() { return templateName }
  static get properties() {
    return {
      data: { type: Object }
    }
  }

  static get template() {
    return html`
      <view bindtap="eventBinder" event-name="xx" >{{data.abc}}</view>
    `
  }

  eventBinder(e) {
    
  }

});

```


## 记录

- 主要问题

  * 生命周期与微信不一致
  * 两套渲染（page和自定义组件走的mini版react， 内置组件走的web-component）

- 预期

一致

- 解决过程

一开始的想法时使用polymer或者lit这样的web-component组件库去实现，模板解析也交它们， 但是捣鼓了一天下来发现模板解析很不动态， 数据绑定也很死板，幸好生命周期是完全对上了。至此得出结论，web-compoent化是正确的，但是模板解析还是得走vdom实现，不然解析太麻烦了。

就在想是不是要在polymer中使用react时， 依稀记得之前的omi 主打web-component + vdom能力。

fork下来魔改一通，成了。