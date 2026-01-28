<template>
  <div class="profile-container app-page with-tabbar">
    <div class="header">
      <div class="user-info">
        <img class="avatar" :src="userAvatar" alt="avatar" />
        <div class="user-details">
          <div class="username">{{ displayName }}</div>
          <div class="phone">{{ maskedPhone }}</div>
        </div>
      </div>

      <div class="settings-btn" @click="toastDev('设置功能开发中')">
        <van-icon name="setting-o" size="22" color="rgba(255,255,255,0.95)" />
      </div>
    </div>

    <div class="quick-actions">
      <div class="action-item" @click="toastDev('升级账户功能开发中')">
        <img class="action-icon" :src="userShoppingcar" alt="upgrade" />
        <div class="action-text">升级账户</div>
      </div>
      <div class="action-item" @click="toastDev('我的订单功能开发中')">
        <img class="action-icon" :src="userOrder" alt="orders" />
        <div class="action-text">我的订单</div>
      </div>
      <div class="action-item" @click="toastDev('我的余额功能开发中')">
        <img class="action-icon" :src="userMoneybag" alt="balance" />
        <div class="action-text">我的余额</div>
      </div>
    </div>

    <div class="content">
      <div class="section-card">
        <div class="section-title">健康服务</div>
        <div class="menu-list">
          <div class="menu-item" @click="toastDev('健康档案功能开发中')">
            <div class="menu-left">
              <img class="menu-icon" :src="iconHealthRecord" alt="健康档案" />
              <div class="menu-text">健康档案</div>
            </div>
            <van-icon name="arrow" color="rgba(0,0,0,0.25)" />
          </div>
          <div class="menu-item" @click="toastDev('专业分析功能开发中')">
            <div class="menu-left">
              <img class="menu-icon" :src="iconAnalysis" alt="专业分析" />
              <div class="menu-text">专业分析</div>
            </div>
            <van-icon name="arrow" color="rgba(0,0,0,0.25)" />
          </div>
          <div class="menu-item" @click="toastDev('数据查看功能开发中')">
            <div class="menu-left">
              <img class="menu-icon" :src="iconDataView" alt="数据查看" />
              <div class="menu-text">数据查看</div>
            </div>
            <van-icon name="arrow" color="rgba(0,0,0,0.25)" />
          </div>
          <div class="menu-item" @click="goToReport">
            <div class="menu-left">
              <img class="menu-icon" :src="iconReport" alt="日报周报" />
              <div class="menu-text">日报周报</div>
            </div>
            <van-icon name="arrow" color="rgba(0,0,0,0.25)" />
          </div>
        </div>
      </div>

      <div class="section-card">
        <div class="section-title">常用工具</div>
        <div class="menu-list">
          <div class="menu-item" @click="toastDev('邀请好友功能开发中')">
            <div class="menu-left">
              <img class="menu-icon" :src="iconInvite" alt="邀请好友" />
              <div class="menu-text">邀请好友</div>
            </div>
            <van-icon name="arrow" color="rgba(0,0,0,0.25)" />
          </div>
          <div class="menu-item" @click="toastDev('用户反馈功能开发中')">
            <div class="menu-left">
              <img class="menu-icon" :src="iconFeedback" alt="用户反馈" />
              <div class="menu-text">用户反馈</div>
            </div>
            <van-icon name="arrow" color="rgba(0,0,0,0.25)" />
          </div>
          <div class="menu-item" @click="toastDev('帮助中心功能开发中')">
            <div class="menu-left">
              <img class="menu-icon" :src="iconHelp" alt="帮助中心" />
              <div class="menu-text">帮助中心</div>
            </div>
            <van-icon name="arrow" color="rgba(0,0,0,0.25)" />
          </div>
          <div class="menu-item" @click="toastDev('联系客服功能开发中')">
            <div class="menu-left">
              <img class="menu-icon" :src="iconService" alt="联系客服" />
              <div class="menu-text">联系客服</div>
            </div>
            <van-icon name="arrow" color="rgba(0,0,0,0.25)" />
          </div>
        </div>
      </div>

      <div class="section-card">
        <div class="menu-item danger" @click="logout">
          <div class="menu-left">
            <van-icon name="warning-o" color="#ff6b6b" />
            <div class="menu-text">退出登录</div>
          </div>
          <van-icon name="arrow" color="rgba(0,0,0,0.25)" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { showConfirmDialog, showToast } from 'vant'
import { useUserStore } from '@/store/user'

import userAvatar from '@/assets/images/user-avatar.png'
import userShoppingcar from '@/assets/images/user-shoppingcar.png'
import userOrder from '@/assets/images/user-order.png'
import userMoneybag from '@/assets/images/user-moneybag.png'
import iconHealthRecord from '@/assets/images/user-健康档案.png'
import iconAnalysis from '@/assets/images/user-专业分析.png'
import iconDataView from '@/assets/images/user-数据查看.png'
import iconReport from '@/assets/images/user-日报周报.png'
import iconInvite from '@/assets/images/user-邀请好友.png'
import iconFeedback from '@/assets/images/user-用户反馈.png'
import iconHelp from '@/assets/images/user-帮助中心.png'
import iconService from '@/assets/images/user-联系客服.png'

const router = useRouter()
const userStore = useUserStore()

const displayName = computed(() => userStore.userInfo?.name || '金小天')

const maskedPhone = computed(() => {
  const p = userStore.phone || userStore.userInfo?.phone || '12345678901'
  if (typeof p !== 'string') return '123****7890'
  if (p.length < 7) return p
  return `${p.slice(0, 3)}****${p.slice(-4)}`
})

const toastDev = (message: string) => showToast({ message, position: 'top' })

const goToReport = () => {
  router.push({ path: '/health-report' })
}

const logout = async () => {
  try {
    await showConfirmDialog({ title: '退出登录', message: '确定要退出登录吗？' })
    userStore.clearUser()
    router.replace('/login')
  } catch {
    // cancel
  }
}
</script>

<style scoped>
.profile-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--app-bg);
}

.header {
  background: linear-gradient(135deg, var(--app-primary) 0%, var(--app-primary-2) 100%);
  padding: 20px 16px 16px;
  padding-top: calc(20px + env(safe-area-inset-top));
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.3);
  object-fit: cover;
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.username {
  font-size: 18px;
  font-weight: 800;
  color: #fff;
}

.phone {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
}

.settings-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}


.quick-actions {
  background: linear-gradient(135deg, var(--app-primary) 0%, var(--app-primary-2) 100%);
  padding: 0 16px 18px;
  display: flex;
  justify-content: space-around;
  gap: 10px;
}

.action-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.action-icon {
  width: 28px;
  height: 28px;
}

.action-text {
  font-size: 13px;
  color: #fff;
}

.content {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

.section-card {
  background-color: #fff;
  border-radius: var(--app-radius-lg);
  padding: 14px;
  margin-bottom: 10px;
}

.section-title {
  font-size: 16px;
  font-weight: 800;
  color: #333;
  margin-bottom: 10px;
}

.menu-list {
  display: flex;
  flex-direction: column;
}

.menu-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f5f5f5;
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-item.danger .menu-text {
  color: #ff6b6b;
}

.menu-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.menu-icon {
  width: 22px;
  height: 22px;
}

.menu-text {
  font-size: 15px;
  color: #333;
}

</style>
