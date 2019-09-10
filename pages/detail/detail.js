// pages/detail/detail.js
const app = getApp()
import store from '../../store'
import create from '../../utils/create'
create(store, {
    data: {
        info: null,
        imglist: [],
        labellist: [],
        commentlist: [],
        inputValue: '',
        listinfo: null,
        blogID: '', // 资讯ID
        inputIsFocus: false,

        showPlaceholder: false,

        showFaceTip: true, // 是否显示face提示
        showFacePosition: false, // 是否显示人脸位置
        facelist: [],
        hasMerge: false,
        scrollTop: 0,
        statusBarHeight: 65,
        swiperCurrent: 0,
        loading: false,

        goodslist: [],

        popup1: false,
        popup2: false,
        poster: '',
        userinfo: null
    },
    onLoad: function(options) {
        // options.id = '5c25a1af358ef20ff28d7d29'
        // console.log(this.store.data.list, options.index)
        this.setData({
            statusBarHeight: app.globalData.statusBarHeight + 45,
            imglist: JSON.parse(JSON.stringify(this.store.data.swiperlist)),
            // swiperCurrent: options.index
        })
        if (wx.getStorageSync('showFaceTip')) {
            this.setData({
                showFaceTip: false
            })
        }
        if (wx.getStorageSync('hasMerge')) {
            this.setData({
                hasMerge: true
            })
        }
        this.setData({
            windowWidth: app.globalData.windowWidth,
            windowHeight: app.globalData.windowHeight
        })
        if (options.id || options.scene) {
            this.data.blogID = options.id || decodeURIComponent(options.scene)
            this.getInfomation()
            this.getgoodslist()
        }
        if (options.sharePage) {
            app.sharePage = 1
        }
        if (!app.globalData.userInfo) {
            let timer = setInterval(() => {
                if (app.globalData.userInfo) {
                    clearInterval(timer)
                    this.setData({
                        userInfo: app.globalData.userInfo || null // 获取用户信息
                    })
                    this.getInfomation()
                }
            }, 500)
        }
    },

    onUnload: function() {
        // wx.setStorageSync('listData', this.data.listData);
    },
    onShow: function(options) {
        if (wx.getStorageSync('hasMerge')) {
            this.setData({
                showFacePosition: false,
                showFaceTip: false
            })
            wx.removeStorageSync('hasMerge')
            this.getFacePosition() // 重新获取人脸信息
        }
        if (wx.getStorageSync('commentlist')) {
            this.setData({
                commentlist: wx.getStorageSync('commentlist')
            })
        }

        if (wx.getStorageSync('collect_operation')) {
            this.getInfomation()
            wx.removeStorageSync('collect_operation')
        }

        let bloggerArr = wx.getStorageSync('bloggerArr') || []
        if (bloggerArr.length > 0 && this.data.info) {
            // console.log(this.data.info)
            bloggerArr.map((item, index) => {
                if (item.user_info) {
                    if (item.user_info.user_id == this.data.info.user_info.user_id) {
                        this.setData({
                            'info.is_focus': item.is_focus
                        })
                    }
                } else {
                    if (item.id == this.data.info.user_info.user_id) {
                        this.setData({
                            'info.is_focus': item.is_focus
                        })
                    }
                }
            })
        }

    },

    showAction() {
        this.setData({
            popup1: true
        })
    },

    createPoster() {
        if (this.data.poster == '') {
            wx.showLoading({
                title: '生成中...',
            })
            app.fn.ajax('POST', {
                sessionrd: app.sessionrd,
                scene: this.data.blogID,
                blog_id: this.data.blogID,
                page_string: 'pages/detail/detail'
            }, '/haida/wxacode/', res => {
                wx.hideLoading()
                this.setData({
                    poster: res.data.url
                })
                this.hideAction()
                setTimeout(() => {
                    this.showAction2()
                }, 300)
            })
        } else {
            this.hideAction()
            setTimeout(() => {
                this.showAction2()
            }, 300)
        }
    },

    savePoster() {
        wx.showLoading({
            title: '保存中',
        })
        const self = this
        wx.getSetting({
            success(res) {
                if (!res.authSetting['scope.writePhotosAlbum']) {
                    wx.authorize({
                        scope: 'scope.writePhotosAlbum',
                        success(res) {
                            // console.log(res, '授权成功')
                            self.downloadFile()
                        }
                    })
                } else { // 已授权
                    self.downloadFile()
                }
            },
            complete (res) {
                // console.log(res)
            }
        })
    },

    downloadFile () {
        var self = this
        wx.downloadFile({
            url: self.data.poster,
            success: function (res) {
                //图片保存到本地
                
                wx.saveImageToPhotosAlbum({
                    filePath: res.tempFilePath,
                    success: function (data) {
                        wx.showToast({
                            title: '保存成功',
                            icon: 'none'
                        })
                    },
                    complete () {
                        self.hideAction2()
                        wx.hideLoading()
                    }
                })
            },
            complete(res) {
                // wx.showToast({
                //     title: JSON.stringify(res),
                //     icon: 'none'
                // })
            }
        })
    },

    hideAction() {
        this.setData({
            popup1: false
        })
    },

    showAction2() {
        this.setData({
            popup2: true
        })
    },

    hideAction2() {
        this.setData({
            popup2: false
        })
        wx.hideLoading()
    },

    getgoodslist() {
        app.fn.ajax('POST', {
            sessionrd: app.sessionrd,
            blog_id: this.data.blogID
        }, '/haida/goods/list', res => {
            this.setData({
                goodslist: res.data.arr
            })
        })
    },

    goShop(e) {
        if (app.sessionrd) {
            console.log(111)
            wx.navigateTo({
                url: '/pages/shop/detail/detail?id=' + e.currentTarget.dataset.id,
            })
        } else {
            wx.getSetting({
                success(res) {
                    if (!res.authSetting['scope.userInfo']) {
                        wx.navigateTo({
                            url: '/pages/wxAuth/wxAuth',
                        })
                    } else {
                        app.myFn.wxlogin()
                    }
                }
            })
        }
    },

    // 跳转博主详情
    goBloggerDetail() {
        wx.navigateTo({
            url: '/pages/bloggerDetail/bloggerDetail?id=' + this.data.info.user_info.user_id,
        })
    },

    // 获取资讯详情
    getInfomation(e) {
        this.setData({
            info: null,
            facelist: [],
            showPlaceholder: false
        })
        let id = this.data.blogID
        let index = this.data.swiperCurrent
        if (e) {
            index = e.detail.current
            // id = this.data.imglist[index].id || this.data.imglist[index].blog_id
            // this.data.blogID = id
            this.data.swiperCurrent = index
            this.setData({
                swiperCurrent: index
            })
        }

        if (index >= this.data.imglist.length - 3 && index <= this.data.imglist.length - 1) { // 滑动至列表倒数第2个时加载下一页数据
            this.getNextPage()
        }

        if (this.data.loading) {
            return
        }

        this.data.loading = true

        app.fn.ajax('POST', {
            sessionrd: app.sessionrd,
            action: 'BlogDetail',
            blog_id: this.data.blogID
        }, app.api.information.detail, res => {
            // this.store.data.current_blog_detail = res.data
            // this.update()
            // this.data.imglist[index].info = res.data
            // console.log(res.data)
            this.setData({
                info: res.data,
                showPlaceholder: true
            }, () => {
                this.getCommentList() // 评论列表
                this.getFacePosition() // 人脸列表
                this.data.loading = false
            })
        })
    },

    getNextPage() {
        let lastID = this.data.imglist[this.data.imglist.length - 1].id
        let page = Math.ceil(this.data.imglist.length / 12) + 1
        let api = app.api.information.list
        if (!this.store.data.listPostData) {
            return
        }
        let postData = this.store.data.listPostData
        // console.log(postData)

        postData.page = page
        postData.pagenum = 12
        postData.blog_id = lastID

        if (postData.action == 'BlogList') { // 首页博客列表加载条件
            if (postData.blog_type == 1) {
                let arr = this.data.imglist.slice(-10)
                let read_ids = []
                arr.map((item, index) => {
                    read_ids.push(item.id)
                })
                postData.read_ids = read_ids.join(',')
            }
            app.fn.ajax('POST', postData, api, res => {
                res.data.map((item, index) => {
                    let key = 'imglist[' + this.data.imglist.length + ']'
                    this.setData({
                        [key]: item
                    })
                })
                if (postData.blog_type == 1) {
                    // console.log(this.store.data.recommendlist)
                    this.store.data.recommendlist = this.data.imglist
                    this.update()
                    // console.log(this.store.data.recommendlist)
                } else {
                    this.store.data.hotlist = this.data.imglist
                    this.update()
                }
            })
        }

        if (postData.action == 'BlogImgSearch') { // 图片搜索加载条件
            app.fn.ajax('POST', postData, api, res => {
                res.data.similar_list.map((item, index) => {
                    let key = 'imglist[' + this.data.imglist.length + ']'
                    this.setData({
                        [key]: item
                    })
                })
                this.store.data.blogImgSeachlist = this.data.imglist
                this.update()
            })
        }

        if (postData.action == 'getUserBlog') { // 博主博客列表加载条件
            api = app.api.user.info
            app.fn.ajax('POST', postData, api, res => {
                // console.log(res.data)
                res.data.map((item, index) => {
                    let key = 'imglist[' + this.data.imglist.length + ']'
                    this.setData({
                        [key]: item
                    })
                })
                if (this.store.data.bloggerList) {
                    this.store.data.bloggerList = this.data.imglist
                    this.update()
                }
            })
        }

    },

    searchBlog() {
        let imgUrl = this.data.info.imgurl
        wx.navigateTo({
            // url: '/pages/imgSearch/imgSearch?imgUrl=' + imgUrl + '&blogID=' + this.data.blogID
            url: '/pages/imgSearch_2/index?imgUrl=' + imgUrl + '&blogID=' + this.data.blogID
        })
    },

    searchGoods() {
        let imgUrl = this.data.info.imgurl
        wx.navigateTo({
            url: '/pages/mall/index?imgUrl=' + imgUrl + '&blogID=' + this.data.blogID
        })
    },

    // 获取资讯图片人脸位置
    getFacePosition(callback) {
        app.fn.ajax('POST', {
            sessionrd: app.sessionrd,
            action: 'getBlogFace',
            blog_id: this.data.blogID
        }, app.api.face.face, res => {
            this.setData({
                facelist: res.data || []
            })
            if (callback) {
                callback()
            }
        })
    },

    // analysis 显隐人脸位置
    analysis(uploadUrl, faceIndex) {
        if (this.data.showFacePosition) {
            this.setData({
                showFacePosition: false
            })
            return
        }
        const self = this
        let origin = this.data.info.imgurl
        let item = this.data.facelist[0]
        if (this.data.facelist.length > 1) {
            if (uploadUrl && typeof uploadUrl == 'string') {
                console.log(typeof faceIndex, faceIndex)
                if (typeof faceIndex == 'number' && this.data.facelist[faceIndex].similar_face.code == 1) {
                    item = this.data.facelist[faceIndex]
                    let url = this.data.facelist[faceIndex].similar_face.image_url
                    self.getUserFacePosition(origin, item, url, faceIndex)
                }
            } else {
                this.setData({
                    showFacePosition: true
                })
            }
        } else {
            this.setData({
                origin,
                item: item
            })
            if (item.similar_face.image_url || wx.getStorageSync('hasMerge')) {
                let url = ''
                if (item.similar_face.image_url && item.similar_face.code == 1) {
                    console.log(uploadUrl, typeof uploadUrl)
                    if (uploadUrl && typeof uploadUrl == 'string') {
                        self.getUserFacePosition(origin, item, uploadUrl, 0)
                    } else {
                        url = item.similar_face.image_url
                        this.getUserFacePosition(origin, item, url, 0)
                    }
                } else {
                    wx.hideLoading()
                    wx.showModal({
                        title: '提示',
                        content: '请上传和图片中人脸角度相似的自拍',
                        success(res) {
                            if (res.confirm) {
                                self.uploadUserFace(origin, item)
                            } else if (res.cancel) {
                                return false
                            }
                        }
                    })
                }
            } else {
                this.setData({
                    showFacePosition: true
                })
            }
        }

        if (wx.getStorageSync('showFaceTip')) {
            this.setData({
                showFaceTip: false
            })
        } else {
            wx.setStorageSync('showFaceTip', 1)
        }
    },

    // 选择人脸
    chooseFace(e) {
        const self = this
        if (!this.data.showFacePosition) return;
        let index = e.currentTarget.dataset.index
        let origin = e.currentTarget.dataset.origin
        let item = this.data.facelist[index]
        this.setData({
            origin,
            item: item
        })

        if (item.similar_face.image_url || wx.getStorageSync('hasMerge')) {
            let url = ''
            if (item.similar_face.image_url && item.similar_face.code == 1) {
                url = item.similar_face.image_url
                this.getUserFacePosition(origin, item, url, index)
                wx.showLoading({
                    title: '加载中...'
                })
            } else {
                self.uploadUserFace(origin, item, index)
            }
        } else {
            self.uploadUserFace(origin, item, index)
        }
    },

    // 上传用户图片
    uploadUserFace(origin, data, index) {
        const self = this
        wx.chooseImage({
            count: 1,
            sizeType: ['original'],
            success: function(res) {
                wx.showLoading({
                    title: '加载中...'
                })
                const tempFilePaths = res.tempFilePaths
                wx.uploadFile({
                    // url: 'http://192.168.1.120:8000/dear' + app.api.image.uploadFile,
                    url: app.requestIP + app.api.image.uploadFile,
                    filePath: tempFilePaths[0],
                    name: 'images',
                    formData: {
                        sessionrd: app.sessionrd,
                        action: 'uploadImg',
                        every_time_update: 1
                    },
                    success(result) {
                        let reseultData = JSON.parse(result.data).data.imagesUrl
                        console.log(reseultData)
                        app.fn.ajax('POST', {
                            sessionrd: app.sessionrd,
                            action: 'getUserFace',
                            image_url: reseultData
                        }, app.api.face.face, res => {
                            self.getFacePosition(function() {
                                self.analysis(reseultData, index)
                                return
                            })
                        })
                    }
                })
            }
        })
    },

    // 获取用户图片人脸位置
    getUserFacePosition(origin, data, url, index) {
        wx.showLoading({
            title: '加载中...'
        })
        app.fn.ajax('POST', {
            sessionrd: app.sessionrd,
            action: 'getUserFace',
            face_sure: 0.8,
            image_url: url
        }, app.api.face.face, res => {
            if (res.status == 'error' || res.data.length == 0) {
                wx.hideLoading()
                wx.showModal({
                    title: '提示',
                    showCancel: false,
                    content: res.msg
                })
                wx.removeStorageSync('hasMerge')
                return false
            }
            let userData = res.data[0].position
            let picData = data.position
            // console.log(picData)
            // 最终合成数据
            let postData = {
                sessionrd: app.sessionrd,
                action: 'mergaUserImage',
                every_time_megre: '1',
                image_url: origin,
                image_rectangle: JSON.stringify(picData),
                user_image: url,
                user_rectangle: JSON.stringify(userData),
                merge_rate: 63 // 融合度 1~100 原图递增至用户
            }
            this.mergeImage(postData, url, index)
        })
    },

    // 开始合成图片
    mergeImage(data, url, index) {
        app.fn.ajax('POST', data, app.api.face.face, res => {
            wx.hideLoading()
            if (res.status == 'error') {
                wx.showModal({
                    title: '提示',
                    showCancel: false,
                    content: res.msg
                })
                wx.removeStorageSync('hasMerge')
                return false
            }
            wx.setStorageSync('hasMerge', {
                user_image: url
            })
            wx.setStorageSync('blogFaceInfo', JSON.stringify(this.data.item))
            let pages = getCurrentPages()
            let route = pages[pages.length - 1].route
            // console.log(route)
            if (route != 'pages/detail/detail') {
                return false
            }
            wx.navigateTo({
                url: '/pages/mergeResult/mergeResult?url=' + res.data.imagesUrl + '&saveUrl=' + res.data.markImgUrl + '&origin=' + this.data.origin + '&blogID=' + this.data.blogID + '&faceIndex=' + index
            })
        })
    },

    // 分享调用次数
    addShareNum() {
        app.fn.ajax('POST', {
            sessionrd: app.sessionrd,
            action: 'addShare',
            title: '分享博客详情',
            content: '这套搭配不错哦，打开试穿一下',
            blog_id: this.data.blogID
        }, app.api.user.info, () => {
            // todo
        })
    },

    onShareAppMessage(res) {
        this.addShareNum()
        return {
            title: '这套搭配不错哦，打开试穿一下',
            path: '/pages/detail/detail?id=' + this.data.blogID + '&sharePage=1&pid=' + app.globalData.userInfo.id,
            imageUrl: this.data.info.imgurl_720 || this.data.info.image_url
        }
    },
    previewImg(e) {
        let imgUrl = e.currentTarget.dataset.previewimgurl
        let imgArr = []
        imgArr.push(imgUrl)
        wx.previewImage({
            urls: imgArr
        })
    },
    // 收藏
    dolick() {
        let storagelist = wx.getStorageSync('collect_list_num_arr') || []
        let alike = false
        let alike_index = 0
        if (storagelist.length > 0) {
            storagelist.map((item, index) => {
                if (item.id == this.data.info.id) {
                    alike = true
                    alike_index = index
                }
            })
        }
        if (alike) {
            storagelist[alike_index] = this.data.info
        } else {
            storagelist.push(this.data.info)
        }
        wx.setStorageSync('collect_list_num_arr', storagelist)
        app.fn.ajax('POST', {
            sessionrd: app.sessionrd,
            action: 'giveLikePoint',
            blog_id: this.data.blogID
        }, app.api.user.info, res => {
            // todo
            if (this.data.info.is_like == 0) {
                this.setData({
                    'info.is_like': 1,
                    'info.points_number': this.data.info.points_number + 1
                })
            } else {
                this.setData({
                    'info.is_like': 0,
                    'info.points_number': this.data.info.points_number - 1
                })
            }
        })
    },

    stopProgapation() {
        return false
    },

    selectItems(e) {
        let index = e.currentTarget.dataset.index
        let bool = this.data.folderlist[index].ischeck
        let key = 'folderlist[' + index + '].ischeck'
        this.setData({
            [key]: !bool
        })
    },

    confirm() {
        let num = 0
        this.data.folderlist.map((item, order) => {
            if (item.ischeck) {
                num += 1
            }
        })
        if (num === 0) {
            if (this.data.info.is_collect) {
                this.setData({
                    'info.is_collect': 0,
                    'info.collect_number': this.data.info.collect_number - 1
                })
                this.collect()
            }
        } else {
            if (!this.data.info.is_collect) {
                this.setData({
                    'info.is_collect': 1,
                    'info.collect_number': this.data.info.collect_number + 1
                })
                this.collect()
            }
        }
        this.closeFolder()
    },

    callBackValue(e) {
        // console.log(e)
        let newFolder = {
            name: e.detail,
            num: 0,
            ischeck: false
        }
        let arr = JSON.parse(JSON.stringify(this.data.folderlist))
        arr.unshift(newFolder)
        console.log(arr)
        this.setData({
            folderlist: arr,
            openNewFolder: false
        })
    },

    openFolder() {
        wx.navigateTo({
            url: '/pages/collectLable/collectLable?id=' + this.data.blogID + '&isCollect=' + this.data.info.is_collect,
        })
        wx.setStorageSync('collect_cate', this.data.info.collect_cate)
    },

    // 关注
    focusBlog() {
        app.fn.ajax('POST', {
            sessionrd: app.sessionrd,
            user_id: this.data.info.user_info.user_id,
            action: 'doFocus'
        }, app.api.user.info, res => {
            this.setData({
                'info.is_focus': this.data.info.is_focus == 1 ? 0 : 1
            })
            // todo
        })

        this.asynData(this.data.info.user_info.user_id)

    },

    asynData(id) {
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

        wx.setStorageSync('updateFocus', 1)

    },

    // 获取评论列表
    getCommentList() {
        app.fn.ajax('POST', {
            sessionrd: app.sessionrd,
            action: 'CommentList',
            blog_id: this.data.blogID
        }, app.api.image.comment, res => {
            this.setData({
                commentlist: res.data
            })
        })
    },

    // 输入评论文字
    inputPrint(e) {
        let value = e.detail.value
        this.setData({
            inputValue: value
        })
    },
    // 标签搜索
    screen(e) {
        if (getCurrentPages().length >= 10) {
            wx.redirectTo({
                url: '/pages/search/search?keyWord=' + encodeURIComponent(e.currentTarget.dataset.value) + '&id=' + e.currentTarget.dataset.id + '&u_id=' + this.data.u_id
            })
        } else {
            wx.navigateTo({
                url: '/pages/search/search?keyWord=' + encodeURIComponent(e.currentTarget.dataset.value) + '&id=' + e.currentTarget.dataset.id + '&u_id=' + this.data.u_id
            })
        }
    },
    inputFocus() {
        this.setData({
            inputIsFocus: true
        })
    },
    inputBlur() {
        this.setData({
            inputIsFocus: false
        })
    },
    // 跳转评论列表页面
    goCommentPage() {
        wx.setStorageSync('commentlist', this.data.commentlist)
        wx.navigateTo({
            url: '/pages/commentPage/commentPage?id=' + this.data.blogID,
        })
    },
    // 确认评论
    comment() {
        if (this.data.inputValue == '') {
            wx.showModal({
                title: '提示',
                showCancel: false,
                content: '评论内容不能为空！'
            })
            return false
        }
        let id = this.data.blogID
        let userinfo = wx.getStorageSync('userInfo')
        let showData = {
            user_info: {
                nickname: userinfo.nickName,
                headimgurl: userinfo.avatarUrl,
            },
            content: this.data.inputValue,
            create_from: app.fn.getCurrentTime()
        }
        app.fn.ajax('POST', {
            sessionrd: app.sessionrd,
            action: 'doComment',
            blog_id: id,
            content: this.data.inputValue
        }, app.api.image.comment, res => {
            let list = JSON.parse(JSON.stringify(this.data.commentlist))
            list.unshift(showData)
            this.setData({
                commentlist: list,
                inputValue: ''
            })
        })
    }
})