// pages/myClothes/myClothes.js
const app = getApp()
Page({
    data: {
        clothSeleted: [],
        clothCateUp: [],
        clothCateDown: [],
        up_active: -1,
        clothList: [],
        delCloth: false,
        clothLoading: false
    },
    onLoad: function(options) {
        this.getClothList()
        this.getCloseCate()
    },

    onShow: function() {

    },

    goAdd() {
        wx.navigateTo({
            url: '/pages/wardrobe/wardrobe',
        })
    },

    mytouchstart(e) {
        this.setData({
            touch_start: e.timeStamp
        })
    },

    mytouchend(e) {
        this.setData({
            touch_end: e.timeStamp
        })
    },

    showDelCloth() {
        this.setData({
            delCloth: true
        })
    },

    hideDelCloth() {
        this.setData({
            delCloth: false
        })
    },

    deleteClothItem(e) {
        let index = parseInt(e.currentTarget.dataset.index)
        let id = e.currentTarget.dataset.id
        let arr = this.data.clothList.slice(0)
        arr.splice(index, 1)
        this.setData({
            clothList: arr
        })
        if (arr.length == 0) {
            this.hideDelCloth()
        }
        app.fn.ajax('POST', {
            sessionrd: app.sessionrd,
            action: 'delWardrobe',
            wids: id
        }, app.api.information.wardrobe, res => {
            // TODO
        })
    },

    goClothEdit(e) {
        let touchTime = this.data.touch_end - this.data.touch_start
        if (touchTime > 350) {
            this.showDelCloth()
        } else {
            let item = e.currentTarget.dataset.item
            wx.navigateTo({
                url: '/pages/wardrobeSimilar/wardrobeSimilar?id=' + item.id + '&url=' + item.image_url
            })
            wx.setStorageSync('clothes_cate', item.cate_list)
        }
    },

    goEdit() {
        wx.navigateTo({
            url: '/pages/collectLable/collectLable',
        })
    },

    get_cloth_up_list() {
        let num = this.data.select_num
        let postdata = {
            sessionrd: app.sessionrd,
            action: 'collectCateList',
            page: Math.ceil(this.data.clothCateUp.length / 10) + 1,
            pagenum: 10
        }
        let arr = []
        this.data.clothSeleted.map((item, index) => {
            arr.push(item.id)
        })
        postdata.cate_ids = arr.join(',')
        if (this.data.cloth_up_loading) {
            return
        }
        this.data.cloth_up_loading = true
        app.fn.ajax('POST', postdata, app.api.information.wardrobe, res => {
            this.data.cloth_up_loading = false
            this.setData({
                clothCateUp: this.data.clothCateUp.concat(res.data)
            })
        })
    },

    selectCloseCate(e) {
        let index = parseInt(e.currentTarget.dataset.index)
        let type = e.currentTarget.dataset.type
        this.setData({
            up_active: index
        })
        this.getCloseCate(1, this.data.clothCateUp[index].id)
    },

    cancleSelect(e) {
        let index = parseInt(e.currentTarget.dataset.index)
        let arr = this.data.clothSeleted.slice(0)
        arr.splice(index, 1)
        this.setData({
            clothSeleted: arr,
            clothLoading: false,
            clothList: []
        })
        this.getCloseCate(2)
        this.getClothList()
    },

    get_cloth_up_list() {
        let num = this.data.select_num
        let postdata = {
            sessionrd: app.sessionrd,
            action: 'collectCateList',
            page: Math.ceil(this.data.clothCateUp.length / 10) + 1,
            pagenum: 10
        }
        let arr = []
        this.data.clothSeleted.map((item, index) => {
            arr.push(item.id)
        })
        postdata.cate_ids = arr.join(',')
        if (this.data.cloth_up_loading) {
            return
        }
        this.data.cloth_up_loading = true
        app.fn.ajax('POST', postdata, app.api.information.wardrobe, res => {
            this.data.cloth_up_loading = false
            this.setData({
                clothCateUp: this.data.clothCateUp.concat(res.data)
            })
        })
    },

    getCloseCate(type, up_id) {
        let num = this.data.select_num
        let postdata = {
            sessionrd: app.sessionrd,
            action: 'collectCateList',
            page: 1,
            pagenum: 10
        }
        let arr = []
        this.data.clothSeleted.map((item, index) => {
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
        if (this.data.cloth_cate_loading) {
            return
        }
        this.data.cloth_cate_loading = true
        app.fn.ajax('POST', postdata, app.api.information.wardrobe, res => {
            this.data.cloth_cate_loading = false
            // 判断
            if (type == 1) {
                this.setData({
                    clothCateDown: res.data
                })
            }
            if (type == 2 || type == undefined) {
                this.setData({
                    clothCateUp: res.data,
                    up_active: 0
                }, () => {
                    if (this.data.clothCateUp.length) {
                        this.getCloseCate(1, this.data.clothCateUp[0].id)
                    }
                })
            }
        })
    },

    selectDown(e) {
        let index = parseInt(e.currentTarget.dataset.index)
        let type = e.currentTarget.dataset.type
        let arr = this.data.clothSeleted.slice(0)
        arr.push(this.data.clothCateDown[index])
        let downArr = this.data.clothCateDown.slice(0)
        downArr.splice(index, 1)
        this.setData({
            clothSeleted: arr,
            clothCateDown: downArr,
            clothLoading: false,
            clothList: []
        })
        this.getCloseCate(2)
        this.getClothList()
    },

    getClothList() {
        let num = this.data.select_num
        let sendData = {
            sessionrd: app.sessionrd,
            action: 'wardrobeList',
            page: Math.ceil(this.data.clothList.length / 9) + 1,
            pagenum: 9
        }

        let cate_ids = []
        if (this.data.clothSeleted.length) {
            this.data.clothSeleted.map((item, index) => {
                cate_ids.push(item.id)
            })
        }
        sendData.cate_ids = cate_ids.join(',')

        let api = app.api.information.wardrobe
        if (this.data.clothLoading) {
            return
        }
        this.setData({
            clothLoading: true
        })
        app.fn.ajax('POST', sendData, api, res => {
            this.setData({
                clothLoading: false
            })
            if (num != this.data.select_num) {
                return
            }
            if (this.data.clothList.length > 0 && this.data.clothList.length < 12) {
                this.setData({
                    clothNoMore: true
                })
            }
            if (this.data.clothList.length == 0) {
                this.setData({
                    clothNoData: true
                })
            }

            this.setData({
                clothList: this.data.clothList.concat(res.data)
            }, () => {
                if (this.data.clothList.length == 9) {
                    this.getClothList()
                }
            })
        })

    },

    onPullDownRefresh: function() {

    },

    onReachBottom: function() {
        this.getClothList()
    }
})