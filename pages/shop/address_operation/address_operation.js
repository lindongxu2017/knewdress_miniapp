// pages/address_operation/address_operation.js
const app = getApp()
Page({

    data: {
        type: 1, // 1编辑地址 2添加地址
        checked: false, // 是否默认
        title: '编辑地址',
        addinfo: {
            name: '',
            tel: '',
            sheng: '',
            city: '',
            quyu: '',
            id: 0,
            address: ''
        },
        province: [],
        province_str: '',
        city: [],
        city_str: '',
        area: [],
        area_str: '',
        pvid: 0,
        address_type: 0 // 0获取省份 1获取城市 2获取区域
    },

    onLoad: function(options) {
        if (options.type == 2) {
            this.data.type = 2
            this.setData({
                title: '添加地址',
            })
        }
        if (options.type == 1) {
            if (wx.getStorageSync('editinfo')) {
                let info = wx.getStorageSync('editinfo')
                let address = info.address_xq.split(' ')
                this.setData({
                    addinfo: wx.getStorageSync('editinfo'),
                    province_str: address[0],
                    city_str: address[1],
                    area_str: address[2]
                })
                if (info.is_default == 1) {
                    this.setData({
                        checked: info.is_default
                    })
                }
                this.getProvinceCityArea().then(() => {
                    this.data.address_type = 1
                    this.data.pvid = info.sheng
                    this.getProvinceCityArea().then(() => {
                        this.data.address_type = 2
                        this.data.pvid = info.city
                        this.getProvinceCityArea()
                    })
                })
                wx.removeStorageSync('editinfo')
            }
        } else {
            this.getProvinceCityArea()
        }
        
    },

    onShow: function() {

    },

    onChange(event) {
        this.setData({
            checked: event.detail
        })
    },

    bindPickerChange (e) {
        // console.log(e)
        let type = e.currentTarget.dataset.type
        let value = e.detail.value
        switch (parseInt(type)) {
            case 0:
                this.setData({
                    province_str: this.data.province[value].name
                })
                this.data.addinfo.sheng = this.data.province[value].id
                this.data.pvid = this.data.province[value].id
                this.data.address_type = 1
                this.getProvinceCityArea()
                break
            case 1:
                this.setData({
                    city_str: this.data.city[value].name
                })
                this.data.addinfo.city = this.data.city[value].id
                this.data.pvid = this.data.city[value].id
                this.data.address_type = 2
                this.getProvinceCityArea()
                break
            case 2:
                this.setData({
                    area_str: this.data.area[value].name
                })
                this.data.addinfo.quyu = this.data.area[value].id
                break
        }
    },

    getProvinceCityArea () {
        return new Promise((resolve, reject) => {
            let data = {
                pvid: this.data.pvid
            }
            app.fn.http('POST', data, '/Api/Address/get_province').then(res => {
                if (this.data.address_type == 0) {
                    this.setData({
                        province: res.list
                    })
                } else if (this.data.address_type == 1) {
                    this.setData({
                        city: res.list
                    })
                } else {
                    this.setData({
                        area: res.list
                    })
                }
                resolve()
            })
        })
    },

    inputField (e) {
        let key = e.currentTarget.dataset.key
        this.setData({
            [key]: e.detail
        })
    },

    save () {
        let data = {
            sheng: this.data.addinfo.sheng,
            city: this.data.addinfo.city,
            quyu: this.data.addinfo.quyu,
            receiver: this.data.addinfo.name,
            tel: this.data.addinfo.tel,
            adds: this.data.addinfo.address,
            id: this.data.addinfo.id
        }
        if (this.data.checked) {
            data.is_default = 1
        }
        let api = '/Api/Address/edit_adds'
        if (this.data.type == 2) {
            api = '/Api/Address/add_adds'
            wx.setStorageSync('address_add', 1)
        }
        app.fn.http('POST', data, api).then(res => {
            // console.log(res)
            wx.navigateBack()
            wx.setStorageSync('address_operation', 1)
        })
        
    }
})