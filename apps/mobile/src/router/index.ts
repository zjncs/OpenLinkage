import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { OFFLINE_MODE } from '@/config/runtime'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/chat'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/chat',
    name: 'Chat',
    component: () => import('@/views/Chat.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/chat-detail',
    name: 'ChatDetail',
    component: () => import('@/views/ChatDetail.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/history',
    name: 'History',
    component: () => import('@/views/History.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/moment',
    name: 'Moment',
    component: () => import('@/views/Moment.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/article',
    name: 'Article',
    component: () => import('@/views/Article.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/views/Profile.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/health-report',
    name: 'HealthReport',
    component: () => import('@/views/HealthReport.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/reminder',
    name: 'Reminder',
    component: () => import('@/views/Reminder.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/add-reminder',
    name: 'AddReminder',
    component: () => import('@/views/AddReminder.vue'),
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, _from, next) => {
  if (OFFLINE_MODE) {
    // 无后端时：保留登录页展示，但不做鉴权拦截
    next()
    return
  }

  const token = localStorage.getItem('token')

  if (to.meta.requiresAuth && !token) {
    next('/login')
  } else if (to.path === '/login' && token) {
    next('/chat')
  } else {
    next()
  }
})

export default router
