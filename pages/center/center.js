// pages/center/center.js
const app = getApp()
import store from '../../store'
import create from '../../utils/create'
create(store, {
    data: {
        userInfo: {}, // 用户信息
        collect_list: [], // 列表数据

        orderCate: [
            { icon: '/icon/all.png', text: '全部订单', type: 0 },
            { icon: '/icon/pending.png', text: '待付款', type: 1 },
            { icon: '/icon/pendingsend.png', text: '待发货', type: 2 },
            { icon: '/icon/recevied.png', text: '待收货', type: 3 },
            { icon: '/icon/finish.png', text: '已完成', type: 4 }
        ],

    },
    onLoad: function(options) {
        // console.log(app.globalData.userInfo)
        this.setData({
            userInfo: app.globalData.userInfo || null,
            windowWidth: app.globalData.windowWidth,
            windowHeight: app.globalData.windowHeight
        })
    },

    onShow: function() {
        let timer = setInterval(() => {
            if (app.globalData.userInfo) {
                clearInterval(timer)
                this.setData({
                    userInfo: app.globalData.userInfo || null // 获取用户信息
                })
            }
        }, 500)
    },

    links (e) {
        let url = e.currentTarget.dataset.url
        if (!this.data.userInfo) {
            wx.showToast({
                title: '请授权获取相关信息',
                icon: 'none'
            })
            setTimeout(() => {
                wx.navigateTo({
                    url: '/pages/wxAuth/wxAuth',
                })
            }, 1000)
        } else {
            wx.navigateTo({ url })
        }
    },

    goOrder (e) {
        let type = e.currentTarget.dataset.type
        if (!this.data.userInfo) {
            wx.showToast({
                title: '请授权获取相关信息',
                icon: 'none'
            })
            setTimeout(() => {
                wx.navigateTo({
                    url: '/pages/wxAuth/wxAuth',
                })
            }, 1000)
        } else {
            wx.navigateTo({
                url: '/pages/shop/order/order?type=' + type,
            })
        }
    },
    
    onShareAppMessage () {
        return {
            title: '这个博主很适合你哟',
            path: '/pages/bloggerDetail/bloggerDetail?id=' + this.data.userInfo.id + '&sharePage=1&pid=' + app.globalData.userInfo.id
        }
    }

})