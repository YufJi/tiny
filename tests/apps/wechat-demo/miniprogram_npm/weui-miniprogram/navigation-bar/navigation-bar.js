var globalThis = this,
  self = this;
module.exports = require("../_commons/0.js")([
  {
    ids: [17],
    modules: {
      3: function (t, e, a) {
        t.exports = a(59);
      },
      59: function (t, e) {
        Component({
          options: { multipleSlots: !0 },
          properties: {
            extClass: { type: String, value: "" },
            title: { type: String, value: "" },
            background: { type: String, value: "" },
            color: { type: String, value: "" },
            back: { type: Boolean, value: !0 },
            loading: { type: Boolean, value: !1 },
            animated: { type: Boolean, value: !0 },
            show: { type: Boolean, value: !0, observer: "_showChange" },
            delta: { type: Number, value: 1 },
          },
          data: { displayStyle: "" },
          attached: function () {
            var t,
              e,
              a = this,
              o =
                null === (t = (e = wx).getMenuButtonBoundingClientRect) ||
                void 0 === t
                  ? void 0
                  : t.call(e);
            wx.getSystemInfo({
              success: function (t) {
                var e = !!(t.system?.toLowerCase().search("ios") + 1);
                a.setData({
                  ios: e,
                  statusBarHeight: t.statusBarHeight,
                  menuButtonWidth: null == o ? void 0 : o.width,
                });
              },
            });
          },
          methods: {
            _showChange: function (t) {
              var e = "";
              ((e = this.data.animated
                ? "opacity: ".concat(
                    t ? "1" : "0",
                    ";-webkit-transition:opacity 0.5s;transition:opacity 0.5s;",
                  )
                : "display: ".concat(t ? "" : "none")),
                this.setData({ displayStyle: e }));
            },
            back: function () {
              var t = this.data;
              (t.delta && wx.navigateBack({ delta: t.delta }),
                this.triggerEvent("back", { delta: t.delta }, {}));
            },
          },
        });
      },
    },
    entries: [[3, 0]],
  },
]);
