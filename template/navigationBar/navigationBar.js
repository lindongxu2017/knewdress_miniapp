// template/navigationBar/navigationBar.js
const app = getApp()
Component({
    /**
     * 组件的属性列表
     */
    properties: {
        navTitle: {
            type: String,
            value: ''
        }
    },

    /**
     * 组件的初始数据
     */
    data: {
        statusBarHeight: 20,
        showAllIcon: true,
        showBackIcon: true
    },

    /**
     * 在组件实例进入页面节点树时执行
     */
    lifetimes: {
        attached() {
            let statusBarHeight = app.globalData.statusBarHeight
            let pages = getCurrentPages()
            if (pages.length == 1) {
                if (pages[0].route == "pages/index/index" || pages[0].route == "pages/blogger/blogger" || pages[0].route == "pages/center/center" || pages[0].route == "pages/shop/index/index" || pages[0].route == "pages/release/release" || pages[0].route == "pages/upload/index") {
                    this.setData({
                        showAllIcon: false
                    })
                } else {
                    this.setData({
                        showBackIcon: false
                    })
                }
            }
            this.setData({
                statusBarHeight
            })
            // console.log(wx.getMenuButtonBoundingClientRect())
        }
    },

    /**
     * 组件的方法列表
     */
    methods: {
        goback() {
            wx.navigateBack()
        },
        gohome() {
            wx.switchTab({
                url: '/pages/index/index',
            })
        }
    }
})