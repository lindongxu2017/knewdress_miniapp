// pages/colletFolder/colletFolder.js
const app = getApp()
import store from '../../store'
import create from '../../utils/create'
create(store, {

    data: {
        openNewFolder: false,
        checklist: [],
        folderlist: [],
        loading: false,
        blog_id: 0,
        isCollect: 0
    },

    onLoad: function(options) {
        // console.log(options)
        if (options.id) {
            this.data.blog_id = options.id
        }
        let arr = wx.getStorageSync('collect_cate') || []
        if (arr && arr.length) {
            this.setData({
                checklist: arr
            })
            wx.removeStorageSync('collect_cate')
        }
        this.getlFolderlist()
        if (options.isCollect == 1) {
            this.data.isCollect = options.isCollect
        }
    },

    onShow: function() {

    },

    getChecklist() {

    },

    getlFolderlist() {
        let page = 1
        if (this.data.folderlist.length > 0) {
            page = Math.ceil(this.data.folderlist.length / 12) + 1
        }
        app.fn.ajax('POST', {
            sessionrd: app.sessionrd,
            action: 'collectCateList',
            page: page,
            pagenum: 12
        }, app.api.information.collect, res => {
            // console.log(res)
            let arr = JSON.parse(JSON.stringify(this.data.folderlist))
            arr = arr.concat(res.data)
            arr.map((item, index) => {
                item.ischeck = false
            })
            if (this.data.checklist.length) {
                this.data.checklist.map((item, index) => {
                    arr.map((obj, order) => {
                        if (item.id == obj.id) {
                            obj.ischeck = true
                        }
                    })
                })
            }
            this.setData({
                folderlist: arr
            })
        })
    },

    callBackValue(e) {
        // console.log(e)
        this.addFolder(e.detail)
    },

    addFolder(folderName) {
        app.fn.ajax('POST', {
            sessionrd: app.sessionrd,
            action: 'modifyCollectCate',
            // cate_id: 0,
            cate_name: folderName
        }, app.api.information.collect, res => {
            // console.log(res)
            let arr = JSON.parse(JSON.stringify(this.data.folderlist))
            arr.unshift({
                cate_name: folderName,
                collect_number: 0,
                ischeck: false,
                id: res.data.cate_id
            })
            this.setData({
                folderlist: arr
            })
            wx.setStorageSync('addfolder', 1)
        })
    },

    openNewFolder() {
        this.setData({
            openNewFolder: true
        })
    },

    confirm() {
        wx.showLoading({
            title: '加载中...',
        })
        // wx.setStorageSync('collectArr', 1)
        wx.setStorageSync('collect_operation', 1)
        if (this.data.checklist.length) {
            var id_str = []
            this.data.checklist.map((item, index) => {
                id_str.push(item.id)
            })
            var action = ''
            console.log(this.data.isCollect)
            if (this.data.isCollect) {
                action = 'updateCollectCate'
            } else {
                action = 'setCollect'
            }
            app.fn.ajax('POST', {
                sessionrd: app.sessionrd,
                action: action,
                blog_id: this.data.blog_id,
                cate_ids: id_str.join(',')
            }, app.api.information.collect, res => {
                wx.hideLoading()
                wx.navigateBack()
                if (!this.data.isCollect) {
                    let item = {
                        blog_info: this.store.data.current_blog_detail,
                        blog_id: this.data.blog_id
                    }
                    let arr = JSON.parse(JSON.stringify(this.store.data.collect_list))
                    arr.unshift(item)
                    this.store.data.collect_list = []
                    this.update()
                    this.store.data.collect_list = arr
                }
            })
        } else {
            if (this.data.isCollect) {
                app.fn.ajax('POST', {
                    sessionrd: app.sessionrd,
                    action: 'setCollect',
                    blog_id: this.data.blog_id
                }, app.api.information.collect, res => {
                    // todo
                    wx.hideLoading()
                    wx.navigateBack()
                    this.store.data.collect_list.map((item, index) => {
                        if (item.blog_info.blog_id == this.data.blog_id) {
                            let arr = JSON.parse(JSON.stringify(this.store.data.collect_list))
                            arr.splice(index, 1)
                            this.store.data.collect_list = []
                            this.update()
                            this.store.data.collect_list = arr
                        }
                    })
                })
            } else {
                wx.navigateBack()
            }
        }
    },

    cancel(e) {
        let index = e.currentTarget.dataset.index
        this.data.folderlist.map((item, order) => {
            if (this.data.checklist[index].cate_name == item.cate_name) {
                let key = 'folderlist[' + order + '].ischeck'
                this.setData({
                    [key]: false
                })
            }
        })
        let arr = JSON.parse(JSON.stringify(this.data.checklist))
        arr.splice(index, 1)
        this.setData({
            checklist: arr
        })
    },

    selectItems(e) {
        let index = e.currentTarget.dataset.index
        let bool = this.data.folderlist[index].ischeck
        let key = 'folderlist[' + index + '].ischeck'
        this.setData({
            [key]: !bool
        })
        let arr = JSON.parse(JSON.stringify(this.data.checklist))
        // console.log(arr)
        if (!bool) {
            arr.push(this.data.folderlist[index])
            this.setData({
                checklist: arr
            })
        } else {
            arr.map((item, order) => {
                // console.log(item.cate_name, this.data.folderlist[index].cate_name)
                if (item.cate_name == this.data.folderlist[index].cate_name) {
                    arr.splice(order, 1)
                    // console.log(item)
                }
            })
            // console.log(arr)
            this.setData({
                checklist: arr
            })
        }
    },

    onReachBottom: function() {
        this.getlFolderlist()
    }
})