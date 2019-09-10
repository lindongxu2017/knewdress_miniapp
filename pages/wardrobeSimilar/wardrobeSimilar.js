// pages/wardrobeSimilar/wardrobeSimilar.js
const app = getApp()
import store from '../../store'
import create from '../../utils/create'
create(store, {

    data: {
        url: '',
        id: '',
        selectedlist: [],
        listinfo: null
    },

    onLoad: function (options) {
        
        this.setData({
            url: options.url,
            id: options.id
        })

        this.searchSimilarImg()

    },

    onShow: function () {
        this.setData({
            selectedlist: wx.getStorageSync('clothes_cate') || []
        })
    },

    onReachBottom () {
        let component = this.selectComponent("#list")
        component.getlist()
    },

    goEdit() {
        wx.navigateTo({
            url: '/pages/wardrobe/wardrobe?id=' + this.data.id + '&url=' + this.data.url
        })
    },

    
    searchSimilarImg() {
        this.setData({
            listinfo: {
                sessionrd: app.sessionrd,
                action: 'BlogImgSearch',
                image_url: this.data.url,
                item_id: '',
                pagenum: 12,
                shownum: 0
            }
        })
    }
})