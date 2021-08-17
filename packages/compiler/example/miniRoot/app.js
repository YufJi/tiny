App({
  todos: [
    { text: 'Learning Javascript', completed: true },
    { text: 'Learning ES2016', completed: true },
    { text: 'Learning 小程序', completed: false },
  ],

  userInfo: null,

  onLaunch(options) {
    // Do something initial when launch.
    console.log('app onLaunch');
  },
  onShow(options) {
    // Do something when show.
    console.log('app onShow');
  },
  onHide() {
    // Do something when hide.
    console.log('app onHide');
  },

});
