<template>
  <div class="login-container">
    <div class="login-card">
      <div class="logo-container">
        <img class="logo-image" :src="loginImage" alt="login" />
      </div>

      <van-field v-model="phone" type="tel" placeholder="演示手机号（可不填）" :maxlength="11" clearable />

      <van-button
        type="primary"
        block
        round
        :loading="loading"
        @click="handleDevLogin"
        class="login-button"
      >
        {{ OFFLINE_MODE ? '微信一键登录（演示）' : '一键体验' }}
      </van-button>

      <div class="login-tip">
        {{ OFFLINE_MODE ? '当前为无后端模式：已启用离线体验。' : '无需短信权限；默认使用演示账号登录。' }}
      </div>
    </div>

    <!-- 底部Logo -->
    <div class="bottom-logo">
      <span class="logo-text">linkage</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { devLogin } from '@/api/auth'
import { useUserStore } from '@/store/user'
import { OFFLINE_MODE } from '@/config/runtime'
import loginImage from '@/assets/images/login.png'

const router = useRouter()
const userStore = useUserStore()

const phone = ref('')
const loading = ref(false)

const offlineLogin = () => {
  const resolvedPhone = phone.value || '13800000000'
  userStore.setToken('offline-token')
  userStore.setPhone(resolvedPhone)
  userStore.setUserInfo({ id: `offline_${Date.now()}`, phone: resolvedPhone })
  router.push('/chat')
}

const handleDevLogin = async () => {
  if (OFFLINE_MODE) {
    offlineLogin()
    return
  }

  loading.value = true

  try {
    if (phone.value && !/^1[3-9]\d{9}$/.test(phone.value)) {
      showToast('请输入正确的手机号')
      return
    }

    const res: any = await devLogin(phone.value || undefined)

    // 保存 token 和用户信息
    userStore.setToken(res.data.token)
    userStore.setPhone(res.data.phone || phone.value || '')
    userStore.setUserInfo({ id: res.data.userId, phone: res.data.phone || phone.value || '' })

    showToast('登录成功')

    // 跳转到聊天页面
    setTimeout(() => {
      router.push('/chat')
    }, 500)
  } catch (error) {
    console.error('登录失败:', error)
    showToast('后端不可用，已进入离线体验')
    offlineLogin()
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  background-color: #f5f5f5;
  padding: 20px;
  padding-top: 100px;
}

.login-card {
  width: 100%;
  max-width: 400px;
  background-color: white;
  border-radius: 16px;
  padding: 50px 30px 40px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.logo-container {
  margin-bottom: 50px;
}

.logo-image {
  width: 200px;
  height: 100px;
  object-fit: contain;
}

.login-button {
  width: 100%;
  margin-top: 20px;
  height: 44px;
  background-color: #4caf50;
  border-color: #4caf50;
  font-size: 16px;
  font-weight: 500;
  box-shadow: 0 4px 16px rgba(76, 175, 80, 0.3);
}

.login-tip {
  margin-top: 14px;
  font-size: 12px;
  color: #8c8c8c;
  text-align: center;
}

.bottom-logo {
  position: absolute;
  bottom: 50px;
}

.logo-text {
  font-size: 24px;
  font-weight: 300;
  color: #4caf50;
  letter-spacing: 1px;
}
</style>
