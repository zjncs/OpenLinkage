// pages/article-detail/article-detail.js
const app = getApp();

Page({
  data: {
    articleId: '',
    article: null,
    loading: true,
    isCollected: false,
    isLiked: false,
    likeCount: 0,

    // 相关文章推荐
    relatedArticles: []
  },

  onLoad(options) {
    if (options.id) {
      this.setData({
        articleId: options.id
      });
      this.loadArticleDetail();
    }
  },

  // 加载文章详情
  async loadArticleDetail() {
    try {
      this.setData({ loading: true });

      // TODO: 调用后端API获取文章详情
      // const response = await app.request({
      //   url: `/article/detail/${this.data.articleId}`,
      //   method: 'GET'
      // });

      // 根据文章ID获取不同的模拟数据
      const mockArticle = this.getArticleById(this.data.articleId);

      this.setData({
        article: mockArticle,
        likeCount: mockArticle.likeCount,
        loading: false
      });

      // 加载相关文章
      this.loadRelatedArticles();

      // 检查收藏和点赞状态
      this.checkCollectStatus();
      this.checkLikeStatus();

    } catch (error) {
      console.error('加载文章详情失败:', error);
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
      this.setData({ loading: false });
    }
  },

  // 加载相关文章
  async loadRelatedArticles() {
    // TODO: 调用后端API获取相关文章
    const mockRelated = [
      {
        id: 'related-1',
        title: '如何正确预防流感？',
        coverImage: '/assets/images/magazine3.png',
        readCount: 856
      },
      {
        id: 'related-2',
        title: '流感疫苗接种指南',
        coverImage: '/assets/images/magazine4.png',
        readCount: 723
      }
    ];

    this.setData({
      relatedArticles: mockRelated
    });
  },

  // 检查收藏状态
  async checkCollectStatus() {
    // TODO: 调用后端API检查收藏状态
    this.setData({
      isCollected: false
    });
  },

  // 检查点赞状态
  async checkLikeStatus() {
    // TODO: 调用后端API检查点赞状态
    this.setData({
      isLiked: false
    });
  },

  // 点赞/取消点赞
  async toggleLike() {
    const newLikeStatus = !this.data.isLiked;
    const newLikeCount = newLikeStatus ? this.data.likeCount + 1 : this.data.likeCount - 1;

    this.setData({
      isLiked: newLikeStatus,
      likeCount: newLikeCount
    });

    try {
      // TODO: 调用后端API
      // await app.request({
      //   url: '/article/like',
      //   method: 'POST',
      //   data: {
      //     articleId: this.data.articleId,
      //     action: newLikeStatus ? 'like' : 'unlike'
      //   }
      // });

      wx.showToast({
        title: newLikeStatus ? '已点赞' : '已取消',
        icon: 'success'
      });
    } catch (error) {
      // 失败时回滚
      this.setData({
        isLiked: !newLikeStatus,
        likeCount: this.data.likeCount
      });
      wx.showToast({
        title: '操作失败',
        icon: 'none'
      });
    }
  },

  // 收藏/取消收藏
  async toggleCollect() {
    const newCollectStatus = !this.data.isCollected;

    this.setData({
      isCollected: newCollectStatus
    });

    try {
      // TODO: 调用后端API
      // await app.request({
      //   url: '/article/collect',
      //   method: 'POST',
      //   data: {
      //     articleId: this.data.articleId,
      //     action: newCollectStatus ? 'collect' : 'uncollect'
      //   }
      // });

      wx.showToast({
        title: newCollectStatus ? '已收藏' : '已取消',
        icon: 'success'
      });
    } catch (error) {
      // 失败时回滚
      this.setData({
        isCollected: !newCollectStatus
      });
      wx.showToast({
        title: '操作失败',
        icon: 'none'
      });
    }
  },

  // 分享文章
  onShareAppMessage() {
    return {
      title: this.data.article?.title || '健康文章分享',
      path: `/pages/article-detail/article-detail?id=${this.data.articleId}`,
      imageUrl: this.data.article?.coverImage
    };
  },

  // 查看相关文章
  viewRelatedArticle(e) {
    const articleId = e.currentTarget.dataset.id;
    wx.redirectTo({
      url: `/pages/article-detail/article-detail?id=${articleId}`
    });
  },

  // 返回上一页
  goBack() {
    wx.navigateBack();
  }
});
