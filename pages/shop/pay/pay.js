// pages/shop/pay/pay.js
const app = getApp()
Page({

    data: {
        ids: '', // 购物车id
        info: null,
        once_info: null,
        address_info: null,
        pay_way: 0, // 0微信支付 1余额支付
        pay_way_list: ['微信支付', '余额支付'],
        order_id: '',
        order_sn: ''
    },

    onLoad: function(options) {

        if (options.cart_id) {
            this.data.ids = options.cart_id
            this.getOrderInfo()
        }
        if (options.ids) {
            this.data.once_info = options
            this.getOrderInfo_once()
        }

    },

    onShow: function() {
        if (this.data.info || this.data.once_info) {
            if (wx.getStorageSync('address_del')) {
                if (this.data.ids) {
                    this.getOrderInfo()
                } else {
                    this.getOrderInfo_once()
                }
                wx.removeStorageSync('address_del')
                return
            }
            if (wx.getStorageSync('address_operation')) {
                if (this.data.ids) {
                    this.getOrderInfo()
                } else {
                    this.getOrderInfo_once()
                }
                wx.removeStorageSync('address_operation')
            }
        }
        if (wx.getStorageSync('checkAddress')) {
            this.setData({
                address_info: wx.getStorageSync('checkAddress')
            })
            wx.removeStorageSync('checkAddress')
        }
    },

    getOrderInfo_once() {
        let data = {
            pid: this.data.once_info.id,
            buy_num: this.data.once_info.num,
            gid: this.data.once_info.ids
        }
        app.fn.http('POST', data, '/Api/Payment/buy_now').then(res => {
            // console.log(res)
            this.setData({
                info: res.arr,
                address_info: res.arr.adds
            })
        })
    },

    getOrderInfo() {
        app.fn.http('POST', {
            cart_id: this.data.ids
        }, '/Api/Payment/buy_cart').then(res => {
            // console.log(res)
            this.setData({
                info: res.arr,
                address_info: res.arr.adds
            })
        })
    },

    selectPayWay() {
        const self = this
        wx.showActionSheet({
            itemList: self.data.pay_way_list,
            success(res) {
                self.setData({
                    pay_way: res.tapIndex
                })
            },
            fail(res) {
                console.log(res.errMsg)
            }
        })
    },

    cartPay(order_id, order_sn) {
        if (this.data.pay_way == 0) { // 微信支付
            app.fn.wxPay(order_id, order_sn).then(res => {
                wx.redirectTo({
                    url: '/pages/shop/order/order',
                })
            })
        } else { // 余额支付
            this.balancePay(order_sn)
        }
    },

    oncePay(order_id, order_sn) {
        if (this.data.pay_way == 0) { // 微信支付
            app.fn.wxPay(order_id, order_sn).then(res => {
                wx.redirectTo({
                    url: '/pages/shop/order/order',
                })
            })
        } else { // 余额支付
            this.balancePay(order_sn)
        }
    },

    balancePay(order_sn) {
        app.fn.http('POST', {
            order_sn: order_sn
        }, '/Api/Order/payAccount').then(res => {
            if (res.status == 0) {
                wx.showToast({
                    title: res.err,
                    icon: 'none'
                })
                return
            }
            wx.redirectTo({
                url: '/pages/shop/order/order',
            })
        })
    },

    onSubmit() {
        if (this.data.address_info.id == '') {
            wx.showToast({
                title: '请选择配送地址',
                icon: 'none'
            })
        }
        if (this.data.ids) {
            let data = {
                aid: this.data.address_info.id,
                cart_id: this.data.ids
            }

            if (this.data.order_id) {
                this.cartPay(this.data.order_id, this.data.order_sn)
                return
            }

            app.fn.http('POST', data, '/Api/Shopping/payment').then(res => {
                this.data.order_id = res.arr.order_id
                this.data.order_sn = res.arr.order_sn
                this.cartPay(res.arr.order_id, res.arr.order_sn)
            })

        } else {
            let data = {
                aid: this.data.address_info.id,
                pid: this.data.once_info.id,
                buy_num: this.data.once_info.num,
                type: 'weixin'
            }
            if (this.data.order_id) {
                this.oncePay(this.data.order_id, this.data.order_sn)
                return
            }
            app.fn.http('POST', data, '/Api/Payment/pay_now').then(res => {
                this.data.order_id = res.arr.order_id
                this.data.order_sn = res.arr.order_sn
                this.oncePay(res.arr.order_id, res.arr.order_sn)
            })
        }
    },

    onReachBottom: function() {

    }
})