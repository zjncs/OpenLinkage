import request from './request'

export const sendHealthManagerMessage = (message: string, sessionId?: string | null) => {
  return request({
    url: '/chat/health-manager',
    method: 'post',
    data: { message, sessionId: sessionId || undefined }
  })
}

export const sendExpertGroupMessage = (message: string, sessionId?: string | null) => {
  return request({
    url: '/chat/expert-group',
    method: 'post',
    data: { message, sessionId: sessionId || undefined }
  })
}

