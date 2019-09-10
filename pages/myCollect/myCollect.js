// pages/myCollect/myCollect.js
const app = getApp()
import store from '../../store'
import create from '../../utils/create'
create(store, {

    data: {
        showPlaceholder: true,
        palceholderShowHeight: 602,

        collect_list: [],

        // 收藏分类
        collect_selected: [],
        collect_up: [],
        collect_down: [],
        collect_up_active: -1,
        collect_up_loading: false,
        collect_loading: false,
        noData: false,
        noMore: false
    },

    onLoad: function (options) {
        this.setData({
            palceholderShowHeight: app.globalData.windowHeight - app.globalData.statusBarHeight - 45
        })
        this.setData({
            collect_list: []
        })
        this.getSelectList()
        this.getlist()
    },

    onShow: function () {
        
    },

    select_collect_up(e) {
        let index = e.currentTarget.dataset.index
        let type = e.currentTarget.dataset.type
        this.setData({
            collect_up_active: index
        })
        this.getSelectList(1, this.data.collect_up[index].id)
    },

    select_collect_down(e) {
        let index = e.currentTarget.dataset.index
        let type = e.currentTarget.dataset.type
        let arr = this.data.collect_selected.slice(0)
        arr.push(this.data.collect_down[index])
        let downArr = this.data.collect_down.slice(0)
        downArr.splice(index, 1)
        this.setData({
            collect_selected: arr,
            collect_down: downArr,
            collect_loading: false,
            noData: false,
            noMore: false,
            collect_list: []
        })
        this.store.data.collect_list = []
        this.update()
        this.getSelectList(2)
        this.getlist()
    },

    cancle_collect_select(e) {
        let index = e.currentTarget.dataset.index
        let arr = this.data.collect_selected.slice(0)
        arr.splice(index, 1)
        this.setData({
            collect_selected: arr,
            collect_loading: false,
            noData: false,
            noMore: false,
            collect_list: []
        })
        this.store.data.collect_list = []
        this.update()
        this.getSelectList(2)
        this.getlist()
    },

    goEdit() {
        wx.navigateTo({
            url: '/pages/collectLable/collectLable',
        })
    },

    get_collect_up_list() {
        let postdata = {
            sessionrd: app.sessionrd,
            action: 'collectCateList',
            page: Math.ceil(this.data.collect_up.length / 10) + 1,
            pagenum: 10
        }
        let arr = []
        this.data.collect_selected.map((item, index) => {
            arr.push(item.id)
        })
        postdata.cate_ids = arr.join(',')
        if (this.data.collect_up_loading) {
            return
        }
        this.data.collect_up_loading = true
        app.fn.ajax('POST', postdata, app.api.information.collect, res => {
            this.data.collect_up_loading = false
            this.setData({
                collect_up: this.data.collect_up.concat(res.data)
            })
        })
    },

    getSelectList(type, up_id) {
        let num = this.data.select_num
        let postdata = {
            sessionrd: app.sessionrd,
            action: 'collectCateList',
            page: 1,
            pagenum: 10
        }
        let arr = []
        this.data.collect_selected.map((item, index) => {
            arr.push(item.id)
        })
        postdata.cate_ids = arr.join(',')
        if (type == 1) {
            postdata.up_id = up_id
        } else if (type == 2) {
            // TODO
        } else {
            postdata.up_id = ''
            postdata.cate_ids = ''
        }
        if (this.data.loading) {
            return
        }
        this.data.loading = true
        app.fn.ajax('POST', postdata, app.api.information.collect, res => {
            this.data.loading = false
            if (num != this.data.select_num) {
                return
            }
            // 判断
            if (type == 1) {
                this.setData({
                    collect_down: res.data
                })
            }
            if (type == 2 || type == undefined) {
                this.setData({
                    collect_up: res.data,
                    collect_up_active: 0
                }, () => {
                    if (this.data.collect_up.length) {
                        this.getSelectList(1, this.data.collect_up[0].id)
                    }
                })
            }
        })
    },

    getlist() {
        let num = this.data.select_num
        let sendData = {
            sessionrd: app.sessionrd,
            action: 'collectList',
            page: Math.ceil(this.data.collect_list.length / 12) + 1,
            pagenum: 12
        }
        let cate_ids = []
        if (this.data.collect_selected.length) {
            this.data.collect_selected.map((item, index) => {
                cate_ids.push(item.id)
            })
        }
        sendData.cate_ids = cate_ids.join(',')

        let api = app.api.information.collect
        if (this.data.collect_loading || this.data.noData || this.data.noMore) {
            return
        }
        this.setData({
            collect_loading: true
        })
        app.fn.ajax('POST', sendData, api, res => {
            this.setData({
                collect_loading: false
            })
            if (num != this.data.select_num) {
                return
            }
            if (res.data.data && res.data.data.length == 0 && this.data.collect_list.length == 0) {
                this.setData({
                    noData: true
                })
            }
            if (res.data.data && res.data.data.length == 0 && this.data.collect_list.length > 0) {
                this.setData({
                    noMore: true
                })
            }
            if (res.data.data && res.data.data.length) {
                // this.store.data.collect_list = this.store.data.collect_list.concat(res.data.data)
                // this.update()
                this.setData({
                    collect_list: this.data.collect_list.concat(res.data.data)
                }, () => {
                    if (res.data.total_page > 1 && this.data.collect_list.length == 12) {
                        this.getlist()
                    } 
                })
            }
        })
    },

    // 跳转详情
    godetail(e) {
        this.store.data.swiperlist = []
        this.update()
        let arr = []
        this.data.collect_list.map((item, index) => {
            arr.push(item.blog_info)
        })
        this.store.data.swiperlist = arr
        this.store.data.listPostData = null
        this.update()
        wx.navigateTo({
            url: '/pages/detail/detail?id=' + e.currentTarget.dataset.id + '&index=' + e.currentTarget.dataset.index,
        })
    },

    onPullDownRefresh: function () {

    },

    onReachBottom: function () {
        this.getlist()
    },

    onShareAppMessage: function () {

    }
})