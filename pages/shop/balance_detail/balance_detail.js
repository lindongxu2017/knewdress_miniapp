// pages/balance_detail/balance_detail.js
const app = getApp()
Page({

    data: {
        list: [],
        loading: false
    },

    onLoad: function (options) {
        this.getlist()
    },

    getlist() {
        if (this.data.loading) {
            return
        }
        this.data.loading = true
        app.fn.http('POST', {
            page: Math.ceil(this.data.list.length / 10) + 1
        }, '/Api/user/userMoney').then(res => {
            this.data.loading = false
            this.setData({
                list: this.data.list.concat(res.arr)
            })
        })
    },

    onReachBottom: function () {
        this.getlist()
    }
})