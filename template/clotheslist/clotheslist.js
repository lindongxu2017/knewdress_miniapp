// template/clotheslist/clotheslist.js
const app = getApp()
Component({
    /**
     * 组件的属性列表
     */
    properties: {
        clothesList: {
            type: Array,
            value: [],
            observer (newVal, oldVal, changePath) {
                // console.log(newVal)
                if (typeof newVal == 'object') {
                    let key = 'list['+ this.data.list.length +']'
                    this.setData({
                        [key]: newVal.pop()
                    })
                    this.layout()
                }
            }
        }
    },

    /**
     * 组件的初始数据
     */
    data: {
        list: [],
        windowWidth: 375,
        itemWidth: 165,
        gap: 15,
        boxHeight: 0,
        columnHeight: [0, 0],
        column: 2
    },

    lifetimes: {
        attached() {
            // TODO
            this.setData({
                windowWidth: app.globalData.windowWidth,
                itemWidth: (app.globalData.windowWidth - (this.data.column + 1) * this.data.gap) / this.data.column
            })
        }
    },

    /**
     * 组件的方法列表
     */
    methods: {

        // 找出最小高度所在位置
        indexOfSmallest() {
            let arr = this.data.columnHeight
            var lowest = 0
            for (var i = 1; i < arr.length; i++) {
                if (arr[i] < arr[lowest]) lowest = i
            }
            return lowest
        },

        layout () {
            let arr = this.data.list.slice(0)
            let index = arr.length - 1
            let item = arr[index]
            // console.log(index, item)
            let min_order = this.indexOfSmallest()
            let ket_top = 'list[' + index + '].top'
            let ket_left = 'list[' + index + '].left'
            let ket_height = 'list[' + index + '].showHeight'
            this.setData({
                [ket_top]: this.data.columnHeight[min_order] + this.data.gap,
                [ket_left]: (this.data.itemWidth + this.data.gap) * min_order + this.data.gap,
                [ket_height]: this.data.itemWidth * item.height / item.width
            })
            this.data.columnHeight[min_order] += this.data.itemWidth * item.height / item.width + this.data.gap
            this.setData({
                boxHeight: Math.max(...this.data.columnHeight)
            })
        }
    }
})
