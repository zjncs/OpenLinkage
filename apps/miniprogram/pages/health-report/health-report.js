// pages/health-report/health-report.js
Page({
  data: {
    reportDate: '',
    heartRate: 75,
    bloodPressure: 100,
    bloodPressureUnit: '70毫米汞柱',
    hemoglobin: 15.5,
    bloodSugar: 150
  },

  onLoad(options) {
    // 获取传入的日期参数
    const date = options.date || this.formatDate(new Date());
    this.setData({
      reportDate: date
    });

    // 加载健康数据
    this.loadHealthData(date);
  },

  // 加载健康数据
  loadHealthData(date) {
    // TODO: 从后端获取指定日期的健康数据
    /*
    const app = getApp();
    app.request({
      url: '/health/report',
      method: 'GET',
      data: {
        date: date
      }
    }).then(response => {
      if (response.success) {
        this.setData({
          heartRate: response.data.heartRate,
          bloodPressure: response.data.bloodPressure,
          hemoglobin: response.data.hemoglobin,
          bloodSugar: response.data.bloodSugar
        });

        // 绘制图表
        this.drawCharts(response.data);
      }
    });
    */

    // 模拟数据，绘制图表
    setTimeout(() => {
      this.drawCharts();
    }, 500);
  },

  // 绘制图表
  drawCharts() {
    // 这里使用简单的canvas绘制，实际项目中可以使用图表库如echarts-for-weixin
    this.drawHeartChart();
    this.drawBloodPressureChart();
    this.drawHemoglobinTrend();
    this.drawBloodSugarTrend();
    this.drawHealthStatusChart();
  },

  // 绘制心跳图表
  drawHeartChart() {
    const ctx = wx.createCanvasContext('heartChart', this);
    const width = 150;
    const height = 80;

    // 绘制简单的折线图
    ctx.setStrokeStyle('#5B6EF5');
    ctx.setLineWidth(2);
    ctx.beginPath();

    const points = [40, 30, 50, 25, 45, 35, 55, 30];
    points.forEach((y, i) => {
      const x = (i / (points.length - 1)) * width;
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();
    ctx.draw();
  },

  // 绘制血压图表
  drawBloodPressureChart() {
    const ctx = wx.createCanvasContext('bloodPressureChart', this);
    const width = 150;
    const height = 80;

    // 绘制区域图
    ctx.setFillStyle('rgba(91, 110, 245, 0.2)');
    ctx.beginPath();

    const points = [50, 40, 45, 35, 40, 45, 50, 45];
    ctx.moveTo(0, height);
    points.forEach((y, i) => {
      const x = (i / (points.length - 1)) * width;
      ctx.lineTo(x, y);
    });
    ctx.lineTo(width, height);
    ctx.closePath();
    ctx.fill();

    ctx.draw();
  },

  // 绘制血红蛋白趋势
  drawHemoglobinTrend() {
    const ctx = wx.createCanvasContext('hemoglobinTrend', this);
    const width = 140;
    const height = 60;

    ctx.setStrokeStyle('#5B6EF5');
    ctx.setLineWidth(2);
    ctx.beginPath();

    const points = [40, 30, 45, 25, 35, 45, 30, 20];
    points.forEach((y, i) => {
      const x = (i / (points.length - 1)) * width;
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();
    ctx.draw();
  },

  // 绘制糖分水平趋势
  drawBloodSugarTrend() {
    const ctx = wx.createCanvasContext('bloodSugarTrend', this);
    const width = 140;
    const height = 60;

    // 绘制区域图
    ctx.setFillStyle('rgba(91, 110, 245, 0.2)');
    ctx.beginPath();

    const points = [35, 30, 40, 35, 45, 40, 35, 30];
    ctx.moveTo(0, height);
    points.forEach((y, i) => {
      const x = (i / (points.length - 1)) * width;
      ctx.lineTo(x, y);
    });
    ctx.lineTo(width, height);
    ctx.closePath();
    ctx.fill();

    ctx.draw();
  },

  // 绘制健康状况图表
  drawHealthStatusChart() {
    const ctx = wx.createCanvasContext('healthStatusChart', this);
    const width = 320;
    const height = 200;

    // 绘制折线图
    ctx.setStrokeStyle('#4CAF50');
    ctx.setLineWidth(2);
    ctx.beginPath();

    const points = [120, 80, 140, 60, 100, 80, 60, 140, 100, 60, 80, 100, 60, 140, 100];
    const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];

    points.forEach((y, i) => {
      const x = (i / (points.length - 1)) * width;
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();

    // 绘制X轴标签
    ctx.setFontSize(12);
    ctx.setFillStyle('#999');
    days.forEach((day, i) => {
      const x = (i / (days.length - 1)) * width;
      ctx.fillText(day, x - 15, height - 10);
    });

    // 绘制Y轴刻度
    for (let i = 0; i <= 5; i++) {
      const y = (i / 5) * (height - 30);
      ctx.setFillStyle('#f0f0f0');
      ctx.fillRect(0, y, width, 1);

      ctx.setFillStyle('#999');
      ctx.fillText(5 - i, 5, y + 5);
    }

    ctx.draw();
  },

  // 格式化日期
  formatDate(date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
});
