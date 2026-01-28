<template>
  <div class="page-container">
    <van-nav-bar title="聊天" fixed />

    <div class="content">
      <van-tabs v-model:active="currentTab" sticky offset-top="46">
        <van-tab v-for="t in tabs" :key="t" :title="t">
          <div v-if="currentTab === 0 || currentTab === 1" class="chat-wrap">
            <div ref="messageListRef" class="message-list">
              <div v-for="msg in messages" :key="msg.id" class="message-row" :class="msg.role">
                <div v-if="msg.role !== 'user'" class="avatar ai-avatar">
                  <span v-if="msg.expertIcon" class="expert-icon" :style="{ background: msg.expertColor }">
                    {{ msg.expertIcon }}
                  </span>
                  <span v-else class="expert-icon default">AI</span>
                </div>

                <div class="bubble-wrap" :class="msg.role">
                  <div v-if="msg.expertName" class="expert-name" :style="{ color: msg.expertColor }">
                    {{ msg.expertName }}
                  </div>
                  <div class="bubble">
                    {{ msg.content }}
                  </div>
                  <div class="time">{{ msg.time }}</div>
                </div>

                <div v-if="msg.role === 'user'" class="avatar user-avatar">
                  我
                </div>
              </div>
            </div>

            <div class="composer">
              <van-field
                v-model="inputValue"
                placeholder="输入消息…"
                clearable
                :disabled="loading"
                @keyup.enter="sendMessage"
              />
              <van-button type="primary" :loading="loading" class="send-btn" @click="sendMessage">
                发送
              </van-button>
            </div>
          </div>

          <div v-else-if="currentTab === 2" class="list-wrap">
            <van-cell-group inset>
              <van-cell
                v-for="m in familyMembers"
                :key="m.id"
                :title="m.name"
                :label="m.lastMessage"
                is-link
                @click="openChatDetail('family', m)"
              >
                <template #icon>
                  <div class="list-avatar">{{ m.name.slice(0, 1) }}</div>
                </template>
                <template #right-icon>
                  <div class="list-time">{{ m.time }}</div>
                </template>
              </van-cell>
            </van-cell-group>
          </div>

          <div v-else class="list-wrap">
            <van-cell-group inset>
              <van-cell
                v-for="d in doctors"
                :key="d.id"
                :title="d.name"
                :label="`${d.title} · ${d.lastMessage}`"
                is-link
                @click="openChatDetail('doctor', d)"
              >
                <template #icon>
                  <div class="list-avatar doctor">{{ d.name.slice(0, 1) }}</div>
                </template>
                <template #right-icon>
                  <div class="list-time">{{ d.time }}</div>
                </template>
              </van-cell>
            </van-cell-group>
          </div>
        </van-tab>
      </van-tabs>
    </div>
  </div>
</template>

<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { sendExpertGroupMessage, sendHealthManagerMessage } from '@/api/chat'

type ChatRole = 'user' | 'assistant'

interface ChatMessage {
  id: string
  role: ChatRole
  content: string
  time: string
  expertName?: string
  expertColor?: string
  expertIcon?: string
}

const router = useRouter()

const currentTab = ref(0)
const tabs = ['管家', '群聊', '家人', '医生']

const inputValue = ref('')
const loading = ref(false)

const messages = ref<ChatMessage[]>([])
const sessionId = ref<string | null>(null)

const messageListRef = ref<HTMLDivElement | null>(null)

const experts = [
  { type: 'emotion', name: '情绪专家', color: '#FF6B9D', icon: '情' },
  { type: 'psychology', name: '心理专家', color: '#C77DFF', icon: '心' },
  { type: 'sleep', name: '睡眠专家', color: '#FFB347', icon: '睡' },
  { type: 'nutrition', name: '营养专家', color: '#4ECDC4', icon: '营' },
  { type: 'safety', name: '安全专家', color: '#95E1D3', icon: '安' }
]

const familyMembers = ref([
  {
    id: '1',
    name: '女儿',
    lastMessage: '妈妈，今天天气不错，大家都要多喝水。',
    time: '3分钟前'
  },
  {
    id: '2',
    name: '儿子',
    lastMessage: '妈妈，今天气温骤降了，出门记得穿多点。',
    time: '15分钟前'
  },
  {
    id: '3',
    name: '孙女',
    lastMessage: '奶奶，周末我来看你哦！',
    time: '1小时前'
  },
  {
    id: '4',
    name: '老伴',
    lastMessage: '我今天散步了7500步，感觉腿脚松快多了。',
    time: '1小时前'
  }
])

const doctors = ref([
  {
    id: '1',
    name: '田晓楠',
    title: '主任医师',
    lastMessage: '您的血压控制得不错，继续保持。',
    time: '9月17日 10:32'
  }
])

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

const resetChat = () => {
  messages.value = []
  sessionId.value = null
  inputValue.value = ''
}

watch(currentTab, () => {
  resetChat()
})

onMounted(() => {
  resetChat()
})

const sendMessage = async () => {
  const content = inputValue.value.trim()
  if (!content) {
    showToast('请输入消息')
    return
  }

  const userMsg: ChatMessage = {
    id: `${Date.now()}_u`,
    role: 'user',
    content,
    time: formatTime(new Date())
  }
  messages.value = [...messages.value, userMsg]
  inputValue.value = ''
  loading.value = true
  await scrollToBottom()

  try {
    if (currentTab.value === 0) {
      const res: any = await sendHealthManagerMessage(content, sessionId.value)
      const aiMsg: ChatMessage = {
        id: `${Date.now()}_a`,
        role: 'assistant',
        content: res.data.message,
        time: formatTime(new Date())
      }
      messages.value = [...messages.value, aiMsg]
      sessionId.value = res.data.sessionId
    } else if (currentTab.value === 1) {
      const res: any = await sendExpertGroupMessage(content, sessionId.value)
      const replies = (res.data?.replies || []) as Array<{ expertType: string; message: string }>
      const mapped: ChatMessage[] = replies.map((r, idx) => {
        const e = experts.find((x) => x.type === r.expertType) || experts[idx]
        return {
          id: `${Date.now()}_${idx}_e`,
          role: 'assistant',
          content: r.message,
          time: formatTime(new Date()),
          expertName: e?.name,
          expertColor: e?.color,
          expertIcon: e?.icon
        }
      })
      messages.value = [...messages.value, ...mapped]
      sessionId.value = res.data.sessionId
    }
  } catch (e: any) {
    showToast(e?.message || '发送失败')
  } finally {
    loading.value = false
    await scrollToBottom()
  }
}

const openChatDetail = (type: 'family' | 'doctor', item: any) => {
  router.push({
    path: '/chat-detail',
    query: { type, id: item.id, name: item.name }
  })
}
</script>

<style scoped>
.page-container {
  height: 100vh;
  background-color: #f5f5f5;
}

.content {
  padding-top: 46px;
  height: calc(100vh - 46px - 50px);
}

.chat-wrap {
  height: calc(100vh - 46px - 44px - 50px);
  display: flex;
  flex-direction: column;
  padding: 12px 12px 10px;
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

.ai-avatar .expert-icon {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
}

.ai-avatar .expert-icon.default {
  background: #9e9e9e;
}

.bubble-wrap {
  max-width: 78%;
}

.bubble-wrap.user {
  text-align: right;
}

.expert-name {
  font-size: 12px;
  margin-bottom: 4px;
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

.list-wrap {
  padding: 12px 0;
}

.list-avatar {
  width: 36px;
  height: 36px;
  border-radius: 12px;
  background: #e8f5e9;
  color: #2e7d32;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  margin-right: 8px;
}

.list-avatar.doctor {
  background: #e3f2fd;
  color: #1565c0;
}

.list-time {
  font-size: 12px;
  color: #9e9e9e;
}
</style>
