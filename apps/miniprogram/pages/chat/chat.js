// pages/chat/chat.js
const app = getApp();

Page({
  data: {
    currentTab: 0, // 当前选中的Tab: 0-管家, 1-群聊, 2-家人, 3-医生
    tabs: ['管家', '群聊', '家人', '医生'],

    // 聊天消息列表
    messages: [],

    // 预设的管家聊天记录
    managerMessages: [],

    // 预设的群聊记录
    groupMessages: [],

    // 输入框内容
    inputValue: '',

    // 专家配置（用于群聊Tab）
    experts: [
      { type: 'emotion', name: '情绪专家', color: '#FF6B9D', icon: '情' },
      { type: 'psychology', name: '心理专家', color: '#C77DFF', icon: '心' },
      { type: 'sleep', name: '睡眠专家', color: '#FFB347', icon: '睡' },
      { type: 'nutrition', name: '营养专家', color: '#4ECDC4', icon: '营' },
      { type: 'safety', name: '安全专家', color: '#95E1D3', icon: '安' }
    ],

    // 家人列表（用于家人Tab）
    familyMembers: [],

    // 医生列表（用于医生Tab）
    doctors: [],

    // 当前会话ID
    sessionId: null,

    // 加载状态
    loading: false
  },

  onLoad() {
    // 加载数据
    this.loadFamilyMembers();
    this.loadDoctors();
    // 加载管家Tab的预设消息
    this.setData({
      messages: this.data.managerMessages
    });
  },

  // 切换Tab
  switchTab(e) {
    const index = e.currentTarget.dataset.index;
    let messages = [];

    // 根据Tab加载对应的预设消息
    if (index === 0) {
      // 管家Tab
      messages = this.data.managerMessages;
    } else if (index === 1) {
      // 群聊Tab
      messages = this.data.groupMessages;
    }

    this.setData({
      currentTab: index,
      messages: messages,
      sessionId: null
    });
  },

  // 加载家人列表
  loadFamilyMembers() {
    // 预设的家人对话列表
    this.setData({
      familyMembers: [
        {
          id: '1',
          name: '女儿',
          avatar: '/assets/images/daughter.png',
          lastMessage: '妈妈，今天天气不错，大家都要多喝水。',
          time: '3分钟前',
          hasUnread: true,
          online: true
        },
        {
          id: '2',
          name: '儿子',
          avatar: '/assets/images/son.png',
          lastMessage: '妈妈，今天气温骤降了，出门记得穿多点。',
          time: '15分钟前',
          hasUnread: true,
          online: false
        },
        {
          id: '3',
          name: '孙女',
          avatar: '/assets/images/granddaughter.png',
          lastMessage: '奶奶，今天气温骤降了，出门记得穿多点。',
          time: '1小时前',
          hasUnread: true,
          online: true
        },
        {
          id: '4',
          name: '老伴',
          avatar: '/assets/images/couple.png',
          lastMessage: '我今天散步了7500步，感觉腿脚松快多了。',
          time: '1小时前',
          hasUnread: true,
          online: true
        }
      ]
    });
  },

  // 加载医生列表
  loadDoctors() {
    // 预设的医生对话列表
    this.setData({
      doctors: [
        {
          id: '1',
          name: '田晓楠',
          title: '主任医师',
          avatar: '/assets/images/real-daughter.png',
          lastMessage: '您的血压控制得不错，继续保持。',
          time: '9月17日 10:32',
          online: true
        }
      ]
    });
  },

  // 输入框内容变化
  onInputChange(e) {
    this.setData({
      inputValue: e.detail.value
    });
  },

  // 发送消息
  async sendMessage() {
    const { inputValue, currentTab, sessionId } = this.data;

    if (!inputValue.trim()) {
      wx.showToast({
        title: '请输入消息',
        icon: 'none'
      });
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
      inputValue: '',
      loading: true
    });

    try {
      let response;

      // 根据当前Tab调用不同的API
      if (currentTab === 0) {
        // 健康管家
        response = await app.request({
          url: '/chat/health-manager',
          method: 'POST',
          data: {
            userId: app.globalData.userId,
            message: inputValue,
            sessionId: sessionId
          }
        });

        // 添加AI回复到列表
        if (response && response.success) {
          const aiMessage = {
            id: Date.now() + 1,
            role: 'assistant',
            content: response.data.message,
            time: this.formatTime(new Date())
          };

          this.setData({
            messages: [...this.data.messages, aiMessage],
            sessionId: response.data.sessionId
          });
        }
      } else if (currentTab === 1) {
        // 专家群聊 - 多个专家依次回复
        response = await app.request({
          url: '/chat/expert-group',
          method: 'POST',
          data: {
            userId: app.globalData.userId,
            message: inputValue,
            sessionId: sessionId
          }
        });

        // 添加多个专家的回复
        if (response && response.success && response.data.replies) {
          const expertReplies = response.data.replies.map((reply, index) => {
            const expert = this.data.experts.find(e => e.type === reply.expertType) || this.data.experts[index];
            return {
              id: Date.now() + index + 1,
              role: 'assistant',
              content: reply.message,
              time: this.formatTime(new Date()),
              expertName: expert.name,
              expertColor: expert.color,
              expertIcon: expert.icon
            };
          });

          this.setData({
            messages: [...this.data.messages, ...expertReplies],
            sessionId: response.data.sessionId
          });
        }
      }

      // 滚动到底部
      this.scrollToBottom();
    } catch (error) {
      wx.showToast({
        title: error.message || '发送失败',
        icon: 'none'
      });
    } finally {
      this.setData({
        loading: false
      });
    }
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

  // 选择家人
  selectFamily(e) {
    const member = e.currentTarget.dataset.member;
    // 跳转到聊天详情页
    wx.navigateTo({
      url: `/pages/chat-detail/chat-detail?type=family&id=${member.id}&name=${member.name}&avatar=${member.avatar}`
    });
  },

  // 选择医生
  selectDoctor(e) {
    const doctor = e.currentTarget.dataset.doctor;
    // 跳转到聊天详情页
    wx.navigateTo({
      url: `/pages/chat-detail/chat-detail?type=doctor&id=${doctor.id}&name=${doctor.name}&avatar=${doctor.avatar}`
    });
  },

  // 选择图片
  chooseImage() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFilePaths[0];
        // TODO: 上传图片并发送
        wx.showToast({
          title: '图片功能开发中',
          icon: 'none'
        });
      }
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
