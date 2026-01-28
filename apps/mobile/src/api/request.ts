import axios from 'axios'
import type { AxiosInstance, AxiosResponse } from 'axios'
import { showToast } from 'vant'
import type { AxiosAdapter, AxiosRequestConfig } from 'axios'
import { OFFLINE_MODE, resolveApiBaseUrl } from '@/config/runtime'

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

const OFFLINE_MOMENTS_KEY = 'offline_moments'
const OFFLINE_REMINDERS_KEY = 'offline_reminders'

const safeJsonParse = <T>(raw: string | null, fallback: T) => {
  if (!raw) return fallback
  try {
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

const getOfflineMoments = () =>
  safeJsonParse<any[]>(localStorage.getItem(OFFLINE_MOMENTS_KEY), []).filter(Boolean)
const setOfflineMoments = (moments: any[]) =>
  localStorage.setItem(OFFLINE_MOMENTS_KEY, JSON.stringify(moments))

const getOfflineReminders = () =>
  safeJsonParse<any[]>(localStorage.getItem(OFFLINE_REMINDERS_KEY), []).filter(Boolean)
const setOfflineReminders = (reminders: any[]) =>
  localStorage.setItem(OFFLINE_REMINDERS_KEY, JSON.stringify(reminders))

const parseConfigData = (data: any) => {
  if (!data) return {}
  if (typeof data === 'string') return safeJsonParse<Record<string, any>>(data, {})
  return data as Record<string, any>
}

const buildMockAdapter = (payload: any): AxiosAdapter => {
  return async (config) => ({
    data: payload,
    status: 200,
    statusText: 'OK',
    headers: {},
    config
  })
}

const attachOfflineAdapter = (config: AxiosRequestConfig) => {
  if (!OFFLINE_MODE) return config

  const url = (config.url || '').split('?')[0] ?? ''
  const method = (config.method || 'get').toLowerCase()

  if (url === '/auth/dev-login' && method === 'post') {
    const data = parseConfigData(config.data)
    const phone = (data.phone as string | undefined) || '13800000000'
    ;(config as any).adapter = buildMockAdapter({
      success: true,
      data: { token: 'offline-token', userId: `offline_${Date.now()}`, phone }
    })
    return config
  }

  if (url === '/chat/health-manager' && method === 'post') {
    const data = parseConfigData(config.data)
    const message = (data.message as string | undefined) || ''
    const sessionId = (data.sessionId as string | undefined) || `offline_s_${Date.now()}`
    ;(config as any).adapter = buildMockAdapter({
      success: true,
      data: { sessionId, message: `（离线演示）我收到了：${message.slice(0, 200)}` }
    })
    return config
  }

  if (url === '/chat/expert-group' && method === 'post') {
    const data = parseConfigData(config.data)
    const message = (data.message as string | undefined) || ''
    const sessionId = (data.sessionId as string | undefined) || `offline_s_${Date.now()}`
    const replies = [
      { expertType: 'emotion', message: `（离线·情绪）听起来你在说：${message.slice(0, 60)}` },
      { expertType: 'psychology', message: '（离线·心理）可以试试把问题拆成可控的小步骤。' },
      { expertType: 'sleep', message: '（离线·睡眠）今晚固定入睡时间，睡前减少屏幕刺激。' },
      { expertType: 'nutrition', message: '（离线·营养）优先保证蛋白质和蔬菜摄入，少油少糖。' },
      { expertType: 'safety', message: '（离线·安全）如有胸痛/呼吸困难等急症，请立即就医。' }
    ]
    ;(config as any).adapter = buildMockAdapter({ success: true, data: { sessionId, replies } })
    return config
  }

  if (url === '/moment/create' && method === 'post') {
    const data = parseConfigData(config.data)
    const content = (data.content as string | undefined) || ''
    const images = (data.images as string[] | undefined) || []
    const moments = getOfflineMoments()
    const item = { id: Date.now(), content, images, createdAt: new Date().toISOString() }
    setOfflineMoments([item, ...moments])
    ;(config as any).adapter = buildMockAdapter({ success: true, data: { id: item.id } })
    return config
  }

  if (url === '/moment/list' && method === 'get') {
    const params = (config.params || {}) as any
    const page = Number(params.page || 1)
    const limit = Number(params.limit || 10)
    const moments = getOfflineMoments()
    const start = (page - 1) * limit
    const slice = moments.slice(start, start + limit)
    ;(config as any).adapter = buildMockAdapter({ success: true, data: { moments: slice } })
    return config
  }

  if (url === '/reminder/list' && method === 'get') {
    const params = (config.params || {}) as any
    const wantActiveRaw = params.isActive
    const wantActive =
      typeof wantActiveRaw === 'boolean'
        ? wantActiveRaw
        : String(wantActiveRaw ?? 'true') === 'true'
    const reminders = getOfflineReminders().filter((r) => {
      const isActive = r.isActive === true || r.isActive === 1
      return wantActive ? isActive : !isActive
    })
    ;(config as any).adapter = buildMockAdapter({ success: true, data: { reminders } })
    return config
  }

  if (url === '/reminder/create' && method === 'post') {
    const data = parseConfigData(config.data)
    const reminders = getOfflineReminders()
    const item = {
      id: Date.now(),
      medicineName: data.medicineName || '',
      dosage: data.dosage || '',
      reminderTime: data.reminderTime || '',
      frequency: data.frequency || '每天',
      isActive: 1,
      notes: data.notes || '',
      createdAt: new Date().toISOString()
    }
    setOfflineReminders([item, ...reminders])
    ;(config as any).adapter = buildMockAdapter({ success: true, data: { id: item.id } })
    return config
  }

  if (url.startsWith('/reminder/delete/') && method === 'delete') {
    const id = url.split('/').pop()
    const reminders = getOfflineReminders().filter((r) => String(r.id) !== String(id))
    setOfflineReminders(reminders)
    ;(config as any).adapter = buildMockAdapter({ success: true, data: { ok: true } })
    return config
  }

  if (url.startsWith('/reminder/update/') && method === 'put') {
    const id = url.split('/').pop()
    const data = parseConfigData(config.data)
    const reminders = getOfflineReminders()
    const next = reminders.map((r) => (String(r.id) === String(id) ? { ...r, ...data } : r))
    setOfflineReminders(next)
    ;(config as any).adapter = buildMockAdapter({ success: true, data: { ok: true } })
    return config
  }

  return config
}

const service: AxiosInstance = axios.create({
  baseURL: resolveApiBaseUrl(),
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    attachOfflineAdapter(config)

    // 从 localStorage 获取 token
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  (((response: AxiosResponse) => {
    const res = response.data as ApiResponse

    // 后端统一返回 { success, data, message/error }
    if (res && res.success === false) {
      const message = res.error || res.message || '请求失败'
      showToast({ message, position: 'top' })
      return Promise.reject(new Error(message))
    }

    return res
  }) as any),
  (error) => {
    console.error('响应错误:', error)

    let message = '网络错误，请稍后重试'

    if (error.response) {
      switch (error.response.status) {
        case 401:
          message = '未授权，请重新登录'
          if (!OFFLINE_MODE) {
            localStorage.removeItem('token')
            window.location.href = '/login'
          }
          break
        case 403:
          message = '拒绝访问'
          break
        case 404:
          message = '请求的资源不存在'
          break
        case 500:
          message = '服务器错误'
          break
        default:
          message = error.response.data?.error || error.response.data?.message || '请求失败'
      }
    }

    showToast({
      message,
      position: 'top'
    })

    return Promise.reject(error)
  }
)

export default service
