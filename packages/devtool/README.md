
## 小程序web调试器

### 目录介绍

```sh
├── host.html  // 调试器入口html
├── public     // 静态资源
|  └── preload // 模拟preload功能，如注入小程序运行时的全局对象
├── src        // 主目录
|  ├── app.jsx 
|  ├── app.module.less
|  ├── assets
|  ├── components
|  ├── global.css
|  ├── main.js
|  ├── store
|  └── utils   // 工具方法（包含调试器层jsbridge功能的实现）
└── static     // 小程序包目录
   ├── base    // 小程序基础库
   └── biz // 小程序业务包
```

### 核心功能

- webviews调度管理
- 宿主api能力提供
- 宿主事件通知