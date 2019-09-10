// pages/search/search.js
const app = getApp()
import store from '../../store'
import create from '../../utils/create'
create(store, {
    data: {
        loglist: [], // 搜索记录
        seachValue: '', // 关键字
        isloading: false, // 是否显示加载
        keyword: '', // 搜索关键字值
        isShowRootList: false, // 显示列表
        complelist: [], // 补全列表
        soonsearch: false, // 快捷搜索（点击历史记录、热门标签）
        printNum: 0,
        timer: null,
        focus: []
    },
    onLoad: function(options) {
        // this.getAccessToken()
        // console.log(options)
        if (options.focus) {
            this.setData({
                inputFocus: true
            })
        }
        // if (wx.getStorageSync('loglist')) {
        //     let currentTime = Math.round(new Date().getTime() / 1000)
        //     let logtime = wx.getStorageSync('logtime')
        //     let expiryTime = 3600
        //     if (currentTime - logtime >= expiryTime) {
        //         wx.removeStorageSync('loglist')
        //         this.getloglist() // 初始化搜索记录列表
        //     } else {
        //         let arr = wx.getStorageSync('loglist') || []
        //         this.setData({
        //             loglist: arr
        //         })
        //     }
        // } else {
        //     this.getloglist() // 初始化搜索记录列表
        // }
    },
    onShow() {
        // console.log(getCurrentPages())

        let bloggerArr = wx.getStorageSync('bloggerArr') || []
        if (bloggerArr.length > 0) {
            if (this.data.complelist.length > 0) {
                this.data.complelist.map((item, index) => {
                    bloggerArr.map((obj, order) => {
                        // console.log(item.id, obj.user_info.user_id)
                        if (obj.user_info) {
                            if (item.id == obj.user_info.user_id) {
                                let key = 'complelist[' + index + '].is_focus'
                                this.setData({
                                    [key]: obj.is_focus
                                })
                            }
                        } else {
                            if (item.id == obj.id) {
                                let key = 'complelist[' + index + '].is_focus'
                                this.setData({
                                    [key]: obj.is_focus
                                })
                            }
                        }
                    })
                })
            }
            wx.removeStorageSync('bloggerArr')
        }

    },

    asynData (e) {
        let bloggerItem = e.detail
        this.store.data.all.map((item, index) => {
            if (item.id == bloggerItem.id) {
                this.store.data.all[index] = bloggerItem
                this.update()
            }
        })
        this.store.data.recommend.map((item, index) => {
            if (item.id == bloggerItem.id) {
                this.store.data.recommend[index] = bloggerItem
                this.update()
            }
        })

        wx.setStorageSync('updateFocus', 1)

    },

    // 删除历史搜索记录
    clearlog() {
        const self = this
        wx.showModal({
            title: '提示',
            content: '删除全部历史记录？',
            success(res) {
                if (res.confirm) {
                    // console.log('用户点击确定')
                    wx.removeStorageSync('loglist')
                    self.setData({
                        loglist: [],
                        nolog: true
                    })
                    app.fn.ajax('POST', {
                        sessionrd: app.sessionrd,
                        action: 'delSearchUserLog'
                    }, app.api.user.info, res => {
                        // todo
                    })
                } else if (res.cancel) {
                    // console.log('用户点击取消')
                }
            }
        })
    },

    // 上传图片搜索
    uplaodImg() {
        wx.chooseImage({
            count: 1,
            sizeType: ['compressed'],
            success: function(res) {
                // console.log(res.tempFilePaths[0])
                let tempFilePath = res.tempFilePaths[0]
                wx.navigateTo({
                    url: '/pages/imgSearch/imgSearch?url=' + tempFilePath
                })
            }
        })
    },
    // 获取搜索记录
    getloglist() {
        app.fn.ajax('POST', {
            sessionrd: app.sessionrd,
            action: 'searchUserLog'
        }, app.api.user.info, res => {
            // console.log(res)
            if (res.data.length == 0) {
                this.setData({
                    nolog: true
                })
                return
            }
            if (res.data[0] && res.data[0].blog_list) {
                this.setData({
                    loglist: res.data[0].blog_list
                })
            }
            let logstoragetime = Math.round(new Date().getTime() / 1000)
            wx.setStorageSync('logtime', logstoragetime)
            wx.setStorageSync('loglist', res.data || '')
        })
    },
    // 取消操作
    goback() {
        if (this.data.seachValue) {
            this.reset()
            return false
        }
        // } else {
        //   wx.navigateBack()
        // }
    },
    inputfocus() {
        this.setData({
            textfocus: true,
            noData: false,
            noMore: false,
            userAvatar: '',
            userName: '',
            userDesc: '',
            lastID: ''
        })
    },
    inputblur() {
        this.setData({
            textfocus: false
        })
    },

    // search-input 输入
    inputPrint(e) {
        this.data.printNum++
            // console.log(e.detail.value)
            this.setData({
                seachValue: e.detail.value
            })
        if (this.data.seachValue == '') {
            this.reset()
        }

        if (this.data.noData) {
            this.setData({
                noData: false
            })
        }
        if (!this.data.soonsearch) {
            this.setData({
                soonsearch: true
            })
        }
        if (!this.data.isloading) {
            this.setData({
                isloading: false
            })
        }

        // console.log(e.detail.value)
        if (this.data.seachValue != '') {
            if (this.data.timer) {
                clearTimeout(this.data.timer)
            }
            this.data.timer = setTimeout(() => {
                this.setData({
                    complelist: []
                })
                if (this.data.seachValue) {
                    this.searchComplelist()
                }
            }, 1000)

        }
    },

    onReachBottom() {
        this.searchComplelist()
    },

    // 搜索补全列表
    searchComplelist() {
        let num = this.data.printNum
        var page = 1
        if (this.data.complelist.length > 0) {
            page = Math.ceil(this.data.complelist.length / 12) + 1
        }
        if ((this.data.complelist.length < 12 && this.data.complelist.length > 0)) {
            return
        }
        this.setData({
            isloading: true
        })
        app.fn.ajax('POST', {
            sessionrd: app.sessionrd,
            keyword: this.data.seachValue,
            action: 'userSearch',
            page: page,
            pagenum: 12
        }, app.api.user.info, res => {
            if (num != this.data.printNum || this.data.seachValue == '') {
                return
            }
            let oldlength = this.data.complelist.length
            let list = this.data.complelist.concat(res.data)
            list.map((item, index) => {
                if (index < oldlength) {
                    return
                }
                item.isShow = true
                let replaceReg = new RegExp(this.data.seachValue, 'i');
                // 高亮替换v-html值
                let replaceString = '<span class="search-text">' + this.data.seachValue + '</span>';
                // 开始替换
                item.nickname = item.nickname.replace(replaceReg, replaceString);
                item.username = item.username.replace(replaceReg, replaceString);
                // if (order>=0) {
                //     item.strBefore = item.nickname.substring(0, order)
                //     item.strCurrent = item.nickname.substring(order, order + this.data.seachValue.length)
                //     item.strAfter = item.nickname.substring(order + this.data.seachValue.length)
                // }
                // let point = item.username.toUpperCase().indexOf(this.data.seachValue.toUpperCase())
                // if (point>=0) {
                //     item.pre = item.username.substring(0, order)
                //     item.mid = item.username.substring(order, order + this.data.seachValue.length)
                //     item.next = item.username.substring(order + this.data.seachValue.length)
                // }

                // console.log(item.strBefore, item.strCurrent, item.strAfter)
            })
            this.setData({
                isloading: false,
                complelist: list
            })
            // console.log(this.data.complelist)
        })
    },

    // 赋值给searchValue
    assignment(e) {
        this.reset()
        this.setData({
            seachValue: e.currentTarget.dataset.value,
            keyword: e.currentTarget.dataset.value,
            noData: false,
            soonsearch: true,
            isloading: true
        })
        this.searchComplelist()
    },
    // 按键enter key.13 触发搜索时
    confirmQuery() {
        if (this.data.seachValue == '' || this.data.isloading || this.data.complelist.length == 0) {
            // todo
            return
        }
        if (this.data.complelist.length > 0 && !this.data.isloading && this.data.seachValue != '') {
            this.addSearchLog()
            let id = this.data.complelist[0].id
            wx.navigateTo({
                url: '/pages/bloggerDetail/bloggerDetail?id=' + id,
            })
        }
    },
    // 重置列表相关属性
    reset() {
        this.setData({
            keyword: '',
            seachValue: '',
            complelist: [],
            isloading: false
        })
    },
    addSearchLog() {
        // 每次搜索添加本地缓存记录
        // console.log(111111)
        let arrlog = wx.getStorageSync('loglist') || []
        let nums = 0
        arrlog.map((item, index) => {
            if (item.search_info == this.data.seachValue) {
                nums++
            }
        })
        if (nums == 0) {
            arrlog.unshift({
                search_info: this.data.seachValue
            })
            this.setData({
                loglist: arrlog
            })
        }
        wx.setStorageSync('loglist', arrlog)
    },

    // 公众号发文二维码
    getAccessToken() {
        if (app.globalData.userInfo.id != 9296) return // 小程序二维码 、小V才能调用
        if (wx.getStorageSync('access_token')) {
            let current = new Date().getTime()
            if (parseInt(current) - parseInt(wx.getStorageSync('expires_in')) > 7000000) {
                wx.removeStorageSync('access_token')
                wx.removeStorageSync('expires_in')
            } else {
                return
            }
        }
        let postData = {
            grant_type: 'client_credential',
            appid: 'wx67cc8ea25fd2ddd8',
            secret: '5a35ea82a9ccf273fffe0b3f9f4d8e5a'
        }
        let api = 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=' + postData.appid + '&secret=' + postData.secret
        wx.request({
            url: api, //仅为示例，并非真实的接口地址
            data: {},
            header: {
                'content-type': 'application/json' // 默认值
            },
            success(res) {
                let currentTime = new Date().getTime()
                console.log(res.data)
                wx.setStorageSync('access_token', res.data.access_token)
                wx.setStorageSync('expires_in', currentTime)
            }
        })
    },

    getWXACode() {
        if (app.globalData.userInfo.id != 9296) return // 小程序二维码 、小V才能调用
        const self = this
        let postData = {
            // access_token: wx.getStorageSync('access_token'),
            path: '/pages/search/search?keyWord=' + encodeURIComponent(this.data.keyword) + '&id=' + this.data.labelID + '&share=1'
        }
        wx.request({
            url: 'https://api.weixin.qq.com/cgi-bin/wxaapp/createwxaqrcode?access_token=' + wx.getStorageSync('access_token'), //仅为示例，并非真实的接口地址
            data: postData,
            method: 'POST',
            responseType: 'arraybuffer',
            header: {
                'content-type': 'application/json' // 默认值
            },
            success(res) {
                console.log(res)
                let base64 = "data:image/PNG;base64," + wx.arrayBufferToBase64(res.data)
                self.setData({
                    wxCode: base64
                })
                var fileManager = wx.getFileSystemManager()
                var imgPath = wx.env.USER_DATA_PATH + '/wxCode.jpg'
                var imageData = base64.replace(/^data:image\/\w+;base64,/, "")
                fileManager.writeFile({
                    filePath: imgPath,
                    data: imageData,
                    encoding: 'base64',
                    success: res => {
                        self.setData({
                            imageUrl: imgPath
                        })
                        wx.saveImageToPhotosAlbum({
                            filePath: imgPath,
                            success: res => {
                                console.log(res)
                            },
                            fail: err => {
                                console.log(err)
                            }
                        })
                    },
                    fail: err => {
                        console.log(err)
                    }
                })
            }
        })
    }
})