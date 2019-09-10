const apiAddress = {
    wx: {
        login: '/wxch/miniLogin/'
    },
    user: {
        info: '/haida/user/',
        collectTime: '/haida/collectTime/',
        like: '/haida/prefer/'
    },
    face: {
        face: '/haida/face/'
    },
    image: {
        labellist: '/haida/getLabel/',
        comment: '/haida/comment/',
        similar: '/haida/similarInfor/',
        similarBySearch: '/haida/similarBySearch/',
        upload: '/haida/uploadImg/',
        uploadFile: '/haida/image/',
        imgSearch: '/haida/searchByImg/'
    },
    information: {
        list: '/haida/blog/',
        detail: '/haida/blog/',
        collect: '/haida/collect/',
        collectlist: '/haida/collectList/',
        searchcomple: '/haida/searchComple/',
        wardrobe: '/haida/wardrobe/'
    },
    label: {
        list: '/haida/label/',
        isfocus: '/haida/has_focus/',
        focus: '/haida/focus/',
        unfocus: '/haida/focusDel/',
        share: '/haida/addShare/',
        dolabel: '/haida/doLabel/'
    },
    follow: {
        labellist: '/haida/focusList/',
        list: '/haida/focusInforList/'
    },
    log: {
        list: '/haida/searchLog/',
        del: '/haida/delSearchLog/'
    },
    FAQ: {
        list: '/haida/doQuestion/'
    }
}
module.exports = apiAddress