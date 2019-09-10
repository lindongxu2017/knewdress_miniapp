// pages/collectLable/collectLable.js
const app = getApp()
import store from '../../store'
import create from '../../utils/create'
create(store, {

    /**
     * 页面的初始数据
     */
    data: {
        grouplist: [],
        selectedlist: [],
        blog_id: '',
        isCollect: false
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.setData({
            selectedlist: wx.getStorageSync('collect_cate'),
            blog_id: options.id || '',
            isCollect: options.isCollect == 0 ? false : true
        }, () => {
            this.getCateList()
            wx.removeStorageSync('collect_cate')
        })
    },

    onShow: function () {

    },

    getCateList () {
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
    
    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    }
})