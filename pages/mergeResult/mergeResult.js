// pages/mergeResult/mergeResult.js
const app = getApp()
const httpUrl = 'https://www.knewdress.com/dear'
Page({

    /**
     * 页面的初始数据
     */
    data: {
        saveImgUrl: '',
        isloading: false, // 分享laodind
        stopSoonClick: false,
        showOrigin: false,
        blogID: 0,
        faceIndex: 0,
        statusBarHeight: 20
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        // console.log(options)
        this.setData({
            statusBarHeight: app.globalData.statusBarHeight
        })
        if (options.blogID) {
            this.setData({
                blogID: options.blogID,
                faceIndex: options.faceIndex,
                imgUrl: decodeURIComponent(options.saveUrl),
                saveImgUrl: decodeURIComponent(options.url),
                origin: decodeURIComponent(options.origin)
            })

            this.setData({
                isloading: true
            })
            if (!app.sessionrd) {
                app.userInfoReadyCallback = res => { // 初始化标签列表
                    this.getBlogFace()
                }
            } else {
                this.getBlogFace()
            }
        }
    },

    goRank() {
        wx.navigateTo({
            url: '/pages/ranke/ranke',
        })
    },

    onShareAppMessage: function(res) {
        // console.log(app.globalData.userInfo.id)
        if (res.from === 'button') {
            // 来自页面内转发按钮
            // console.log(res.target)
        }
        return {
            title: '一分钟找准穿衣风格，快来试试!',
            path: '/pages/mergeResult/mergeResult?url=' + this.data.saveImgUrl + '&saveUrl=' + this.data.imgUrl + '&blogID=' + this.data.blogID + '&origin=' + this.data.origin + '&faceIndex=' + this.data.faceIndex
        }
    },

    // 获取资讯人脸位置
    getBlogFace() {
        wx.showLoading({
            title: '加载中',
        })
        app.fn.ajax('POST', {
            sessionrd: app.sessionrd,
            action: 'getBlogFace',
            blog_id: this.data.blogID
        }, app.api.face.face, res => {
            wx.hideLoading()
            console.log(res.data, '获取人脸位置')
            this.setData({
                item: res.data[this.data.faceIndex] || [],
                isloading: false
            })
        })
    },

    // 查看原图
    checkOrigin() {
        this.setData({
            showOrigin: true
        })
    },

    // 查看结果图片
    checkResult() {
        this.setData({
            showOrigin: false
        })
    },

    // 上传用户图片
    uploadUserFace() {
        if (this.data.isloading) return
        let origin = this.data.origin
        let data = this.data.item
        let faceIndex = this.data.faceIndex
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
                        self.getUserFacePosition(origin, data, reseultData)
                    }
                })
            }
        })

    },

    // 获取用户图片人脸位置
    getUserFacePosition(origin, data, url) {
        const self = this
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
                    content: '识别人脸失败',
                    // content: res.msg
                })
                wx.removeStorageSync('hasMerge')
                return false
            }

            wx.showLoading({
                title: '加载中',
            })
            app.fn.ajax('POST', {
                sessionrd: app.sessionrd,
                action: 'getBlogFace',
                blog_id: this.data.blogID
            }, app.api.face.face, response => {
                wx.hideLoading()
                console.log(response.data, '获取资讯人脸位置')
                this.setData({
                    item: response.data[this.data.faceIndex] || [],
                    isloading: false
                })
                console.log(this.data.item.similar_face)
                if (this.data.item.similar_face && this.data.item.similar_face.code == 1) {
                    let userData = res.data[0].position
                    let picData = data.position
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
                    console.log('最终合成数据')
                    console.log(postData)
                    wx.setStorageSync('hasMerge', {
                        user_image: url
                    })
                    this.mergeImage(postData)
                } else {
                    wx.showModal({
                        title: '提示',
                        content: '请上传和图片中人脸角度相似的自拍',
                        success(res) {
                            if (res.confirm) {
                                self.uploadUserFace()
                            } else if (res.cancel) {
                                return false
                            }
                        }
                    })
                }
            })

        })
    },

    // 开始合成图片
    mergeImage(data) {
        const self = this
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
            // console.log(res)
            self.setData({
                imgUrl: res.data.markImgUrl,
                saveImgUrl: res.data.imagesUrl
            })
            // console.log(self.data.imgUrl)
        })
    },

    previview() {
        let arr = []
        arr[0] = this.data.imgUrl + '?version=' + new Date().toString()
        wx.previewImage({
            urls: arr
        })
    },

    // 保存图片
    save() {
        wx.showLoading({
            title: '保存中...'
        })
        const self = this
        if (this.data.stopSoonClick) {
            return false
        }
        this.data.stopSoonClick = true
        wx.getImageInfo({
            src: self.data.saveImgUrl,
            success: function(res) {
                wx.saveImageToPhotosAlbum({
                    filePath: res.path,
                    success(result) {
                        wx.showToast({
                            title: '保存成功',
                            icon: 'none',
                            duration: 1000
                        })
                    }
                })
            },
            complete() {
                self.data.stopSoonClick = false
                wx.hideLoading()
            }
        })
    }
})