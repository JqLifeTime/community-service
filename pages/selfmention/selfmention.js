// pages/selfmention/selfmention.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    address: null,
    historyList: []
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
    this.setData({
      address: address
    })
    wx.getStorage({
      key: 'addresslist',
      success: res => {
        console.log(res);
        let addlist = res.data ? JSON.parse(res.data) : [];
        this.setData({
          historyList: addlist
        })
      },
      fail: res => {
        console.log(res);
      }
    })
  },

  // 选择地址
  choseShop(e) {
    console.log(e);
    console.log(app.globalData.address);
    let shopid = wx.getStorageSync("shopUser");
    if (e.currentTarget.dataset.id == shopid){
      wx.showToast({
        title: '选择自提点与当前相同，无须重复选择',
        icon: 'none'
      })
    }else{
      wx.showModal({
        title: '温馨提示',
        content: '您确定要切换自提点吗？',
        success: res => {
          console.log(res);
          if (res.confirm == true) {
            let index = e.currentTarget.dataset.index;
            console.log(this.data.historyList[index]);
            app.data.selfAddressId = this.data.historyList[index].userId;
            wx.setStorageSync("address", this.data.historyList[index]);
            wx.setStorageSync("shopUser", e.currentTarget.dataset.id);
            wx.switchTab({
              url: '/pages/index/index',
              success: function (e) {
                console.log("成功跳转，刷新");
                var page = getCurrentPages();
                console.log(page);
                // if (page[0] == undefined || page[0] == null) return;
                page[0].onLoad();
                page[0].getIndex();
                console.log("成功跳转，刷新");
              }
            })
          }else{
            wx.showToast({
              title: '取消切换！',
              icon: 'none'
            })
          }
        },
        fail: res=>{
          console.log(res);
        }
      })
    }
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