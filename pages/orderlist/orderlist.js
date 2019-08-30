// pages/user/dingdan.js
//index.js  
//获取应用实例  
var app = getApp();
var timer;
// var common = require("../../utils/common.js");
Page({
  data: {
    height: 0,
    winWidth: 0,
    winHeight: 0,
    // tab切换  
    currentTab: 0,
    isStatus: 'pay',//10待付款，20待发货，30待收货 40、50已完成
    page: [1, 1, 1, 1],
    refundpage: 0,
    orderList0: [],
    orderList1: [],
    orderList2: [],
    orderList3: [],
    orderList4: [],
    showLoading: true,
    isHideLoadMore: [true, true, true, true, true],
    control: [true, true, true, true, true],
    loadingval: ['正在加载', '正在加载', '正在加载', '正在加载', '正在加载',],
    runid: 0,   //运动id
    imgUrl: app.data.imgUrl,
    tel1: null
  },
  // 分享
  onShareAppMessage: function () {
    return {
      title: app.data.shopNmae,
      path: '/pages/index/index?scene=' + app.data.userId
    }
  },
  onLoad: function (options) {
    console.log(options)
    this.initSystemInfo();
    this.setData({
      currentTab: parseInt(options.currentTab)
    });
    if (options.otype != '') {
      this.setData({
        isStatus: parseInt(options.otype)
      });
    }else{
      this.setData({
        isStatus: ""
      });
    }
    if (this.data.currentTab == 4) {
      this.loadReturnOrderList();
    } else {
      this.loadOrderList();
    }
  },

  onReachBottom: function () {
    var that = this;
    var isHideLoadMore = this.data.isHideLoadMore;
    var currentTab = this.data.currentTab;
    isHideLoadMore[currentTab] = false;
    this.setData({
      isHideLoadMore: isHideLoadMore
    });

    var control = this.data.control[currentTab];
    if (control) {
      if (timer) {
        clearTimeout(timer);
      }
      timer = setTimeout(() => {
        that.loadOrderList();
      }, 2000)
    }
  },

  getOrderStatus: function () {
    return this.data.currentTab == 0 ? 1 : this.data.currentTab == 2 ? 2 : this.data.currentTab == 3 ? 3 : 0;
  },

  //取消订单
  removeOrder: function (e) {
    var that = this;
    console.log(e);
    var orderId = e.currentTarget.dataset.orderid;
    var index = e.currentTarget.dataset.index;
    var runid = this.data.runid;
    if (runid != orderId) {
      wx.showModal({
        title: '提示',
        content: '你确定要取消订单吗？',
        success: function (res) {
          res.confirm && wx.request({
            url: app.data.hostUrl + 'api/Payment/orderClose',
            method: 'post',
            data: {
              userId: app.data.userId,
              orderId: orderId,
            },
            header: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            success: function (res) {
              //--init data
                console.log(res);
                if(res.data.status == 1){
                  wx.showToast({
                    title: res.data.msg,
                    duration: 2000
                  });
                  var currentTab = that.data.currentTab;
                  // var pages = that.data.page;
                  // pages[currentTab] = 0;
                  if (currentTab == 0){
                    var orderList0 = that.data.orderList0;
                    orderList0.splice(index, 1);
                    setTimeout(() => {
                      that.setData({
                        orderList0: orderList0
                      })
                    }, 1000)
                  }else{
                    var orderList1 = that.data.orderList1;
                    orderList1.splice(index, 1);
                    setTimeout(() => {
                      that.setData({
                        orderList1: orderList1
                      })
                    }, 1000)
                  }
                }else{
                  wx.showToast({
                    title: res.data.msg,
                    duration: 2000
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
            }
          });

        }
      });
    }

  },

  //确认收货
  recOrder: function (e) {
    var that = this;
    var orderId = e.currentTarget.dataset.orderId;
    wx.showModal({
      title: '提示',
      content: '你确定已收到宝贝吗？',
      success: function (res) {
        res.confirm && wx.request({
          url: app.data.hostUrl + 'api/Order/orderConf',
          method: 'post',
          data: {
            id: orderId,
            type: 'receive',
          },
          header: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          success: function (res) {
            //--init data
            var status = res.data.status;
            if (status == 1) {
              wx.showToast({
                title: '操作成功！',
                duration: 2000
              });
              var currentTab = that.data.currentTab;
              var pages = that.data.page;
              pages[currentTab] = 0;
              that.loadOrderList(0);
            } else {
              wx.showToast({
                title: res.data.err,
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
          }
        });

      }
    });
  },
  // 请求普通订单数据
  loadOrderList: function (page) {
    var currentTab = this.data.currentTab;
    var clear = false;
    if (page == 0) {
      var page = page;
      clear = true;
    } else {
      var page = this.data.page[currentTab];
    }
    //console.log(page)
    var that = this;
    wx.request({
      url: app.data.hostUrl + 'api/Order/orderList',
      method: 'post',
      data: {
        userId: app.data.userId,
        status: that.data.isStatus,
        page: page,
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        //--init data     
        console.log(res)
        console.log(app.data.userId);
        console.log(that.data.isStatus);
        console.log(page);
        page++;
        var status = res.data.status;
        var list = res.data.root;
        var len0 = list.length;
        var isHideLoadMore = that.data.isHideLoadMore;
        var control = that.data.control;
        var loadingval = that.data.loadingval;
        if (len0 == 0) {
          isHideLoadMore[currentTab] = false;
          control[currentTab] = false;
          loadingval[currentTab] = '亲，我们是有底线的';
          that.setData({
            isHideLoadMore: isHideLoadMore,
            control: control,
            loadingval: loadingval
          })
        } else {
          if (len0 < 7) {
            isHideLoadMore[currentTab] = false;
            control[currentTab] = false;
            loadingval[currentTab] = '亲，我们是有底线的';
            that.setData({
              isHideLoadMore: isHideLoadMore,
              control: control,
              loadingval: loadingval
            })
          } else {
            isHideLoadMore[currentTab] = true;
            that.setData({
              isHideLoadMore: isHideLoadMore,
            })
          }

          var pages = that.data.page;
          pages[currentTab] = page;
          console.log(pages)
          if (currentTab == 0) {
            if (clear) {
              var list0 = [];
            } else {
              var list0 = that.data.orderList0;
            }
            console.log(clear)
            console.log(list0)
            var total_list = list0.concat(list);
            that.setData({
              orderList0: total_list
            });
            console.log(that.data.orderList0)
          } else if (currentTab == 1) {
            if (clear) {
              var list1 = [];
            } else {
              var list1 = that.data.orderList1;
            }
            var total_list = list1.concat(list);
            that.setData({
              orderList1: total_list
            });
            console.log(that.data.orderList1)
          } else if (currentTab == 2) {
            if (clear) {
              var list2 = [];
            } else {
              var list2 = that.data.orderList2;
            }
            var total_list = list2.concat(list);
            that.setData({
              orderList2: total_list
            });
            console.log('待提货');
            console.log(that.data.orderList2);
          } else if (currentTab == 3) {
            if (clear) {
              var list3 = [];
            } else {
              var list3 = that.data.orderList3;
            }
            var total_list = list3.concat(list);
            that.setData({
              orderList3: total_list
            });
          }

          var len = total_list.length;
          that.setData({
            winHeight: 567 * len + 80,
            page: pages
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
  // 请求退款订单数据
  // loadReturnOrderList: function () {
  //   var that = this;
  //   console.log(app.data.userId)
  //   wx.request({
  //     url: app.data.hostUrl + '/Api/Order/order_refund',
  //     method: 'post',
  //     data: {
  //       uid: app.data.userId,
  //       page: that.data.page[4],
  //     },
  //     header: {
  //       'Content-Type': 'application/x-www-form-urlencoded'
  //     },
  //     success: function (res) {   
  //       var data = res.data.ord;
  //       var status = res.data.status;
  //       var list = that.data.orderList4;
  //       if (status == 1) {
  //         var len0 = data.length;
  //         var isHideLoadMore = that.data.isHideLoadMore;
  //         var control = that.data.control;
  //         var loadingval = that.data.loadingval;
  //         if (len0 == 0) {
  //           isHideLoadMore[4] = false;
  //           control[4] = false;
  //           loadingval[4] = '亲，我们是有底线的';
  //           that.setData({
  //             isHideLoadMore: isHideLoadMore,
  //             control: control,
  //             loadingval: loadingval
  //           })
  //         } else {
  //           if (len0 < 7) {
  //             isHideLoadMore[4] = false;
  //             control[4] = false;
  //             loadingval[4] = '亲，我们是有底线的';
  //             that.setData({
  //               isHideLoadMore: isHideLoadMore,
  //               control: control,
  //               loadingval: loadingval
  //             })
  //           }
  //           var pages = that.data.page;
  //           pages[4] = pages[4] + 1;
  //           list = that.data.orderList4.concat(data);
  //           var len = list.length;
  //           that.setData({
  //             winHeight: 567 * len + 80,
  //             page: pages
  //           });
  //           that.setData({
  //             orderList4: list,
  //           });
  //         }
  //       } else {
  //         wx.showToast({
  //           title: res.data.err,
  //           duration: 2000,
  //           icon: 'none'
  //         });
  //       }

  //     },
  //     fail: function () {
  //       // fail
  //       wx.showToast({
  //         title: '网络异常！',
  //         duration: 2000,
  //         icon: 'none'
  //       });
  //     },
  //     complete: function () {
  //       that.setData({
  //         showLoading: false
  //       })
  //     }
  //   });
  // },

  // returnProduct:function(){
  // },
  initSystemInfo: function () {
    var that = this;

    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          winWidth: res.windowWidth,
          //winHeight: res.windowHeight  
        });
      }
    });
  },
  bindChange: function (e) {
    var that = this;
    that.setData({ currentTab: e.detail.current });
  },
  swichNav: function (e) {
    console.log(e);
    var that = this;
    if (that.data.currentTab === e.target.dataset.current) {
      return false;
    } else {
      var current = e.target.dataset.current;
      // 判断是否点击了全部，全部订单status为''
      if (e.target.dataset.otype != ''){
        that.setData({
          currentTab: parseInt(current),
          isStatus: parseInt(e.target.dataset.otype),
        });
      }else{
        that.setData({
          currentTab: parseInt(current),
          isStatus: '',
        });
      }
      var currentTab = that.data.currentTab;
      console.log("123231");
      console.log(currentTab);
      var control = this.data.control[currentTab];
      var lens;
      if (currentTab == 4) {
        if (control) {
          that.loadReturnOrderList();
        }
      } else {
        if (control) {
          that.loadOrderList();
        } else {

        }
      }
    }
  },
  // 确认付款
  payOrderByWechat: function (e) {
    var order_id = e.currentTarget.dataset.orderid,
      userName = e.currentTarget.dataset.name,
      userPhone = e.currentTarget.dataset.tel,
      address = e.currentTarget.dataset.add,
      totalMoney = e.currentTarget.dataset.total;
    wx.showLoading({
      title: '加载中',
    })
    wx.request({
      url: app.data.hostUrl + 'api/Payment/unifiedorder',
      data: {
        orderId: order_id,
        isSelf: 1,
        userName: userName,
        userPhone: userPhone,
        address: address,
        totalMoney: totalMoney,
        deliverMoney: 0,
        voucherId: 0,
        reduceMoney: 0
      },
      method: 'POST', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }, // 设置请求的 header
      success: function (res) {
        console.log(res);
        wx.hideLoading();
        if (res.data.status == 1) {
          var order = res.data.data.payData;
          wx.requestPayment({
            timeStamp: JSON.stringify(order.timeStamp),
            nonceStr: order.nonceStr,
            package: order.package,
            signType: 'MD5',
            paySign: order.paySign,
            success: function (res) {
              wx.showToast({
                title: "支付成功!",
                duration: 2000,
              });
              setTimeout(function () {
                wx.navigateTo({
                  url: '/pages/orderlist/orderlist?currentTab=2&otype=10',
                });
              }, 2000);
            },
            fail: function (res) {
              wx.showToast({
                title: '取消支付！',
                duration: 3000,
                icon: 'none'
              })
            }
          })
        } else {
          wx.showToast({
            title: res.data.data.msg,
            duration: 2000,
            icon: 'none'
          });
        }
      },
      fail: function (e) {
        // fail
        wx.showToast({
          title: '网络异常！',
          duration: 2000,
          icon: 'none'
        });
      }
    })
  }
})