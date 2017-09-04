 import Config from '../../../etc/config'
const App = getApp()

Page({
  data: {
    carts:[],               // 购物车列表
    hasList:false,          // 列表是否有数据
    totalPrice:0,           // 总价，初始为0
    selectAllStatus:true,    // 全选状态，默认全选
    jsoncarts:''
  },
  onShow() {
    // this.setData({
    //   hasList: true,
    //   carts:[
    //     {id:1,title:'新鲜芹菜 半斤',image:'/image/s5.png',num:4,price:0.01,selected:true},
    //     {id:2,title:'素米 500g',image:'/image/s6.png',num:1,price:0.03,selected:true}
    //   ]
    // });
    this.getcart();
  },
  getcart:function(){
    var that = this;
    wx.request({
      url: Config.basePath + 'cart&list=1&openid=' + App.globalData.openid,
      success: function (data) {
        
        if (data.data.meta.code == 0) {
          that.setData({
            carts: data.data.data,
            jsoncarts: JSON.stringify(data.data.data)
          })
          if (data.data.data.length!=0){
            that.setData({
              hasList: true
            })
          }
          that.getTotalPrice();
        }
      }
    })
  },
  /**
   * 当前商品选中事件
   */
  selectList(e) {
    console.log(e)
    const index = e.currentTarget.dataset.index;
    let carts = this.data.carts;
    const selected = carts[index].selected;
    carts[index].selected = !selected;
    var that = this;
    var dbselected = selected?0:1;
    wx.request({
      url: Config.basePath + 'updnumcart&id=' + carts[index].id+'&type=1&selected=' + dbselected,
      success: function (data) {
        if (data.data.meta.code == 0) {
          that.setData({
            carts: carts,
            jsoncarts: JSON.stringify(carts)
          });
          that.getTotalPrice();
        }
      }
    })

  },
  /**
   * 删除购物车当前商品
   */
  deleteList(e) {
    const index = e.currentTarget.dataset.index;
    let carts = this.data.carts;
    var that=this;
    var cartid=carts[e.currentTarget.dataset.index].id;

    wx.request({
      url: Config.basePath + 'delcart&id=' + cartid,
      success: function (data) {
        if (data.data.meta.code == 0) {
          carts.splice(index, 1);
          that.setData({
            carts: carts,
            jsoncarts: JSON.stringify(carts)
          });
          if (!carts.length) {
            that.setData({
              hasList: false
            });
          } else {
            that.getTotalPrice();
          }
        }
      }
    })

  },

  /**
   * 购物车全选事件
   */
  selectAll(e) {
    let selectAllStatus = this.data.selectAllStatus;
    selectAllStatus = !selectAllStatus;
    let carts = this.data.carts;

    var that = this;
    var dbselected = selectAllStatus ? 0 : 1;
    wx.request({
      url: Config.basePath + 'updnumcart&openid=' + App.globalData.openid + '&type=1&selected=' + dbselected,
      success: function (data) {
        if (data.data.meta.code == 0) {
          for (let i = 0; i < carts.length; i++) {
            carts[i].selected = selectAllStatus;
          }
          that.setData({
            selectAllStatus: selectAllStatus,
            carts: carts,
            jsoncarts: JSON.stringify(carts)
          });
          that.getTotalPrice();
        }
      }
    })
  },

  /**
   * 绑定加数量事件
   */
  addCount(e) {
    const index = e.currentTarget.dataset.index;
    let carts = this.data.carts;
    let num = carts[index].num;
    num = num + 1;
    carts[index].num = num;
    var that = this;

    wx.request({
      url: Config.basePath + 'updnumcart&id=' + carts[index].id + '&total=' + num,
      success: function (data) {
        if (data.data.meta.code == 0) {
          that.setData({
            carts: carts,
            jsoncarts: JSON.stringify(carts)
          });
          that.getTotalPrice();
        }
      }
    })

  },

  /**
   * 绑定减数量事件
   */
  minusCount(e) {
    const index = e.currentTarget.dataset.index;
    let carts = this.data.carts;
    let num = carts[index].num;
    if (num <= 1) {
      return false;
    }
    num = num - 1;
    carts[index].num = num;
    var that = this;

    wx.request({
      url: Config.basePath + 'updnumcart&id=' + carts[index].id + '&total=' + num,
      success: function (data) {
        if (data.data.meta.code == 0) {
          that.setData({
            carts: carts,
            jsoncarts: JSON.stringify(carts)
          });
          that.getTotalPrice();
        }
      }
    })

  },

  /**
   * 计算总价
   */
  getTotalPrice() {
    let carts = this.data.carts;                  // 获取购物车列表
    let total = 0;
    for(let i = 0; i<carts.length; i++) {         // 循环列表得到每个数据
      if(carts[i].selected) {                     // 判断选中才会计算价格
        total += carts[i].num * carts[i].price;   // 所有价格加起来
      }
    }
    this.setData({                                // 最后赋值到data中渲染到页面
      carts: carts,
      totalPrice: total.toFixed(2),
      jsoncarts: JSON.stringify(carts)
    });
  }

})