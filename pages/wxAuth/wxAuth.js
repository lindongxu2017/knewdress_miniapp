var app = getApp()
Page({
    data: {
        canIUse: wx.canIUse('button.open-type.getUserInfo')
    },
    onLoad(option) {
        // console.log(this.data.canIUse)
    },
    bindGetUserInfo(res) {
        wx.login({
            success: result => {
                if (res.detail.errMsg == 'getUserInfo:ok') {
                    wx.setStorageSync('userInfo', res.detail.userInfo)
                    app.fn.login(result.code, res.detail)
                    wx.navigateBack()
                } else {
                    wx.showToast({
                        title: '授权失败！',
                        icon: 'none',
                        duration: 2000
                    })
                }
            }
        })
    }
})