// pages/address_list/address_list.js
const app = getApp()
Page({

    data: {
        radio: true,
        ischeck: false,
        list: []
    },

    onLoad: function(options) {
        if (options.check) {
            this.data.ischeck = true
        }
        this.getlist()
    },

    onShow() {
        if (this.data.list.length || wx.getStorageSync('address_add')) {
            this.setData({
                list: []
            })
            this.getlist()
            wx.removeStorageSync('address_add')
        }
    },

    getlist() {
        const self = this
        app.fn.http('POST', {}, '/Api/Address/index').then(res => {
            // console.log(res.arr)
            res.arr.map((item, index) => {
                item.ischeck = false
                if (item.is_default == 1) {
                    self.setData({
                        radio: index + ''
                    })
                }
            })
            this.setData({
                list: this.data.list.concat(res.arr)
            })
        })
    },

    // onChange(event) {
    //     this.setData({
    //         radio: event.detail + ''
    //     })
    // },

    onClick(event) {
        let info = event.currentTarget.dataset.item
        if (this.data.ischeck) {
            wx.setStorageSync('checkAddress', info)
            wx.navigateBack()
        }
    },

    addressChange(e) {
        let { type, id, index } = e.currentTarget.dataset
        wx.navigateTo({
            url: '/pages/shop/address_operation/address_operation?type=' + type
        })
        wx.setStorageSync('editinfo', this.data.list[index])
    },

    addressdel (e) {
        const self = this
        wx.showModal({
            title: '提示',
            content: '是否删除地址信息',
            success(res) {
                if (res.confirm) {
                    let { id, index } = e.currentTarget.dataset
                    let arr = self.data.list.slice(0)
                    arr.splice(index, 1)
                    self.setData({
                        list: arr
                    })
                    app.fn.http('POST', { id_arr: id }, '/Api/Address/del_adds').then(res => {
                        // TODO
                        wx.setStorageSync('address_del', 1)
                    })
                } else if (res.cancel) {
                    // console.log('用户点击取消')
                }
            }
        })
    },

    onReachBottom: function() {

    }
})