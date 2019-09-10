var api = require('./api.js')
const httpUrl = 'https://www.knewdress.com/dear2'
// const httpUrl = 'http://192.168.1.120:8000/dear2'
const httpUrl2 = 'https://www.knewdress.com/shop/'
// const httpUrl = 'http://119.123.77.69:8000/dear2'
var numer = 0
const myFn = {
    ajax: (method, data, api, fn) => {
        if (getCurrentPages().length && getCurrentPages()[0].options && getCurrentPages()[0].options.pid) {
            data.pid = getCurrentPages()[0].options.pid
        }
        numer++
        let num = numer
        let self = this
        wx.request({
            url: httpUrl + api,
            data: data,
            header: {
                'content-type': 'application/x-www-form-urlencoded' // 默认值
            },
            method: method,
            success: function(res) {
                myFn.state(res, fn, num)
            },
            fail(e) {
                myFn.state({
                    data: {
                        code: -200
                    }
                }, fn, num)
            }
        })
    },
    state(res, fn, num) {
        // console.log(res)
        switch (parseInt(res.data.code)) {
            // 成功
            case 200:
                fn(res.data)
                break
            case 99999:
                // wx.showToast({
                //     title: res.data.msg,
                //     icon: 'none'
                // })
                myFn.wxlogin()
                break;
            case 11000:
                fn({
                    msg: res.data.msg,
                    status: 'error'
                })
                break
            default:
                if (num != numer) return
                if (res.statusCode != 200) {
                    wx.hideToast()
                    wx.showToast({
                        title: '网络错误',
                        icon: 'none'
                    })
                    setTimeout(() => {
                        const pages = getCurrentPages()
                        const perpage = pages[pages.length - 1]
                        perpage.onLoad()
                    }, 1500)
                    return false
                }
                wx.hideLoading()
                wx.showToast({
                    title: res.data.msg,
                    icon: 'none'
                })
        }
    },

    http(method, data, url) {
        if (url != '/Api/Login/authlogin') {
            var app  = getApp()
            data.token = app.token
        }
        return new Promise((resolve, reject) => {
            wx.request({
                method,
                data,
                url: httpUrl2 + url,
                header: {
                    'content-type': 'application/x-www-form-urlencoded'
                },
                success(res) {
                    resolve(res.data)
                },
                fail(res) {
                    reject(res.data)
                }
            })
        })
    },

    wxPay(order_id, order_sn) {
        return new Promise((resolve, reject) => {
            myFn.http('POST', {
                order_id,
                order_sn
            }, '/Api/Wxpay/wxpay').then(res => {
                myFn.wxRequestPayment(res.arr)
            })
        }).catch(res => {
            console.log('catch:', res)
        })
    },

    wxRequestPayment(info) {
        return new Promise((resolve, reject) => {
            wx.requestPayment({
                timeStamp: info.timeStamp,
                nonceStr: info.nonceStr,
                package: info.package,
                signType: info.signType,
                paySign: info.paySign,
                success(res) {
                    // TODO 支付成功
                    resolve(res)
                },
                fail(res) {
                    // TODO 支付失败
                    reject(res.errMsg)
                }
            })
        }).catch(res => {
            wx.showToast({
                title: res,
                icon: 'none'
            })
        })
    },

    wxlogin(app) {
        wx.login({
            success: res => {
                // 发送 res.code 到后台换取 openId, sessionKey, unionId
                // 获取用户信息
                if (app) {
                    app.code = res.code
                }
                wx.getSetting({
                    success: result => {
                        if (result.authSetting['scope.userInfo']) {
                            // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
                            wx.getUserInfo({
                                success: response => {
                                    // 可以将 res 发送给后台解码出 unionId
                                    wx.setStorageSync('userInfo', response.userInfo)
                                    myFn.login(res.code, response)
                                },
                                fail: error => {
                                    console.log(error)
                                }
                            })
                        } else {
                            wx.navigateTo({
                                url: '/pages/wxAuth/wxAuth'
                            })
                        }
                    }
                })
            }
        })
    },
    login(code, res) {
        wx.showLoading({
            title: '正在登录...',
        })
        const app = getApp()
        wx.request({
            url: httpUrl + api.wx.login,
            data: {
                code: code,
                rawData: res.rawData,
                signature: res.signature,
                encryptedData: res.encryptedData,
                iv: res.iv
            },
            header: {
                'content-type': 'application/x-www-form-urlencoded' // 默认值
            },
            method: 'POST',
            success: function(result) {
                wx.hideLoading()
                // 存储session3rd
                app.sessionrd = result.data.data.sessionrd
                myFn.shopLogin(result.data.data.sessionrd, res.userInfo.nickName)
                wx.setStorageSync('pageLoading', 1)
                setTimeout(() => {
                    app.getUserInfo()
                }, 100)
                if (app.userInfoReadyCallback) {
                    app.userInfoReadyCallback()
                }
            }
        })
    },

    // 商城模块登录
    shopLogin(sessionrd, nickname) {
        myFn.ajax('POST', { sessionrd }, '/haida/goods/get_code', res => {
            myFn.http('POST', { dcode: res.data.code, nickname }, '/Api/Login/authlogin').then(res => {
                if (res.status == 1) {
                    let app = getApp()
                    app.token = res.arr.token
                    if (app.tokenCallback) {
                        app.tokenCallback()
                    }
                }
            })
        })
    },

    getCurrentTime() {
        let nowDate = new Date()
        let year = nowDate.getFullYear()
        let month = nowDate.getMonth() + 1
        let day = nowDate.getDate()
        let hours = nowDate.getHours()
        let minutes = nowDate.getMinutes()
        let seconds = nowDate.getSeconds()
        return year + '-' + month + '-' + day
    },
    getUrlParams(url, name) {
        let paramsIndex = url.indexOf('?')
        let str = url.substr(paramsIndex)
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i"); // 定义正则表达式 
        var r = str.substr(1).match(reg);
        if (r != null) return unescape(r[2]);
        return null;
    }
}
module.exports = myFn