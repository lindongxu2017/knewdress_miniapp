// template/popupFolder/popupFolder.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    popupVisible: {
      type: Boolean,
      value: false
    },
    defaultValue: {
      type: String,
      value: '',
      observer: function (newVal, olVal, changedPath) {
        this.setData({
          inputValue: newVal
        })
      }
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    inputValue: ''
  },

  /**
   * 组件的方法列表
   */
  methods: {
    closeFolder () {
      this.setData({ popupVisible: false })
    },
    confirm () {
      if (this.data.inputValue == '') {
        return
      }
      this.triggerEvent('formComfirm', this.data.inputValue)
      this.setData({ 
        popupVisible: false,
        inputValue: ''
      })
    },
    inputPrint (e) {
      // console.log(e.detail.value)
      this.setData({ inputValue: e.detail.value })
    }
  }
})
