// template/shop/classify/classify.js
const app = getApp()
Component({

    properties: {

    },

    data: {
        classify: [],
        active: 0,
        cate: [],
        down_active: 0
    },

    lifetimes: {
        attached () {
            // this.getClassList()
        }
    },

    methods: {
        getClassList(id) {
            let data = {
                tid: 0
            }
            if (id) {
                data.tid = id
            }
            app.fn.http('POST', data, '/Api/Product/cate_lists').then(res => {
                if (!id) {
                    this.setData({
                        classify: res.arr
                    })
                } else {
                    this.setData({
                        cate: res.arr
                    })
                    if (res.arr.length > 0) {
                        this.triggerEvent('getlist', {cid: res.arr[0].id})
                    }
                }
                if (res.arr.length > 0 && !id) {
                    this.getClassList(this.data.classify[this.data.active].id)
                }
            })
        },

        selectCate(e) {
            let index = e.currentTarget.dataset.index
            this.setData({
                active: index,
                down_active: 0
            })
            this.getClassList(this.data.classify[this.data.active].id)
        },

        golist(e) {
            let { index, cid, name } = e.currentTarget.dataset
            this.setData({
                down_active: index
            })
            this.triggerEvent('getlist', { cid })
            // wx.navigateTo({
            //     url: '/pages/shop/goods/goods?cid=' + cid + '&name=' + name,
            // })
        }
    }
})
