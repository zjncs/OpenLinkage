// pages/article/article.js
Page({
  data: {
    searchKeyword: '',

    // 热门推荐文章
    featuredArticle: {
      id: '1',
      title: '儿童与青少年临床心理学：关注孩子的心理健康',
      image: '/assets/images/magazine1.png'
    },

    // 文章列表
    articles: [
      {
        id: '2',
        tag: '热',
        title: '板蓝根、抗病毒口服液，对流感病毒有效吗？',
        date: '2024-05-20',
        image: '/assets/images/magazine2.png'
      },
      {
        id: '3',
        tag: '热',
        title: '如何正确预防流感？专家给出这些建议',
        date: '2024-05-18',
        image: '/assets/images/magazine3.png'
      },
      {
        id: '4',
        tag: '热',
        title: '流感疫苗接种指南：这些人群应优先接种',
        date: '2024-05-15',
        image: '/assets/images/magazine4.png'
      },
      {
        id: '5',
        tag: '',
        title: '高血压患者的日常饮食管理与注意事项',
        date: '2024-05-12',
        image: '/assets/images/magazine2.png'
      }
    ]
  },

  onLoad() {
    // 可以在这里加载文章数据
  },

  // 搜索输入
  onSearchInput(e) {
    this.setData({
      searchKeyword: e.detail.value
    });
  },

  // 执行搜索
  onSearch() {
    const keyword = this.data.searchKeyword.trim();
    if (!keyword) {
      return;
    }

    wx.showToast({
      title: '搜索功能开发中',
      icon: 'none'
    });

    // TODO: 调用搜索API
    /*
    const app = getApp();
    app.request({
      url: '/article/search',
      method: 'GET',
      data: {
        keyword: keyword
      }
    }).then(response => {
      if (response.success) {
        this.setData({
          articles: response.data.articles
        });
      }
    });
    */
  },

  // 查看文章详情
  viewArticle(e) {
    const articleId = e.currentTarget.dataset.id;

    wx.navigateTo({
      url: `/pages/article-detail/article-detail?id=${articleId}`
    });
  }
});
