//index.js
//获取应用实例
const app = getApp()
import store from '../../store'
import create from '../../utils/create'
create(store, {
    // v2.0
    data: {
        infoTypeActive: 0,
        isShowGuide: false,
        // 推荐列表参数
        info_recommend: null,
        recommendIsloading: false,
        scrollTop_recommend: 0,
        info_hot: null, // 热门列表参数
        hotIsloading: false,
        isloading_hot: false,
        scrollTop_hot: 0,
        enable_back_to_top: true,
        showTips: false,
        showRecommendPlaceholder: true,
        showHotPlaceholder: true,
        shopPlaceholder: true,
        palceholderShowHeight: 0,
        loading1: true,
        loading2: true,
        loading3: true,

        recommendlist: [], // 推荐列表
        hotlist: [], // 热门列表
        shoplist: [], // 种草列表

        statusBarHeight: 20
    },
    onLoad: function(options) {
        let statusBarHeight = app.globalData.statusBarHeight
        this.setData({
          statusBarHeight: statusBarHeight
        })
        this.store.data.recommendlist = []
        this.store.data.hotlist = []
        this.store.data.shoplist = []
        this.update()
        wx.showLoading({
            title: '加载中'
        })
        const self = this
        // 用户第一次进入小程序显示引导
        // if (!wx.getStorageSync('isShowGuide') && wx.getStorageSync('userInfo')) {
        //     this.setData({
        //         isShowGuide: true
        //     })
        //     wx.setStorageSync('isShowGuide', 1)
        // }
        this.setData({
            info_recommend: {
                sessionrd: app.sessionrd,
                action: 'BlogList',
                blog_type: 1
            }
        })
        // this.getPhoto()

        this.setData({
            palceholderShowHeight: app.globalData.windowHeight - 120
        })

        if (options.sharePage) {
            app.sharePage = 1
        }
    },
    onShow() {
        // 同步收藏数据
        // console.log(this.data)
        if (wx.getStorageSync('collect_list_num_arr')) {
            if (this.data.info_recommend) {
                let component_recommend = this.selectComponent("#recommendlist") || null
                if (component_recommend) {
                    component_recommend.syncData()
                }
            }
            if (this.data.info_hot) {
                let component_hot = this.selectComponent("#hotlist") || null
                if (component_hot) {
                    component_hot.syncData()
                }
            }
        }
        
        // 详情加载后更新列表
        // let component_recommend = this.selectComponent("#recommendlist") || null
        // if (component_recommend) {
        //     component_recommend.updatelist('recommendlist')
        // }
        // let component_hot = this.selectComponent("#hotlist") || null
        // if (component_hot) {
        //     component_hot.updatelist('hotlist')
        // }

        if (wx.getStorageSync('reset')) {
            this.setData({
                info_recommend: {
                    sessionrd: app.sessionrd,
                    action: 'BlogList',
                    blog_id: '',
                    newline: 1,
                    blog_type: 1,
                    refresh: 1
                },
                showRecommendPlaceholder: true
            })

            wx.removeStorageSync('reset')
            this.data.loading1 = true
            // setTimeout(() => {
            //     wx.showLoading({
            //         title: '加载中'
            //     })
            // }, 300)
        }


        if (this.data.infoTypeActive == 0) {
            if (!this.data.loading1) {
                wx.hideLoading()
            } else {
                wx.showLoading({
                    title: '加载中',
                })
            }
        }

        if (this.data.infoTypeActive == 1) {
            if (!this.data.loading2) {
                wx.hideLoading()
            } else {
                wx.showLoading({
                    title: '加载中',
                })
            }
        }

        if (this.data.infoTypeActive == 2) {
            if (!this.data.loading3) {
                wx.hideLoading()
            } else {
                wx.showLoading({
                    title: '加载中',
                })
            }
        }

    },
    hideTips () {
        this.setData({
            showTips: false
        })
    },
    // 获取人脸库列表
    getPhoto() {
        app.fn.ajax('POST', {
            sessionrd: app.sessionrd,
            action: 'myFaceList'
        }, app.api.face.face, res => {
            if (res.data.length == 0) {
                this.setData({
                    showTips: true
                })
            }
        })
    },

    finishFirstLoadRecommend(e) {
        this.data.loading1 = false
        if (this.data.infoTypeActive == 0) {
            wx.hideLoading()
        }
        this.setData({
            showRecommendPlaceholder: false
        })
    },

    finishFirstLoadHot(e) {
        this.data.loading2 = false
        if (this.data.infoTypeActive == 1) {
            wx.hideLoading()
        }
        this.setData({
            showHotPlaceholder: false
        })
    },

    finishFirstLoadShop(e) {
        this.data.loading3 = false
        if (this.data.infoTypeActive == 2) {
            wx.hideLoading()
        }
        this.setData({
            shopPlaceholder: false
        })
    },

    goUploadPage() {
        wx.navigateTo({
            url: '/pages/searchSuit/searchSuit',
        })
    },
    // 
    switchInfoType(e) {
        let type = e.detail.index
        if (type != this.data.infoTypeActive) {
            this.setData({
                infoTypeActive: type
            })
        }
        // console.log(this.data.loading1, this.data.loading2)
        if (type == 0) {
            if (this.data.loading1) {
                wx.showLoading({
                    title: '加载中'
                })
            } else {
                wx.hideLoading()
            }
        }
        if (type == 1) {
            if (!this.data.info_hot) {
                let assignment = () => {
                    this.setData({
                        info_hot: {
                            sessionrd: app.sessionrd,
                            action: 'BlogList',
                            blog_type: 2
                        }
                    })
                }
                assignment()
            }
            if (this.data.loading2) {
                wx.showLoading({
                    title: '加载中'
                })
            } else {
                wx.hideLoading()
            }
        }
        if (type == 2) {
            if (!this.data.info_shop) {
                let assignment = () => {
                    this.setData({
                        info_shop: {
                            sessionrd: app.sessionrd,
                            action: 'BlogList',
                            blog_type: 3
                        }
                    })
                }
                assignment()
            }
            if (this.data.loading3) {
                wx.showLoading({
                    title: '加载中'
                })
            } else {
                wx.hideLoading()
            }
        }
    },
    preventSwiper() {
        return false
    },
    swiperChange(e) {
        // console.log(e.detail)
        this.setData({
            infoTypeActive: e.detail.current
        })
    },
    onShareAppMessage(res) {
        return {
            title: '拍照搜搭配，无需下载',
            path: '/pages/index/index?sharePage=1&pid=' + app.globalData.userInfo.id
        }
    },

    closeGuide() {
        this.setData({
            isShowGuide: false
        })
    },

    // uploadImg () {
    //   this.closeGuide()
    //   this.uplaodImg()
    // },

    // scroll-view 滚动
    // viewScroll(e) {
    //     // console.log(e.detail.scrollTop)
    //     if (this.data.infoTypeActive == 0) {
    //         this.setData({
    //             scrollTop_recommend: e.detail.scrollTop
    //         })
    //     } else {
    //         this.setData({
    //             scrollTop_hot: e.detail.scrollTop
    //         })
    //     }
    // },

    // scroll-view 滚动触底
    scrolltolower() {
        let component_recommend = this.selectComponent("#recommendlist") || null
        let component_hot = this.selectComponent("#hotlist") || null
        let component_shop = this.selectComponent("#shoplist") || null
        if (this.data.infoTypeActive == 0 && component_recommend) {
            component_recommend.getlist()
        }
        if (this.data.infoTypeActive == 1 && component_hot) {
            component_hot = this.selectComponent("#hotlist")
            component_hot.getlist()
        }
        if (this.data.infoTypeActive == 2 && component_shop) {
            component_shop = this.selectComponent("#shoplist")
            component_shop.getlist()
        }
    },

    onReachBottom () {
      this.scrolltolower()
    },

    changeIsloadingStatus(e) {
        if (e.currentTarget.dataset.listtype == 'recommendlist') {
            this.setData({
                recommendIsloading: e.detail.isloading
            })
        } else if (e.currentTarget.dataset.listtype == 'hotlist') {
            this.setData({
                hotIsloading: e.detail.isloading
            })
        } else {
            this.setData({
                shopIsloading: e.detail.isloading
            })
        }
        if (!e.detail.isloading) {
            wx.stopPullDownRefresh()
        }
    },

    // 页面下拉刷新
    onPullDownRefresh() {
        if (this.data.infoTypeActive == 0 && !this.data.recommendIsloading) {
            this.setData({
                info_recommend: {
                    sessionrd: app.sessionrd,
                    action: 'BlogList',
                    blog_type: 1,
                    refresh: 1
                },
                showRecommendPlaceholder: true
            })
            this.data.loading1 = true
        }
        if (this.data.infoTypeActive == 1 && !this.data.hotIsloading) {
            this.setData({
                info_hot: {
                    sessionrd: app.sessionrd,
                    action: 'BlogList',
                    blog_type: 2,
                    refresh: 1
                },
                showHotPlaceholder: true
            })
            this.data.loading2 = true
        }
        if (this.data.infoTypeActive == 2 && !this.data.shopIsloading) {
            this.setData({
                info_shop: {
                    sessionrd: app.sessionrd,
                    action: 'BlogList',
                    blog_type: 3,
                    refresh: 1
                },
                shopPlaceholder: true
            })
            this.data.loading3 = true
        }
        wx.stopPullDownRefresh()
        wx.hideLoading()
        wx.showLoading({
            title: '加载中'
        })
    },

    openDetail(e) {
        // console.log(e)
        this.setData({
            floorData: e
        })
    },
    isPreventScroll(e) {
        this.setData({
            isPreventScroll: e.detail
        })
    },

    // 上传图片搜索
    uploadImg() {
        wx.chooseImage({
            count: 1,
            sizeType: ['compressed'],
            success: function(res) {
                // console.log(res.tempFilePaths[0])
                let tempFilePath = res.tempFilePaths[0]
                wx.navigateTo({
                    url: '/pages/imgSearch/imgSearch?url=' + tempFilePath + '&show_face=1'
                })
            }
        })
    }
})