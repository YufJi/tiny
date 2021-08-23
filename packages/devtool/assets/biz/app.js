
const { App } = self.MP;

if(App) {
  App({
    stylesheet(){return require('./app.wxss')},
  });
}
