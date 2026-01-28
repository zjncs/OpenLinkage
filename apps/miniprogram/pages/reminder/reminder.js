// pages/reminder/reminder.js
Page({
  data: {
    reminders: [],
    selectedDate: '',
    currentMonth: '',
    calendarDays: []
  },

  onLoad() {
    this.initCalendar();
    this.loadReminders();
  },

  onShow() {
    // 每次显示页面时刷新提醒列表
    this.loadReminders();
  },

  // 初始化日历
  initCalendar() {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const date = today.getDate();

    this.setData({
      selectedDate: date,
      currentMonth: `${year}年${month + 1}月`
    });

    // 生成日历数据（简化版，只显示当月）
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days = [];
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: i,
        isToday: i === date
      });
    }

    this.setData({ calendarDays: days });
  },

  // 加载提醒列表
  async loadReminders() {
    const app = getApp();

    try {
      const response = await app.request({
        url: '/reminder/list',
        method: 'GET',
        data: { isActive: true }
      });

      if (response.success) {
        this.setData({
          reminders: response.data.reminders || []
        });
      }
    } catch (error) {
      console.error('加载提醒列表失败:', error);
    }
  },

  // 选择日期
  selectDate(e) {
    const date = e.currentTarget.dataset.date;
    this.setData({ selectedDate: date });
  },

  // 跳转到添加提醒页面
  goToAddReminder() {
    wx.navigateTo({
      url: '/pages/add-reminder/add-reminder'
    });
  },

  // 删除提醒
  async deleteReminder(e) {
    const id = e.currentTarget.dataset.id;
    const app = getApp();

    const result = await new Promise(resolve => {
      wx.showModal({
        title: '确认删除',
        content: '确定要删除这个提醒吗？',
        success: res => resolve(res.confirm)
      });
    });

    if (!result) return;

    try {
      wx.showLoading({ title: '删除中...' });

      const response = await app.request({
        url: `/reminder/delete/${id}`,
        method: 'DELETE'
      });

      wx.hideLoading();

      if (response.success) {
        wx.showToast({ title: '删除成功', icon: 'success' });
        this.loadReminders();
      }
    } catch (error) {
      wx.hideLoading();
      wx.showToast({
        title: error.message || '删除失败',
        icon: 'none'
      });
    }
  }
});
