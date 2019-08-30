// pages/nearbyAddress/nearbyAddress.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    address:'',
    shoplist: [],
    imgUrl: app.data.imgUrl
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      address: app.globalData.address.address
    })
    wx.showLoading({
      title: '搜索中，请稍候',
    })
    console.log(app.globalData.address);
    let jingwei = app.globalData.address.latitude + ',' + app.globalData.address.longitude;
    console.log(typeof jingwei)
    console.log(jingwei);
    // 根据经纬度获取附近1500米店铺
    wx.request({
      url: `${app.data.hostUrl}api/common/ext_distance`,
      method: 'post',
      data: {
        start: jingwei,
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success: res => {
        console.log(res);
        if(res.data != null){
          this.setData({
            shoplist: res.data
          })
        }
      },
      fail: res => {
        wx.showToast({
          title: '网络异常！',
          duration: 2000,
          icon: 'none'
        });
      },
      complete: res => {
        wx.hideLoading();
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

  },
  // 选择地址
  choseShop(e){
    console.log(e);
    console.log(app.globalData.address);
    let index = e.currentTarget.dataset.index;
    console.log(this.data.shoplist[index]);
    console.log()
    app.data.selfAddressId = this.data.shoplist[index].userId;
    wx.getStorage({
      key: 'addresslist',
      success: res => {
        console.log(res);
        let addlist = res.data ? JSON.parse(res.data) : [];
        console.log(addlist);
        let isId = addlist.findIndex(item => item.id == this.data.shoplist[index].id);
        if(isId == -1){
          addlist.push(this.data.shoplist[index]);
          wx.setStorage({
            key: 'addresslist',
            data: JSON.stringify(addlist),
          })
        }
      },
      fail: res => {
        console.log(res);
        wx.setStorage({
          key: 'addresslist',
          data: JSON.stringify([this.data.shoplist[index]]),
        })
      }
    })
    wx.setStorageSync("address", this.data.shoplist[index]);
    wx.setStorageSync("shopUser", e.currentTarget.dataset.id);
    wx.switchTab({
      url: '/pages/index/index',
      success: function(e){
        console.log("成功跳转，刷新");
        var page = getCurrentPages();
        console.log(page);
        // if (page[0] == undefined || page[0] == null) return;
        page[0].onLoad();
        page[0].getIndex();
        console.log("成功跳转，刷新");
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