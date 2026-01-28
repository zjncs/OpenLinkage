import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore('user', () => {
  const token = ref<string>('')
  const userInfo = ref<any>(null)
  const phone = ref<string>('')

  // 初始化从本地存储加载
  const init = () => {
    const savedToken = localStorage.getItem('token')
    const savedUserInfo = localStorage.getItem('userInfo')
    const savedPhone = localStorage.getItem('phone')

    if (savedToken) token.value = savedToken
    if (savedUserInfo) userInfo.value = JSON.parse(savedUserInfo)
    if (savedPhone) phone.value = savedPhone
  }

  // 设置 token
  const setToken = (newToken: string) => {
    token.value = newToken
    localStorage.setItem('token', newToken)
  }

  // 设置用户信息
  const setUserInfo = (info: any) => {
    userInfo.value = info
    localStorage.setItem('userInfo', JSON.stringify(info))
  }

  // 设置手机号
  const setPhone = (newPhone: string) => {
    phone.value = newPhone
    localStorage.setItem('phone', newPhone)
  }

  // 清除用户信息
  const clearUser = () => {
    token.value = ''
    userInfo.value = null
    phone.value = ''
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
    localStorage.removeItem('phone')
  }

  return {
    token,
    userInfo,
    phone,
    init,
    setToken,
    setUserInfo,
    setPhone,
    clearUser
  }
})
