// app.js
App({
  globalData: {
    userInfo: null,
    userId: null,
    token: null,
    apiBaseUrl: 'http://localhost:3000/api'
  },

  onLaunch() {
    // 检查登录状态
    this.checkLoginStatus();
  },

  checkLoginStatus() {
    const token = wx.getStorageSync('token');
    const userId = wx.getStorageSync('userId');

    if (token && userId) {
      this.globalData.token = token;
      this.globalData.userId = userId;
    } else {
      // 跳转到登录页
      wx.redirectTo({
        url: '/pages/login/login'
      });
    }
  },

  // 设置用户信息
  setUserInfo(userInfo) {
    this.globalData.userInfo = userInfo;
    this.globalData.userId = userInfo.id;
    wx.setStorageSync('userInfo', userInfo);
    wx.setStorageSync('userId', userInfo.id);
  },

  // 设置token
  setToken(token) {
    this.globalData.token = token;
    wx.setStorageSync('token', token);
  },

  // 清除登录信息
  clearLoginInfo() {
    this.globalData.userInfo = null;
    this.globalData.userId = null;
    this.globalData.token = null;
    wx.removeStorageSync('userInfo');
    wx.removeStorageSync('userId');
    wx.removeStorageSync('token');
  },

  // 发起请求
  request(options) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: this.globalData.apiBaseUrl + options.url,
        method: options.method || 'GET',
        data: options.data || {},
        header: {
          'Content-Type': 'application/json',
          'Authorization': this.globalData.token ? `Bearer ${this.globalData.token}` : ''
        },
        success: (res) => {
          if (res.statusCode === 200) {
            resolve(res.data);
          } else if (res.statusCode === 401) {
            // token过期，跳转登录
            this.clearLoginInfo();
            wx.redirectTo({
              url: '/pages/login/login'
            });
            reject(new Error('未登录'));
          } else {
            reject(new Error(res.data.message || '请求失败'));
          }
        },
        fail: (err) => {
          reject(err);
        }
      });
    });
  }
});
