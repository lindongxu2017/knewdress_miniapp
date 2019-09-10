// pages/blogger/blogger.js
const app = getApp()
import store from '../../store'
import create from '../../utils/create'
create(store, {
    data: {
        infoTypeActive: 0,
        isloading0: false,
        isloading1: false,
        isloading2: false,
        noData0: false,
        noMore0: false,
        noData1: false,
        noMore1: false,
        noData2: false,
        noMore2: false,
        lastAllID: '', // 全部博主最后一个ID
        all: [], // 推荐博主

        selectid: [],
        selectFocusid: [],
        selectNum: 0,
        selectFocusNum: 0,

        lastID: '', // 推荐博主最后一个ID
        recommend: [], // 推荐博主
        lastFocusID: '', // 推荐博主最后一个ID
        focus: [], // 我的关注
        statusBarHeight: 20,
        islogin: false
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        wx.showLoading({
            title: '加载中',
        })
        this.setData({
            statusBarHeight: app.globalData.statusBarHeight
        })
        this.getAlllist()
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function() {
        if (app.sessionrd) {
            this.setData({
                islogin: true
            })
        }
        if (wx.getStorageSync('updateFocus')) {
            if (this.data.focus.length) {
                this.store.data.focus = []
                this.update()
                this.getfocuslist()
            }
            wx.removeStorageSync('updateFocus')
        }
    },
    preventSwiper() {
        return false
    },

    asynData (e) {
        let bloggerItem = e.detail

        let getCurrent = (arr) => {
            let current = ''
            arr.map((item, index) => {
                if (item.id == bloggerItem.id) {
                    current = index
                }
            })
            return current
        }

        let arr = []
        switch (parseInt(bloggerItem.type)) {
            case 1:
                arr = this.store.data.all
                break
            case 2:
                arr = this.store.data.recommend
                break
            case 3:
                arr = this.store.data.focus
                break
        }
        let current = getCurrent(arr)
        if (parseInt(bloggerItem.type) == 3) {
            this.store.data.focus[current].isShow = false
            this.update()
            if (this.store.data.all.length) {
                let all_index = getCurrent(this.store.data.all)
                if (all_index !== '') {
                    let item = JSON.parse(JSON.stringify(bloggerItem))
                    item.type = 1
                    this.store.data.all.splice(all_index, 1)
                    this.update()
                    this.store.data.all.splice(all_index, 0, item)
                    this.update()
                }
            }
            if (this.store.data.recommend.length) {
                let recommend_index = getCurrent(this.store.data.recommend)
                if (recommend_index !== '') {
                    let item = JSON.parse(JSON.stringify(bloggerItem))
                    item.type = 2
                    this.store.data.recommend.splice(recommend_index, 1)
                    this.update()
                    this.store.data.recommend.splice(recommend_index, 0, item)
                    this.update()
                }
            }
        } else {
            if (this.store.data.focus.length) {
                if (bloggerItem.is_focus == 1) {
                    this.store.data.focus = []
                    this.update()
                    this.getfocuslist()
                } else {
                    let order = getCurrent(this.store.data.focus)
                    this.store.data.focus.splice(order, 1)
                }
                this.update()
            }
            if (parseInt(bloggerItem.type) == 1) {
                if (this.store.data.recommend.length) {
                    let current = getCurrent(this.store.data.recommend)
                    if (current !== '') {
                        this.store.data.recommend.splice(current, 1)
                        this.update()
                        let item = JSON.parse(JSON.stringify(bloggerItem))
                        item.type = 2
                        this.store.data.recommend.splice(current, 0, item)
                        this.update()
                    }
                }
            } else {
                if (this.store.data.all.length) {
                    let current = getCurrent(this.store.data.all)
                    if (current !== '') {
                        this.store.data.all.splice(current, 1)
                        this.update()
                        let item = JSON.parse(JSON.stringify(bloggerItem))
                        item.type = 1
                        this.store.data.all.splice(current, 0, item)
                        this.update()
                    }
                }
            }
        }
    },

    selectCate (e) {
        // console.log(e.detail)
        if (this.data.infoTypeActive == 0) {
            this.setData({
                noData0: false,
                noMore0: false,
                lastAllID: '',
                selectid: e.detail
            })
            this.store.data.all = []
            this.update()
            this.getAlllist()
        } else {
            this.setData({
                noData2: false,
                noMore2: false,
                selectFocusid: e.detail
            })
            this.store.data.focus = []
            this.update()
            this.getfocuslist()
        }
    },

    getfocuslist() {
        if (this.data.isloading2 || this.data.noData2 || this.data.noMore2) {
            return
        }
        this.data.selectFocusNum += 1
        let num = this.data.selectFocusNum
        this.setData({
            isloading2: true
        })
        let postData = {
            sessionrd: app.sessionrd,
            action: 'focusList',
            page: Math.ceil(this.data.focus.length / 12) + 1,
            pagenum: 12
        }
        if (this.data.selectFocusid.length) {
            postData.sid = this.data.selectFocusid.join(',')
        }
        app.fn.ajax('POST', postData, app.api.user.info, res => {
            wx.hideLoading()
            this.setData({ isloading2: false })
            if (num != this.data.selectFocusNum) {
                return
            }
            if (res.data && res.data.length) {
                res.data.map((item, index) => { 
                    item.type = 3
                    item.isShow = true
                })
                this.store.data.focus = this.store.data.focus.concat(res.data)
                this.update()
            }
            if (res.data && res.data.length == 0 && this.data.focus.length == 0) {
                this.setData({ noData2: true })
            }
            if (res.data && res.data.length < 12 && this.data.focus.length > 0) {
                this.setData({ noMore2: true })
            }
        })
    },

    // 上传图片搜索
    uploadImg() {
        wx.chooseImage({
            count: 1,
            sizeType: ['compressed'],
            success: function(res) {
                // console.log(res.tempFilePaths[0])
                let tempFilePath = res.tempFilePaths[0]
                wx.navigateTo({
                    url: '/pages/imgSearch/imgSearch?url=' + tempFilePath + '&show_face=1'
                })
            }
        })
    },

    getAlllist() {
        if (this.data.isloading0 || this.data.noData0 || this.data.noMore0) {
            return
        }
        this.data.selectNum = this.data.selectNum + 1
        let num = this.data.selectNum
        this.setData({ isloading0: true })
        let postData = {
            sessionrd: app.sessionrd,
            action: 'bloggerList',
            user_id: this.data.lastAllID,
            page: Math.ceil(this.data.all.length / 12) + 1,
            pagenum: 12
        }
        if (this.data.selectid.length) {
            postData.sid = this.data.selectid.join(',')
        }
        app.fn.ajax('POST', postData, app.api.user.info, res => {
            this.setData({  isloading0: false })
            wx.hideLoading()
            if (num != this.data.selectNum) {
                return
            }
            if (res.data && res.data.length > 0) {
                res.data.map((item, index) => {
                    item.type = 1
                    item.isShow = true
                })
                this.store.data.all = this.store.data.all.concat(res.data)
                this.update()
                this.data.lastAllID = res.data[res.data.length - 1].id
            }
            if (res.data && res.data.length == 0 && this.data.all.length == 0) {
                this.setData({ noData0: true })
            }
            if (res.data && res.data.length < 12 && this.data.all.length > 0) {
                this.setData({ noMore0: true })
            }
        })
    },

    getlist() {
        if (this.data.isloading1 || this.data.noData1 || this.data.noMore1) {
            return
        }
        this.setData({ isloading1: true })
        app.fn.ajax('POST', {
            sessionrd: app.sessionrd,
            action: 'userRecommended',
            user_id: this.data.lastID,
            page: Math.ceil(this.data.recommend.length / 12) + 1,
            pagenum: 12
        }, app.api.user.info, res => {
            this.setData({ isloading1: false })
            wx.hideLoading()
            if (res.data && res.data.length > 0) {
                res.data.map((item, index) => { 
                    item.type = 2
                    item.isShow = true
                })
                this.store.data.recommend = this.store.data.recommend.concat(res.data)
                this.update()
                this.data.lastID = res.data[res.data.length - 1].id
            }
            if (res.data && res.data.length == 0 && this.data.recommend.length == 0) {
                this.setData({ noData1: true })
            }
            if (res.data && res.data.length < 12 && this.data.recommend.length > 0) {
                this.setData({ noMore1: true })
            }
        })
    },

    // 跳转至搜索页面
    goSearch() {
        wx.navigateTo({
            url: '/pages/search/search?focus=1',
        })
    },

    scrolltolower() {
        switch (this.data.infoTypeActive) {
            case 0:
                this.getAlllist()
                break
            case 1:
                this.getlist()
                break
            case 2:
                this.getfocuslist()
                break
        }
    },

    switchInfoType(e) {
        let type = e.currentTarget.dataset.type
        if (type != this.data.infoTypeActive) {
            this.setData({
                infoTypeActive: type
            })
        }

        if (type == 0) {
            if (!this.data.isloading0) {
                wx.hideLoading()
            } else {
                wx.showLoading({
                    title: '加载中',
                })
            }
        }

        if (type == 1) {
            if (this.data.recommend.length == 0) {
                this.getlist()
            }
            if (!this.data.isloading1) {
                wx.hideLoading()
            } else {
                wx.showLoading({
                    title: '加载中',
                })
            }
        }

        if (type == 2) {
            if (this.data.focus.length == 0) {
                this.getfocuslist()
            }
            if (!this.data.isloading2) {
                wx.hideLoading()
            } else {
                wx.showLoading({
                    title: '加载中',
                })
            }
        }
    },

    swiperChange(e) {
        this.setData({ infoTypeActive: e.detail.current })
    },

    onPullDownRefresh () {
        if (this.data.infoTypeActive == 0) {
            this.setData({
                noMore0: false,
                noData0: false,
                lastAllID: ''
            })
            this.store.data.all = []
            this.update()
            this.getAlllist()
        } else if (this.data.infoTypeActive == 1) {
            this.setData({
                noMore1: false,
                noData1: false,
                lastID: ''
            })
            this.store.data.recommend = []
            this.update()
            this.getlist()
        } else {
            this.setData({
                noMore2: false,
                noData2: false
            })
            this.store.data.focus = []
            this.update()
            this.getfocuslist()
        }
        wx.stopPullDownRefresh()
    }

})