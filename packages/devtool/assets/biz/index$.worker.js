if(!self.__mpInited) {
self.__mpInited = 1;

require('./config$');


var MP = self.MP;
self.getCurrentPages = MP.getCurrentPages;
self.getApp = MP.getApp;
self.Page = MP.Page;
self.App = MP.App;
self.mp = MP.bridge;
self.Component = MP.Component;
self.$global = MP.$global;
self.requirePlugin = MP.requirePlugin;


if(MP.registerApp) {
  MP.registerApp({
    appJSON: mpAppJson,
  });
}


function success() {
require('/Users/jiyufeng/Documents/demo/tiny-v1/packages/compiler/example/miniRoot/app');
require('/Users/jiyufeng/Documents/demo/tiny-v1/packages/compiler/example/miniRoot/components/add-button/add-button');
require('/Users/jiyufeng/Documents/demo/tiny-v1/packages/compiler/example/miniRoot/pages/todos/todos');
require('/Users/jiyufeng/Documents/demo/tiny-v1/packages/compiler/example/miniRoot/pages/add-todo/add-todo');
}
self.bootstrapApp ? self.bootstrapApp({ success }) : success();
}