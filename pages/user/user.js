// pages/user/user.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    ewmIsshow: false,
    address:null,
    userInfo: null,
    phone:'',
    config: null
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
    let address = wx.getStorageSync("address");
    let phone = wx.getStorageSync("phone");
    this.setData({
      address: address,
      phone: phone,
      config: app.data.config
    })
    if (app.globalData.userInfo){
      this.setData({
        userInfo: app.globalData.userInfo
      })
    }
  },
  // 显示二维码
  bindEwmshow() {
    this.setData({
      ewmIsshow: true
    })
  },
  // 隐藏二维码
  bindEwm(){
    this.setData({
      ewmIsshow: false
    })
  },
  // 获取用户信息
  getUI: function (e) {
    var that = this;
    if (e.detail.userInfo) {
      var userInfo = e.detail.userInfo;
      this.setData({
        userInfo: userInfo
      })
      console.log(userInfo);
      app.globalData.userInfo = userInfo;
      userInfo.id = that.data.userId;
      var info = {};
      info.avatarUrl = userInfo.avatarUrl;
      info.city = userInfo.city;
      info.nickName = userInfo.nickName;
      info.gender = userInfo.gender;
      app.change_info(info);
    }
  },
  bindSelf(){
    wx.makePhoneCall({
      phoneNumber: this.data.address.tel,
    })
  },
  bindhohu(){
    wx.makePhoneCall({
      phoneNumber: this.data.config.tel,
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