// pages/setFavorite/setFavorite.js
const app = getApp()
Page({

    // 页面的初始数据
    data: {
        sex: [{ name: '女生', active: 0, value: 2 }, { name: '男生', active: 0, value: 1 }],
        year: [{ name: '不限', active: 0, value: 1 }, { name: '两年内', active: 0, value: 2 }],
        ethnic: [{ name: '亚洲', active: 0, value: 'ASIAN' }, { name: '欧美', active: 0, value: 'WHITE' }, { name: '非洲', active: 0, value: 'BLACK' }, { name: '印度', active: 0, value: 'INDIA' }],
        postData: {},
        imgUrl: '',
        multipleClick: false
    },

    // 生命周期函数--监听页面加载
    onLoad: function(options) {
        if (wx.getStorageSync('imgAnalysisResult')) {
            let storageData = wx.getStorageSync('imgAnalysisResult')
            this.reset()
            this.autoScreen(storageData)
            wx.removeStorageSync('imgAnalysisResult')
            return
        }
        if (app.sessionrd) {
            this.getFavoriteInfo()
        } else {
            app.userInfoReadyCallback = res => {
                this.getFavoriteInfo()
            }
        }
    },

    // 生命周期函数--监听页面显示
    onShow: function() {

    },

    getFavoriteInfo() {
        app.fn.ajax('POST', {
            sessionrd: app.sessionrd,
            action: 'myPrefer'
        }, app.api.user.like, res => {
            // console.log(res)
            this.reset()
            this.autoScreen(res)
            let newObject = {
                year_type: res.data.year_type,
                gender: res.data.gender,
                ethnicity: res.data.ethnicity
            }
            this.data.postData = Object.assign({}, this.data.postData, newObject)
        })
    },

    reset() {
        this.data.sex.map((item, index) => {
            let key = 'sex[' + index + '].active'
            this.setData({
                [key]: 0
            })
        })
        this.data.ethnic.map((item, index) => {
            let key = 'ethnic[' + index + '].active'
            this.setData({
                [key]: 0
            })
        })
        this.data.year.map((item, index) => {
            let key = 'year[' + index + '].active'
            this.setData({
                [key]: 0
            })
        })
    },

    autoScreen(res) {

        if (res.data && typeof res.data.year_type === 'number') {
            this.data.year.map((item, index) => {
                if (item.value == res.data.year_type) {
                    let key = 'year[' + index + '].active'
                    this.setData({
                        [key]: 1
                    })
                }
            })
        }

        if (res.data && res.data.ethnicity.length) {
            res.data.ethnicity.map((item, index) => {
                this.data.ethnic.map((obj, order) => {
                    if (item == obj.value) {
                        let key = 'ethnic[' + order + '].active'
                        this.setData({
                            [key]: 1
                        })
                    }
                })
            })
        }

        if (res.data && res.data.gender) {
            this.data.sex.map((item, index) => {
                if (item.value == res.data.gender) {
                    let key = 'sex[' + index + '].active'
                    this.setData({
                        [key]: 1
                    })
                }
            })
            if (res.data.gender == 3) {
                this.data.sex.map((item, index) => {
                    let key = 'sex[' + index + '].active'
                    this.setData({
                        [key]: 1
                    })
                })
            }
        }

        this.data.postData = {
            sessionrd: app.sessionrd,
            action: 'modifyPrefer',
            ethnicity: this.data.postData.ethnicity ? this.data.postData.ethnicity : res.data.ethnicity.join(','),
            gender: this.data.postData.gender ? this.data.postData.gender : res.data.gender,
            year_type: this.data.postData.year_type ? this.data.postData.year_type : res.data.year_type
        }
    },

    screen(e) {
        let type = e.currentTarget.dataset.type
        let index = e.currentTarget.dataset.index
        let currentActive = 0
        let currentName = ''
        switch (type) {
            case 'sex':
                currentActive = this.data.sex[index].active
                break
            case 'year':
                currentActive = this.data.year[index].active
                break
            case 'ethnic':
                currentActive = this.data.ethnic[index].active
                break
        }
        let key = type + '[' + index + '].active'
        this.setData({
            [key]: currentActive == 0 ? 1 : 0
        })
        if (type == 'year') {
            if (index == 0 && currentActive == 0) {
                let key = 'year[1].active'
                this.setData({
                    [key]: 0
                })
            }
            if (index == 1 && currentActive == 0) {
                let key = 'year[0].active'
                this.setData({
                    [key]: 0
                })
            }
        }
        // this.isSelectAll(type, index)
    },

    // 全选
    isSelectAll(type, index) {
        // POST
        let data_gender = ''
        let data_ethnicity = []
        let data_year_list = []

        let sex_num = 0
        this.data.sex.map((item, index) => {
            if (item.active) {
                data_gender = item.value
                sex_num++
            }
        })
        if (sex_num == 2) {
            data_gender = 3
        }

        this.data.year.map((item, index) => {
            if (item.active) {
                data_year_list.push(item.value)
            }
        })

        this.data.ethnic.map((item, index) => {
            if (item.active) {
                data_ethnicity.push(item.value)
            }
        })


        // 赋值

        this.data.postData.ethnicity = data_ethnicity.join(',')
        this.data.postData.gender = data_gender
        this.data.postData.year_type = data_year_list.join(',')

    },

    confirm() {
        this.isSelectAll()
        if (this.data.multipleClick) return
        this.data.multipleClick = true
        wx.showLoading({
            title: '正在推荐'
        })
        // console.log(this.data.postData)
        app.fn.ajax('POST', this.data.postData, app.api.user.like, res => {
            // todo
            wx.setStorageSync('reset', 1)
            wx.hideLoading()
            wx.switchTab({
                url: '/pages/index/index',
            })
            this.data.multipleClick = false
        })
    }

})