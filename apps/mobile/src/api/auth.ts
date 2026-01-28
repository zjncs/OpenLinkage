import request from './request'

// 演示登录（无需短信/微信权限）
export const devLogin = (phone?: string) => {
  return request({
    url: '/auth/dev-login',
    method: 'post',
    data: phone ? { phone } : {}
  })
}

// 保留：短信验证码（如未来接入权限再启用）
export const sendSmsCode = (phone: string) => {
  return request({
    url: '/auth/phone/send-code',
    method: 'post',
    data: { phone }
  })
}

// 保留：手机号登录（如未来接入权限再启用）
export const phoneLogin = (phone: string, code: string) => {
  return request({
    url: '/auth/phone/login',
    method: 'post',
    data: { phone, code }
  })
}

