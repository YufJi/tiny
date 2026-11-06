Component({
  methods: {
    navigateFromComponent() {
      // `this.router` is component-relative: components/router-probe/router-probe
      // resolves `../../pages/add-todo/add-todo` to pages/add-todo/add-todo.
      this.router.navigateTo({
        url: '../../pages/add-todo/add-todo?from=component-router',
        events: {
          todoSaved(data) {
            // The opened page emits this on save; the host can observe it.
            wx.setStorageSync('routerProbe', data.text)
          },
        },
        success: (result) => {
          result.eventChannel.emit('fromProbe', { probe: 'component-router' })
        },
      })
    },

    navigateFromPageRouter() {
      // `this.pageRouter` is page-relative: the owning page is pages/router/router,
      // so `../add-todo/add-todo` also lands on pages/add-todo/add-todo.
      this.pageRouter.navigateTo({ url: '../add-todo/add-todo?from=component-page-router' })
    },
  },
})
