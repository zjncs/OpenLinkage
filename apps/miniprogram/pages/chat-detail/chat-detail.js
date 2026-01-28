// pages/chat-detail/chat-detail.js
Page({
  data: {
    contactName: '',
    contactAvatar: '',
    contactType: '', // 'family' or 'doctor'
    messages: [],
    inputValue: '',
    loading: false,
    scrollIntoView: ''
  },

  onLoad(options) {
    const { type, id, name, avatar } = options;

    this.setData({
      contactType: type,
      contactName: name,
      contactAvatar: avatar
    });

    // 设置导航栏标题
    wx.setNavigationBarTitle({
      title: name
    });

    // 加载预设消息
    this.loadPresetMessages(type, id);
  },

  // 加载预设消息
  loadPresetMessages(type, id) {
    let messages = [];

    if (type === 'family') {
      // 根据家人ID加载不同的预设消息
      if (id === '1') {
        // 女儿
        messages = [
          {
            id: 1,
            role: 'assistant',
            content: '妈妈，今天天气不错，大家都要多喝水。',
            time: '10:15'
          },
          {
            id: 2,
            role: 'user',
            content: '好的，你也要注意身体哦',
            time: '10:16'
          },
          {
            id: 3,
            role: 'assistant',
            content: '嗯嗯，我会的。妈妈你最近血压怎么样？',
            time: '10:17'
          }
        ];
      } else if (id === '2') {
        // 儿子
        messages = [
          {
            id: 1,
            role: 'assistant',
            content: '妈妈，今天气温骤降了，出门记得穿多点。',
            time: '09:45'
          },
          {
            id: 2,
            role: 'user',
            content: '知道了，你在外面工作也要注意保暖',
            time: '09:50'
          }
        ];
      } else if (id === '3') {
        // 孙女
        messages = [
          {
            id: 1,
            role: 'assistant',
            content: '奶奶，今天气温骤降了，出门记得穿多点。',
            time: '08:30'
          },
          {
            id: 2,
            role: 'user',
            content: '好的宝贝，奶奶会注意的',
            time: '08:35'
          },
          {
            id: 3,
            role: 'assistant',
            content: '奶奶，周末我来看你哦！',
            time: '08:36'
          }
        ];
      } else if (id === '4') {
        // 老伴
        messages = [
          {
            id: 1,
            role: 'assistant',
            content: '我今天散步了7500步，感觉腿脚松快多了。',
            time: '07:20'
          },
          {
            id: 2,
            role: 'user',
            content: '真好，我也要多运动运动',
            time: '07:25'
          },
          {
            id: 3,
            role: 'assistant',
            content: '一起去公园走走吧，天气挺好的',
            time: '07:26'
          }
        ];
      }
    } else if (type === 'doctor') {
      // 医生的预设消息
      messages = [
        {
          id: 1,
          role: 'assistant',
          content: '您的血压控制得不错，继续保持。',
          time: '9月17日 10:32'
        },
        {
          id: 2,
          role: 'user',
          content: '谢谢田医生，我会继续注意的',
          time: '9月17日 10:35'
        },
        {
          id: 3,
          role: 'assistant',
          content: '记得按时服药，饮食清淡，适量运动。有任何不适随时联系我。',
          time: '9月17日 10:36'
        }
      ];
    }

    this.setData({
      messages: messages
    });
  },

  // 输入框内容变化
  onInputChange(e) {
    this.setData({
      inputValue: e.detail.value
    });
  },

  // 发送消息
  sendMessage() {
    const { inputValue } = this.data;

    if (!inputValue.trim()) {
      return;
    }

    // 添加用户消息到列表
    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: inputValue,
      time: this.formatTime(new Date())
    };

    this.setData({
      messages: [...this.data.messages, userMessage],
      inputValue: ''
    });

    // 滚动到底部
    setTimeout(() => {
      this.scrollToBottom();
    }, 100);
  },

  // 滚动到底部
  scrollToBottom() {
    wx.createSelectorQuery()
      .select('#message-list')
      .boundingClientRect((rect) => {
        if (rect) {
          wx.pageScrollTo({
            scrollTop: rect.height,
            duration: 300
          });
        }
      })
      .exec();
  },

  // 格式化时间
  formatTime(date) {
    const hour = date.getHours().toString().padStart(2, '0');
    const minute = date.getMinutes().toString().padStart(2, '0');
    return `${hour}:${minute}`;
  },

  // 选择图片
  chooseImage() {
    wx.showToast({
      title: '图片功能开发中',
      icon: 'none'
    });
  },

  // 开始语音
  startVoice() {
    wx.showToast({
      title: '语音功能开发中',
      icon: 'none'
    });
  }
});
