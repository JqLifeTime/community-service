//index.js
//获取应用实例
const app = getApp()
var page = 0;
Page({
  data: {
    userInfo: {},
    hasUserInfo: true,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    iscart: 0,  //是否是可以购买状态
    proNum: 1,
    shopInfo:null,  //头部信息
    shopList:[],  //可以下拉加载的商品列表
    imgUrl:app.data.imgUrl,  //图片路径
    shopMap:[],  //总商列表
    tabList:[],   //table列表
    toView: 0,   //锚链接id
    mapIs: false,   //是否显示跳转地图授权
    buyUserlist: [],   //购买用户数组
    loading: true
  },
  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  /**
   * 监听页面加载
   */
  onLoad: function () {
    page = 0;
    wx.showLoading({
      title: '加载中...',
    })
    // 获取地址缓存
    let address = wx.getStorageSync("address");
    console.log(address);
    if (!address){
      this.choseaddress();
    }
    
    this.getIndex();
  },
  /**
   * 页面显示
   */
  onShow: function(){
    page = 0;
    this.getIndex();
    // this.setData({
    //   shopInfo: this.data.shopInfo,
    //   shopList: this.data.shopList
    // })
    if (app.globalData.userInfo) {
      console.log('已经授权');
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: false
      })
    } else if (this.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: false
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      this.getUI();
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: false
          })
        }
      })
    }
  },
  // 获取首页商品信息
  getIndex(){
    let shopUser = wx.getStorageSync("shopUser") || null;
    wx.showLoading({
      title: '加载中，请稍等...',
    })
    wx.request({
      url: `${app.data.hostUrl}api/Goods/goodsList`,
      method: 'post',
      data: { userId: shopUser },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success: res => {
        console.log(res);
        if (res.data.data.child != null) {
          var shoplist = res.data.data.child[0];
          var biglist = res.data.data.child;
          for (let i = 0; i < biglist.length;i++){
            for (let j = 0; j < biglist[i].goodslist.length;j++){
                if (biglist[i].goodslist[j].buy_history.length > 5) {
                  biglist[i].goodslist[j].buy_history = biglist[i].goodslist[j].buy_history.splice(0, 5);
                }
            }
          }
          console.log(shoplist);
          console.log(biglist);
          this.setData({
            shopInfo: res.data.data.info,
            shopList: [biglist[0]],
            shopMap: biglist
          })
          console.log(this.data.shopList);
        } else {
          this.setData({
            shopInfo: res.data.data.info,
            shopList: [],
            shopMap: [],
            loading: false
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
    // 请求首页table
    wx.request({
      url: `${app.data.hostUrl}api/Shop/sccat`,
      method: 'post',
      data: { userId: shopUser },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success: res => {
        console.log(res);
        this.setData({
          tabList: res.data.data
        })
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
    wx.hideLoading();
    console.log('首页信息');
  },
  // table仿锚链接选择跳转
  bindScroll(e) {
    console.log(e);
    let index = e.currentTarget.dataset.index * 1,
        height = 0;
    for (let i = 0; i < index;i++){
      console.log(this.data.shopMap[i].goodslist.length);
      height += 686 * (this.data.shopMap[i].goodslist.length*1-1) - 300
    }
    console.log(height);
    wx.pageScrollTo({
      scrollTop: height,
      duration: 300
    })
  },
  // 获取用户信息
  getUserInfo: function(e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },
  // 调起地址
  choseaddress() {
    // 点击选择按钮之后打开地图选择地址
    wx.getLocation({
      type: 'wgs84',
      // 如果成功 直接选择地址
      success: res => {
        console.log("如果成功 直接选择地址");
        console.log(res);
        this.chooseAddress();
      },
      // 如果选择失败 打开设置 重新授权
      fail: res => {
        console.log(res);
        //如果选择失败 打开设置 重新授权
        wx.showModal({
          title: '温馨提示',
          content: '小程序需要获取您的位置，用于查找您附近的商家',
          success: res =>{
            wx.openSetting({
              success: res => {
                if (res.authSetting['scope.userLocation']) {
                  this.chooseAddress();
                }
              }
            });
          },
          fail: res=>{
            wx.redirectTo({
              url: '/pages/addAddress/addAddress'
            })
          }
        })
      }
    });
  },

  // 选择地址
  chooseAddress() {
    wx.chooseLocation({
      success: res => {
        console.log(res);
        var addressmap = {
          latitude: res.latitude,
          longitude: res.longitude,
          address: res.address != '' ? res.address : res.name
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
  // 获取用户信息
  getUI: function (e) {
    var that = this;
    if (e.detail.userInfo) {
      var userInfo = e.detail.userInfo;
      this.setData({
        userInfo: userInfo,
        hasUserInfo: false
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
  
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    setTimeout(function(){
      wx.pageScrollTo({
        scrollTop: 0
      })
    },500)
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.onLoad();
    wx.stopPullDownRefresh();
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    page++;
    console.log(page);
    if(page < this.data.shopMap.length){
      let newlist = this.data.shopList.concat(this.data.shopMap[page]);
      this.setData({
        shopList: newlist
      })
    }else{
      this.setData({
        loading: false
      })
    }
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})
