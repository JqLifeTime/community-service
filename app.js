//app.js
App({
  data: {
    hostUrl:"https://hohushop.hohu.top/index.php/",
    userId:0,
    config:null,
    imgUrl:"https://hohushop.hohu.top/Data/",
    selfAddressId: 0
  },
  onLaunch: function () {
    var that = this;
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
    
    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        console.log(res);
        wx.request({
          url: that.data.hostUrl +'api/user/login',
          method: 'post',
          data: { code:res.code },
          header: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          success: res=> {
            console.log(res);
            this.data.userId = res.data.data.userId;
            this.data.config = res.data.data.config[0]
            console.log(this.data.userId);
            wx.setNavigationBarTitle({
              title: res.data.data.config[0].title
            })
          },
          fail: function (e) {
            wx.showToast({
              title: '网络异常！',
              duration: 2000,
              icon: 'none'
            });
          },
        })
      }
    })
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo
              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    })
  },
  // 修改用户信息
  change_info(res){
    console.log(res);
    wx.request({
      url: this.data.hostUrl + 'api/user/modify_info',
      method: 'post',
      data: { 
        userId: this.data.userId,
        nickName: res.nickName,
        gender: res.gender,
        avatarUrl: res.avatarUrl
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success: res => {
        console.log(res);
      },
      fail: function (e) {
        wx.showToast({
          title: '网络异常！',
          duration: 2000,
          icon: 'none'
        });
      },
    })
  },
  globalData: {
    userInfo: null,
    orderData:[],
    address:null,
    phone: null,
    shopUserId: null
  }
})