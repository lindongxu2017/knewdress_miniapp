//app.js
const fn = require('./utils/main.js')
const api = require('./utils/api.js')
App({
    sessionrd: '',
    onLaunch: function() {
        const self = this
        wx.getSystemInfo({
            success: function (res) {
                self.globalData.windowHeight = res.windowHeight
                self.globalData.windowWidth = res.windowWidth
                self.globalData.statusBarHeight = res.statusBarHeight
            }
        })
        // 程序版本更新
        const updateManager = wx.getUpdateManager()
        // 监听向微信后台请求检查更新结果事件。微信在小程序冷启动时自动检查更新，不需由开发者主动触发。
        updateManager.onCheckForUpdate(function(res) {
            // 请求完新版本信息的回调
            // console.log(res.hasUpdate)
        })
        
        // 监听小程序有版本更新事件。客户端主动触发下载（无需开发者触发），下载成功后回调
        updateManager.onUpdateReady(function() {
            wx.showModal({
                title: '更新提示',
                content: '新版本已经准备好，是否重启应用？',
                success: function(res) {
                    if (res.confirm) {
                        // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
                        updateManager.applyUpdate()
                    }
                }
            })
        })
        // 监听小程序更新失败事件。小程序有新版本，客户端主动触发下载（无需开发者触发），下载失败（可能是网络原因等）后回调
        updateManager.onUpdateFailed(function() {
            // 新版本下载失败
            wx.showModal({
                title: '提示',
                content: '网络错误！',
                showCancel: false
            })
        })
        // 登录
        // fn.wxlogin(this)
    },
    getUserInfo(callback) {
        fn.ajax('POST', {
            sessionrd: this.sessionrd,
            action: 'getUserDetail'
        }, api.user.info, response => {
            this.globalData.userInfo = response.data
            if (callback) {
                callback(response)
            }
        })
    },
    globalData: {
        windowWidth: 0,
        windowHeight: 0,
        statusBarHeight: wx.getSystemInfoSync().statusBarHeight
    },
    requestIP: 'https://www.knewdress.com/dear2',
    // requestIP: 'http://192.168.1.120:8000/dear2',
    // requestIP: 'http://119.123.77.69:8000/dear2',
    api,
    fn,
})

  
  // {
  //   "pagePath": "pages/shop/index/index",
  //   "text": "商城",
  //   "iconPath": "./icon/mall-default.png",
  //   "selectedIconPath": "./icon/mall.png"
  // }