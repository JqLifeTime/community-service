// pages/user/comment/comment.js
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    val: ''
  },
  onLoad(option) {
    var pid = option.pid;
    var orderId = option.orderId;
    this.setData({
      pid: pid,
      orderId: orderId
    })
  },
  send: function () {
    var value = this.data.val;
    var that = this;
    var userId = wx.getStorageSync('userId');
    wx.request({
      url: app.data.ceshiUrl + '/api/order/addMessage',
      method: 'post',
      data: {
        pid: that.data.pid,
        orderId: that.data.orderId,
        uid: userId,
        content: value,
        pingfen: 5
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        //--init data        
        var status = res.data.status;
        if (status == 1) {
          wx.showToast({
            title: res.data.msg,
            duration: 2000,
            icon: 'none'
          });
          setTimeout(function () {
            wx.navigateTo({
              url: '../dingdan?currentTab=0'
            })
          }, 1000)
        } else {
          wx.showToast({
            title: '非法操作.',
            duration: 2000,
            icon: 'none'
          });
        }
      },
      fail: function (e) {
        wx.showToast({
          title: '网络异常！',
          duration: 2000,
          icon: 'none'
        });
      }
    });
  },
  remarkInput: function (e) {
    this.setData({
      val: e.detail.value
    })
  },
  // 分享
  onShareAppMessage: function () {
    return {
      title: app.data.shopNmae,
      path: '/pages/index/index?scene=' + app.data.userId,
      success: function (res) {
        // 分享成功
      },
      fail: function (res) {
        // 分享失败
      }
    }
  },
})