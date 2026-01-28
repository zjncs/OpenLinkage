// pages/login/login.js
const app = getApp();

Page({
  data: {
    phone: '',
    code: '',
    showOtherMethods: false,
    codeSending: false,
    codeButtonText: '获取',
    countdown: 60
  },

  onLoad() {
    // 检查是否已登录
    const token = wx.getStorageSync('token');
    if (token) {
      wx.switchTab({
        url: '/pages/chat/chat'
      });
    }
  },

  // 切换其他登录方式显示
  toggleLoginMethods() {
    this.setData({
      showOtherMethods: !this.data.showOtherMethods
    });
  },

  // 人脸识别登录
  async faceLogin() {
    // 显示识别动画
    wx.showLoading({
      title: '人脸识别中...',
      mask: true
    });

    // 模拟识别过程（2秒）
    setTimeout(async () => {
      wx.hideLoading();

      // 显示识别成功
      wx.showToast({
        title: '识别成功',
        icon: 'success',
        duration: 1500
      });

      // 1.5秒后执行登录
      setTimeout(async () => {
        await this.mockLogin();
      }, 1500);
    }, 2000);
  },

  // 通过拍照进行人脸识别
  async faceLoginByPhoto() {
    try {
      // 选择图片（拍照或相册）
      const res = await wx.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['camera', 'album']
      });

      const tempFilePath = res.tempFilePaths[0];

      wx.showLoading({ title: '识别中...' });

      // TODO: 上传图片到后端进行人脸识别
      // 这里需要后端提供人脸识别接口
      const response = await app.request({
        url: '/auth/face-login',
        method: 'POST',
        data: {
          faceImage: tempFilePath
        }
      });

      wx.hideLoading();

      if (response.success) {
        // 保存token和用户信息
        app.setToken(response.data.token);
        app.setUserInfo({
          id: response.data.userId,
          name: response.data.name
        });

        wx.showToast({
          title: '登录成功',
          icon: 'success'
        });

        setTimeout(() => {
          wx.switchTab({
            url: '/pages/chat/chat'
          });
        }, 1500);
      }
    } catch (error) {
      wx.hideLoading();

      // 如果后端接口未实现，使用模拟登录
      if (error.message && error.message.includes('404')) {
        wx.showModal({
          title: '提示',
          content: '人脸识别功能开发中，是否使用测试账号登录？',
          success: async (res) => {
            if (res.confirm) {
              await this.mockLogin();
            }
          }
        });
      } else {
        wx.showToast({
          title: error.message || '识别失败',
          icon: 'none'
        });
      }
    }
  },

  // 模拟登录（开发测试用）
  async mockLogin() {
    try {
      wx.showLoading({ title: '登录中...' });

      // 使用手机号验证码方式模拟登录
      const codeResponse = await app.request({
        url: '/auth/phone/send-code',
        method: 'POST',
        data: { phone: '13800138000' }
      });

      const response = await app.request({
        url: '/auth/phone/login',
        method: 'POST',
        data: {
          phone: '13800138000',
          code: codeResponse.data.code
        }
      });

      wx.hideLoading();

      if (response.success) {
        app.setToken(response.data.token);
        app.setUserInfo({
          id: response.data.userId,
          phone: '13800138000'
        });

        wx.showToast({
          title: '登录成功',
          icon: 'success'
        });

        setTimeout(() => {
          wx.switchTab({
            url: '/pages/chat/chat'
          });
        }, 1500);
      }
    } catch (error) {
      wx.hideLoading();
      wx.showToast({
        title: error.message || '登录失败',
        icon: 'none'
      });
    }
  },

  // 微信一键登录
  async wechatLogin() {
    try {
      wx.showLoading({ title: '登录中...' });

      // 开发模式：直接使用手机号登录
      const codeResponse = await app.request({
        url: '/auth/phone/send-code',
        method: 'POST',
        data: { phone: '13800138000' }
      });

      const response = await app.request({
        url: '/auth/phone/login',
        method: 'POST',
        data: {
          phone: '13800138000',
          code: codeResponse.data.code
        }
      });

      wx.hideLoading();

      if (response.success) {
        app.setToken(response.data.token);
        app.setUserInfo({
          id: response.data.userId,
          phone: '13800138000'
        });

        wx.showToast({
          title: '登录成功',
          icon: 'success'
        });

        setTimeout(() => {
          wx.switchTab({
            url: '/pages/chat/chat'
          });
        }, 1500);
      }
    } catch (error) {
      wx.hideLoading();
      wx.showToast({
        title: error.message || '登录失败',
        icon: 'none'
      });
    }
  },

  // 手机号输入
  onPhoneInput(e) {
    this.setData({
      phone: e.detail.value
    });
  },

  // 验证码输入
  onCodeInput(e) {
    this.setData({
      code: e.detail.value
    });
  },

  // 发送验证码
  async sendCode() {
    const { phone, codeSending } = this.data;

    if (codeSending) return;

    if (!phone || phone.length !== 11) {
      wx.showToast({
        title: '请输入正确的手机号',
        icon: 'none'
      });
      return;
    }

    try {
      this.setData({ codeSending: true });

      await app.request({
        url: '/auth/phone/send-code',
        method: 'POST',
        data: { phone }
      });

      wx.showToast({
        title: '验证码已发送',
        icon: 'success'
      });

      // 开始倒计时
      this.startCountdown();
    } catch (error) {
      this.setData({ codeSending: false });
      wx.showToast({
        title: error.message || '发送失败',
        icon: 'none'
      });
    }
  },

  // 倒计时
  startCountdown() {
    let countdown = 60;
    this.setData({
      codeButtonText: `${countdown}s`,
      codeSending: true
    });

    const timer = setInterval(() => {
      countdown--;
      if (countdown > 0) {
        this.setData({
          codeButtonText: `${countdown}s`
        });
      } else {
        clearInterval(timer);
        this.setData({
          codeButtonText: '重发',
          codeSending: false
        });
      }
    }, 1000);
  },

  // 验证码登录
  async phoneLogin() {
    const { phone, code } = this.data;

    if (!phone || !code) {
      wx.showToast({
        title: '请输入手机号和验证码',
        icon: 'none'
      });
      return;
    }

    if (phone.length !== 11) {
      wx.showToast({
        title: '请输入正确的手机号',
        icon: 'none'
      });
      return;
    }

    try {
      wx.showLoading({ title: '登录中...' });

      const response = await app.request({
        url: '/auth/phone/login',
        method: 'POST',
        data: { phone, code }
      });

      wx.hideLoading();

      if (response.success) {
        app.setToken(response.data.token);
        app.setUserInfo({
          id: response.data.userId,
          phone: phone
        });

        wx.showToast({
          title: '登录成功',
          icon: 'success'
        });

        setTimeout(() => {
          wx.switchTab({
            url: '/pages/chat/chat'
          });
        }, 1500);
      }
    } catch (error) {
      wx.hideLoading();
      wx.showToast({
        title: error.message || '登录失败',
        icon: 'none'
      });
    }
  }
});
