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
        clothId: {
            type: String,
            value: ''
        },
        clothUrl: {
            type: String,
            value: '',
            observer: function (newVal, oldVal, changePath) {
                console.log(newVal)
                if (newVal) {
                    let arr = this.data.imglist.slice(0)
                    let arr2 = this.data.previewlist.slice(0)
                    arr.push(newVal)
                    arr2.push(newVal)
                    this.setData({
                        imglist: arr,
                        previewlist: arr2
                    })
                }
            }
        },
        uploadList: {
            type: Array,
            value: []
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
        imglist: [],
        previewlist: [],

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

        preViewImage (e) {
            let url = e.currentTarget.dataset.url
            wx.previewImage({
                urls: this.data.uploadList,
                current: url
            })
        },

        delImage (e) {
            let index = e.currentTarget.dataset.index
            let arr = this.data.uploadList.slice(0)
            arr.splice(index, 1)
            this.setData({
                uploadList: arr
            })
        },

        chooseImage () {
            const self = this
            wx.chooseImage({
                success: function(res) {
                    console.log(res)
                    self.setData({
                        previewlist: self.data.previewlist.concat(res.tempFilePaths)
                    })
                    self.uploadFile(res.tempFilePaths)
                }
            })
        },

        uploadFile (path) {
            const self = this
            wx.uploadFile({
                // url: 'http://192.168.1.120:8000/dear' + app.api.image.uploadFile,
                url: app.requestIP + app.api.image.uploadFile,
                filePath: path[0],
                name: 'images',
                formData: {
                    sessionrd: app.sessionrd,
                    action: 'uploadImg'
                },
                success(res) {
                    let responseData = JSON.parse(res.data)
                    let arr = self.data.imglist.slice(0)
                    arr.push(responseData.data.imagesUrl)
                    self.setData({
                        imglist: arr
                    })
                    path.shift()
                    if (path.length > 0) {
                        self.uploadFile(path)
                    }
                }
            })
        },

        cancelAddImage () {
            wx.navigateBack()
        },

        confirmUpload () {
            // if (this.data.uploadList.length == 0) {
            //     wx.showToast({
            //         title: '请上传图片',
            //         icon: 'none'
            //     })
            //     return
            // }
            if (this.data.selectedList.length == 0) {
                wx.showToast({
                    title: '请添加标签',
                    icon: 'none'
                })
                return
            }
            let arr = []
            this.data.selectedList.map((item, index) => {
                arr.push(item.id)
            })
            let postData = {
                sessionrd: app.sessionrd,
                action: 'setWardrobe',
                cate_ids: arr.join(',')
            }
            if (this.data.clothId) {
                postData.wids = this.data.clothId
                postData.action = 'updateWardrobe'
            } else {
                postData.image_urls = this.data.uploadList.join(',')
            }
            app.fn.ajax('POST', postData, app.api.information.wardrobe, res => {
                // console.log(res)
                wx.navigateBack()
            })
            wx.setStorageSync('clothes_cate', this.data.selectedList)
            wx.setStorageSync('addCloth', 1)
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
                return
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
                arr.push({ id: res.data.cate_id, name: this.data.createValue, operationVisible: true})
                let key = 'groupList[' + this.data.createIndex + '].list'
                this.setData({
                    [key]: arr,
                    createValue: '',
                    arrHeight: [0, 0],
                    createVisible: false
                })
                this.getlayoutdata()
            })
            wx.setStorageSync('addlable', 1)
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
            })
            wx.setStorageSync('addlable', 1)
        },

        selectlabel(e) {
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

        mytouchstart(e) {
            this.setData({ touch_start: e.timeStamp })
        },

        mytouchend(e) {
            this.setData({ touch_end: e.timeStamp })
        },

        showOperation(e) {
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

        hiddenOperation() {
            this.data.groupList.map((item, index) => {
                item.list.map((obj, order) => {
                    let key = 'groupList[' + index + '].list[' + order + '].operationVisible'
                    this.setData({ [key]: true })
                })
            })
        },

        editChange(e) {
            this.setData({
                editSelectCurrent: e.detail.value
            })
        },

        cancleEdit() {
            this.setData({
                editVisible: false,
                editValue: ''
            })
            this.hiddenOperation()
        },

        editInput(e) {
            this.setData({
                editValue: e.detail.value
            })
        },

        editLable(e) {
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

        delLable(e) {
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
            })
            wx.setStorageSync('addlable', 1)
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
