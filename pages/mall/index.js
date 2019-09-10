// pages/mall/index.js
const app = getApp()
import store from '../../store'
import create from '../../utils/create'
create(store, {
    data: {
        showUrl: '',
        scrollTop: 0,
        // -----------------------------------
        windowHeight: 0,
        contentHeight: 0,
        
        // ----------------------------------
        distance: 40, // 初始距离
        y: 0,
        pageH: 0,
        start_y: 0,
        open: false,
        blogID: '',

        positions: [],
        name_arr: [],
        default_current: 0,
        loading: false,
        current: 0,
        goods_popup: false,
        goods_list: [],
        all_data: [],
        current_info: {},

        img_w: 0,
        img_h: 0
    },
    onLoad: function(options) {
        let barHeight = app.globalData.statusBarHeight
        let pageH = app.globalData.windowHeight - barHeight - 45

        this.setData({
            windowHeight: app.globalData.windowHeight,
            windowWidth: app.globalData.windowWidth,
            contentHeight: app.globalData.windowHeight * 0.7
        })

        this.closePopup()

        if (options.blogID) {
            this.setData({
                blogID: options.blogID
            })
            this.getTBlist()
        }

        if (options.imgUrl) {
            this.setData({
                showUrl: options.imgUrl
            })
        }
    },

    onShow: function() {
        // TODO
    },

    selectgoods (e) {
        let index = e.currentTarget.dataset.index
        if (index == this.data.default_current) {
            return
        }
        this.setData({
            default_current: index,
            goods_list: []
        })
        wx.showLoading({
            title: '加载中',
        })
        setTimeout(() => {
            this.setData({
                goods_list: this.data.all_data[this.data.default_current].tb_items[0].auctions
            })
            wx.hideLoading()
        }, 1000)
        // this.getTBlist()
    },

    imgonload (e) {
        let { width, height } = e.detail
        this.setData({
            img_w: width,
            img_h: height
        })
    },

    getTBlist () {
        wx.showLoading({
            title: '加载中',
        })
        if (this.data.loading) {
            return
        }
        app.fn.ajax('POST', {
            sessionrd: app.sessionrd,
            blog_id: this.data.blogID
        }, '/haida/goods/tbk_goods', res => {
            this.setData({
                goods_list: res.data[this.data.default_current].tb_items[0].auctions
            })
            this.data.all_data = res.data
            wx.hideLoading()
            var arr = []
            var name_arr = []
            res.data.map((item, index) => {
                arr.push(item.position)
                name_arr.push(item.cat_leaf_name)
            })
            this.setData({
                positions: arr,
                name_arr: name_arr,
            })
        })
    },

    swiperchange (e) {
        this.setData({
            current: e.detail.current
        })
    },

    showGoodsPopup (e) {
        this.setData({
            goods_popup: true,
            current_info: '',
            current: 0
        })
        let info = e.currentTarget.dataset.info
        this.setData({
            current_info: info
        })
    },

    hideGoodsPopup () {
        this.setData({
            goods_popup: false
        })
    },

    copy () {
        const self = this
        wx.setClipboardData({
            data: this.data.current_info.coupon.tpwd,
            success(res) {
                wx.showToast({
                    title: '复制成功',
                    icon: 'none'
                })
                self.hideGoodsPopup()
            }
        })
    },

    previewimg (e) {
        let imgs = e.currentTarget.dataset.imgs
        let current = e.currentTarget.dataset.current
        console.log(current)
        wx.previewImage({
            urls: imgs,
            current: current
        })
    },

    moveChange(e) {
        // console.log(e.detail)
        return false
    },

    touchStart(e) {
        let touch = e.changedTouches[0]
        this.setData({
            scrollTop: 0,
            start_y: touch.pageY
        })
    },

    touchEnd(e) {
        let touch = e.changedTouches[0]
        let distance = touch.pageY - this.data.start_y
        let range = this.data.windowHeight * 0.075
        if (distance >= 0) {
            if (distance > range) {
                this.closePopup()
            } else {
                this.openPopup()
            }
        } else {
            if (Math.abs(distance) > range) {
                this.openPopup()
            } else {
                this.closePopup()
            }
        }
    },

    openPopup() {
        this.setData({
            y: 0,
            open: true
        })
    },

    closePopup() {
        if (this.data.scrollTop > 10) {
            return
        }
        this.setData({
            y: (this.data.windowHeight - this.data.windowWidth) / 2,
            open: false
        })
    },

    preventMove() {
        return false
    },

    // --------------------------------------------------
    onShareAppMessage(res) {
        return {
            title: '',
            path: ''
        }
    },

    scrollView(e) {
        this.setData({
            scrollTop: e.detail.scrollTop
        })
    },
    onReachBottom() {

    },
    searchSimilarImg() {
        
    }
})