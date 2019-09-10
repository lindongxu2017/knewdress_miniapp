// template/shop/order/order.js
const app = getApp()
Component({
    /**
     * 组件的属性列表
     */
    properties: {
        infoItem: {
            type: Object,
            value: {}
        },
        itemIndex: {
            type: Number,
            value: 0
        }
    },

    /**
     * 组件的初始数据
     */
    data: {

    },

    /**
     * 组件的方法列表
     */
    methods: {
        pay() {
            app.fn.wxPay(this.data.infoItem.id, this.data.infoItem.porder_sn).then(res => {
                // TODO
                this.setData({
                    'infoItem.status': 30,
                    'infoItem.desc': '待发货'
                })
            }).catch(res => {
                console.log(res)
            })
        },
        del() {
            let index = this.data.itemIndex
            app.fn.http('POST', {
                order_id: this.data.infoItem.id,
                type: 'cancel',
            }, '/Api/order/orders_edit').then(res => {
                this.triggerEvent('del', index)
            })
        },
        confirm() {
            this.setData({
                'infoItem.status': 50,
                'infoItem.desc': '已完成'
            })
            app.fn.http('POST', {
                order_id: this.data.infoItem.id,
                type: 'receive'
            }, '/Api/order/orders_edit').then(res => {
                // TODO
            })
        },
        godetail (e) {
            console.log(e)
        }
    }
})