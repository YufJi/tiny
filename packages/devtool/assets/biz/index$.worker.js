if(!self.__mpInited) {
self.__mpInited = 1;

require('./config$');


var MP = self.MP;
self.getCurrentPages = MP.getCurrentPages;
self.getApp = MP.getApp;
self.Page = MP.Page;
self.App = MP.App;
self.wx = MP.bridge;
self.Component = MP.Component;
self.$global = MP.$global;
self.requirePlugin = MP.requirePlugin;


if(MP.registerApp) {
  MP.registerApp({
    appJSON: mpAppJson,
  });
}


function success() {
require('/Users/jiyufeng/Documents/demo/tiny-v1/packages/compiler/example/oa/app');
require('/Users/jiyufeng/Documents/demo/tiny-v1/packages/compiler/example/oa/pages/index/index?hash=f8f53b2631c7389810262145c2357935db847400');
}
self.bootstrapApp ? self.bootstrapApp({ success }) : success();
}