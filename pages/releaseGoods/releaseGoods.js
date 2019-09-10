// pages/releaseGoods/releaseGoods.js
const app = getApp()
Page({

    data: {
        recommend_list: [],
        screen_list: [],
        up_cate: [],
        down_cate: [],
        ids: [],
        checkItems: [],
        up_active: 0,
        down_active: 0,
        loading: false,
        imgUrl: ''
    },

    onLoad: function(options) {
        if (wx.getStorageSync('releaseIds')) {
            this.data.ids = wx.getStorageSync('releaseIds')
            this.data.checkItems = wx.getStorageSync('releaseInfo')
            wx.removeStorageSync('releaseIds')
        }
        this.getClassList()
        if (options.imgUrl) {
            this.data.imgUrl = options.imgUrl
            this.getRecommend()
        }
    },

    onShow: function() {

    },

    getClassList(id) {
        let data = {
            tid: 0
        }
        if (id) {
            data.tid = id
        }
        app.fn.http('POST', data, '/Api/Product/cate_lists').then(res => {
            if (!id) {
                this.setData({
                    up_cate: res.arr
                })
            } else {
                this.setData({
                    down_cate: [],
                    screen_list: [],
                    down_active: 0,
                    down_cate: res.arr
                }, () => {
                    this.getList()
                })
            }
            if (res.arr.length > 0 && !id) {
                this.getClassList(this.data.up_cate[this.data.up_active].id)
            }
        })
    },

    selectUpCate(e) {
        let {
            index
        } = e.currentTarget.dataset
        this.setData({
            up_active: index
        }, () => {
            this.getClassList(this.data.up_cate[this.data.up_active].id)
        })
    },

    selectDownCate(e) {
        let {
            index
        } = e.currentTarget.dataset
        this.setData({
            screen_list: [],
            down_active: index
        })
        this.getList()
    },

    getList() {
        if (this.data.loading || this.data.down_cate.length == 0) {
            return
        }
        this.data.loading = true
        app.fn.http('POST', {
            page: Math.ceil(this.data.screen_list.length / 10) + 1,
            cid: this.data.down_cate[this.data.down_active].id
        }, '/Api/Product/lists').then(res => {
            this.data.loading = false
            res.arr.map((item, index) => {
                item.check = false
            })
            if (this.data.ids.length > 0) {
                this.data.ids.map((item, index) => {
                    res.arr.map((obj, order) => {
                        if (item == obj.id) {
                            obj.check = true
                        }
                    })
                })
            }
            this.setData({
                screen_list: this.data.screen_list.concat(res.arr)
            })
        })
    },

    getRecommend() {
        app.fn.ajax('POST', {
            sessionrd: app.sessionrd,
            image_url: this.data.imgUrl
        }, '/haida/search_goods/', res => {
            res.data.map((item, index) => {
                item.check = false
            })
            console.log(this.data.ids.length)
            if (this.data.ids.length > 0) {
                this.data.ids.map((item, index) => {
                    res.data.map((obj, order) => {
                        if (item == obj.id) {
                            console.log(item, obj.id)
                            obj.check = true
                        }
                    })
                })
            }
            this.setData({
                recommend_list: res.data
            })
            console.log(this.data.recommend_list)
        })
    },

    checkItem(e) {
        let {
            index,
            id,
            type
        } = e.currentTarget.dataset
        this.diff(id, index, type)
    },

    diff(id, index, type) {
        let key = 'recommend_list[' + index + '].check'
        if (type == 2) {
            key = 'screen_list[' + index + '].check'
        }
        if (this.data.ids.length > 0) {
            if (this.data.ids.indexOf(id) > -1) {
                let order = this.data.ids.indexOf(id)
                this.data.ids.splice(order, 1)
                this.data.checkItems.splice(order, 1)
                this.setData({
                    [key]: false
                })
                if (type == 1) {
                    this.screen_list_change(id, false)
                } else {
                    this.recommend_list_change(id, false)
                }
            } else {
                this.data.ids.push(id)
                if (type == 1) {
                    this.data.checkItems.push(this.data.recommend_list[index])
                } else {
                    this.data.checkItems.push(this.data.screen_list[index])
                }
                this.setData({
                    [key]: true
                })
                if (type == 1) {
                    this.screen_list_change(id, true)
                } else {
                    this.recommend_list_change(id, true)
                }
            }
        } else {
            this.data.ids.push(id)
            if (type == 1) {
                this.data.checkItems.push(this.data.recommend_list[index])
                this.screen_list_change(id, true)
            } else {
                this.data.checkItems.push(this.data.screen_list[index])
                this.recommend_list_change(id, true)
            }
            this.setData({
                [key]: true
            })
        }
    },

    recommend_list_change(id, bool) {
        if (this.data.screen_list.length > 0) {
            this.data.recommend_list.map((item, index) => {
                if (item.id == id) {
                    let itme_key = 'recommend_list[' + index + '].check'
                    this.setData({
                        [itme_key]: bool
                    })
                }
            })
        }
    },

    screen_list_change(id, bool) {
        if (this.data.recommend_list.length > 0) {
            this.data.screen_list.map((item, index) => {
                if (item.id == id) {
                    let itme_key = 'screen_list[' + index + '].check'
                    this.setData({
                        [itme_key]: bool
                    })
                }
            })
        }
    },

    confirm() {
        wx.setStorageSync('releaseInfo', this.data.checkItems)
        wx.setStorageSync('releaseIds', this.data.ids)
        wx.navigateBack()
    },

    onPullDownRefresh: function() {
        // TODO
    },

    onReachBottom: function() {
        this.getList()
    },

    onShareAppMessage: function() {

    }
})