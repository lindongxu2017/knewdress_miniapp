// pages/imgSearch/imgSearch.js
const app = getApp()
import store from '../../store'
import create from '../../utils/create'
create(store, {
    data: {
        showUrl: '',
        imgUrl: '',
        currentID: '',
        scrollTop: 0,
        // -----------------------------------
        // y: 0, // 当前滑动距离
        // moveY: 0, // 保存上次滑动距离
        // animation: false, // 是否动画弹回
        // direction: 'up', // 手指滑动方向
        // initPageY: 0,
        imgShowWidth: 0,
        windowWidth: 0,
        windowHeight: 0,
        contentHeight: 0,
        leftTop: {
            x: 0,
            y: 0
        },
        initArea: 0,
        changeArea: 0,
        initWidth: 80,
        initHeight: 80,
        clientY: 0,
        delay: false,
        list: [],
        show_face: '',
        // ----------------------------------
        lastDistance: 40, // 上一次滑动距离
        distance: 40, // 初始距离
        startY: 0, // 触摸开始
        endY: 0, // 触摸结束
        moveY: 0, // 触摸滑动
        initY: 0, // 判断方向
        prevent: false, // 是否禁止滑动
        animation: false,
        animationTime: 0,
        direction: 'up', // 初始方向
        y: 0,
        pageH: 0,
        start_y: 0,
        open: false,
        blogID: ''
    },
    onLoad: function(options) {
        
        this.store.data.blogImgSeachlist = []
        this.update()

        let barHeight = app.globalData.statusBarHeight
        let pageH = app.globalData.windowHeight - barHeight - 45

        // console.log(pageH, app.globalData.windowHeight, barHeight)

        this.setData({
            windowWidth: app.globalData.windowWidth,
            windowHeight: app.globalData.windowHeight,
            contentHeight: app.globalData.windowHeight * 0.7
        })

        this.closePopup()

        if (options.show_face) {
            this.data.show_face = 1
        }

        // console.log(options.url)
        // options.url = 'http://tmp/wx67cc8ea25fd2ddd8.o6zAJs4JTWZgNmnAQ29vOuZZPrro.dCu9HcGEOK3M8fb890d6ad66034ebab6804f888455a6.jpg'

        // --------------------
        if (options.url) {
            this.setData({
                showUrl: options.url
            })
            this.wxUplaod(options.url)
        }

        if (options.blogID) {
            this.setData({
                blogID: options.blogID
            })
        }

        if (options.imgUrl) {
            this.setData({
                showUrl: options.imgUrl,
                imgUrl: options.imgUrl
            })
            this.searchSimilarImg()
        }

        if (options.sharePage) {
            this.setData({
                showUrl: options.shareImgUrl,
                imgUrl: options.shareImgUrl
            })
            let callback = () => {
                this.setData({
                    isloading: false
                })
                this.searchSimilarImg()
            }
            callback()
            app.sharePage = 1
        }
    },
    onShow: function() {
        // TODO
    },
    // --------------------------------------------------
    frameMoveView(e) {
        const self = this
        if (e.detail.source == 'touch') {
            this.setData({
                'leftTop.x': e.detail.x,
                'leftTop.y': e.detail.y
            })
        }
    },

    min(value1, value2) {
        return value1 - value2 > 0 ? value2 : value1
    },

    max(value1, value2) {
        return value1 - value2 > 0 ? value1 : value2
    },

    frameMoveEnd() {
        let move_w = this.data.initWidth
        let move_h = this.data.initHeight
        let move_leftTop = this.data.leftTop
        let rate_max = 0,
            rate_max_index = 0;
        this.data.list.map((item, index) => { // 判断是否有重合

            let x1 = move_leftTop.x;
            let y1 = move_leftTop.y;
            let width1 = move_w;
            let height1 = move_h;

            let x2 = item.a.x;
            let y2 = item.a.y;
            let width2 = item.box_w;
            let height2 = item.box_h;

            let endx = this.max(x1 + width1, x2 + width2);
            let startx = this.min(x1, x2);
            let width = width1 + width2 - (endx - startx);

            let endy = this.max(y1 + height1, y2 + height2);
            let starty = this.min(y1, y2);
            let height = height1 + height2 - (endy - starty);

            if (width <= 0 || height <= 0) {
                item.coincidence_ratio = 0
            } else {
                let Area = width * height;
                let Area1 = width1 * height1;
                let Area2 = width2 * height2;
                let ratio = Area / (Area1 + Area2 - Area);
                item.coincidence_ratio = ratio
            }

            // console.log('item重合率:' + item.coincidence_ratio)

            if (item.coincidence_ratio > rate_max) {
                rate_max_index = index
                rate_max = item.coincidence_ratio
            }
            // console.log(item.coincidence_ratio)
        })
        // console.log(this.data.frameItem)
        // console.log('最大重合率：' + rate_max)
        if (rate_max >= 0.3) {
            let rate_max_box = this.data.list[rate_max_index]
            // console.log(rate_max_box)
            if (rate_max_box.box_area < 1600) {
                let dw_value = 40 - rate_max_box.box_w
                let dh_value = 40 - rate_max_box.box_h

                if (dw_value > 0) { // 宽度小于80
                    this.setData({
                        'leftTop.x': rate_max_box.a.x - dw_value / 2,
                        initWidth: rate_max_box.box_w + dw_value / 2,
                    })
                }

                if (dh_value > 0) { // 高度小于80
                    this.setData({
                        'leftTop.y': rate_max_box.a.y - dh_value / 2,
                        initHeight: rate_max_box.box_h + dh_value / 2
                    })
                }

            } else {
                this.setData({
                    'leftTop.x': rate_max_box.a.x,
                    'leftTop.y': rate_max_box.a.y,
                    initWidth: rate_max_box.box_w,
                    initHeight: rate_max_box.box_h
                })
            }
            this.setData({
                currentID: this.data.list[rate_max_index].id
            })
            this.searchSimilarImg()
        } else {
            this.custome()
        }

    },

    // 自定义选框， 计算坐标
    custome() {
        let postData = {
            sessionrd: app.sessionrd,
            action: 'BlogAreaSearch',
            position: JSON.stringify({
                xmin: this.data.leftTop.x / this.data.imgShowWidth,
                ymin: this.data.leftTop.y / this.data.contentHeight,
                xmax: (this.data.leftTop.x + this.data.initWidth) / this.data.imgShowWidth,
                ymax: (this.data.leftTop.y + this.data.initHeight) / this.data.contentHeight
            }),
            image_url: this.data.imgUrl,
            refresh: 1
        }
        // console.log(this.data.leftTop, this.data.initWidth, this.data.initHeight, this.data.imgShowWidth, this.data.contentHeight)
        this.store.data.blogImgSeachlist = []
        this.update()
        this.setData({
            listinfo: postData
        })
    },

    moveChangerightdown(e) {
        // console.log(e.detail)
        if (e.detail.source == 'touch') {
            let dynamic_x = e.detail.x - this.data.leftTop.x
            let dynamic_y = e.detail.y - this.data.leftTop.y
            this.setData({
                initWidth: dynamic_x < 40 ? 40 : dynamic_x + 30,
                initHeight: dynamic_y < 40 ? 40 : dynamic_y + 30
            }, () => {
                this.data.changeArea = this.data.initWidth * this.data.initHeight
            })
        }
    },

    moveChangeletfdown(e) {
        if (e.detail.source == 'touch') {
            let dynamic_x = Math.abs(e.detail.x - this.data.leftTop.x)
            let dynamic_y = e.detail.y - this.data.leftTop.y
            let origin_x = this.data.leftTop.x + this.data.initWidth
            let origin_y = this.data.leftTop.y
            this.setData({
                'leftTop.x': e.detail.x + 40 > origin_x ? origin_x - 40 : e.detail.x,
                initWidth: e.detail.x + 40 > origin_x ? 40 : origin_x - e.detail.x,
                initHeight: dynamic_y < 40 ? 40 : dynamic_y + 30
            }, () => {
                this.data.changeArea = this.data.initWidth * this.data.initHeight
            })
        }
    },

    moveChangelefttop(e) {
        if (e.detail.source == 'touch') {
            let origin_x = this.data.leftTop.x + this.data.initWidth
            let origin_y = this.data.leftTop.y + this.data.initHeight
            this.setData({
                'leftTop.x': e.detail.x + 40 > origin_x ? origin_x - 40 : e.detail.x,
                'leftTop.y': e.detail.y + 40 > origin_y ? origin_y - 40 : e.detail.y,
                initWidth: e.detail.x + 40 > origin_x ? 40 : origin_x - e.detail.x,
                initHeight: e.detail.y + 40 > origin_y ? 40 : origin_y - e.detail.y
            }, () => {
                this.data.changeArea = this.data.initWidth * this.data.initHeight
            })
        }
    },

    moveChangerighttop(e) {
        if (e.detail.source == 'touch') {
            let origin_x = this.data.leftTop.x
            let origin_y = this.data.leftTop.y + this.data.initHeight
            this.setData({
                'leftTop.y': e.detail.y + 40 > origin_y ? origin_y - 40 : e.detail.y,
                initWidth: e.detail.x - origin_x < 40 ? 40 : e.detail.x - origin_x + 30,
                initHeight: e.detail.y + 40 > origin_y ? 40 : origin_y - e.detail.y
            }, () => {
                this.data.changeArea = this.data.initWidth * this.data.initHeight
            })
        }
    },

    setImgInfo(e) {
        // console.log(e)
        var height_img = this.data.windowWidth * e.detail.height / e.detail.width
        if (height_img > this.data.windowHeight * 0.7) {
            height_img = this.data.windowHeight * 0.7
        }
        this.setData({
            contentHeight: height_img,
        })
        if (e.detail.width >= e.detail.height) {
            this.setData({
                imgShowWidth: this.data.windowWidth
            })
        } else {
            this.setData({
                imgShowWidth: this.data.contentHeight * e.detail.width / e.detail.height
            })
            // console.log(this.data.imgShowWidth)
        }
        this.setData({
            distance: this.data.contentHeight,
            lastDistance: this.data.contentHeight,
            prevent: true
        })
        let ayncCallback = () => {
            this.calcArea()
            let area_max_index = 0
            let area_max = 0
            this.data.frameItem.map((item, index) => { // 找出最大面积
                if (item.selected == 1) {
                    area_max_index = index
                }
            })

            // console.log(area_max_index, area_max)
            let box_item = this.data.frameItem[area_max_index]
            // console.log(box_item)
            this.setData({
                'leftTop.x': box_item.a.x,
                'leftTop.y': box_item.a.y,
                initWidth: box_item.box_w,
                initHeight: box_item.box_h
            })
        }
        let timer = setInterval(() => {
            if (this.data.frameItem) {
                clearInterval(timer)
                ayncCallback()
            }
        }, 100)
    },

    // 计算已有框列表中各个框的面积以及中心点和4个顶点
    calcArea() {
        let imgWidth = this.data.imgShowWidth != 0 ? this.data.imgShowWidth : this.data.windowWidth
        let imgHeight = this.data.contentHeight
        // console.log(imgWidth, imgHeight)
        this.data.frameItem.map((item, index) => {
            let box_w = (item.positions.x_max - item.positions.x_min) * imgWidth
            let box_h = (item.positions.y_max - item.positions.y_min) * imgHeight
            let box_area = box_w * box_h
            let box_center = {
                x: (item.positions.x_max + item.positions.x_min) * imgWidth / 2,
                y: (item.positions.y_max + item.positions.y_min) * imgHeight / 2
            }
            let a = {
                x: box_center.x - box_w / 2,
                y: box_center.y - box_h / 2
            }
            let b = {
                x: box_center.x + box_w / 2,
                y: box_center.y - box_h / 2
            }
            let c = {
                x: box_center.x + box_w / 2,
                y: box_center.y + box_h / 2
            }
            let d = {
                x: box_center.x - box_w / 2,
                y: box_center.y + box_h / 2
            }
            item.box_area = box_area
            item.box_center = box_center
            item.box_w = box_w
            item.box_h = box_h
            item.a = a, item.b = b, item.c = c, item.d = d;
            // console.log(item)
        })
        this.data.list = this.data.frameItem
    },


    moveChange(e) {
        // console.log(e.detail)
    },

    touchStart(e) {
        let touch = e.changedTouches[0]
        this.setData({
            scrollTop: 0,
            start_y: touch.pageY
        })
    },

    touchEnd(e) {
        // console.log(e.changedTouches[0])
        let touch = e.changedTouches[0]
        let distance = touch.pageY - this.data.start_y
        let range = this.data.windowHeight * 0.075
        // console.log(distance, range)
        if (distance >= 0) {
            if (distance > range) {
                this.closePopup()
            } else {
                this.openPopup()
            }
        } else {
            if (Math.abs(distance) > range) {
                this.openPopup()
            } else {
                this.closePopup()
            }
        }
    },

    openPopup() {
        this.setData({
            y: 0,
            open: true
        })
    },

    closePopup() {
        if (this.data.scrollTop > 10) {
            return
        }
        this.setData({
            y: (this.data.windowHeight - this.data.contentHeight) / 2,
            open: false
        })
    },

    preventMove() {
        // todo
        // console.log(111111)
    },

    todo() {
        // console.log(111111)
        return false
    },

    // --------------------------------------------------
    onShareAppMessage(res) {
        return {
            title: '真没想到，还可以这么搭配？',
            path: 'pages/imgSearch/imgSearch?shareImgUrl=' + this.data.imgUrl + '&sharePage=1pid=' + app.globalData.userInfo.id
        }
    },

    selectItem(e) {
        // console.log(e.currentTarget.dataset.item.id)
        this.setData({
            currentID: e.currentTarget.dataset.item.id
        })
        this.searchSimilarImg()
    },

    wxUplaod(url) {
        // console.log(url)
        const self = this
        wx.uploadFile({
            // url: 'http://192.168.1.120:8000/dear' + app.api.image.uploadFile,
            url: app.requestIP + app.api.image.uploadFile,
            filePath: url,
            name: 'images',
            formData: {
                sessionrd: app.sessionrd,
                action: 'uploadImg',
                every_time_update: 1
            },
            success(res) {
                let responseData = JSON.parse(res.data)
                // console.log(responseData.data.imagesUrl)
                self.setData({
                    imgUrl: responseData.data.imagesUrl
                }, () => {
                    self.setData({
                        isloading: false
                    })
                    self.searchSimilarImg()
                })
            }
        })
    },
    // 页面滚动
    onViewScroll(e) {
        // console.log(e)
        // this.setData({ scrollTop: e.detail.scrollTop })
    },
    scrollView(e) {
        // console.log(e.detail.scrollTop)
        this.setData({
            scrollTop: e.detail.scrollTop
        })
    },
    onReachBottom() {
        // this.searchSimilarImg()
        let component = this.selectComponent("#list")
        component.getlist()
    },
    searchSimilarImg() {
        // console.log(this.data.imgUrl)
        let postData = {
            sessionrd: app.sessionrd,
            action: 'BlogImgSearch',
            image_url: this.data.imgUrl,
            item_id: this.data.currentID
        }
        if (this.data.blogID) {
            postData.blog_id = this.data.blogID
            // console.log(postData)
        }
        if (this.data.show_face) {
            postData.show_face = 1
        }
        this.store.data.blogImgSeachlist = []
        this.update()
        if (this.data.listinfo) {
            postData.refresh = 1
        }
        this.setData({
            listinfo: postData
        })
    },
    setItemInfo(e) {
        // console.log(e.detail)
        this.setData({
            frameItem: e.detail
        })
        // this.openPopup()
    }
})