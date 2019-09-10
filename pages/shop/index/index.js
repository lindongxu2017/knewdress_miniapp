// pages/shop/index/index.js
const app = getApp()
Page({

    data: {
        active: 0,
        goods: [],
        loading: false,
        noMore: false,

        list: [],
        loading2: false,
        noData2: false,
        noMore2: false,
        cid: 0
    },

    onLoad: function (options) {
        if (app.token) {
            this.getList()
            let component = this.selectComponent("#classify") || null
            if (component) {
                component.getClassList()
            }
        } else {
            app.tokenCallback = res => {
                this.getList()
                let component = this.selectComponent("#classify") || null
                if (component) {
                    component.getClassList()
                }
            }
        }
    },

    onShow: function () {
        
    },

    getList() {
        if (this.data.loading) {
            return
        }
        this.data.loading = true
        app.fn.http('POST', {
            page: Math.ceil(this.data.goods.length / 10) + 1
        }, '/Api/Product/lists').then(res => {
            this.data.loading = false
            this.setData({
                goods: this.data.goods.concat(res.arr)
            })
            if (res.arr.length < 10) {
                this.setData({
                    noMore: true
                })
            }
            wx.stopPullDownRefresh()
        })
    },

    getCateGoods (e) {
        if (e) {
            this.setData({
                list: [],
                loading2: false,
                noData2: false,
                noMore2: false,
            })
            this.data.cid = e.detail.cid
        }
        if (this.data.loading2) {
            return
        }
        this.data.loading2 = true
        app.fn.http('POST', {
            page: Math.ceil(this.data.list.length / 10) + 1,
            cid: this.data.cid
        }, '/Api/Product/lists').then(res => {
            this.data.loading2 = false
            this.setData({
                list: this.data.list.concat(res.arr)
            })
            if (res.arr.length == 0 && this.data.list.length == 0) {
                this.setData({
                    noData2: true
                })
                return
            }
            if (res.arr.length < 10) {
                this.setData({
                    noMore2: true
                })
            }
            wx.stopPullDownRefresh()
        })
    },

    onChange (e) { // Tab切换
        let index = e.detail.index
        this.data.active = index
    },

    onPullDownRefresh () {
        if (this.data.active == 0) {
            this.setData({
                goods: [],
                loading: false,
                noMore: false,
            })
            this.getList()
        } else {
            this.setData({
                list: [],
                loading2: false,
                noData2: false,
                noMore2: false,
            })
            this.getCateGoods()
        }
    },

    onReachBottom: function () {
        if (this.data.active == 0) {
            this.getList()
        } else {
            this.getCateGoods()
        }
        
    }

})