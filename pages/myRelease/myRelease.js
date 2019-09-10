// pages/myRelease/myRelease.js
const app = getApp()
import store from '../../store'
import create from '../../utils/create'
create(store, {

    data: {
        postInfo: null,
        is_edit: false
    },

    onLoad: function (options) {
        this.setData({
            postInfo: {
                sessionrd: app.sessionrd,
                action: 'getUserBlog',
                user_id: app.globalData.userInfo.id,
                api: app.api.user.info
            }
        })
    },

    onShow: function () {

    },

    nodata () {
        this.setData({ is_edit: false})
    },

    edit () {
        this.setData({
            is_edit: !this.data.is_edit
        })
        let component = this.selectComponent("#list")
        component.changeStatus(this.data.is_edit)
    },

    onPullDownRefresh: function () {
        if (this.data.is_edit) {
            wx.showToast({
                title: '请取消编辑',
            })
            wx.stopPullDownRefresh()
            return
        }
        this.setData({
            postInfo: {
                sessionrd: app.sessionrd,
                action: 'getUserBlog',
                user_id: app.globalData.userInfo.id,
                api: app.api.user.info,
                refresh: 1
            }
        })
        wx.stopPullDownRefresh()
    },

    onReachBottom: function () {
        if (this.data.is_edit) {
            wx.showToast({
                title: '请取消编辑',
            })
            wx.stopPullDownRefresh()
            return
        }
        let component = this.selectComponent("#list")
        component.getlist()
    },

    onShareAppMessage: function () {

    }
})