// pages/cart/cart.js
const app = getApp()
Page({

    data: {
        goodslist: [],
        total: 0,
        loading: false,
        ids: []
    },

    onLoad: function(options) {
        this.getlist()
    },

    onShow: function() {
        if (this.data.goodslist.length) {
            this.setData({
                goodslist: []
            })
            this.getlist()
        }
    },

    getlist() {
        if (this.data.loading) {
            return
        }
        this.data.loading = true
        let data = {
            page: Math.ceil(this.data.goodslist.length / 10) + 1
        }
        app.fn.http('POST', data, '/Api/Shopping/index').then(res => {
            this.data.loading = false
            this.setData({
                goodslist: this.data.goodslist.concat(res.arr)
            })
        })
    },

    check(e) {
        let index = e.currentTarget.dataset.index
        let item = e.currentTarget.dataset.item
        let key = 'goodslist[' + index + '].check'
        this.setData({
            [key]: !this.data.goodslist[index].check
        })
        this.calculateTotal()
    },

    calculateTotal() {
        let total = 0
        let arr = []
        this.data.goodslist.map((item, index) => {
            if (item.check) {
                total += parseFloat(item.price) * item.num
                arr.push(item.id)
            }
        })
        this.setData({
            total: total * 100
        })
        this.data.ids = arr
    },

    delItem(e) {
        // console.log(e.currentTarget.dataset)
        let {
            index,
            id
        } = e.currentTarget.dataset
        let arr = this.data.goodslist.slice(0)
        arr.splice(index, 1)
        this.setData({
            goodslist: arr
        })
        app.fn.http('POST', {
            cart_id: id
        }, '/Api/Shopping/delete').then(res => {
            // TODO
        })
    },

    onSubmit() {
        if (this.data.total == 0) {
            wx.showToast({
                title: '请选择商品',
                icon: 'none'
            })
            return
        }
        let ids = this.data.ids.join(',')
        wx.navigateTo({
            url: '/pages/shop/pay/pay?cart_id=' + ids,
        })
    },

    onReachBottom: function() {

    },
})