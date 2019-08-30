// pages/cart/cart.js
var app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    cartList: [],
    baseUrl: app.data.imgUrl, //图片地址
    alls: false,
    totalMoney: 0
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
    this.setData({
      alls: false,
      totalMoney: 0
    })
    var that = this;
    wx.getStorage({
      key: 'cartList',
      success: function (res) {
        console.log(res);
        console.log(JSON.parse(res.data));
        let lists = res.data ? JSON.parse(res.data) : [];
        lists.map(item => {
          let demo = item;
          demo.temp = false;
          demo.temps = false;
          return demo;
        })
        console.log(lists);
        that.setData({
          cartList: lists
        })
        console.log(that.data.cartList);
        wx.setStorage({
          key: 'cartList',
          data: res.data,
        })
      },
    })
  },

  /**
   * 
   */
  // 选择商品
  bindChose(e) {
    // var that = this;
    console.log(e);
    let index = e.currentTarget.dataset.index * 1;
    console.log(index);
    let lists1 = this.data.cartList;
    console.log(lists1);
    lists1[index].temp = !lists1[index].temp;
    let money = 0;
    // 判断商品是否全选，全部选中全选按钮为true
    var flag = lists1.findIndex(item => item.temp == false);
    console.log(flag);
    if (flag == -1) {
      this.setData({
        alls: true
      })
    } else {
      this.setData({
        alls: false
      })
    }
    // 过滤属性filter，过滤出来temp为true的数组，也就是选中的商品，计算价格
    let demolist = lists1.filter(res => res.temp == true);
    console.log(demolist);
    for (let i = 0; i < demolist.length; i++) {
      money += demolist[i].shopNumber * 1 * demolist[i].shopPrice * 1
    }
    this.setData({
      cartList: lists1,
      totalMoney: money
    })
  },
  /**
   * 商品加
   */
  bindAdd(e) {
    // 获取data中商品数组cartList以及点击的商品的index
    let lists2 = this.data.cartList,
      flag1 = e.target.dataset.index;
    // 定义总钱数获取data里面money进行加减操作
    let money = this.data.totalMoney;
    if (lists2[flag1].shopNumber * 1 < lists2[flag1].goodsStock * 1 ) {
      if (lists2[flag1].shopNumber * 1 < lists2[flag1].pro_maxNum * 1){
        lists2[flag1].shopNumber++;
        // 如果选中商品点击加号temp为true就把价格加上去
        if (lists2[flag1].temp == true) {
          money += lists2[flag1].shopPrice * 1;
        }
      }else{
        wx.showToast({
          title: '每人限购' + lists2[flag1].pro_maxNum +'件',
          icon: 'none'
        })
      }
    }else{
      wx.showToast({
        title: '库存不足！',
        icon: 'none'
      })
    }
    this.setData({ cartList: lists2, totalMoney: money })
  },
  /**
   * 商品减
   */
  bindReduce(e) {
    let lists3 = this.data.cartList,
      flag1 = e.target.dataset.index,
      money = this.data.totalMoney;
    if (lists3[flag1].shopNumber > 1) {
      lists3[flag1].shopNumber--;
      // 如果选中商品点击加号temp为true就把价格减下去
      if (lists3[flag1].temp == true) {
        money -= lists3[flag1].shopPrice * 1;
      }
    }
    this.setData({ cartList: lists3, totalMoney: money });
  },
  // 全选按钮
  bindall() {
    this.data.alls = !this.data.alls;
    let demolist = this.data.cartList;
    // 如果全不选变为全选
    // 判断是否全选，反之全不选返回-1，无法判断是否选中其中一个
    let flag2 = demolist.findIndex(item => item.temp == true);  
    let ind = 0;  //如果商品状态为true，ind+1
    let isall = false;  //是否所有商品状态都为选中，默认不选中
    for (let i = 0; i < demolist.length;i++){
      if (demolist[i].temp == true) ind++;
    }
    if (ind == demolist.length){
      // 如果遍历所有商品都为true，改变isall
      isall = true
    }
    // 如果遍历其中有等于true的就
    let money = 0;
    console.log(flag2);
    if (flag2 == -1) {
      demolist.map(item => {
        let res = item;
        res.temp = true;
        return res;
      })
    } else {
      if (isall){
        demolist.map(item => {
          let res = item;
          res.temp = false;
          return res;
        })
      }else{
        demolist.map(item => {
          let res = item;
          res.temp = true;
          return res;
        })
      }
      
    }
    console.log(demolist);
    let filterlist = demolist.filter(item => item.temp == true);
    console.log(filterlist);
    for (let i = 0; i < filterlist.length; i++) {
      money += filterlist[i].shopNumber * 1 * filterlist[i].shopPrice * 1;
    }
    this.setData({
      alls: this.data.alls,
      totalMoney: money,
      cartList: demolist
    })
  },
  // 删除商品
  bindDelete(){
    let dellist = this.data.cartList;
    let delindex = dellist.findIndex(item => item.temp == true);
    console.log(delindex);
    if(delindex == -1){
      wx.showToast({
        title: '请选择要删除的商品',
        icon: 'none'
      })
    }else{
      wx.showModal({
        title: '温馨提示',
        content: '您确定要删除吗？',
        success: res =>{
          for(var i = 0;i<dellist.length;i++){
            if(dellist[i].temp == true){
              dellist.splice(i,1);
              i--;
            }
          }
          console.log(dellist);
          this.setData({
            cartList: dellist
          })
          wx.setStorage({
            key: 'cartList',
            data: JSON.stringify(dellist),
          })
        }
      })
    }
  },
  // 购物车结算
  bucart(e){
    console.log(e);
    let list = this.data.cartList,
      formid = e.detail.formId;
    //判断是否选择商品
    let listIndex = list.findIndex(item=> item.temp == true);
    console.log(listIndex);
    if (listIndex == -1) {
      wx.showToast({
        title: '请选择商品',
        icon: 'none',
        duration: 1500
      });
    } else {
      //把选中的商品提取出来
      let lists = [];
      for (var i = 0; i < list.length; i++) {
        if (list[i].temp == true) {
          lists = lists.concat(list[i]);
        }
      }
      console.log(lists);
      app.globalData.orderData = lists;
      wx.navigateTo({
        url: '/pages/order/order?type=buycart&formId=' + formid
      });
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