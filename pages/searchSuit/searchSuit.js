// pages/searchSuit/searchSuit.js
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    windowHeight: 0,
    auth: false,
    imgUrl: '',
    devicePosition: 'front',
    navbarHeight: 65,
    navstatueHeight: 20
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const self = this
    console.log(app.globalData.windowHeight, this.data.navstatueHeight)
    wx.getSystemInfo({
      success(res) {
        self.setData({
          windowHeight: res.windowHeight,
          navbarHeight: res.statusBarHeight + 45,
          navstatueHeight: res.statusBarHeight
        })
      }
    })
  },

  onShow(){
    if (wx.getStorageSync('reset')) {
      wx.removeStorageSync('reset')
      this.setData({ imgUrl: '' })
    }
    const self = this
    if (self.data.auth) {
      setTimeout(() => {
        wx.getSetting({
          success(result) {
            if (result.authSetting['scope.camera']) {
              self.setData({ auth: false })
              wx.reLaunch({
                url: '/pages/searchSuit/searchSuit'
              })
            } else {
              self.error()
            }
          }
        })
      }, 2000)
    }
  },

  reverseCamera() {
    if (this.data.devicePosition == 'front') {
      this.setData({ devicePosition: 'back' })
    } else {
      this.setData({ devicePosition: 'front' })
    }
  },

  openAlbum() {
    const self = this
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album'],
      success(res) {
        // tempFilePath可以作为img标签的src属性显示图片
        const tempFilePaths = res.tempFilePaths
        self.setData({ imgUrl: tempFilePaths[0]})
        self.analysis(tempFilePaths[0])
      }
    })
  },

  takePhoto() {
    const self = this
    const ctx = wx.createCameraContext()
    ctx.takePhoto({
      quality: 'high',
      success: result => {
        // console.log('组件拍照:' + result.tempImagePath)
        self.setData({ imgUrl: result.tempImagePath })
        self.analysis(result.tempImagePath)
      }
    })
  },

  analysis(tempImagePath) {
    console.log(tempImagePath)
    wx.uploadFile({
      // url: 'http://192.168.1.120:8000/dear' + app.api.image.uploadFile,
      url: app.requestIP + app.api.image.uploadFile,
      filePath: tempImagePath,
      name: 'images',
      formData: {
        sessionrd: app.sessionrd,
        action: 'uploadImg',
        every_time_update: 1
      },
      success(result) {
        let url = JSON.parse(result.data).data.imagesUrl
        console.log(JSON.parse(result.data))
        app.fn.ajax('POST', {
          sessionrd: app.sessionrd,
          action: 'getUserFace',
          face_sure: 0.8,
          image_url: url
        }, app.api.face.face, res => {
          wx.setStorageSync('updateFace', 1)
          if (res.status == 'error' || res.data.length == 0) {
            wx.hideLoading()
            wx.showModal({
              title: '提示',
              showCancel: false,
              content: res.msg
            })
          }
        })
        app.fn.ajax('POST', {
          sessionrd: app.sessionrd,
          action: 'detectPrefer',
          image_url: url
        }, app.api.user.like, res => {
          // console.log(res)
          wx.setStorageSync('reset', 1)
          wx.setStorageSync('imgAnalysisResult', res)
          wx.navigateTo({
            url: '/pages/setFavorite/setFavorite',
          })
        })
      }
    })
  },

  error(e) {
    console.log(e)
    const self = this
    wx.showModal({
      title: '提示',
      content: '如需正常使用小程序功能，请按确定并且在【设置】页面中授权',
      success(res) {
        if (res.confirm) {
          wx.openSetting()
        } else if (res.cancel) {
          self.setData({ auth: true })
          wx.switchTab({
            url: '/pages/index/index'
          })
        }
      }
    })
  }
  
})