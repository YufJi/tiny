// index/selectable-group.js
Component({
  data: {
    labels: [1, 2, 3],
    selected: [false, false, false],
  },
  methods: {
    itemTap: function(e) {
      var selected = [false, false, false];
      selected[e.currentTarget.dataset.index] = true;
      this.setData({
        selected: selected
      })
    }
  }
})
