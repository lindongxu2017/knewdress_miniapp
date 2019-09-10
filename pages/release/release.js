// pages/release/release.js
const app = getApp()
Page({

    data: {
        imgUrl: '',
        value: '',
        ids: [],
        goods_list: [],
        uplaod_img: '',
        isload: false,
        is_bloggers: false,
        article_url: ''
    },

    onLoad: function (options) {
        this.get_article_url()
    },

    onShow: function () {
        if (wx.getStorageSync('releaseInfo') && this.data.imgUrl) {
            // console.log(wx.getStorageSync('releaseInfo'))
            this.data.ids = wx.getStorageSync('releaseIds')
            this.setData({
                goods_list: wx.getStorageSync('releaseInfo')
            })
            wx.removeStorageSync('releaseIds')
            wx.removeStorageSync('releaseInfo')
        }
    },

    add () {
        const self = this
        wx.chooseImage({
            count: 1,
            sourceType: ['album'],
            success: function(res) {
                console.log(res)
                self.setData({
                    imgUrl: res.tempFilePaths[0]
                })
                self.wxUplaod(res.tempFilePaths[0])
            },
        })
    },

    get_article_url () {
        app.fn.ajax('POST', { sessionrd: app.sessionrd }, '/haida/become_blogger/', res => {
            this.data.article_url = res.data.url
        })
    },

    wxUplaod(url) {
        wx.showLoading({
            title: '上传中...',
        })
        const self = this
        wx.uploadFile({
            url: app.requestIP + app.api.image.uploadFile,
            filePath: url,
            name: 'images',
            formData: {
                sessionrd: app.sessionrd,
                action: 'uploadImg',
                every_time_update: 1
            },
            success(res) {
                wx.hideLoading()
                let responseData = JSON.parse(res.data)
                self.data.uplaod_img = responseData.data.imagesUrl
            }
        })
    },

    selectGoods (e) {
        if (this.data.imgUrl == '') {
            wx.showToast({
                title: '请先上传图片',
                icon: 'none'
            })
            return
        }
        if (this.data.uplaod_img == '') {
            wx.showToast({
                title: '请等待图片上传',
                icon: 'none'
            })
            return
        }
        if (this.data.goods_list.length > 0) {
            wx.setStorageSync('releaseIds', this.data.ids)
            wx.setStorageSync('releaseInfo', this.data.goods_list)
        }
        wx.navigateTo({
            url: '/pages/releaseGoods/releaseGoods?imgUrl=' + this.data.uplaod_img,
        })
    },

    input (e) {
        this.setData({
            value: e.detail.value
        })
    },

    release () {
        const self = this
        if (app.globalData.userInfo) {
            this.data.is_bloggers = app.globalData.userInfo.is_bloggers
        }
        if (!this.data.is_bloggers) {
            wx.showModal({
                title: '提示',
                content: '时尚博主才能发布博客，是否成为时尚博主？',
                success(res) {
                    // console.log(res.confirm)
                    if (res.confirm) {
                        wx.navigateTo({
                            url: '/pages/article/article?url=' + self.data.article_url,
                        })
                    }
                }
            })
            return
        }
        if (this.data.value == '') {
            wx.showToast({
                title: '请填写描述信息',
                icon: 'none'
            })
            return
        }
        if (this.data.imgUrl == '') {
            wx.showToast({
                title: '请上传图片',
                icon: 'none'
            })
            return
        }
        // if (this.data.ids.length == 0) {
        //     wx.showToast({
        //         title: '请选择关联商品',
        //         icon: 'none'
        //     })
        //     return
        // }
        if (this.data.isload) {
            return
        }
        wx.showLoading({
            title: '正在发布',
        })
        this.data.isload = true
        app.fn.ajax('POST', {
            sessionrd: app.sessionrd,
            desc: this.data.value,
            image_url: this.data.uplaod_img,
            goods_ids: this.data.ids.join(',')
        }, '/haida/write_blog/', res => {
            this.data.isload = false
            wx.hideLoading()
            if (res.status == 'error') {
                wx.showToast({
                    title: res.msg,
                    icon: 'none'
                })
                return
            }
            // TODO
            wx.showToast({
                title: '发布成功',
                icon: 'none'
            })
            this.setData({
                imgUrl: '',
                uplaod_img: '',
                value: '',
                goods_list: []
            })
            wx.navigateTo({
                url: '/pages/myRelease/myRelease',
            })
        })
    },

    onPullDownRefresh: function () {

    }
})