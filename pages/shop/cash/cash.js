// pages/cash/cash.js
const app = getApp()
Page({

    data: {
        value: '',
        userinfo: {}
    },

    onLoad: function(options) {
        this.getUserInfo()
    },

    getUserInfo() {
        app.fn.http('POST', {}, '/Api/User/userinfo').then(res => {
            this.setData({
                userinfo: res.arr
            })
        })
    },

    cash() {
        if (this.data.value == '') {
            wx.showToast({
                title: '请输入提现金额',
                icon: 'none'
            })
            return
        }
        if (this.data.value < 1) {
            wx.showToast({
                title: '提现金额不能小于1元',
                icon: 'none'
            })
            return
        }
        if (this.data.value > this.data.userinfo.money) {
            this.onClickIcon()
            return
        }
        app.fn.http('POST', {
            money: this.data.value
        }, '/Api/user/withdraw').then(res => {
            if (res.status == 1) {
                wx.showToast({
                    title: '提现成功',
                    icon: 'none'
                })
                setTimeout(() => {
                    wx.navigateBack()
                }, 1500)
            } else {
                wx.showToast({
                    title: res.err,
                    icon: 'none'
                })
            }
        })
    },

    onChange (e) {
        this.setData({
            value: e.detail
        })
    },

    onClickIcon() {
        wx.showToast({
            title: '提现金额不能超过限额',
            icon: 'none'
        })
    }

})