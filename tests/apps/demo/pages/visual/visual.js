Page({
  back() {
    wx.navigateBack()
  },

  data: {
    richNodes: [
      { name: 'div', attrs: { style: 'color: #07c160; font-size: 18px;' }, children: [
        { type: 'text', text: 'Rich ' },
        { name: 'b', attrs: {}, children: [{ type: 'text', text: 'text' }] },
      ] },
    ],
  },
})
