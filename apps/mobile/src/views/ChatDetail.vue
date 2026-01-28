<template>
  <div class="page-container">
    <van-nav-bar :title="contactName || '聊天'" left-arrow @click-left="$router.back()" fixed />
    <div class="content">
      <div ref="messageListRef" class="message-list">
        <div v-for="msg in messages" :key="msg.id" class="message-row" :class="msg.role">
          <div v-if="msg.role !== 'user'" class="avatar ai-avatar">
            {{ contactName ? contactName.slice(0, 1) : 'TA' }}
          </div>
          <div class="bubble-wrap" :class="msg.role">
            <div class="bubble">
              {{ msg.content }}
            </div>
            <div class="time">{{ msg.time }}</div>
          </div>
          <div v-if="msg.role === 'user'" class="avatar user-avatar">我</div>
        </div>
      </div>

      <div class="composer">
        <van-field v-model="inputValue" placeholder="输入消息…" clearable @keyup.enter="sendMessage" />
        <van-button type="primary" class="send-btn" @click="sendMessage">发送</van-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { nextTick, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { showToast } from 'vant'

type ChatRole = 'user' | 'assistant'
interface ChatMessage {
  id: string
  role: ChatRole
  content: string
  time: string
}

const route = useRoute()

const contactName = ref<string>('')
const contactType = ref<string>('')
const contactId = ref<string>('')

const messages = ref<ChatMessage[]>([])
const inputValue = ref('')
const messageListRef = ref<HTMLDivElement | null>(null)

const formatTime = (date: Date) => {
  const h = date.getHours().toString().padStart(2, '0')
  const m = date.getMinutes().toString().padStart(2, '0')
  return `${h}:${m}`
}

const scrollToBottom = async () => {
  await nextTick()
  const el = messageListRef.value
  if (!el) return
  el.scrollTop = el.scrollHeight
}

const loadPreset = (type: string, id: string) => {
  let preset: ChatMessage[] = []
  if (type === 'family') {
    if (id === '1') {
      preset = [
        { id: '1', role: 'assistant', content: '妈妈，今天天气不错，大家都要多喝水。', time: '10:15' },
        { id: '2', role: 'user', content: '好的，你也要注意身体哦', time: '10:16' },
        { id: '3', role: 'assistant', content: '嗯嗯，我会的。妈妈你最近血压怎么样？', time: '10:17' }
      ]
    } else if (id === '2') {
      preset = [
        { id: '1', role: 'assistant', content: '妈妈，今天气温骤降了，出门记得穿多点。', time: '09:45' },
        { id: '2', role: 'user', content: '知道了，你在外面工作也要注意保暖', time: '09:50' }
      ]
    } else if (id === '3') {
      preset = [
        { id: '1', role: 'assistant', content: '奶奶，周末我来看你哦！', time: '08:36' },
        { id: '2', role: 'user', content: '好的宝贝，奶奶等你', time: '08:40' }
      ]
    } else if (id === '4') {
      preset = [
        { id: '1', role: 'assistant', content: '我今天散步了7500步，感觉腿脚松快多了。', time: '07:20' },
        { id: '2', role: 'user', content: '真好，我也要多运动运动', time: '07:25' },
        { id: '3', role: 'assistant', content: '一起去公园走走吧，天气挺好的', time: '07:26' }
      ]
    }
  } else if (type === 'doctor') {
    preset = [
      { id: '1', role: 'assistant', content: '您的血压控制得不错，继续保持。', time: '10:32' },
      { id: '2', role: 'user', content: '谢谢田医生，我会继续注意的', time: '10:35' },
      {
        id: '3',
        role: 'assistant',
        content: '记得按时服药，饮食清淡，适量运动。有任何不适随时联系我。',
        time: '10:36'
      }
    ]
  }
  messages.value = preset
}

onMounted(async () => {
  contactType.value = (route.query.type as string) || ''
  contactId.value = (route.query.id as string) || ''
  contactName.value = (route.query.name as string) || ''
  loadPreset(contactType.value, contactId.value)
  await scrollToBottom()
})

const sendMessage = async () => {
  const content = inputValue.value.trim()
  if (!content) return

  messages.value = [
    ...messages.value,
    { id: `${Date.now()}_u`, role: 'user', content, time: formatTime(new Date()) }
  ]
  inputValue.value = ''
  await scrollToBottom()

  showToast('演示页面：此处仅展示预设对话')
}
</script>

<style scoped>
.page-container {
  height: 100vh;
  background-color: #f5f5f5;
}

.content {
  padding-top: 46px;
  height: calc(100vh - 46px);
  display: flex;
  flex-direction: column;
  padding: 12px;
}

.message-list {
  flex: 1;
  overflow-y: auto;
  padding-bottom: 10px;
}

.message-row {
  display: flex;
  gap: 8px;
  margin: 10px 0;
  align-items: flex-end;
}

.message-row.user {
  justify-content: flex-end;
}

.avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  flex: 0 0 auto;
}

.user-avatar {
  background: #4caf50;
  color: #fff;
}

.ai-avatar {
  background: #fff;
  color: #333;
}

.bubble-wrap {
  max-width: 78%;
}

.bubble-wrap.user {
  text-align: right;
}

.bubble {
  display: inline-block;
  padding: 10px 12px;
  border-radius: 14px;
  line-height: 1.4;
  white-space: pre-wrap;
  word-break: break-word;
}

.bubble-wrap.assistant .bubble {
  background: #fff;
  color: #333;
  border-top-left-radius: 6px;
}

.bubble-wrap.user .bubble {
  background: #4caf50;
  color: #fff;
  border-top-right-radius: 6px;
}

.time {
  font-size: 10px;
  color: #9e9e9e;
  margin-top: 4px;
}

.composer {
  display: flex;
  gap: 10px;
  padding: 10px 0 0;
}

.composer :deep(.van-field) {
  flex: 1;
  background: #fff;
  border-radius: 12px;
}

.send-btn {
  border-radius: 12px;
  background: #4caf50;
  border-color: #4caf50;
  min-width: 86px;
}
</style>
