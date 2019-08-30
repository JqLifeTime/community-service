// pages/addAddress/addAddress.js
let address = '',
  name, phone, addressContent, latitude, longitude,
  title = '添加';
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    shoplist:[],
    inputval:'',
    imgUrl: app.data.imgUrl
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
  // 监听input
  bindInput(e){
    this.setData({
      inputval: e.detail.value
    })
  },
  // 点击搜索
  bindSearch(){
    wx.showLoading({
      title: '搜索中，请稍候',
    })
    let val = this.data.inputval;
    if(val){
      wx.request({
        url: `${app.data.hostUrl}api/Shop/index`,
        method: 'post',
        data: {
          key: val,
        },
        header: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        success: res => {
          console.log(res);
          if (res.data.data.root.length != 0) {
            this.setData({
              shoplist: res.data.data.root
            })
          } else {
            this.setData({
              shoplist: []
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
    }else{
      wx.showToast({
        title: '请输入您要查询的地址',
        icon: 'none'
      })
    }
  },
  // 选择地址
  choseShop(e) {
    console.log(e);
    console.log(app.globalData.address);
    let index = e.currentTarget.dataset.index;
    console.log(this.data.shoplist[index]);
    wx.getStorage({
      key: 'addresslist',
      success: res => {
        console.log(res);
        let addlist = res.data ? JSON.parse(res.data) : [];
        console.log(addlist);
        let isId = addlist.findIndex(item => item.id == this.data.shoplist[index].id);
        if (isId == -1) {
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
      success: function (e) {
        var page = getCurrentPages().pop();
        if (page == undefined || page == null) return;
        page.onLoad();
      }
    })
  },

  // 调起地址
  choseaddress(){
    // 点击选择按钮之后打开地图选择地址
    wx.getLocation({
      type: 'wgs84',
      // 如果成功 直接选择地址
      success: res => {
        this.chooseAddress();
      },
      // 如果选择失败 打开设置 重新授权
      fail: res => {
        wx.openSetting({
          success: res => {
            if (res.authSetting['scope.userLocation']) {
              this.chooseAddress();
            }
          }
        });
      }
    });
  },
  
  // 选择地址
  chooseAddress(){
    wx.chooseLocation({
      success: res => {
        console.log(res);
        var addressmap = {
          latitude:res.latitude,
          longitude:res.longitude,
          address:res.address != '' ? res.address : res.name
        }
        console.log(addressmap);
        app.globalData.address = addressmap;
        wx.navigateTo({
          url: '/pages/nearbyAddress/nearbyAddress',
        })
        // this.setData({
        //   address: address
        // });
      }
    });
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