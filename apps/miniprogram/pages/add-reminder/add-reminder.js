// pages/add-reminder/add-reminder.js
Page({
  data: {
    medicineName: '',
    dosage: '',
    reminderTime: '09:00',
    frequency: '每天',
    notes: '',
    frequencyOptions: ['每天', '每周', '每月']
  },

  // 药品名称输入
  onMedicineNameInput(e) {
    this.setData({ medicineName: e.detail.value });
  },

  // 剂量输入
  onDosageInput(e) {
    this.setData({ dosage: e.detail.value });
  },

  // 时间选择
  onTimeChange(e) {
    this.setData({ reminderTime: e.detail.value });
  },

  // 频率选择
  onFrequencyChange(e) {
    const index = e.detail.value;
    this.setData({ frequency: this.data.frequencyOptions[index] });
  },

  // 备注输入
  onNotesInput(e) {
    this.setData({ notes: e.detail.value });
  },

  // 提交表单
  async submitForm() {
    const { medicineName, dosage, reminderTime, frequency, notes } = this.data;

    if (!medicineName.trim()) {
      wx.showToast({ title: '请输入药品名称', icon: 'none' });
      return;
    }

    if (!reminderTime) {
      wx.showToast({ title: '请选择提醒时间', icon: 'none' });
      return;
    }

    const app = getApp();

    wx.showLoading({ title: '创建中...' });

    try {
      const response = await app.request({
        url: '/reminder/create',
        method: 'POST',
        data: {
          medicineName,
          dosage,
          reminderTime,
          frequency,
          notes
        }
      });

      wx.hideLoading();

      if (response.success) {
        wx.showToast({ title: '创建成功', icon: 'success' });
        setTimeout(() => {
          wx.navigateBack();
        }, 1500);
      }
    } catch (error) {
      wx.hideLoading();
      wx.showToast({
        title: error.message || '创建失败',
        icon: 'none'
      });
    }
  },

  // 取消
  cancel() {
    wx.navigateBack();
  }
});
