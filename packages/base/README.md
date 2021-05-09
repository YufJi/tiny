# 小程序基础库
> TODO: description



### 事件
- appCreated
- launch
- foreground
- background
- enterPage
- pageLoad
- pageReady
- pageUpdate
- leavePage
- pageHide
- pageUnload
- pullDownRefresh
- switchTab

## 待完善列表

### 参数支持
- lifetimes
- pageLifetimes
- behaviors
- observers

### 方法支持
- hasBehavior
- createSelectorQuery (这个的实现比较简单，基于api.createSelectorQuery就可以实现)
- selectComponent
- selectAllComponents
- selectOwnerComponent
- getRelationNodes
- ~~getPageId~~


# 小程序方案探索


### 事件系统
修改nervjs的原有事件绑定，支持bind、catch、capture-bind、capture-catch； 取消事件代理；减少编译阶段的工作

### 自定义组件、内置组件
基于web component包装一层， 即可精准触发生命周期


### 生命周期

- 新开一个页面时，render端注册一个‘init-data-ready‘事件， 
- worker端的page准备初始数据，同时根据usingComponents初始化自定义组件并收集起来， 组装出一份初始化数据，大致如下：

```js

{
  data: e.implement.instance.data,
  config: {
    customComponents: {
      '/components/a/a': {
          properties: Jo(componentPublicInstance.properties, function (e) {
            return { type: e.type, value: e.value };
          }),
          data: componentPublicInstance.data,
          relationMap: qo(componentPublicInstance.relations, "type"),
          ancestors: Array.from(componentPublicInstance.ancestors),
          options: componentPublicInstance.options,
          externalClasses: componentPublicInstance.externalClasses,
      }
    },
    allComponentsAliasName: ['add-button'],
  },
  options: { firstRender: !0, timestamp: Date.now(), path: e.route }
}
```