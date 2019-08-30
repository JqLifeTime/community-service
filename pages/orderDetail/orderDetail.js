var app = getApp();
// pages/order/detail.js
Page({
  data: {
    orderId: 0,
    orderData: {},
    proData: [],
    showLoading: true,
    imgUrl: app.data.imgUrl,
    status: ''
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
  onLoad: function (options) {
    this.setData({
      orderId: options.orderId,
      type: options.type
    })
    this.loadProductDetail();
  },
  // 评论
  comment: function (e) {
    var pid = e.currentTarget.dataset.pid;
    var orderId = this.data.orderId;
    var type0 = this.data.type;
    if (type0 == 3 || type0 == 4) {
      wx.navigateTo({
        url: '../user/comment/comment?pid=' + pid + '&orderId=' + orderId
      })
    }
  },
  loadProductDetail: function () {
    var that = this;
    wx.request({
      url: app.data.hostUrl + 'api/Order/orderList',
      method: 'post',
      data: {
        userId: app.data.userId,
        orderId: that.data.orderId,
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        console.log(res);
        if (res.data.root.length != 0) {
          var pro = res.data.root[0];
          let statu = '';
          let ind = parseInt(pro.orderStatus);
          switch (ind) {
            case 0:
              statu = "待付款";
              break;
            case 10:
              statu = "待提货";
              break;
            case 20:
              statu = "已提货";
          }
          that.setData({
            proData: pro,
            status: statu
          });
        } else {
          wx.showToast({
            title: '请求失败',
            duration: 2000,
            icon: 'none'
          });
        }
      },
      fail: function () {
        // fail
        wx.showToast({
          title: '网络异常！',
          duration: 2000,
          icon: 'none'
        });
      },
      complete: function () {
        that.setData({
          showLoading: false
        })
      }
    });
  },

})