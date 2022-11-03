## 小程序引擎

对标微信小程序的实现

### 基础库
> 小程序核心运行时

- Page、自定义组件实现通过vdom + web-component
- JSBridge
- web-component
- 路由、事件管理

### 编译器
> 编译小程序的模板、样式、逻辑文件，并打包

- babel
- webpack

### 调试器
> 基于浏览器同源多iframe，实现双线程架构宿主环境

- 了解Electron开发



## 本地调试

1、 构建基础库

```sh
cd packages/base && yarn dev
```

2、 启动本地调试器
```sh
cd packages/devtool && yarn dev
```

3、 编译demo
```sh
cd packages/examples && NODE_ENV=development node ./scripts/compile.js --root ./mini
```


### todo list

- [ ] tabBar支持
- [ ] 分包加载
- [ ] 使用quickjs wasm代替逻辑层iframe实现沙盒
