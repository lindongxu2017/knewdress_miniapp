// pages/commentPage/commentPage.js
const app = getApp()
Page({
  data: {
    commentlist: [],
    inputValue: '',
    inputIsFocus: false,
    goCommentPage: '',
    iscomment: 0
  },
  onLoad: function (options) {
    this.setData({
      commentlist: wx.getStorageSync('commentlist'),
      id: options.id
    })
    wx.removeStorageSync('commentlist')
  },
  inputBlur() {
    this.setData({ inputIsFocus: false})
  },
  inputFocus() {
    this.setData({ inputIsFocus: true })
  },
  // 输入评论文字
  inputPrint(e) {
    let value = e.detail.value
    this.setData({
      inputValue: value
    })
  },
  comment() {
    if (this.data.inputValue == '') {
      wx.showModal({
        title: '提示',
        showCancel: false,
        content: '评论内容不能为空！'
      })
      return false
    }
    this.data.iscomment++
    let id = this.data.id
    let userinfo = wx.getStorageSync('userInfo')
    let showData = {
      user_info: {
        nickname: userinfo.nickName,
        headimgurl: userinfo.avatarUrl,
      },
      content: this.data.inputValue,
      create_from: app.fn.getCurrentTime()
    }
    app.fn.ajax('POST', {
      sessionrd: app.sessionrd,
      action: 'doComment',
      blog_id: id,
      content: this.data.inputValue
    }, app.api.image.comment, res => {
      let list = JSON.parse(JSON.stringify(this.data.commentlist))
      list.unshift(showData)
      this.setData({
        commentlist: list,
        inputValue: ''
      })
    })
  },
  onUnload: function () {
    if (this.data.iscomment == 0) return
    wx.setStorageSync('commentlist', this.data.commentlist);
  }
})