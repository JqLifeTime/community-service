// pages/login/login.js
var app = getApp();
var time;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    phone: '',
    config: {},
    imgUrl: app.data.imgUrl
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.checkSession({
      success: function () {
        //session_key 未过期，并且在本生命周期一直有效
      },
      fail: function () {
        // session_key 已经失效，需要重新执行登录流程
        console.log('失效')
        wx.login() //重新登录
      }
    })
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
    var that = this;
    wx.showLoading({
      title: '加载中...',
    })
    time = setInterval(function(){
      console.log(123);
      if (app.data.config != null){
        that.setData({
          config: app.data.config
        })
        var phone = wx.getStorageSync("phone");
        setTimeout(function () {
          if (phone != "") {
            wx.switchTab({
              url: '/pages/index/index',
            })
          }
        }, 500)
        wx.hideLoading();
      }
    },200)
  },
  // 获取用户手机号
  getPhoneNumber(e) {
    console.log(e);
    console.log(e.detail.errMsg)
    console.log(e.detail.iv)
    console.log(e.detail.encryptedData)
    if (e.detail.errMsg == "getPhoneNumber:ok"){
      wx.request({
        url: app.data.hostUrl + 'api/user/modifyPhone',
        method: 'post',
        data: {
          userId: app.data.userId,
          encryptedData: encodeURIComponent(e.detail.encryptedData),
          iv: encodeURIComponent(e.detail.iv)
        },
        header: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        success: res => {
          console.log(res);
          if(res.data.data.phoneNumber){
            app.globalData.phone = res.data.data.phoneNumber
            wx.setStorageSync("phone", res.data.data.phoneNumber);
          }
        },
        fail: function (e) {
          wx.showToast({
            title: '网络异常！',
            duration: 2000,
            icon: 'none'
          });
        },
      })
      wx.switchTab({
        url: '/pages/index/index',
      })
    }else{
      wx.showToast({
        title: '请您授权登录，以便于后续操作',
        icon: 'none'
      })
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    clearInterval(time);
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    clearInterval(time);
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