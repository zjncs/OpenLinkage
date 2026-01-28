// pages/profile/profile.js
Page({
  data: {
    // 用户信息
    userInfo: {
      name: '金小天',
      phone: '123****7890',
      avatar: '/assets/images/user-avatar.png'
    }
  },

  onLoad() {
    // 可以在这里加载用户信息
    // this.loadUserInfo();
  },

  // 加载用户信息
  loadUserInfo() {
    // TODO: 从后端获取用户信息
    /*
    const app = getApp();
    app.request({
      url: '/user/info',
      method: 'GET'
    }).then(response => {
      if (response.success) {
        this.setData({
          userInfo: response.data
        });
      }
    });
    */
  },

  // 前往设置
  goToSettings() {
    wx.showToast({
      title: '设置功能开发中',
      icon: 'none'
    });
  },

  // 升级账户
  upgradeAccount() {
    wx.showToast({
      title: '升级账户功能开发中',
      icon: 'none'
    });
  },

  // 查看订单
  viewOrders() {
    wx.showToast({
      title: '我的订单功能开发中',
      icon: 'none'
    });
  },

  // 查看余额
  viewBalance() {
    wx.showToast({
      title: '我的余额功能开发中',
      icon: 'none'
    });
  },

  // 健康档案
  goToHealthRecord() {
    wx.showToast({
      title: '健康档案功能开发中',
      icon: 'none'
    });
  },

  // 专业分析
  goToAnalysis() {
    wx.showToast({
      title: '专业分析功能开发中',
      icon: 'none'
    });
  },

  // 数据查看
  goToDataView() {
    wx.showToast({
      title: '数据查看功能开发中',
      icon: 'none'
    });
  },

  // 日报周报
  goToReport() {
    wx.navigateTo({
      url: '/pages/health-report/health-report'
    });
  },

  // 邀请好友
  inviteFriends() {
    wx.showToast({
      title: '邀请好友功能开发中',
      icon: 'none'
    });
  },

  // 用户反馈
  feedback() {
    wx.showToast({
      title: '用户反馈功能开发中',
      icon: 'none'
    });
  },

  // 帮助中心
  helpCenter() {
    wx.showToast({
      title: '帮助中心功能开发中',
      icon: 'none'
    });
  },

  // 联系客服
  contactService() {
    wx.showToast({
      title: '联系客服功能开发中',
      icon: 'none'
    });
  }
});
