// pages/upload/index.js
Page({
    data: {

    },

    onLoad: function(options) {

    },

    onShow: function() {

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
    
    onShareAppMessage: function() {

    }
})