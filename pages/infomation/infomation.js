// pages/infomation/infomation.js
const app = getApp()
Page({

    data: {
        userinfo: {
            height: '',
            weight: '',
            sex: '', // 性别 (1男 2女)
            biography: '',
            age: '',
            city: ''
        },
        array: [{
                name: '男',
                value: 1
            },
            {
                name: '女',
                value: 2
            },
        ],
        sex_str: ''
    },

    onLoad: function(options) {
        this.getUserInfo()
    },

    onShow: function() {

    },

    bindPickerChange(e) {
        // console.log(e)
        let index = e.detail.value
        this.setData({
            sex_str: this.data.array[index].name,
            'userinfo.sex': this.data.array[index].value
        })
    },

    input (e) {
        let key = e.currentTarget.dataset.key
        let value = e.detail
        // console.log(key, value)
        this.setData({
            [key]: value
        })
    },

    save() {
        if (this.data.userinfo.height == '') {
            wx.showToast({
                title: '身高不能为空',
                icon: 'none'
            })
            return
        }
        if (this.data.userinfo.weight == '') {
            wx.showToast({
                title: '体重不能为空',
                icon: 'none'
            })
            return
        }
        if (this.data.userinfo.sex == '') {
            wx.showToast({
                title: '请选择性别',
                icon: 'none'
            })
            return
        }
        if (this.data.userinfo.biography == '') {
            wx.showToast({
                title: '个人简介不能为空',
                icon: 'none'
            })
            return
        }
        this.data.userinfo.sessionrd = app.sessionrd
        this.data.userinfo.action = 'setUserInfo'
        app.fn.ajax('POST', this.data.userinfo, '/haida/user/', res => {
            // todo
            wx.showToast({
                title: '设置成功',
                icon: 'none'
            })
            setTimeout(() => {
                wx.navigateBack()
            }, 1000)
        })
    },

    getUserInfo () {
        app.getUserInfo(res => {
            this.setData({
                'userinfo.height': res.data.height,
                'userinfo.weight': res.data.weight,
                'userinfo.sex': res.data.sex,
                'userinfo.biography': res.data.biography,
                'userinfo.city': res.data.city,
                'userinfo.age': res.data.age,
                sex_str: res.data.sex == 1 ? '男' : '女'
            })
        })
    },

    // userinfo: {
    //     height: '',
    //     weight: '',
    //     sex: '', // 性别 (1男 2女)
    //     biography: ''
    // },

    onHide: function() {

    }
})