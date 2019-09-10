// pages/detail/detail.js
const app = getApp()
const WxParse = require('../../../wxParse/wxParse.js');
import store from '../../../store'
import create from '../../../utils/create'
create(store, {

    data: {
        id: '',
        info: {},
        popupVisible: false,
        actionType: 2, // 1加入购物车 2立即购买
        sku_specs: [],
        specs_ids: [],
        goodsNum: 1,

        loading: false,
        finish: false,
        goodsBlog: [],
        active: 0,

        poster: '',
        popup2: false
    },

    onLoad: function(options) {
        if (options.id || options.scene) {
            this.data.id = options.id || decodeURIComponent(options.scene)
            if (app.token) {
                this.getDetail()
                this.getRelativeBlog()
            } else {
                app.tokenCallback = res => {
                    this.getDetail()
                    this.getRelativeBlog()
                }
            }
        }
        if (options.sharePage) {
            app.sharePage = 1
        }
    },

    onShow: function() {

    },

    createPoster() {
        if (this.data.poster == '') {
            wx.showLoading({
                title: '生成中...',
            })
            app.fn.ajax('POST', {
                sessionrd: app.sessionrd,
                scene: this.data.id,
                blog_id: '',
                goods_id: this.data.id,
                page_string: 'pages/shop/detail/detail'
            }, '/haida/wxacode/', res => {
                wx.hideLoading()
                this.setData({
                    poster: res.data.url
                })
                this.showAction2()
            })
        } else {
            this.showAction2()
        }
    },

    savePoster() {
        wx.showLoading({
            title: '保存中',
        })
        const self = this
        wx.getSetting({
            success(res) {
                if (!res.authSetting['scope.writePhotosAlbum']) {
                    wx.authorize({
                        scope: 'scope.writePhotosAlbum',
                        success() {
                            // console.log('授权成功')
                            self.downloadFile()
                        }
                    })
                } else { // 已授权
                    self.downloadFile()
                }
            }
        })
    },

    downloadFile() {
        var self = this
        wx.downloadFile({
            url: this.data.poster,
            success: function (res) {
                // console.log(res);
                //图片保存到本地
                wx.saveImageToPhotosAlbum({
                    filePath: res.tempFilePath,
                    success: function (data) {
                        self.hideAction2()
                        wx.hideLoading()
                        wx.showToast({
                            title: '保存成功',
                            icon: 'none'
                        })
                    }
                })
            }
        })
    },

    showAction2() {
        this.setData({
            popup2: true
        })
    },

    hideAction2() {
        this.setData({
            popup2: false
        })
        wx.hideLoading()
    },

    onChange (e) {
        this.setData({
            active: e.detail.index
        })
    },

    getDetail() {
        app.fn.http('POST', {
            product_id: this.data.id
        }, '/Api/Product/details').then(res => {
            this.setData({
                info: res.arr
            })
            let arr = []
            res.arr.attribute.map((item, index) => {
                let obj = {}
                if (index == 0) {
                    obj.list = item
                }
                if (index == 1) {
                    obj.list = item
                }
                arr.push(obj)
            })
            this.setData({
                sku_specs: arr
            })
            WxParse.wxParse('content', 'html', res.arr.content, this, 5);
        })
    },

    getRelativeBlog () {
        if (this.data.loading || this.data.finish) {
            return
        }
        this.data.loading = true
        app.fn.http('POST', {
            product_id: this.data.id,
            page: Math.ceil(this.data.goodsBlog.length / 10) + 1,
            pagenum: 10
        }, '/Api/Product/blogList').then(res => {
            // console.log(res)
            this.data.loading = false
            if (res.arr.length < 10) {
                this.data.finish = true
            }
            this.setData({
                goodsBlog: this.data.goodsBlog.concat(res.arr)
            })
        })
    },

    clearSpeceCheck(index) {
        let list = this.data.sku_specs[index].list.slice(0)
        list.map((item, seq) => {
            item.check = 0
        })
        let list_item = 'sku_specs[' + index + '].list'
        this.setData({
            [list_item]: list
        })
    },

    checkSpecs(e) {
        // console.log(e.currentTarget.dataset)
        let index = e.currentTarget.dataset.index
        let order = e.currentTarget.dataset.order
        this.clearSpeceCheck(index)
        let key = 'sku_specs[' + index + '].list[' + order + '].check'
        this.setData({
            [key]: 1
        })
        this.getSpecsIds()
    },

    getSpecsIds() {
        let arr = []
        this.data.sku_specs.map((item, index) => {
            item.list.map((obj, order) => {
                if (obj.check == 1) {
                    arr.push(obj.id)
                }
            })
        })
        this.setData({
            specs_ids: arr
        })
    },

    goodsNumChange(e) {
        this.data.goodsNum = e.detail
    },

    onClickIcon() {
        wx.navigateTo({
            url: '/pages/shop/cart/cart',
        })
    },

    onClickButton(e) {
        let type = e.currentTarget.dataset.type
        this.data.actionType = type
        this.showPopup()
    },

    showPopup() {
        this.setData({
            popupVisible: true
        })
    },

    closePopup() {
        this.setData({
            popupVisible: false
        })
    },

    submit() {
        // console.log(this.data.actionType, this.data.specs_ids, this.data.goodsNum, this.data.info.id)
        if (this.data.specs_ids.length < this.data.sku_specs.length) {
            wx.showToast({
                title: '请选择对应规格',
                icon: 'none'
            })
            return
        }

        if (this.data.actionType == 1) {
            let data = {
                pid: this.data.id,
                num: this.data.goodsNum,
                gid: this.data.specs_ids.join(',')
            }
            app.fn.http('POST', data, '/Api/Shopping/add').then(res => {
                this.closePopup()
                wx.showToast({
                    title: '加入购物车成功',
                    icon: 'none'
                })
            })
        } else {
            // TODO
            let ids = this.data.specs_ids.join(',')
            let num = this.data.goodsNum
            let id = this.data.info.id
            wx.navigateTo({
                url: '/pages/shop/pay/pay?id=' + id + '&ids=' + ids + '&num=' + num,
            })
        }
    },

    onReachBottom () {
        if (this.data.active == 1) {
            this.getRelativeBlog()
        }
    },

    onShareAppMessage: function() {
        return {
            title: this.data.info.name,
            path: '/pages/shop/detail/detail?sharePage=1&pid=' + app.globalData.userInfo.id + '&id=' + this.data.id,
            imageUrl: this.info.photo_d
        }
    }
})