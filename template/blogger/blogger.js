// template/blogger/blogger.js
var WxParse = require('../../wxParse/wxParse.js');
const app = getApp()
import create from '../../utils/create'
create({
    /**
     * 组件的属性列表
     */
    properties: {
        isShow: {
            type: Boolean,
            value: false,
            obsever: function(newVal, oldVal, changedPath) {
                // console.log(newVal)
            }
        },
        bloggerItem: {
            type: Object,
            value: null,
            observer: function(newVal, oldVal, changedPath) {
                // console.log(newVal)
            }
        }
    },

    /**
     * 组件的初始数据
     */
    data: {
        // isShowComplelist: false
    },

    lifetimes: {
        // 在组件实例进入页面节点树时执行
        attached() {
            let arr = []
            arr.push(this.data.bloggerItem.nickname)
            arr.push(this.data.bloggerItem.username)
            for (let i = 0; i < arr.length; i++) {
                WxParse.wxParse('reply' + i, 'html', arr[i], this);
                if (i === arr.length - 1) {
                    WxParse.wxParseTemArray("replyTemArray", 'reply', arr.length, this)
                }
            }
            // WxParse.wxParse('nickname', 'html', this.data.bloggerItem.nickname, this, 5);
            // WxParse.wxParse('username', 'html', this.data.bloggerItem.username, this, 5);
        }
    },

    /**
     * 组件的方法列表
     */
    methods: {
        focus() {
            app.fn.ajax('POST', {
                sessionrd: app.sessionrd,
                action: 'doFocus',
                user_id: this.data.bloggerItem.id
            }, app.api.user.info, res => {
                // todo
                this.setData({
                    'bloggerItem.is_focus': this.data.bloggerItem.is_focus == 0 ? 1 : 0
                })
            })
            this.triggerEvent('asynData', this.data.bloggerItem)
        },
        
        // 博客详情
        goDetail(e) {
            this.store.data.swiperlist = this.data.bloggerItem.blog_list
            this.store.data.listPostData = null
            this.update()
            wx.navigateTo({
                url: '/pages/detail/detail?id=' + e.currentTarget.dataset.id + '&index=' + e.currentTarget.dataset.index,
            })
        },
        // 博主详情
        goBloggerDetail() {
            wx.navigateTo({
                url: '/pages/bloggerDetail/bloggerDetail?id=' + this.data.bloggerItem.id,
            })
        }
    }
})