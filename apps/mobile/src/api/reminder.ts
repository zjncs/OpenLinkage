import request from './request'

export interface ReminderItem {
  id: number
  medicineName: string
  dosage: string
  reminderTime: string
  frequency: string
  isActive: number | boolean
  notes: string
  createdAt: string
}

export const listReminders = (isActive: boolean = true) => {
  return request({
    url: '/reminder/list',
    method: 'get',
    params: { isActive }
  })
}

export const createReminder = (payload: {
  medicineName: string
  dosage?: string
  reminderTime: string
  frequency?: string
  notes?: string
}) => {
  return request({
    url: '/reminder/create',
    method: 'post',
    data: payload
  })
}

export const updateReminder = (
  id: number | string,
  payload: {
    medicineName: string
    dosage?: string
    reminderTime: string
    frequency?: string
    isActive: boolean | number
    notes?: string
  }
) => {
  return request({
    url: `/reminder/update/${id}`,
    method: 'put',
    data: payload
  })
}

export const deleteReminder = (id: number | string) => {
  return request({
    url: `/reminder/delete/${id}`,
    method: 'delete'
  })
}

