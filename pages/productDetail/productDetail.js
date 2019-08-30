// pages/productDetail/productDetail.js
var app = getApp();
var timers;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    tabIndex:0,   //详情购买用户切换
    swiperIndex:0,
    proDetail:{},   //商品信息
    imglist:[],    //轮播图
    imgUrl:app.data.imgUrl,
    numbers: 1,   //购买商品数量
    buyUserlist: [],   //购买用户列表
    time: ' : : : ',   //倒计时
    nums: 0,
    // 遮罩
    mask: {
      opacity: 0,
      display: 'none'
    },
    //弹窗
    returnDeposit: {
      translateY: 'translateY(1500px)',
      opacity: 1
    },
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options);
    this.setData({
      tabIndex: options.tabindex
    })
    // 获取商品信息
    wx.request({
      url: `${app.data.hostUrl}api/Goods/getGoodsDetails`,
      method: 'post',
      data: { 
        userId: app.data.userId,
        gid: options.proId
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success: res => {
        console.log(res);
        let buyName = res.data.buy_history;
        let nums = 0;
        for (let i = 0; i < buyName.length;i++){
          buyName[i].nickName = buyName[i].nickName.substring(0, 1) + '***' + buyName[i].nickName.substring(buyName.length - 1, buyName.length);
          nums += buyName[i].num*1
        }
        if (res.data.status != 0){
          this.setData({
            proDetail: res.data.proInfo,
            buyUserlist: buyName,
            nums: nums,
            imglist: res.data.proInfo.img_arr,
            content: res.data.proInfo.content.replace(/\<img/gi, '<img style="max-width:100%;vertical-align:top; height:auto" ')
          })
        }else{
          wx.showToast({
            title: res.data.msg,
            icon: "none"
          })
        }
        
        console.log(this.data.proDetail);
      },
      fail: res => {
        wx.showToast({
          title: '网络异常！',
          duration: 2000,
          icon: 'none'
        });
      },
    })
    this.Settime()
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
  // 跳转购物车
  bindcart(){
    wx.switchTab({
      url: '/pages/cart/cart',
    })
  },
  /**
   * table选项卡切换
   */
  tabChange(e){
    console.log(e);
    this.setData({
      tabIndex: e.target.dataset.ind
    })
  },

  /**
   * swiper切换
   */
  swiperChange(e){
    this.setData({
      swiperIndex:e.detail.current
    })
  },
  // 数量加
  bindAdds() {
    if (this.data.numbers < this.data.proDetail.stillBuyNums) {
      this.data.numbers++;
      this.setData({
        numbers: this.data.numbers
      })
    } else {
      wx.showToast({
        title: '每人限购' + this.data.proDetail.stillBuyNums + '件',
        icon: 'none'
      })
    }
  },
  // 数量减
  bindReduce() {
    if (this.data.numbers > 1) {
      this.data.numbers--;
      this.setData({
        numbers: this.data.numbers
      })
    }
  },
  /**
   * 立即购买
   */
  buynow(e){
    console.log(e);
    let formid = e.detail.formId;
    var buynow = [this.cartbefore()];
    console.log(buynow);
    app.globalData.orderData = buynow;
    wx.navigateTo({
      url: '/pages/order/order?type=buynow&formId=' + formid,
    })
  },
  /**
   * 加入购物车
   */
  buycart() {
    let buycart = this.cartbefore();
    console.log(buycart);
    wx.getStorage({
      key: 'cartList',
      success: res => {
        console.log(res);
        let cartlist = res.data ? JSON.parse(res.data) : [];
        console.log(cartlist);
        let xindex = cartlist.findIndex(item => item.goodsId == buycart.goodsId);
        if(xindex == -1){
          cartlist.push(buycart);
          wx.setStorage({
            key: 'cartList',
            data: JSON.stringify(cartlist),
          })
          wx.showToast({
            title: '加入购物车成功',
            icon: 'success'
          })
        }else{
          wx.showToast({
            title: '该商品已在购物车，请勿重复添加！',
            icon:'none'
          })
        }
      },
      fail: res => {
        console.log(res);
        let cartshop = [buycart]
        wx.setStorage({
          key: 'cartList',
          data: JSON.stringify(cartshop),
        })
        wx.showToast({
          title: '加入购物车成功',
          icon: 'success'
        })
      }
    })
  },
  /**
   * 立即购买之前重组数据结构
   */
  // buybefore(){
  //   let prodetail = this.data.proDetail;
  //   return {
  //     proImg: prodetail.photo_d,
  //     proName: prodetail.name,
  //     proNum: 1,
  //     proTime: prodetail.start_time,
  //     proPrice: prodetail.price,
  //     proPrice_yh: prodetail.price_yh,
  //     pro_maxNum: prodetail.stillBuyNums
  //   }
  // },
  // 加入购物车之前重组数据
  cartbefore() {
    let prodetail = this.data.proDetail;
    return {
      shopName: prodetail.name, //店铺名称
      goodsId: prodetail.id, //商品ID
      goodsName: prodetail.name, //商品名字
      goodsImage: prodetail.photo_d, //商品图片
      shopPricebig: prodetail.price,
      shopPrice: prodetail.price_yh, //商品单价
      shopNumber: this.data.numbers, //商品数量
      proTime: prodetail.get_time, // 提货时间
      pro_maxNum: prodetail.stillBuyNums,  //剩余购买量
      goodsStock: prodetail.num,  //库存
    }
  },
  //弹窗显示
  bindtapMasks() {
    let mask = this.data.mask,
      returnDeposit = this.data.returnDeposit;
    mask.display = 'block';
    this.setData({ mask });
    mask.opacity = 1;
    returnDeposit.translateY = 'translateY(0)';
    returnDeposit.opacity = 1;
    this.setData({ mask, returnDeposit });
  },
  //关闭弹窗
  bindtapClose() {
    //弹窗关闭后把模拟的数组重置一下
    this.setData({
      numbers: 1
    });
    let mask = this.data.mask,
      returnDeposit = this.data.returnDeposit;
    mask.opacity = 0;
    returnDeposit.opacity = 0;
    this.setData({ mask, returnDeposit });
    setTimeout(() => {
      mask.display = 'none';
      returnDeposit.translateY = 'translateY(1500px)';
      this.setData({ mask, returnDeposit });
    }, 500);
  },

  // 倒计时
  Settime: function () {
    var that = this;
    var timers;
    // 在手机上显示转换时间格式
    // var enddata = new Date(timezz.replace(/-/g, "/"));
    clearInterval(timers);
    timers = setInterval(clock, 1000);
    function clock() {
      var sj;
      var nowdata = new Date();
      var cha = (Date.parse(that.data.proDetail.end_time.replace(/-/g, "/")) * 1 - Date.parse(nowdata) * 1) / 1000;
      var d = parseInt(cha / 3600 / 24);
      var h = parseInt(cha / 3600 % 24);
      var f = parseInt(cha / 60 % 60);
      var m = parseInt(cha % 60);
      d < 10 ? d = "0" + d : d;
      h < 10 ? h = "0" + h : h;
      f < 10 ? f = "0" + f : f;
      m < 10 ? m = "0" + m : m;
      sj = d + " : " + h + " : " + f + " : " + m ;
      // console.log(sj);
      // sj.replace(/-/g, "/");
      that.setData({
        time: sj
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