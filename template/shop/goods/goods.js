// template/goods/goods.js
Component({
    /**
     * 组件的属性列表
     */
    properties: {
        itemInfo: {
            type: Object,
            value: {}
        }
    },

    /**
     * 组件的初始数据
     */
    data: {

    },

    /**
     * 组件的方法列表
     */
    methods: {
        goDetail() {
            wx.navigateTo({
                url: '/pages/shop/detail/detail?id=' + this.data.itemInfo.id,
            })
        }
    }
})
