import request from './request'

export interface MomentItem {
  id: number
  content: string
  images: string[]
  createdAt: string
}

export const createMoment = (payload: { content: string; images?: string[] }) => {
  return request({
    url: '/moment/create',
    method: 'post',
    data: payload
  })
}

export const listMoments = (page: number = 1, limit: number = 10) => {
  return request({
    url: '/moment/list',
    method: 'get',
    params: { page, limit }
  })
}

