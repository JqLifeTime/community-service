// pages/order/order.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isshowbox: false,
    orderList:[],  //订单商品列表
    imgUrl:app.data.imgUrl,
    totalMoney: 0,  //订单总价
    address:null,  //提货地址
    user: '',  //提货人
    phone: null,
    userId: 0,  //用户id
    orderDetail: null,  //生成订单信息
    type: null,  //是购物车购买还是立即购买
    totalNum: 1,
    config: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options);
    var address = wx.getStorageSync("address");
    var phone = wx.getStorageSync("phone");
    this.setData({
      address: address,
      userId: app.data.userId,
      config: app.data.config
    })
    console.log(this.data.address);
    if(options.type == "buynow"){
      this.setData({
        orderList: app.globalData.orderData,
        totalMoney: app.globalData.orderData[0].shopPrice,
        type: options.type,
        totalNum: app.globalData.orderData[0].shopNumber
      })
    }else{
      let ind = 0;
      for (let i = 0; i < app.globalData.orderData.length;i++){
        ind += app.globalData.orderData[i].shopNumber
      }
      this.setData({
        orderList: app.globalData.orderData,
        type: options.type,
        totalNum: ind
      })
    }
    // console.log(this.data.orderList);
    // var goods = this.data.orderList;
    // console.log(goods);

    var goodlist = [];
    for (let i = 0; i < this.data.orderList.length;i++){
      var goods = {
        goodsId: this.data.orderList[i].goodsId,
        num: this.data.orderList[i].shopNumber
      }
      goodlist.push(goods);
    }
    console.log(goodlist);
    // 请求订单
    wx.request({
      url: `${app.data.hostUrl}api/Payment/submitGoodsOrder`,
      method: 'post',
      data: {
        userId: this.data.userId,
        goods: JSON.stringify(goodlist),
        formId: options.formId,
        shareId: this.data.address.userId,
        getTime: this.data.orderList[0].proTime
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success: res => {
        console.log(res);
        this.setData({
          orderDetail: res.data.data,
          user: res.data.data.memberInfo.userName,
          totalMoney: res.data.data.totalMoney
        })
        console.log(this.data.orderDetail);
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
  bindSelf() {
    wx.makePhoneCall({
      phoneNumber: this.data.address.tel,
    })
  },
  bindhohu() {
    wx.makePhoneCall({
      phoneNumber: this.data.config.tel,
    })
  },
  // 展示订单详情
  bindshow(){
    var testtel = /^1[0-9]{10}$/;
    if (this.data.phone == null) {
      wx.showToast({
        title: '请输入您的手机号',
        icon: "none"
      })
      return;
    }
    if (testtel.test(this.data.phone)) {
      
    }else{
      wx.showToast({
        title: '请输入正确的手机号',
        icon: "none"
      })
      return;
    }
    
    this.setData({
      isshowbox: true
    })
  },
  // 隐藏订单详情
  bindhide() {
    this.setData({
      isshowbox: false
    })
  },
  // 修改名字
  bindName(e){
    this.setData({
      user: e.detail.value
    })
  },
  // 修改手机号
  bindTel(e) {
    this.setData({
      phone: e.detail.value
    })
  },
  // 数量加
  bindAdds(){
    let tatmoney = this.data.totalMoney*1;
    if (this.data.orderList[0].shopNumber < this.data.orderList[0].pro_maxNum){
      this.data.orderList[0].shopNumber++;
      tatmoney += this.data.orderList[0].shopPrice*1
      this.setData({
        orderList: this.data.orderList,
        totalMoney: tatmoney
      })
    }else{
      wx.showToast({
        title: '每人限购' + this.data.orderList[0].pro_maxNum +'件',
        icon: 'none'
      })
    }
  },
  // 数量减
  bindReduce() {
    let tatmoney = this.data.totalMoney * 1;
    if (this.data.orderList[0].shopNumber > 1) {
      this.data.orderList[0].shopNumber--;
      tatmoney -= this.data.orderList[0].shopPrice * 1
      this.setData({
        orderList: this.data.orderList,
        totalMoney: tatmoney
      })
    }
  },
  
  // 确认订单

  // 立即支付
  buynow(){
    var that = this;
    wx.showLoading({
      title: '请稍候',
    })
    wx.request({
      url: `${app.data.hostUrl}api/Payment/unifiedorder`,
      method: 'post',
      data: { 
        orderId: this.data.orderDetail.orderId,
        isSelf: 1,
        userName: this.data.user,
        userPhone: this.data.phone,
        address: this.data.orderDetail.shareInfo.address,
        totalMoney: this.data.totalMoney,
        deliverMoney:0,
        voucherId:0,
        reduceMoney:0
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success: res => {
        console.log(res);
        wx.requestPayment({
          timeStamp: res.data.data.payData.timeStamp.toString(),
          nonceStr: res.data.data.payData.nonceStr,
          package: res.data.data.payData.package,
          signType: 'MD5',
          paySign: res.data.data.payData.paySign,
          success(res) {
            if (res.errMsg == 'requestPayment:ok') {
              wx.showToast({
                title: '支付成功！',
                icon: 'success',
                mask: true
              })
              if (that.data.type == 'buycart') {
                // 从购物车缓存取出商品
                wx.getStorage({
                  key: 'cartList',
                  success: res => {
                    console.log(res.data);
                    //缓存里的数组
                    let shops = res.data ? JSON.parse(res.data) : [];
                    console.log(shops);
                    //订单结算的数组
                    let goods = [];
                    for (var i = 0; i < that.data.orderList.length; i++) {
                      goods = goods.concat(that.data.orderList[i]);
                    }
                    console.log(goods);
                    //判断goodsId是否相同 如果相同就删除
                    for (var i = 0; i < shops.length; i++) {
                      for (var k = 0; k < goods.length; k++) {
                        if (shops[i].goodsId == goods[k].goodsId) {
                          shops.splice(i, 1);
                        }
                      }
                    }
                    console.log(shops);
                    wx.setStorage({
                      key: "cartList",
                      data: JSON.stringify(shops)
                    });
                  }
                });
              }
              wx.redirectTo({
                url: '/pages/orderlist/orderlist?currentTab=2&otype=10',
              })
            }else{
              wx.showToast({
                title: '支付失败！',
                icon: 'none',
                mask: true
              })
            }
            
          },
          fail(res) { 
            wx.showToast({
              title: '取消支付！',
              icon: 'none',
            })
            wx.redirectTo({
              url: '/pages/orderlist/orderlist?currentTab=1&otype=0',
            })
          }
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