<template>
  <div class="article-container app-page with-tabbar">
    <div class="search-bar">
      <div class="search-input">
        <img class="search-icon" :src="searchIcon" alt="search" />
        <input
          v-model="searchKeyword"
          class="search-field"
          placeholder="请输入关键词"
          @keyup.enter="onSearch"
        />
      </div>
    </div>

    <div class="content">
      <div class="featured-card" @click="viewArticle(featuredArticle.id)">
        <img class="featured-image" :src="featuredArticle.image" alt="featured" />
        <div class="featured-overlay">
          <div class="featured-tag">🔥 热门</div>
          <div class="featured-title">{{ featuredArticle.title }}</div>
        </div>
      </div>

      <div class="article-list">
        <div v-for="a in filteredArticles" :key="a.id" class="article-item" @click="viewArticle(a.id)">
          <div class="article-content">
            <div v-if="a.tag" class="article-tag">{{ a.tag }}</div>
            <div class="article-title">{{ a.title }}</div>
            <div class="article-date">{{ a.date }}</div>
          </div>
          <img class="article-thumb" :src="a.image" alt="thumb" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { showToast } from 'vant'

import searchIcon from '@/assets/images/search.png'
import magazine1 from '@/assets/images/magazine1.png'
import magazine2 from '@/assets/images/magazine2.png'
import magazine3 from '@/assets/images/magazine3.png'
import magazine4 from '@/assets/images/magazine4.png'

const searchKeyword = ref('')

const featuredArticle = {
  id: 'featured-1',
  title: '儿童与青少年临床心理学',
  image: magazine1
}

const articles = [
  {
    id: 'article-1',
    tag: '热',
    title: '板蓝根、抗病毒口服液，对流感病毒有效吗？',
    date: '2024-05-20',
    image: magazine2
  },
  {
    id: 'article-2',
    tag: '热',
    title: '春季过敏高发：如何区分感冒与过敏？',
    date: '2024-05-18',
    image: magazine3
  },
  {
    id: 'article-3',
    tag: '热',
    title: '高血压人群的饮食建议：低盐不等于无盐',
    date: '2024-05-10',
    image: magazine4
  },
  {
    id: 'article-4',
    tag: '',
    title: '睡眠质量提升小技巧：从固定起床时间开始',
    date: '2024-05-02',
    image: magazine2
  }
]

const filteredArticles = computed(() => {
  const key = searchKeyword.value.trim()
  if (!key) return articles
  return articles.filter((a) => a.title.includes(key) || a.tag.includes(key))
})

const onSearch = () => {
  const key = searchKeyword.value.trim()
  if (!key) return
  showToast({ message: '搜索功能开发中', position: 'top' })
}

const viewArticle = (_id: string) => {
  showToast({ message: '文章详情页开发中', position: 'top' })
}
</script>

<style scoped>
.article-container {
  display: flex;
  flex-direction: column;
}

.search-bar {
  background-color: var(--app-primary);
  padding: 10px 12px;
  padding-top: calc(10px + env(safe-area-inset-top));
}

.search-input {
  display: flex;
  align-items: center;
  background-color: #fff;
  border-radius: 20px;
  padding: 8px 12px;
  gap: 8px;
}

.search-icon {
  width: 16px;
  height: 16px;
  opacity: 0.5;
}

.search-field {
  flex: 1;
  font-size: 14px;
  color: var(--app-text);
  border: none;
  outline: none;
  background: transparent;
}

.content {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

.featured-card {
  width: 100%;
  height: 200px;
  border-radius: var(--app-radius-lg);
  overflow: hidden;
  position: relative;
  margin-bottom: 14px;
}

.featured-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.featured-overlay {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 16px;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent);
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.featured-tag {
  display: inline-block;
  align-self: flex-start;
  padding: 4px 10px;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  font-size: 12px;
  color: #ff5722;
  font-weight: 500;
}

.featured-title {
  font-size: 18px;
  font-weight: 700;
  color: #fff;
  line-height: 1.35;
}

.article-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.article-item {
  display: flex;
  background-color: #fff;
  border-radius: 14px;
  padding: 12px;
  gap: 10px;
  align-items: center;
}

.article-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.article-tag {
  display: inline-block;
  align-self: flex-start;
  padding: 2px 8px;
  background-color: #ffe8e8;
  border-radius: 6px;
  font-size: 11px;
  color: #ff5722;
  font-weight: 600;
}

.article-title {
  font-size: 15px;
  font-weight: 600;
  color: #333;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.article-date {
  font-size: 12px;
  color: #999;
}

.article-thumb {
  width: 100px;
  height: 76px;
  border-radius: 10px;
  flex-shrink: 0;
  object-fit: cover;
}
</style>
