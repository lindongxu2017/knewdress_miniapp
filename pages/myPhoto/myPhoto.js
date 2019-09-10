// pages/myPhoto/myPhoto.js
const app = getApp()
Page({

    data: {
        photo_list: [], // 列表数据
        noMore_photo: false,
        showDelete: false,
    },

    onLoad: function (options) {
        this.getPhoto()
    },

    onShow: function () {

    },

    // 获取人脸库列表
    getPhoto() {
        app.fn.ajax('POST', {
            sessionrd: app.sessionrd,
            action: 'myFaceList'
        }, app.api.face.face, res => {
            wx.hideLoading()
            if (res.data.length) {
                this.setData({
                    noMore_photo: true,
                    photo_list: res.data || []
                })
            }
        })
    },

    // 上传人脸库
    uplaodImg() {
        const self = this
        wx.chooseImage({
            count: 1,
            success(res) {
                // console.log(res)
                let tempFilePaths = res.tempFilePaths
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
                        wx.showLoading({
                            title: '图片上传',
                            mask: true,
                        })
                        let url = JSON.parse(result.data).data.imagesUrl
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
                                return
                            }
                            self.setData({
                                photo_list: []
                            })
                            self.getPhoto()
                        })
                    }
                })
            }
        })
    },

    // 显示隐藏删除按钮
    isShowDelete() {
        this.setData({
            showDelete: !this.data.showDelete
        })
    },

    deleteItem(e) {
        let index = e.currentTarget.dataset.index
        let id = e.currentTarget.dataset.id
        let arr = JSON.parse(JSON.stringify(this.data.photo_list))
        arr.splice(index, 1)
        this.setData({
            photo_list: arr
        })
        app.fn.ajax('POST', {
            sessionrd: app.sessionrd,
            action: 'delMyFace',
            face_id: id
        }, app.api.face.face, res => {
            // todo
        })
    },

    previewImg(e) {
        if (this.data.showDelete) {
            return
        }
        let index = e.currentTarget.dataset.index
        let arr = []
        this.data.photo_list.map((item, index) => {
            arr.push(item.image_url)
        })
        // console.log(index, arr)
        wx.previewImage({
            current: arr[index], // 当前显示图片的http链接
            urls: arr // 需要预览的图片http链接列表
        })
    },

    onPullDownRefresh: function () {

    },

    onReachBottom: function () {

    },

    onShareAppMessage: function () {

    }
})