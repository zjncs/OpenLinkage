import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface Message {
  id: string
  content: string
  type: 'user' | 'ai' | 'expert'
  timestamp: number
  avatar?: string
  name?: string
}

export const useChatStore = defineStore('chat', () => {
  const messages = ref<Message[]>([])
  const currentChatType = ref<string>('health-manager')

  // 添加消息
  const addMessage = (message: Message) => {
    messages.value.push(message)
  }

  // 清空消息
  const clearMessages = () => {
    messages.value = []
  }

  // 设置当前聊天类型
  const setChatType = (type: string) => {
    currentChatType.value = type
  }

  return {
    messages,
    currentChatType,
    addMessage,
    clearMessages,
    setChatType
  }
})
