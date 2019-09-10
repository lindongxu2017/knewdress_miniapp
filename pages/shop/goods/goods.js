// pages/goods/goods.js
const app = getApp()
Page({

    data: {
        list: [],
        loading: false,
        noData: false,
        noMore: false,
        cid: 0,
        title: ''
    },

    onLoad: function (options) {
        if (options.cid) {
            this.setData({
                title: options.name,
            })
            this.data.cid = options.cid
            this.getList()
        }
    },

    onShow: function () {

    },

    getList () {
        if (this.data.loading) {
            return
        }
        this.data.loading = true
        app.fn.http('POST', {
            page: Math.ceil(this.data.list.length / 10) + 1,
            cid: this.data.cid
        }, '/Api/Product/lists').then(res => {
            this.data.loading = false
            this.setData({
                list: this.data.list.concat(res.arr)
            })
            if (res.arr.length == 0 && this.data.list.length == 0) {
                this.setData({
                    noData: true
                })
                return
            }
            if (res.arr.length < 10) {
                this.setData({
                    noMore: true
                })
            }
        })
    },
    
    onReachBottom: function () {
        this.getList()
    },

    onShareAppMessage: function () {

    }
})