<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const active = ref(0)

// 底部导航栏配置
const tabbarItems = [
  { name: 'chat', label: '聊天', icon: 'chat-o' },
  { name: 'history', label: '历史', icon: 'clock-o' },
  { name: 'moment', label: '动态', icon: 'photo-o' },
  { name: 'article', label: '文章', icon: 'notes-o' },
  { name: 'profile', label: '我的', icon: 'user-o' }
]

// 判断是否显示底部导航栏
const showTabbar = computed(() => {
  const hiddenRoutes = ['/login', '/chat-detail', '/health-report', '/add-reminder', '/reminder']
  return !hiddenRoutes.includes(route.path)
})

watch(
  () => route.path,
  (path) => {
    const index = tabbarItems.findIndex((i) => `/${i.name}` === path)
    if (index >= 0) active.value = index
  },
  { immediate: true }
)

// 切换标签
const onChange = (index: number) => {
  const item = tabbarItems[index]
  if (!item) return
  router.push(`/${item.name}`)
}
</script>

<template>
  <div id="app">
    <router-view />
    <van-tabbar v-if="showTabbar" v-model="active" @change="onChange" active-color="#4CAF50">
      <van-tabbar-item v-for="item in tabbarItems" :key="item.name" :icon="item.icon">
        {{ item.label }}
      </van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

#app {
  width: 100%;
  height: 100%;
  min-height: 100vh;
  background-color: var(--app-bg);
}

.van-tabbar {
  padding-bottom: env(safe-area-inset-bottom);
}
</style>
