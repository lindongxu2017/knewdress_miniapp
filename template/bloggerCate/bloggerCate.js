// template/bloggerCate/bloggerCate.js
const app = getApp()
Component({
    
    properties: {
        isFocus: {
            type: Number,
            value: 0,
            observer: function (newVal, oldVal, changePath) {
                // console.log(newVal)
            }
        }
    },

    data: {
        selectid: [],
        cateList: [],
        cateListSelected: [],
    },

    lifetimes: {
        // 在组件实例进入页面节点树时执行
        attached() {
            this.getAlllistCate()
        }
    },

    methods: {
        getAlllistCate() {
            let arr = [].concat(this.data.selectid)
            let postData = {
                sessionrd: app.sessionrd,
                action: 'bloggerCate',
            }
            if (this.data.isFocus) {
                postData.is_focus = 1
            }
            if (this.data.selectid.length) {
                postData.sid = this.data.selectid.join(',')
            }
            app.fn.ajax('POST', postData, app.api.user.info, res => {
                // console.log(res)
                this.setData({
                    cateList: res.data
                })
            })
        },

        selectCate(event) {
            let item = event.currentTarget.dataset.item
            let arr = JSON.parse(JSON.stringify(this.data.cateListSelected))
            arr.push(item)
            let sid = [].concat(this.data.selectid)
            sid.push(item.id)
            this.setData({
                cateListSelected: arr,
                selectid: sid,
                cateList: []
            })
            this.getAlllistCate()
            this.triggerEvent('selectCate', this.data.selectid)
        },

        cancelSelect(event) {
            let index = event.currentTarget.dataset.index
            let arr = JSON.parse(JSON.stringify(this.data.cateListSelected))
            arr.splice(index, 1)
            let sid = [].concat(this.data.selectid)
            sid.splice(index, 1)
            this.setData({
                cateListSelected: arr,
                selectid: sid,
                cateList: []
            })
            this.getAlllistCate()
            this.triggerEvent('selectCate', this.data.selectid)
        },
    }
})
