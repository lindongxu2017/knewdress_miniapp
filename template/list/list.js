// template/list/list.js
const app = getApp()
import create from '../../utils/create'
create({
    /**
     * 组件的属性列表
     */
    properties: {
        infoList: {
            type: Object,
            value: {},
            observer: function(newVal, oldVal, changePath) {
                this.setData({
                    list: []
                })
                if (newVal.action == 'BlogList') {
                    this.setData({ isFloat: true })
                }
                if (oldVal) {
                    this.setData({
                        'layoutData.totalHeight': 0,
                        'layoutData.columnHeight': [],
                        noData: false,
                        noMore: false,
                        isloading: false
                    })
                    this.data.shownum = 0
                    this.initLayoutData()
                }
                if (newVal.refresh || oldVal.refresh) {
                    if (newVal.action == 'BlogList' || oldVal.refresh) {
                        this.data.lastID = ''
                        this.data.pageListID = []
                    }
                    this.getlist()
                }
            }
        },
        scrollTop: {
            type: Number,
            value: 0,
            observer: function(newVal, oldVal, changePath) {
                // todo
            }
        },
        padB: {
            type: Boolean,
            value: false
        },
        showList: {
            type: Object,
            value: [],
            observer: function (newVal, oldVal, changePath) {
                if (oldVal && oldVal.length > 0) {
                    this.data.initlenght = oldVal.length
                }
                if (newVal.length > 0) {
                    // console.log(this.data.initlenght)
                    newVal.map((item, index) => {
                        if (index >= this.data.initlenght) {
                            let key = 'list['+index+']'
                            this.setData({
                                [key]: item
                            })
                        }
                    })
                    if (typeof this.data.layoutData.itemWidth == 'string') {
                        this.initLayoutData()
                    }
                    this.calculation()
                }
            }
        },
        editAble: {
            type: Boolean,
            value: false
        }
    },

    /**
     * 组件的初始数据
     */
    data: {
        // windowHeight: 500, // 默认
        windowWidth: 375, // 默认
        list: [], // 资讯列表
        initlenght: 0,
        isloading: false, // 正在加载阈值
        // 布局信息
        layoutData: {
            totalHeight: 0, // 总高度
            columnHeight: [], // 
            column: 0, // 列
            gap: 0, // 间距 （单位：PX）
            itemWidth: '50%' // 列表元素默认宽度
        },
        noData: false,
        noMore: false,
        requestNum: 0,
        isFloat: false,
        shownum: 0,
        pageListID: [],
        lastID: ''
    },

    lifetimes: {
        // 在组件实例进入页面节点树时执行
        attached() {
            // console.log(app.globalData.windowWidth)
            this.setData({
                // windowHeight: app.globalData.windowHeight,
                windowWidth: app.globalData.windowWidth
            })
            if (!this.data.infoList) {
                return
            }
            if (this.data.showList.length > 0) {
                return
            }
            this.initLayoutData()
            this.getlist()
        }
    },

    /**
     * 组件的方法列表
     */
    methods: {

        changeStatus (bool) {
            this.data.list.map((item, index) => {
                let key = 'list['+index+'].is_del'
                this.setData({
                    [key]: bool
                })
            })
        },

        delItem(e) {
            const self = this
            let {id, index} = e.currentTarget.dataset
            wx.showModal({
                title: '提示',
                content: '是否删除该博客？',
                success(res) {
                    if (res.confirm) {
                        app.fn.ajax('POST', {
                            sessionrd: app.sessionrd,
                            blog_id: id,
                        }, '/haida/del_blog/', res => {
                            // TODO
                            let list = self.data.list.slice(0)
                            list.splice(index, 1)
                            if (list.length == 0) {
                                self.setData({
                                    noData: true
                                })
                                self.triggerEvent('nodata', {})
                            }
                            self.setData({
                                list: list,
                                'layoutData.totalHeight': 0, // 总高度
                                'layoutData.columnHeight': [0, 0] // 列表高度
                            }, () => {
                                self.calculation()
                            })
                        })
                    } else if (res.cancel) {
                        // console.log('用户点击取消')
                    }
                }
            })
        },

        // 获取列表数据
        getlist() {
            this.data.requestNum++
            let postData = JSON.parse(JSON.stringify(this.data.infoList))
            if (postData.action != 'getUserBlog') {
                postData.page = Math.ceil(this.data.list.length / 12) + 1
                postData.pagenum = 12
            } else {
                if (this.data.list.length > 0) {
                    postData.blog_id = this.data.nextID
                } else {
                    postData.blog_id = ''
                }
            }

            if (postData.action == 'BlogSimilar' || postData.action == 'BlogImgSearch' || postData.action == 'BlogAreaSearch') {
                postData.shownum = this.data.shownum
            }

            if (postData.action == 'BlogList') {
                postData.blog_id = this.data.lastID
                if (postData.blog_type == 1 || postData.blog_type == 3) {
                    postData.read_ids = this.data.pageListID.join(',')
                }
            }

            // console.log(postData)
            let api = app.api.information.list
            // console.log(this.data.infoList)
            if (this.data.infoList.api) {
                api = this.data.infoList.api
            }
            // if (this.data.isloading || this.data.noData || this.data.noMore || !app.sessionrd) {
            if (this.data.isloading || this.data.noData || this.data.noMore) {
                return
            }
            this.setData({
                isloading: true
            })
            this.triggerEvent('isloading', {
                isloading: true
            })
            let num = this.data.requestNum

            // return
            app.fn.ajax('POST', postData, api, res => {
                
                // 删除博客
                if (this.data.editAble) {
                    res.data.map((item, index) => {
                        item.is_del = false
                    })
                }

                // console.log(postData)
                if (this.store && this.store.data) {
                    this.store.data.listPostData = postData
                    this.update()
                }

                this.triggerEvent('isloading', {
                    isloading: false
                })
                this.setData({
                    isloading: false,
                    isFloat: false
                })

                this.triggerEvent('finishFirstLoad', false)
                if (postData.action == 'BlogImgSearch' || postData.action == 'BlogAreaSearch') {
                    if (num != this.data.requestNum) {
                        // 频繁调取数据
                        return
                    }
                    if (res.data.item_list && res.data.item_list.length) {
                        this.triggerEvent('itemListInfo', res.data.item_list)
                    }
                    if (res.data.similar_list && this.data.list.length > 0) {
                        this.setData({
                            initlenght: this.data.list.length
                        })
                    }
                    if (res.data.similar_list.length > 0) {
                        res.data.similar_list.map((item, index) => {
                            // console.log(item.distance)
                            if (item.distance) {
                                item.distance = (Number(item.distance) * 100).toFixed(2)
                            }
                            let key = 'list[' + this.data.list.length + ']'
                            this.setData({
                                [key]: item
                            })
                            if (index + 1 == res.data.similar_list.length) {
                                this.data.shownum = item.shownum
                            }
                        })
                        this.calculation()
                        this.store.data.blogImgSeachlist = this.store.data.blogImgSeachlist.concat(res.data.similar_list)
                        this.update()
                    }
                    if (res.data.similar_list && res.data.similar_list.length == 0 && this.data.list.length == 0) {
                        this.setData({
                            noData: true
                        })
                    }
                    if (res.data.similar_list && res.data.similar_list.length < 12 && !this.data.noData) {
                        this.setData({
                            noMore: true
                        })
                    }
                    return
                }
                // 
                if (res.data && this.data.list.length > 0) {
                    this.setData({
                        initlenght: this.data.list.length
                    })
                }
                if (res.data && res.data.length > 0) {
                    this.setData({
                        nextID: res.data[res.data.length - 1].id
                    })
                    res.data.map((item, index) => {
                        // if (item.distance) {
                        //     item.distance = (Number(item.distance) * 100).toFixed(2)
                        // }
                        let key = 'list[' + this.data.list.length + ']'
                        this.setData({
                            [key]: item
                        })
                        // if (postData.action == 'BlogSimilar' && index + 1 == res.data.length) {
                        //     this.data.shownum = item.shownum
                        // }
                    })
                    this.calculation()
                    if (postData.action == 'BlogList') {
                        this.data.lastID = res.data[res.data.length - 1].id
                        this.data.pageListID = []
                        res.data.map((item, index) => {
                            this.data.pageListID.push(item.id)
                        })
                        if (postData.blog_type == 1) {
                            this.store.data.recommendlist = this.store.data.recommendlist.concat(res.data)
                            this.update()
                        } else {
                            this.store.data.hotlist = this.store.data.hotlist.concat(res.data)
                            this.update()
                        }
                    }
                    if (postData.action == 'getUserBlog') {
                        if (this.store.data.bloggerList) {
                            this.store.data.bloggerList = this.store.data.bloggerList.concat(res.data) || []
                            this.update()
                        }
                    }
                }
                if (res.data && res.data.length == 0 && this.data.list.length == 0) {
                    this.setData({
                        noData: true
                    })
                }
                if (res.data && res.data.length < 12 && !this.data.noData) {
                    this.setData({
                        noMore: true
                    })
                }
            })
        },

        // 初始化布局信息
        initLayoutData() {
            let windowWidth =  app.globalData.windowWidth
            this.data.layoutData.column = 2
            this.setData({
                'layoutData.gap': 15
            })
            let gap = this.data.layoutData.gap
            let column = this.data.layoutData.column
            this.setData({
                'layoutData.itemWidth': (windowWidth - (column + 1) * gap) / column
            })
            let columnArr = []
            for (var i = 0; i < this.data.layoutData.column; i++) {
                columnArr.push(0)
            }
            this.data.layoutData.columnHeight = columnArr
        },

        // 计算列表元素item位置、高度
        calculation() {
            // let listLenght = this.data.list.length // 资讯列表长度
            // console.log(listLenght, this.data.initlenght)
            let width = this.data.layoutData.itemWidth
            let gap = this.data.layoutData.gap
            let space = 25 // item元素间上下间距
            let columnHeight = this.data.layoutData.columnHeight
            this.data.list.map((item, index) => {
                let minHeightIndex = this.indexOfSmallest()
                let itemHeight = item.img_height * width / item.img_width
                let top = 'list[' + index + '].top'
                let left = 'list[' + index + '].left'
                let height = 'list[' + index + '].height'
                if (this.data.layoutData.totalHeight == 0) { // 第一页数据
                    this.setData({
                        [top]: columnHeight[minHeightIndex] + gap, // 上边距
                        [left]: minHeightIndex * (gap + width), // 左边距
                        [height]: itemHeight + 57 // 元素高度
                    })
                } else { // 第二页以后数据
                    if (index >= this.data.initlenght) {
                        this.setData({
                            [top]: columnHeight[minHeightIndex] + gap, // 上边距
                            [left]: minHeightIndex * (gap + width), // 左边距
                            [height]: itemHeight + 57 // 元素高度
                        })
                    }
                }
                if (this.data.layoutData.totalHeight == 0 || index >= this.data.initlenght) {
                    // 重新给高度列表赋值，下次循环比较
                    this.data.layoutData.columnHeight[minHeightIndex] = this.data.layoutData.columnHeight[minHeightIndex] + space + item.height
                }
            })
            // 设置列表高度
            this.setData({
                'layoutData.totalHeight': Math.max(...this.data.layoutData.columnHeight)
            })
        },

        // 找出最小高度所在位置
        indexOfSmallest() {
            let arr = this.data.layoutData.columnHeight
            // console.log(arr)
            var lowest = 0
            for (var i = 1; i < arr.length; i++) {
                if (arr[i] < arr[lowest]) lowest = i
            }
            // console.log(lowest)
            return lowest
        },

        dolike(e) {
            // console.log(e.currentTarget.dataset)
            let dataset = e.currentTarget.dataset
            let id = dataset.id
            let index = dataset.index
            let key = 'list[' + index + '].is_like'
            let keyNum = 'list[' + index + '].points_number'
            // console.log(this.data.list[index])
            app.fn.ajax('POST', {
                sessionrd: app.sessionrd,
                action: 'giveLikePoint',
                blog_id: id
            }, app.api.user.info, res => {
                // todo
                if (this.data.list[index].is_like == 0) {
                    this.setData({
                        [key]: 1,
                        [keyNum]: this.data.list[index].points_number + 1
                    })
                } else {
                    this.setData({
                        [key]: 0,
                        [keyNum]: this.data.list[index].points_number - 1
                    })
                }
            })
            let storagelist = wx.getStorageSync('collect_list_num_arr') || []
            let alike = false
            let alike_index = 0
            if (storagelist.length > 0) {
                storagelist.map((item, order) => {
                    if (item.id == this.data.list[index].id) {
                        alike = true
                        alike_index = order
                    }
                })
            }
            if (alike) {
                storagelist[alike_index] = this.data.list[index]
            } else {
                storagelist.push(this.data.list[index])
            }
            wx.setStorageSync('collect_list_num_arr', storagelist)
        },

        syncData() {
            let storagelist = wx.getStorageSync('collect_list_num_arr') || []
            this.data.list.map((item, index) => {
                storagelist.map((obj, order) => {
                    if (item.id == obj.id) {
                        let key = 'list[' + index + '].is_like'
                        let keyNum = 'list[' + index + '].points_number'
                        this.setData({
                            [key]: obj.is_like || 0,
                            [keyNum]: obj.points_number
                        })
                    }
                })
            })
        },

        godetail(e) {
            let id = e.currentTarget.dataset.id
            let index = e.currentTarget.dataset.index
            // this.store.data.swiperlist = this.data.list
            this.update()
            wx.navigateTo({
                // url: '/pages/detail/detail?id=' + id + '&index=' +index
                url: '/pages/detail/detail?id=' + id
            })
        },
    }
})