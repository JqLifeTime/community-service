// pages/search/search.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    searchList:[],
    inputVal:'',
    imgurl: app.data.imgUrl
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
     
  },
  /**
   * 获取用户输入搜索内容
   */
  bindInput(e){
    this.setData({
      inputVal: e.detail.value
    })
  },
  /**
   * 点击搜索
   */
  bindtapSeek(){
    let val = this.data.inputVal;
    let shopuserId = wx.getStorageSync("shopUser");
    wx.request({
      url: `${app.data.hostUrl}api/Goods/search`,
      method: 'post',
      data: {
        key: val,
        userId: shopuserId,
        uid: app.data.userId
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success: res => {
        console.log(res);
        if(res.data.status == 1){
          this.setData({
            searchList: res.data.data
          })
        }
      }
    })
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})