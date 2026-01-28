// pages/history/history.js
Page({
  data: {
    weekdays: ['日', '一', '二', '三', '四', '五', '六'],
    calendarDays: [],
    currentYear: 0,
    currentMonth: 0,
    selectedDate: null,
    reminders: [], // 提醒列表

    // 预设的日期记录数据（用于显示彩色小点）
    dateRecords: {
      '2024-09-01': [{ type: 'medicine', color: '#4CAF50' }],
      '2024-09-02': [{ type: 'medicine', color: '#2196F3' }],
      '2024-09-04': [
        { type: 'medicine', color: '#FF9800' },
        { type: 'health', color: '#E91E63' },

        
        { type: 'exercise', color: '#9C27B0' }
      ],
      '2024-09-05': [{ type: 'health', color: '#673AB7' }],
      '2024-09-07': [{ type: 'medicine', color: '#2196F3' }],
      '2024-09-10': [
        { type: 'medicine', color: '#FF9800' },
        { type: 'health', color: '#4CAF50' }
      ],
      '2024-09-11': [
        { type: 'medicine', color: '#2196F3' },
        { type: 'health', color: '#E91E63' }
      ],
      '2024-09-13': [{ type: 'medicine', color: '#FF9800' }],
      '2024-09-14': [
        { type: 'medicine', color: '#2196F3' },
        { type: 'health', color: '#4CAF50' }
      ],
      '2024-09-16': [
        { type: 'medicine', color: '#2196F3' },
        { type: 'health', color: '#E91E63' }
      ],
      '2024-09-19': [
        { type: 'medicine', color: '#FF9800' },
        { type: 'health', color: '#E91E63' },
        { type: 'exercise', color: '#9C27B0' }
      ],
      '2024-09-21': [{ type: 'medicine', color: '#2196F3' }],
      '2024-09-24': [
        { type: 'medicine', color: '#FF9800' },
        { type: 'health', color: '#E91E63' }
      ],
      '2024-09-26': [{ type: 'health', color: '#673AB7' }],
      '2024-09-27': [
        { type: 'medicine', color: '#2196F3' },
        { type: 'health', color: '#4CAF50' }
      ],
      '2024-09-29': [{ type: 'medicine', color: '#2196F3' }],
      '2024-09-30': [{ type: 'medicine', color: '#2196F3' }]
    }
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
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    this.setData({
      currentYear: year,
      currentMonth: month
    });

    this.generateCalendar(year, month);
  },

  // 生成日历数据
  generateCalendar(year, month) {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const firstDayOfWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    const calendarDays = [];
    const today = new Date();
    const todayStr = this.formatDate(today);

    // 填充上个月的日期
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const day = prevMonthLastDay - i;
      const date = new Date(year, month - 1, day);
      calendarDays.push({
        day: day,
        date: this.formatDate(date),
        isCurrentMonth: false,
        isToday: false,
        records: []
      });
    }

    // 填充当月的日期
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateStr = this.formatDate(date);
      const isToday = dateStr === todayStr;

      calendarDays.push({
        day: day,
        date: dateStr,
        isCurrentMonth: true,
        isToday: isToday,
        records: this.data.dateRecords[dateStr] || []
      });
    }

    // 填充下个月的日期，补齐到42个格子（6行7列）
    const remainingDays = 42 - calendarDays.length;
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day);
      calendarDays.push({
        day: day,
        date: this.formatDate(date),
        isCurrentMonth: false,
        isToday: false,
        records: []
      });
    }

    this.setData({
      calendarDays: calendarDays
    });
  },

  // 格式化日期为 YYYY-MM-DD
  formatDate(date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  // 选择日期
  selectDate(e) {
    const date = e.currentTarget.dataset.date;
    this.setData({
      selectedDate: date
    });

    // 跳转到健康日报页面
    wx.navigateTo({
      url: `/pages/health-report/health-report?date=${date}`
    });
  },

  // 加载提醒列表
  async loadReminders() {
    console.log('=== loadReminders 开始执行 ===');
    const app = getApp();
    console.log('app.globalData.token:', app.globalData.token);
    console.log('app.globalData.apiBaseUrl:', app.globalData.apiBaseUrl);

    try {
      console.log('准备发送请求: /reminder/list');
      const response = await app.request({
        url: '/reminder/list',
        method: 'GET',
        data: { isActive: true }
      });

      console.log('收到响应:', response);

      if (response.success) {
        console.log('提醒列表:', response.data.reminders);
        this.setData({
          reminders: response.data.reminders || []
        });
        console.log('setData 完成，reminders 数量:', this.data.reminders.length);
      } else {
        console.log('响应失败:', response);
      }
    } catch (error) {
      console.error('加载提醒列表失败:', error);
    }
  },

  // 添加提醒
  addReminder() {
    wx.navigateTo({
      url: '/pages/add-reminder/add-reminder'
    });
  }
});
