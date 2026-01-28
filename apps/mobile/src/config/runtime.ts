import { Capacitor } from '@capacitor/core'

export const resolveApiBaseUrl = () => {
  const envUrl = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api') as string
  try {
    const url = new URL(envUrl)
    const isLoopback = url.hostname === 'localhost' || url.hostname === '127.0.0.1'

    // Android Emulator: host machine loopback is 10.0.2.2
    if (Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android' && isLoopback) {
      url.hostname = '10.0.2.2'
      return url.toString().replace(/\/$/, '')
    }

    return envUrl.replace(/\/$/, '')
  } catch {
    return envUrl.replace(/\/$/, '')
  }
}

const resolveOfflineMode = () => {
  const raw = (import.meta.env.VITE_DISABLE_AUTH as string | undefined) ?? undefined
  const envDisableAuth = raw === 'true'
  const envEnableAuth = raw === 'false'

  if (envDisableAuth) return true
  if (envEnableAuth) return false

  // Native + loopback baseURL usually means "no backend yet".
  const base = resolveApiBaseUrl()
  try {
    const url = new URL(base)
    const isLoopback = url.hostname === 'localhost' || url.hostname === '127.0.0.1'
    return Capacitor.isNativePlatform() && isLoopback
  } catch {
    return false
  }
}

export const OFFLINE_MODE = resolveOfflineMode()
