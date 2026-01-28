// pages/moment/moment.js
Page({
  data: {
    content: '', // 文本内容
    images: [] // 已选择的图片列表
  },

  onLoad() {
    // 可以从其他页面传入预设图片
    const pages = getCurrentPages();
    const currentPage = pages[pages.length - 1];
    if (currentPage.options.presetImages) {
      try {
        const presetImages = JSON.parse(decodeURIComponent(currentPage.options.presetImages));
        this.setData({
          images: presetImages
        });
      } catch (e) {
        console.error('解析预设图片失败', e);
      }
    }
  },

  // 输入文本内容
  onContentInput(e) {
    this.setData({
      content: e.detail.value
    });
  },

  // 选择图片
  chooseImage() {
    const maxCount = 9 - this.data.images.length;

    wx.chooseImage({
      count: maxCount,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePaths = res.tempFilePaths;
        this.setData({
          images: [...this.data.images, ...tempFilePaths]
        });
      }
    });
  },

  // 删除图片
  deleteImage(e) {
    const index = e.currentTarget.dataset.index;
    const images = this.data.images.filter((item, i) => i !== index);
    this.setData({
      images: images
    });
  },

  // 取消发布
  cancel() {
    if (this.data.content || this.data.images.length > 0) {
      wx.showModal({
        title: '提示',
        content: '确定要放弃编辑吗？',
        success: (res) => {
          if (res.confirm) {
            wx.navigateBack();
          }
        }
      });
    } else {
      wx.navigateBack();
    }
  },

  // 发布动态
  async publish() {
    const { content, images } = this.data;

    if (!content.trim() && images.length === 0) {
      wx.showToast({
        title: '请输入内容或选择图片',
        icon: 'none'
      });
      return;
    }

    const app = getApp();

    wx.showLoading({
      title: '发布中...'
    });

    try {
      // 暂时不上传图片，直接发布文本内容
      // TODO: 后续可以添加图片上传功能
      const response = await app.request({
        url: '/moment/create',
        method: 'POST',
        data: {
          content: content,
          images: images.length > 0 ? images : null
        }
      });

      wx.hideLoading();

      if (response.success) {
        // 清空页面内容
        this.setData({
          content: '',
          images: []
        });

        wx.showToast({
          title: '发布成功',
          icon: 'success'
        });
        setTimeout(() => {
          wx.navigateBack();
        }, 1500);
      } else {
        wx.showToast({
          title: response.message || '发布失败',
          icon: 'none'
        });
      }
    } catch (error) {
      wx.hideLoading();
      wx.showToast({
        title: error.message || '发布失败',
        icon: 'none'
      });
    }
  }
});
