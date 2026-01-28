<template>
  <div class="reminder-container app-page">
    <van-nav-bar title="用药提醒" left-arrow @click-left="$router.back()" fixed />

    <div class="content">
      <div class="calendar-section">
        <div class="calendar-header">
          <div class="month-text">{{ currentMonth }}</div>
        </div>
        <div class="calendar-grid">
          <div
            v-for="d in calendarDays"
            :key="d"
            class="calendar-day"
            :class="{ today: d === todayDate, selected: d === selectedDate }"
            @click="selectedDate = d"
          >
            <div class="day-number">{{ d }}</div>
          </div>
        </div>
      </div>

      <div class="reminder-section">
        <div class="section-title">食药提醒</div>

        <div v-if="!loading && reminders.length === 0" class="empty-state">
          <div class="empty-text">暂无提醒</div>
          <div class="empty-hint">点击右下角"+"添加提醒</div>
        </div>

        <div v-else class="reminder-list">
          <div v-for="r in reminders" :key="r.id" class="reminder-item">
            <div class="medicine-icon">
              <div class="icon-text">💊</div>
            </div>
            <div class="reminder-info">
              <div class="medicine-name">
                <span class="name-text">{{ r.medicineName }}</span>
                <span class="dosage-text">{{ r.dosage }}</span>
              </div>
              <div class="reminder-time">
                <span class="time-icon">🕐</span>
                <span class="time-text">{{ r.reminderTime }}</span>
                <span class="frequency-icon">📅</span>
                <span class="frequency-text">{{ r.frequency }}</span>
              </div>
            </div>
            <div class="reminder-actions">
              <div class="delete-btn" @click="onDelete(r.id)">删除</div>
            </div>
          </div>
        </div>
      </div>

      <div class="add-btn" @click="$router.push('/add-reminder')">
        <div class="add-icon">+</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { showConfirmDialog, showToast } from 'vant'
import { deleteReminder, listReminders, type ReminderItem } from '@/api/reminder'

const reminders = ref<ReminderItem[]>([])
const loading = ref(false)
const selectedDate = ref<number>(new Date().getDate())
const todayDate = new Date().getDate()
const currentMonth = ref('')
const calendarDays = ref<number[]>([])

const initCalendar = () => {
  const today = new Date()
  const year = today.getFullYear()
  const month0 = today.getMonth()
  currentMonth.value = `${year}年${month0 + 1}月`
  const daysInMonth = new Date(year, month0 + 1, 0).getDate()
  calendarDays.value = Array.from({ length: daysInMonth }, (_, i) => i + 1)
}

const load = async () => {
  loading.value = true
  try {
    const res: any = await listReminders(true)
    reminders.value = res.data?.reminders || []
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  initCalendar()
  load()
})

const onDelete = async (id: number) => {
  try {
    await showConfirmDialog({ title: '确认删除', message: '确定要删除这个提醒吗？' })
    await deleteReminder(id)
    showToast('删除成功')
    await load()
  } catch {
    // cancel
  }
}
</script>

<style scoped>
.content {
  padding-top: 46px;
  height: calc(100vh - 46px);
  padding: 12px 0 80px;
}

.reminder-container {
  min-height: 100vh;
  background: #f5f5f5;
}

.calendar-section {
  background: white;
  padding: 16px;
  margin-bottom: 10px;
}

.calendar-header {
  margin-bottom: 10px;
}

.month-text {
  font-size: 16px;
  font-weight: 800;
  color: #333;
}

.calendar-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.calendar-day {
  width: calc((100% - 36px) / 7);
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: #f8f8f8;
}

.calendar-day.today,
.calendar-day.selected {
  background: #667eea;
  color: white;
}

.day-number {
  font-size: 14px;
  font-weight: 600;
}

.reminder-section {
  background: white;
  padding: 16px;
}

.section-title {
  font-size: 16px;
  font-weight: 800;
  color: #333;
  margin-bottom: 14px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 0;
}

.empty-text {
  font-size: 14px;
  color: #999;
  margin-bottom: 6px;
}

.empty-hint {
  font-size: 12px;
  color: #ccc;
}

.reminder-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.reminder-item {
  display: flex;
  align-items: center;
  padding: 14px;
  background: #f8f8f8;
  border-radius: 14px;
}

.medicine-icon {
  width: 40px;
  height: 40px;
  background: white;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 10px;
}

.icon-text {
  font-size: 20px;
}

.reminder-info {
  flex: 1;
}

.medicine-name {
  margin-bottom: 6px;
}

.name-text {
  font-size: 15px;
  font-weight: 800;
  color: #333;
  margin-right: 6px;
}

.dosage-text {
  font-size: 12px;
  color: #999;
}

.reminder-time {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.time-icon,
.frequency-icon {
  font-size: 12px;
}

.time-text,
.frequency-text {
  font-size: 12px;
  color: #666;
}

.reminder-actions {
  margin-left: 10px;
}

.delete-btn {
  padding: 6px 10px;
  background: #ff6b6b;
  color: white;
  border-radius: 8px;
  font-size: 12px;
}

.add-btn {
  position: fixed;
  right: 14px;
  bottom: calc(20px + env(safe-area-inset-bottom));
  width: 50px;
  height: 50px;
  background: #4caf50;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6px 18px rgba(76, 175, 80, 0.35);
}

.add-icon {
  font-size: 30px;
  color: white;
  font-weight: 300;
  line-height: 1;
}
</style>
