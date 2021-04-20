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
require('/Users/jiyufeng/Documents/demo/tiny-v1/packages/compiler/example/oa/pages/component/searchbar/searchbar?hash=6c359315a7ada66c6dfaac019bb0ff915df3f4b8');
require('/Users/jiyufeng/Documents/demo/tiny-v1/packages/compiler/example/oa/pages/component/toptips/toptips?hash=6c359315a7ada66c6dfaac019bb0ff915df3f4b8');
require('/Users/jiyufeng/Documents/demo/tiny-v1/packages/compiler/example/oa/pages/component/search/search?hash=dcbe94866d3a665efd3557072bc33b52208803de');
require('/Users/jiyufeng/Documents/demo/tiny-v1/packages/compiler/example/oa/pages/index/index?hash=f8f53b2631c7389810262145c2357935db847400');
require('/Users/jiyufeng/Documents/demo/tiny-v1/packages/compiler/example/oa/pages/taxNumber/index?hash=6e2d98e6435d6a61031ff99729801114d253e1e4');
require('/Users/jiyufeng/Documents/demo/tiny-v1/packages/compiler/example/oa/pages/approve/index?hash=f8f53b2631c7389810262145c2357935db847400');
require('/Users/jiyufeng/Documents/demo/tiny-v1/packages/compiler/example/oa/pages/costaccount/index?hash=f3f64c61b3b98da7f1f3d9ff9a0e65292a614ee2');
require('/Users/jiyufeng/Documents/demo/tiny-v1/packages/compiler/example/oa/pages/costaccount/accountDetail?hash=f3f64c61b3b98da7f1f3d9ff9a0e65292a614ee2');
require('/Users/jiyufeng/Documents/demo/tiny-v1/packages/compiler/example/oa/pages/search/searchCompany?hash=6e2d98e6435d6a61031ff99729801114d253e1e4');
require('/Users/jiyufeng/Documents/demo/tiny-v1/packages/compiler/example/oa/pages/search/searchBudgetList?hash=6e2d98e6435d6a61031ff99729801114d253e1e4');
require('/Users/jiyufeng/Documents/demo/tiny-v1/packages/compiler/example/oa/pages/search/searchBusinessType?hash=6e2d98e6435d6a61031ff99729801114d253e1e4');
require('/Users/jiyufeng/Documents/demo/tiny-v1/packages/compiler/example/oa/pages/travelPay/index?hash=f3f64c61b3b98da7f1f3d9ff9a0e65292a614ee2');
require('/Users/jiyufeng/Documents/demo/tiny-v1/packages/compiler/example/oa/pages/travelPay/travelDetail?hash=f3f64c61b3b98da7f1f3d9ff9a0e65292a614ee2');
require('/Users/jiyufeng/Documents/demo/tiny-v1/packages/compiler/example/oa/pages/warrant/index?hash=f8f53b2631c7389810262145c2357935db847400');
require('/Users/jiyufeng/Documents/demo/tiny-v1/packages/compiler/example/oa/pages/warrant/warrant?hash=f8f53b2631c7389810262145c2357935db847400');
require('/Users/jiyufeng/Documents/demo/tiny-v1/packages/compiler/example/oa/pages/submitted/index?hash=f8f53b2631c7389810262145c2357935db847400');
require('/Users/jiyufeng/Documents/demo/tiny-v1/packages/compiler/example/oa/pages/detail/index?hash=f8f53b2631c7389810262145c2357935db847400');
require('/Users/jiyufeng/Documents/demo/tiny-v1/packages/compiler/example/oa/pages/detail/addFlow?hash=f8f53b2631c7389810262145c2357935db847400');
require('/Users/jiyufeng/Documents/demo/tiny-v1/packages/compiler/example/oa/pages/detail/search?hash=36f562b2762ab92f3a4fd8c46f5a34325c16e0d1');
require('/Users/jiyufeng/Documents/demo/tiny-v1/packages/compiler/example/oa/pages/holdOAdetail/index?hash=f8f53b2631c7389810262145c2357935db847400');
require('/Users/jiyufeng/Documents/demo/tiny-v1/packages/compiler/example/oa/pages/holdOAdetail/addFlow?hash=f8f53b2631c7389810262145c2357935db847400');
require('/Users/jiyufeng/Documents/demo/tiny-v1/packages/compiler/example/oa/pages/holdOAdetail/search?hash=36f562b2762ab92f3a4fd8c46f5a34325c16e0d1');
require('/Users/jiyufeng/Documents/demo/tiny-v1/packages/compiler/example/oa/pages/warrant/search?hash=36f562b2762ab92f3a4fd8c46f5a34325c16e0d1');
}
self.bootstrapApp ? self.bootstrapApp({ success }) : success();
}