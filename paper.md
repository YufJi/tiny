# 双线程小程序探索
> 持续更新中...

## 概要
分为基础库、编译器、web调试器三个模块来介绍双线程小程序的探索过程，基础库负责整个小程序框架层的功能，包含渲染层和逻辑层；编译器负责将小程序DSL转译为标准web规范；web调试器模拟端侧宿主环境。

## 基础库

### bridge实现

### 核心方法

- Render端

  - todo...

- Worker端
  - BaseModel
  - PageModel
  - ComponentModel
  - AppModel

### 事件流程

- render端

  - 通知Native documentReady 事件
  - 通知Worker DOCUMENT_READY 事件
  
  - 监听Worker INIT_DATA_READY 事件
  - 监听Worker appDataChange 事件
  - 其他Worker事件
    - onComponentDataChange
    - onTriggerComponentEvent
    - onRequestComponentObserver
    - onSelectComponentInPage
    - onSelectComponent
    - onRequestComponentInfo
    - onGetRelationNode
    - onAnimationStatusChange
    - onAppLoadStatusChange
    - onDisableScroll
    - onPageScrollTo

- worker端

  - 检查小程序配置
  - 初始化App
  - 执行 App 创建
  - 路由启动
    - 监听Native App路由
    - 监听Render DOCUMENT_READY 事件，执行页面 onReady
  - 加载自定义组件
    - 监听Native 销毁页面事件
    - 监听Render COMPONENT_EVENT 事件, 生命周期处理
    - 监听Render COMPONENT_DATA_CHANGE 事件，data处理
    - 监听Render COMPONENT_RELATION_CHANGE 事件，relation 处理
  - 监听Render PAGE_EVENT 事件


## 编译器
