// template/lable/lable.js
const app = getApp()
import create from '../../utils/create'
create({
    /**
     * 组件的属性列表
     */
    properties: {
        groupList: {
            type: Array,
            value: []
        },
        selectedList: {
            type: Array,
            value: []
        },
        blogId: {
            type: String,
            value: ''
        },
        isCollect: {
            type: Boolean,
            value: false
        }
    },

    /**
     * 组件的初始数据
     */
    data: {
        cateAdd: null,
        contentH: 0,
        windowWidth: 375,
        itemWidth: 165,
        arrHeight: [0, 0],
        gap: 15,
        // 一级分类
        addVisible: false,
        addValue: '',
        // 二级标签
        createVisible: false,
        createValue: '',
        createIndex: 0,
        touch_start: '',
        touch_end: '',
        // 编辑标签
        editVisible: false,
        editValue: '',
        editIndex: '',
        editOrder: '',
        editSelectCurrent: 0,
        initSelectCurrent: 0
    },

    lifetimes: {
        attached () {
            if (app.globalData.windowWidth) {
                this.setData({
                    windowWidth: app.globalData.windowWidth,
                    itemWidth: (app.globalData.windowWidth - 3 * this.data.gap) / 2
                })
            }
            this.diff()
        }
    },

    /**
     * 组件的方法列表
     */
    methods: {

        cancelCollect () {
            if (!this.data.isCollect && this.data.selectedList.length == 0) {
                wx.navigateBack()
                return
            }
            wx.setStorageSync('collect_operation', 1)
            let arr = []
            this.data.selectedList.map((item, index) => {
                arr.push(item.id)
            })
            app.fn.ajax('POST', {
                sessionrd: app.sessionrd,
                action: 'setCollect',
                blog_id: this.data.blogId,
                cate_ids: arr.join(',')
            }, app.api.information.collect, res => {
                if (this.data.isCollect) {
                    this.store.data.collect_list.map((item, index) => {
                        if (item.blog_info.blog_id == this.data.blogId) {
                            let arr = JSON.parse(JSON.stringify(this.store.data.collect_list))
                            arr.splice(index, 1)
                            this.store.data.collect_list = []
                            this.update()
                            this.store.data.collect_list = arr
                            this.update()
                        }
                    })
                }
                wx.navigateBack()
            })
        },

        confirmCollect () {
            if (!this.data.isCollect) {
                this.cancelCollect()
                if (this.data.selectedList.length > 0) {
                    wx.setStorageSync('collect_operation', 1)
                    let item = {
                        blog_info: this.store.data.current_blog_detail || {},
                        blog_id: this.data.blogId || 0
                    }
                    item.blog_info.blog_id = this.data.blogId
                    let arr = JSON.parse(JSON.stringify(this.store.data.collect_list))
                    arr.unshift(item)
                    this.store.data.collect_list = []
                    this.update()
                    this.store.data.collect_list = arr
                    this.update()
                }
            } else {
                if (this.data.selectedList.length > 0) {
                    let arr = []
                    this.data.selectedList.map((item, index) => {
                        arr.push(item.id)
                    })
                    app.fn.ajax('POST', {
                        sessionrd: app.sessionrd,
                        action: 'updateCollectCate',
                        blog_id: this.data.blogId,
                        cate_ids: arr.join(',')
                    }, app.api.information.collect, res => {
                        wx.navigateBack()
                    })
                } else {
                    wx.setStorageSync('collect_operation', 1)
                    this.cancelCollect()
                }
                
            }
        },

        diff() {
            this.data.groupList.map((item, index) => {
                item.list.map((obj, order) => {
                    obj.active = false
                })
            })
            this.data.selectedList.map((item, index) => {
                this.data.groupList.map((obj, order) => {
                    obj.list.map((ele, sort) => {
                        let key = 'groupList[' + order + '].list[' + sort + '].active'
                        if (item.id == ele.id) {
                            this.setData({ [key]: true })
                        }
                    })
                })
            })
        },

        getlayoutdata() {
            if (this.data.groupList.length == 0) {
                let timer = setInterval(() => {
                    if (this.data.groupList.length > 0) {
                        clearInterval(timer)
                        this.getlayoutdata()
                    }
                }, 100)
                return
            }
            const self = this
            var obj = wx.createSelectorQuery().in(this);
            obj.selectAll('.group-item').boundingClientRect(function (rect) {
                // console.log(rect)
                rect.map((item, index) => {
                    if (index == 0) {
                        let key = 'arrHeight[0]'
                        self.setData({
                            cateAdd: item,
                            [key]: item.height + 8
                        })
                    } else {
                        let layout = 'groupList[' + (index - 1) + '].layout'
                        self.setData({ [layout]: item })
                    }
                })
                let list = JSON.parse(JSON.stringify(self.data.groupList))
                self.layout(list)
            })
            obj.exec();
        },

        layout(list) {
            let top = 'groupList[' + (this.data.groupList.length - list.length) + '].layout.top'
            let left = 'groupList[' + (this.data.groupList.length - list.length) + '].layout.left'
            let height = list[0].layout.height + this.data.gap
            if (this.data.arrHeight[0] >= this.data.arrHeight[1]) {
                this.setData({
                    [top]: this.data.arrHeight[1],
                    [left]: this.data.itemWidth + 2 * this.data.gap
                })
                this.data.arrHeight[1] = this.data.arrHeight[1] + height
            } else {
                this.setData({
                    [top]: this.data.arrHeight[0],
                    [left]: this.data.gap
                })
                this.data.arrHeight[0] = this.data.arrHeight[0] + height
            }

            list.shift()
            if (list.length > 0) {
                this.layout(list)
                return
            }

            if (list.length == 0) {
                this.setData({ contentH: Math.max(...this.data.arrHeight) })
            }
        },

        mytouchstart (e) {
            this.setData({ touch_start: e.timeStamp })
        },

        mytouchend (e) {
            this.setData({ touch_end: e.timeStamp })
        },

        bindPickerChange(e) {
            // console.log(e)
            this.setData({ createIndex: e.detail.value })
        },

        createlable(e) {
            // console.log(e.currentTarget.dataset.index)
            this.setData({
                createVisible: true,
                createIndex: e.currentTarget.dataset.index
            })
        },

        createInput(e) {
            // console.log(e.detail)
            this.data.createValue = e.detail.value
        },

        cancle() {
            this.setData({ createVisible: false })
        },

        confirm() {
            if (this.data.createValue == '') {
                wx.showToast({
                    title: '标签名称不能为空',
                    icon: 'none'
                })
                return
            }
            if (this.data.createValue.length > 5) {
                wx.showToast({
                    title: '标签名称不得超过5个字符',
                    icon: 'none'
                })
            }
            console.log(this.data.createValue)
            app.fn.ajax('POST', {
                sessionrd: app.sessionrd,
                cate_name: this.data.createValue,
                action: 'modifyCollectCate',
                cate_id: '',
                up_id: this.data.groupList[this.data.createIndex].id,
                level: 2
            }, app.api.information.collect, res => {
                let arr = JSON.parse(JSON.stringify(this.data.groupList[this.data.createIndex].list))
                arr.push({ id: res.data.cate_id, name: this.data.createValue, operationVisible: true })
                let key = 'groupList[' + this.data.createIndex + '].list'
                this.setData({
                    [key]: arr,
                    createValue: '',
                    arrHeight: [0, 0],
                    createVisible: false
                })
                this.getlayoutdata()
                wx.setStorageSync('addfolder', 1)
            })
        },

        addLable() {
            this.setData({ addVisible: true })
        },

        addInput(e) {
            this.data.addValue = e.detail.value
        },

        cancleAdd() {
            this.setData({ addVisible: false })
        },

        confirmAdd() {
            if (this.data.addValue == '') {
                return
            }
            if (this.data.addValue.length > 5) {
                wx.showToast({
                    title: '分类名称不得超过5个字符',
                    icon: 'none'
                })
                return
            }
            app.fn.ajax('POST', {
                sessionrd: app.sessionrd,
                cate_name: this.data.addValue,
                action: 'modifyCollectCate',
                level: 1
            }, app.api.information.collect, res => {
                
                let arr = JSON.parse(JSON.stringify(this.data.groupList))
                arr.unshift({
                    id: res.data.cate_id,
                    name: this.data.addValue,
                    list: []
                })
                this.setData({
                    groupList: arr,
                    addValue: '',
                    arrHeight: [0, 0],
                    addVisible: false
                })
                this.getlayoutdata()
                wx.setStorageSync('addfolder', 1)
            })
        },

        showOperation (e) {
            this.hiddenOperation()
            let index = e.currentTarget.dataset.index
            let order = e.currentTarget.dataset.order
            let key = 'groupList[' + index + '].list[' + order + '].operationVisible'
            this.setData({
                [key]: false,
                editSelectCurrent: index,
                initSelectCurrent: index
            })
            
        },

        hiddenOperation () {
            this.data.groupList.map((item, index) => {
                item.list.map((obj, order) => {
                    let key = 'groupList[' + index + '].list[' + order + '].operationVisible'
                    this.setData({ [key]: true })
                })
            })
        },

        cancleEdit() {
            this.setData({
                editVisible: false,
                editValue: ''
            })
            this.hiddenOperation()
        },

        editChange (e) {
            this.setData({
                editSelectCurrent: e.detail.value
            })
        },

        confirmEdit() {
            if (this.data.editValue.length > 5) {
                wx.showToast({
                    title: '标签名称不得超过5个字符',
                    icon: 'none'
                })
                return
            }
            let index = this.data.editIndex
            let order = this.data.editOrder
            let key = 'groupList[' + index + '].list[' + order + '].name'
            let up_id = this.data.groupList[index].id
            if (this.data.editSelectCurrent != this.data.initSelectCurrent) {
                up_id = this.data.groupList[this.data.editSelectCurrent].id
            }
            app.fn.ajax('POST', {
                sessionrd: app.sessionrd,
                cate_name: this.data.editValue,
                action: 'modifyCollectCate',
                cate_id: this.data.groupList[index].list[order].id,
                up_id: up_id,
                level: 2
            }, app.api.information.collect, res => {
                // TODO
                if (this.data.editSelectCurrent == this.data.initSelectCurrent) {
                    this.setData({
                        [key]: this.data.editValue
                    })
                } else {
                    let removeArr = this.data.groupList[index].list.slice(0)
                    let removekey = 'groupList[' + index + '].list'
                    removeArr.splice(order, 1)
                    let addArr = this.data.groupList[this.data.editSelectCurrent].list.slice(0)
                    let addkey = 'groupList[' + this.data.editSelectCurrent + '].list'
                    addArr.unshift(this.data.groupList[index].list[order])
                    this.setData({
                        [removekey]: removeArr,
                        [addkey]: addArr
                    })
                }
                this.setData({
                    editVisible: false,
                    editValue: '',
                    arrHeight: [0, 0]
                })
                this.getlayoutdata()
                this.hiddenOperation()
                wx.setStorageSync('addfolder', 1)
            })
        },

        editInput (e) {
            this.setData({
                editValue: e.detail.value
            })
        },

        editLable (e) {
            let index = e.currentTarget.dataset.index
            let order = e.currentTarget.dataset.order
            console.log(index, order)
            this.setData({
                editIndex: index,
                editOrder: order,
                editVisible: true,
                editValue: this.data.groupList[index].list[order].name
            })
        },

        delLable (e) {
            let index = e.currentTarget.dataset.index
            let order = e.currentTarget.dataset.order
            let arr = this.data.groupList[index].list.slice(0)
            arr.splice(order, 1)
            let key = 'groupList[' + index + '].list'
            app.fn.ajax('POST', {
                sessionrd: app.sessionrd,
                cate_name: this.data.editValue,
                action: 'delCollectCate',
                cate_id: this.data.groupList[index].list[order].id
            }, app.api.information.collect, res => {
                // TODO
                this.setData({
                    [key]: arr,
                    arrHeight: [0, 0]
                })
                this.getlayoutdata()
                this.hiddenOperation()
            })
        },

        selectlabel(e) {
            if (!this.data.blogId) {
                return
            }
            let touchTime = this.data.touch_end - this.data.touch_start;
            let index = e.currentTarget.dataset.index
            let order = e.currentTarget.dataset.order
            if (touchTime > 350) { // longtap
                let key = 'groupList[' + index + '].list[' + order + '].operationVisible'
                this.setData({
                    [key]: false,
                    editSelectCurrent: index,
                    initSelectCurrent: index
                })
            } else { // tap
                let item = this.data.groupList[index].list[order]
                let key = 'selectedList[' + this.data.selectedList.length + ']'
                if (!item.active) {
                    this.setData({ [key]: item })
                    this.diff()
                } else {
                    let arr = JSON.parse(JSON.stringify(this.data.selectedList))
                    let active = 'groupList[' + index + '].list[' + order + '].active'
                    arr.map((obj, index) => {
                        if (obj.id == item.id) {
                            arr.splice(index, 1)
                        }
                    })
                    this.setData({
                        [active]: false,
                        selectedList: arr
                    })
                }
            }
        },

        reselect(e) {
            let item = e.currentTarget.dataset.item
            let index = e.currentTarget.dataset.index
            this.data.groupList.map((obj, order) => {
                obj.list.map((ele, sort) => {
                    if (item.id == ele.id) {
                        let key = 'groupList[' + order + '].list[' + sort + '].active'
                        this.setData({ [key]: false })
                    }
                })
            })
            let arr = JSON.parse(JSON.stringify(this.data.selectedList))
            arr.splice(index, 1)
            this.setData({
                selectedList: arr
            })
        }
    }
})
