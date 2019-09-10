// pages/wardrobe/wardrobe.js
const app = getApp()
import store from '../../store'
import create from '../../utils/create'
create(store, {

    data: {
        grouplist: [],
        selectedlist: [],
        id: '',
        url: '',
        imglist: []
    },

    onLoad: function (options) {
        if (wx.getStorageSync('uploadimg')) {
            this.setData({
                imglist: wx.getStorageSync('uploadimg')
            })
            wx.removeStorageSync('uploadimg')
        }
        this.setData({
            selectedlist: wx.getStorageSync('clothes_cate')
        }, () => {
            this.getCateList()
            wx.removeStorageSync('clothes_cate')
        })
        if (options.id) {
            this.setData({
                id: options.id,
                url: options.url
            })
        }
    },

    onShow: function () {

    },

    getCateList() {
        app.fn.ajax('POST', {
            sessionrd: app.sessionrd,
            action: 'cateList',
        }, app.api.information.collect, res => {
            res.data.map((item, index) => {
                item.list.map((obj, order) => {
                    obj.operationVisible = true
                })
            })
            this.setData({
                grouplist: res.data
            })
        })
    },

    onReachBottom: function () {

    },
})