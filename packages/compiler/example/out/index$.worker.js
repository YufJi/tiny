if(!self.__mpInited) {
self.__mpInited = 1;

require('./config$');


var MP = self.MP;
self.getCurrentPages = MP.getCurrentPages;
self.getApp = MP.getApp;
self.Page = MP.Page;
self.App = MP.App;
self.mp = MP.bridge;
self.Component = MP.WorkerComponent || function(){};
self.$global = MP.$global;
self.requirePlugin = MP.requirePlugin;


if(MP.registerApp) {
  MP.registerApp({
    appJSON: mpAppJson,
  });
}


function success() {
require('../miniRoot/app');
require('../miniRoot/components/add-button/add-button');
require('../miniRoot/pages/todos/todos');
require('../miniRoot/pages/add-todo/add-todo');
}
self.bootstrapApp ? self.bootstrapApp({ success }) : success();
}