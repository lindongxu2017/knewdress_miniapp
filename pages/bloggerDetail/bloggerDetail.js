// pages/bloggerDetail/bloggerDetail.js
const app = getApp()
import store from '../../store'
import create from '../../utils/create'
create(store, {

    // 页面的初始数据
    data: {
        bloggerID: '',
        bloggerInfo: null,
        labelList: [],
        postInfo: null,
        scrollTop: 0,
        collapse: false,
        showAddPrompt: false,
        promptValue: '',
        active: 0,
        clothList: [],

        clothSeleted: [],
        clothCateUp: [],
        clothCateDown: [],
        up_active: -1,
        select_num: 0,
        cloth_up_loading: false,
        clothLoading: false,
        
        datalength: 0, // 图片加载计数
        initlist: [] // concat之前数据长度
    },

    // 生命周期函数--监听页面加载
    onLoad: function(options) {
        this.store.data.bloggerList = []
        this.update()
        if (options.id) {
            // console.log(options.id)
            this.data.bloggerID = options.id
        }
        // this.data.bloggerID = '5c24df14358ef23d59c06200'
        // 涉及app.sessionrd
        let attached = res => {
            this.getBloggerInfo()
            this.getBloggerLabel()
            this.setData({
                postInfo: {
                    sessionrd: app.sessionrd,
                    action: 'getUserBlog',
                    user_id: this.data.bloggerID,
                    api: app.api.user.info
                }
            })
            this.getCloseCate()
        }
        // 防止异步
        attached()
        if (options.sharePage) {
            app.sharePage = 1
        }
    },

    // 生命周期函数--监听页面显示
    onShow: function() {
        // 同步收藏数据
        if (wx.getStorageSync('collect_list_num_arr') && this.data.postInfo) {
            let component_recommend = this.selectComponent("#list")
            component_recommend.syncData()
        }
        let bloggerArr = wx.getStorageSync('bloggerArr') || []
        if (bloggerArr.length > 0 && this.data.bloggerInfo) {
            bloggerArr.map((item, index) => {
                if (item.user_info) {
                    if (item.user_info.user_id == this.data.bloggerInfo.id) {
                        this.setData({
                            'bloggerInfo.is_focus': item.is_focus
                        })
                    }
                } else {
                    if (item.id == this.data.bloggerInfo.id) {
                        this.setData({
                            'bloggerInfo.is_focus': item.is_focus
                        })
                    }
                }
            })
        }
    },

    switchInfoType (e) {
        let type = e.currentTarget.dataset.type
        if (type != this.data.active) {
            this.setData({
                active: type
            })
        }
        if (type == 1 && this.data.clothList.length == 0) {
            this.getClothList()
        }
    },

    cancleSelect(e) {
        let index = e.currentTarget.dataset.index
        let arr = this.data.clothSeleted.slice(0)
        arr.splice(index, 1)
        this.setData({
            clothSeleted: arr,
            clothLoading: false,
            clothList: [],
            initlist: [],
            datalength: 0
        })
        this.data.select_num++
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

    selectCloseCate(e) {
        // console.log(e)
        let index = e.currentTarget.dataset.index
        let type = e.currentTarget.dataset.type
        this.setData({
            up_active: index
        })
        this.data.select_num++
        this.getCloseCate(1, this.data.clothCateUp[index].id)
    },
    
    selectDown(e) {
        let index = e.currentTarget.dataset.index
        let type = e.currentTarget.dataset.type
        let arr = this.data.clothSeleted.slice(0)
        arr.push(this.data.clothCateDown[index])
        let downArr = this.data.clothCateDown.slice(0)
        downArr.splice(index, 1)
        this.setData({
            clothSeleted: arr,
            clothCateDown: downArr,
            clothLoading: false,
            clothList: [],
            initlist: [],
            datalength: 0
        })
        this.data.select_num++
        this.getCloseCate(2)
        this.getClothList()
    },

    getCloseCate(type, up_id) {
        let num = this.data.select_num
        let postdata = {
            sessionrd: app.sessionrd,
            action: 'collectCateList',
            page: 1,
            user_id: this.data.bloggerID,
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

    getClothList() {
        let num = this.data.select_num
        let sendData = {
            sessionrd: app.sessionrd,
            action: 'wardrobeList',
            page: Math.ceil(this.data.clothList.length / 9) + 1,
            // page: 1,
            pagenum: 9,
            user_id: this.data.bloggerID,
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
            this.setData({
                clothList: this.data.clothList.concat(res.data)
            })
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

        })

    },

    // 获取博主信息
    getBloggerInfo() {
        app.fn.ajax('POST', {
            sessionrd: app.sessionrd,
            action: 'getUserDetail',
            user_id: this.data.bloggerID
        }, app.api.user.info, res => {
            // console.log(res)
            this.setData({
                bloggerInfo: res.data
            })
        })
    },

    // 获取博主标签列表
    getBloggerLabel() {
        app.fn.ajax('POST', {
            sessionrd: app.sessionrd,
            action: 'getUserLabel',
            user_id: this.data.bloggerID
        }, app.api.label.list, res => {
            // console.log(res)
            this.setData({
                labelList: res.data
            })
        })
    },

    // 关注博主
    focusBlogger() {
        
        app.fn.ajax('POST', {
            sessionrd: app.sessionrd,
            action: 'doFocus',
            user_id: this.data.bloggerID
        }, app.api.user.info, res => {
            var num = this.data.bloggerInfo.new_focus
            this.setData({
                'bloggerInfo.is_focus': this.data.bloggerInfo.is_focus == 0 ? 1 : 0,
                'bloggerInfo.new_focus': this.data.bloggerInfo.is_focus == 0 ? num + 1 : num - 1
            })
        })
        // console.log(this.data.bloggerInfo)
        this.asynData(this.data.bloggerID)
    },

    asynData(id) {
        if (this.store && this.store.data) {
            this.store.data.all.map((item, index) => {
                if (item.id == id) {
                    let status = this.store.data.all[index].is_focus
                    this.store.data.all[index].is_focus = status == 0 ? 1 : 0
                    this.update()
                }
            })
            this.store.data.recommend.map((item, index) => {
                if (item.id == id) {
                    let status = this.store.data.recommend[index].is_focus
                    this.store.data.recommend[index].is_focus = status == 0 ? 1 : 0
                }
            })
        }

        wx.setStorageSync('updateFocus', 1)

    },

    imgonload (e) {
        let order = e.currentTarget.dataset.index
        this.data.datalength++
        let key_width = 'clothList[' + order + '].width'
        let key_height = 'clothList[' + order + '].height'
        this.setData({
            [key_width]: e.detail.width,
            [key_height]: e.detail.height
        })
        if (this.data.datalength == this.data.clothList.length) {
            this.data.clothList.map((item, index) => {
                if (index >= this.data.initlist.length) {
                    let key = 'initlist[' + index+']'
                    this.setData({
                        [key]: item
                    })
                }
            })
        }
    },

    // 修改标签状态
    changeStatus(e) {
        console.log(e)
        let index = e.currentTarget.dataset.index
        let item = e.currentTarget.dataset.item
        let key = 'labelList[' + index + ']'
        let postData = {
            sessionrd: app.sessionrd,
            action: 'addUserLabel',
            user_id: this.data.bloggerID,
            label_name: item.label_name || item.label
        }
        if (item.is_add == 0) {
            item.number++
                item.is_add = 1
            app.fn.ajax('POST', postData, app.api.label.list, res => {
                // todo
            })
        } else {
            item.number--
                item.is_add = 0
            postData.action = 'delUserLabel'
            // wx:if 隐藏数量为0的item 数据上没有处理、接口处理
            app.fn.ajax('POST', postData, app.api.label.list, res => {
                // todo
            })
        }
        this.setData({
            [key]: item
        })
        console.log(item)
        if (item.number == 0 && item.status != 2) {
            let arr = JSON.parse(JSON.stringify(this.data.labelList))
            arr.splice(index, 1)
            this.setData({
                labelList: arr
            })
        }
    },

    // 添加标签
    addSign() {
        this.setData({
            showAddPrompt: true
        })
    },
    inputBlur2() {
        this.setData({
            showAddPrompt: false
        })
    },
    inputPrint2(e) {
        this.setData({
            promptValue: e.detail.value
        })
    },
    comment2() {
        this.setData({
            collapse: true
        })
        let postData = {
            sessionrd: app.sessionrd,
            action: 'addUserLabel',
            user_id: this.data.bloggerID,
            label_name: this.data.promptValue
        }
        if (this.data.promptValue == '') return
        app.fn.ajax('POST', postData, app.api.label.list, res => {
            // console.log(res)
            let length = this.data.labelList.length
            let key = 'labelList[' + length + ']'
            // console.log(this.isReapet(this.data.promptValue))
            if (this.isReapet(this.data.promptValue)) return false
            this.setData({
                [key]: {
                    label_name: this.data.promptValue,
                    number: 1,
                    is_add: 1
                },
                showAddPrompt: false,
                promptValue: ''
            })
        })
    },

    isReapet(value) {
        let num = 0
        this.data.labelList.map((item, index) => {
            if (item.label_name == value) {
                num++
                let key = 'labelList[' + index + '].number'
                let key2 = 'labelList[' + index + '].is_add'
                let nums = this.data.labelList[index].number + 1
                if (item.is_add) {
                    return false
                }
                this.setData({
                    [key]: nums,
                    [key2]: 1
                })
            }
        })
        if (num > 0) {
            return true
        } else {
            return false
        }
    },

    changeCollapse() {
        this.setData({
            collapse: !this.data.collapse
        })
    },

    // 页面滚动事件
    onPageScroll(e) {
        // console.log(e)
        // this.setData({ scrollTop: e.scrollTop })
    },

    // 页面相关事件处理函数--监听用户下拉动作
    onPullDownRefresh: function() {

    },

    // 页面上拉触底事件的处理函数
    onReachBottom: function() {
        if (this.data.active == 0) {
            let component = this.selectComponent("#list")
            component.getlist()
        }
        if (this.data.active == 1) {
            this.getClothList()
        }
    },

    // 分享调用次数
    addShareNum() {
        app.fn.ajax('POST', {
            sessionrd: app.sessionrd,
            action: 'addShare',
            title: '分享博主',
            content: this.data.bloggerInfo.nickname,
            user_id: this.data.bloggerID
        }, app.api.user.info, () => {
            // todo
        })
    },

    // 用户点击右上角分享
    onShareAppMessage: function() {
        this.addShareNum()
        return {
            title: '这个博主很适合你哟',
            path: '/pages/bloggerDetail/bloggerDetail?id=' + this.data.bloggerID + '&sharePage=1&pid=' + app.globalData.userInfo.id
        }
    }
})