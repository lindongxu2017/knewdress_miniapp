// pages/order/order.js
const app = getApp()
Page({

    data: {
        active: 0,
        list_all: [],
        list_topay: [],
        list_tosend: [],
        list_toreceive: [],
        list_finish: [],
        loading: [false, false, false, false, false]
    },

    onLoad: function (options) {
        if (typeof options.type == 'string') {
            this.setData({
                active: options.type
            })
        }
        this.getlist()
    },

    onShow: function () {

    },

    tabChange (e) {
        this.data.active = e.detail.index
        wx.hideLoading()
        switch (parseInt(e.detail.index)) {
            case 0:
                if (this.data.list_all.length == 0) this.getlist()
                break
            case 1:
                if (this.data.list_topay.length == 0) this.getlist()
                break
            case 2:
                if (this.data.list_tosend.length == 0) this.getlist()
                break
            case 3:
                if (this.data.list_toreceive.length == 0) this.getlist()
                break
            case 4:
                if (this.data.list_finish.length == 0) this.getlist()
                break
        }
    },

    getlist () {
        return new Promise((resolve, reject) => {
            let index = this.data.active
            if (this.data.loading[index]) {
                return
            }
            wx.showLoading({
                title: '加载中',
            })
            this.data.loading[index] = true
            let data = {
                order_type: 0,
                page: 1
            }
            switch (parseInt(index)) {
                case 0:
                    data.order_type = 0
                    data.page = Math.ceil(this.data.list_all.length / 10) + 1
                    break
                case 1:
                    data.order_type = 1
                    data.page = Math.ceil(this.data.list_topay.length / 10) + 1
                    break
                case 2:
                    data.order_type = 2
                    data.page = Math.ceil(this.data.list_tosend.length / 10) + 1
                    break
                case 3:
                    data.order_type = 3
                    data.page = Math.ceil(this.data.list_toreceive.length / 10) + 1
                    break
                case 4:
                    data.order_type = 5
                    data.page = Math.ceil(this.data.list_finish.length / 10) + 1
                    break
            }
            this.data.loading[index] = true
            app.fn.http('POST', data, '/Api/Order/index').then(res => {
                this.data.loading[index] = false
                wx.hideLoading()
                switch (parseInt(index)) {
                    case 0:
                        this.setData({
                            list_all: this.data.list_all.concat(res.arr)
                        })
                        break
                    case 1:
                        this.setData({
                            list_topay: this.data.list_topay.concat(res.arr)
                        })
                        break
                    case 2:
                        this.setData({
                            list_tosend: this.data.list_tosend.concat(res.arr)
                        })
                        break
                    case 3:
                        this.setData({
                            list_toreceive: this.data.list_toreceive.concat(res.arr)
                        })
                        break
                    case 4:
                        this.setData({
                            list_finish: this.data.list_finish.concat(res.arr)
                        })
                        break
                }
                resolve()
            })
        })
    },

    del (e) {
        let index = e.detail
        let arr = []
        switch (parseInt(this.data.active)) {
            case 0:
                arr = this.data.list_all.slice(0)
                arr.splice(index, 1)
                this.setData({
                    list_all: arr
                })
                break
            case 1:
                arr = this.data.list_topay.slice(0)
                arr.splice(index, 1)
                this.setData({
                    list_topay: arr
                })
                break
            case 4:
                arr = this.data.list_finish.slice(0)
                arr.splice(index, 1)
                this.setData({
                    list_finish: arr
                })
                break
        }
    },

    onPullDownRefresh () {
        let index = this.data.active
        switch (parseInt(index)) {
            case 0:
                this.setData({
                    list_all: []
                })
                break
            case 1:
                this.setData({
                    list_topay: []
                })
                break
            case 2:
                this.setData({
                    list_tosend: []
                })
                break
            case 3:
                this.setData({
                    list_toreceive: []
                })
                break
            case 4:
                this.setData({
                    list_finish: []
                })
                break
        }
        this.getlist().then(() => {
            wx.stopPullDownRefresh()
        })
    },

    onReachBottom: function () {
        this.getlist()
    }
})