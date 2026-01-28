<template>
  <div class="history-container app-page with-tabbar">
    <div class="calendar-section">
      <div class="weekdays">
        <div v-for="w in weekdays" :key="w" class="weekday">{{ w }}</div>
      </div>

      <div class="calendar-grid">
        <div
          v-for="d in calendarDays"
          :key="d.date"
          class="calendar-day"
          :class="{
            'other-month': !d.isCurrentMonth,
            today: d.isToday,
            selected: selectedDate === d.date
          }"
          @click="selectDate(d.date)"
        >
          <div class="day-number">{{ d.day }}</div>
          <div v-if="d.records.length > 0" class="record-dots">
            <div v-for="r in d.records" :key="r.type" class="dot" :style="{ backgroundColor: r.color }" />
          </div>
        </div>
      </div>
    </div>

    <div class="reminder-section">
      <div class="section-header">
        <div class="section-title">食药提醒</div>
      </div>

      <div v-if="!loading && reminders.length === 0" class="empty-reminder">
        <div class="empty-text">暂无提醒</div>
      </div>

      <div v-else class="reminder-list">
        <div v-for="r in reminders" :key="r.id" class="reminder-item">
          <div class="medicine-icon">💊</div>
          <div class="reminder-info">
            <div class="medicine-name-row">
              <div class="medicine-name">{{ r.medicineName }}</div>
              <div class="medicine-dosage">{{ r.dosage }}</div>
            </div>
            <div class="reminder-details">
              <div class="detail-item">
                <span class="icon">🕐</span>
                <span class="detail-text">{{ r.reminderTime }}</span>
              </div>
              <div class="detail-item">
                <span class="icon">📅</span>
                <span class="detail-text">{{ r.frequency }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="add-button" @click="goAddReminder">
      <div class="add-icon">+</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { listReminders, type ReminderItem } from '@/api/reminder'

type RecordDot = { type: string; color: string }
type CalendarDay = {
  day: number
  date: string
  isCurrentMonth: boolean
  isToday: boolean
  records: RecordDot[]
}

const router = useRouter()

const weekdays = ['日', '一', '二', '三', '四', '五', '六']

const selectedDate = ref('')
const calendarDays = ref<CalendarDay[]>([])

const reminders = ref<ReminderItem[]>([])
const loading = ref(false)

const formatDate = (date: Date) => {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

const seeded = (seed: number) => {
  let x = seed % 2147483647
  if (x <= 0) x += 2147483646
  return () => (x = (x * 16807) % 2147483647) / 2147483647
}

const buildDateRecords = (year: number, month0: number) => {
  const rand = seeded(Number(`${year}${String(month0 + 1).padStart(2, '0')}`))
  const colors = [
    { type: 'bp', color: '#5B6EF5' },
    { type: 'med', color: '#4CAF50' },
    { type: 'sleep', color: '#FFB347' }
  ]
  const pick = (): RecordDot => colors[Math.min(colors.length - 1, Math.floor(rand() * colors.length))]!
  const records: Record<string, RecordDot[]> = {}
  for (let day = 1; day <= 28; day += 1) {
    if (rand() < 0.35) {
      const dots: RecordDot[] = [pick()]
      if (rand() < 0.35) dots.push(pick())
      const key = formatDate(new Date(year, month0, day))
      records[key] = dots
    }
  }
  return records
}

const buildCalendar = (date: Date) => {
  const year = date.getFullYear()
  const month0 = date.getMonth()
  const todayStr = formatDate(new Date())
  const daysInMonth = new Date(year, month0 + 1, 0).getDate()
  const firstDayOfWeek = new Date(year, month0, 1).getDay()

  const dateRecords = buildDateRecords(year, month0)
  const days: CalendarDay[] = []

  // Prev month padding
  const prevMonthLastDay = new Date(year, month0, 0).getDate()
  for (let i = firstDayOfWeek - 1; i >= 0; i -= 1) {
    const day = prevMonthLastDay - i
    const d = new Date(year, month0 - 1, day)
    const key = formatDate(d)
    days.push({
      day,
      date: key,
      isCurrentMonth: false,
      isToday: key === todayStr,
      records: dateRecords[key] || []
    })
  }

  // Current month
  for (let day = 1; day <= daysInMonth; day += 1) {
    const d = new Date(year, month0, day)
    const key = formatDate(d)
    days.push({
      day,
      date: key,
      isCurrentMonth: true,
      isToday: key === todayStr,
      records: dateRecords[key] || []
    })
  }

  // Next month padding to 42
  const remaining = 42 - days.length
  for (let day = 1; day <= remaining; day += 1) {
    const d = new Date(year, month0 + 1, day)
    const key = formatDate(d)
    days.push({
      day,
      date: key,
      isCurrentMonth: false,
      isToday: key === todayStr,
      records: []
    })
  }

  calendarDays.value = days
}

const selectDate = (dateStr: string) => {
  selectedDate.value = dateStr
  router.push({ path: '/health-report', query: { date: dateStr } })
}

const goAddReminder = () => {
  router.push('/add-reminder')
}

const loadReminders = async () => {
  loading.value = true
  try {
    const res: any = await listReminders(true)
    reminders.value = res.data?.reminders || []
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  const today = new Date()
  selectedDate.value = formatDate(today)
  buildCalendar(today)
  loadReminders()
})
</script>

<style scoped>
.history-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--app-bg);
}

.calendar-section {
  background-color: #fff;
  padding: 10px 12px 12px;
  border-bottom: 1px solid #eaeaea;
}

.weekdays {
  display: flex;
  justify-content: space-around;
  margin-bottom: 10px;
}

.weekday {
  width: 14.28%;
  text-align: center;
  font-size: 12px;
  color: #999;
  font-weight: 600;
}

.calendar-grid {
  display: flex;
  flex-wrap: wrap;
}

.calendar-day {
  width: 14.28%;
  height: 52px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  margin-bottom: 6px;
  border-radius: 10px;
}

.calendar-day:active {
  background: rgba(0, 0, 0, 0.04);
}

.day-number {
  font-size: 14px;
  color: #333;
  margin-bottom: 2px;
}

.calendar-day.other-month .day-number {
  color: #ccc;
}

.calendar-day.today .day-number {
  background-color: var(--app-blue);
  color: #fff;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
}

.calendar-day.selected {
  outline: 2px solid rgba(91, 110, 245, 0.35);
}

.record-dots {
  display: flex;
  gap: 4px;
  position: absolute;
  bottom: 6px;
}

.dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
}

.reminder-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: #fff;
  margin-top: 10px;
  overflow: hidden;
}

.section-header {
  padding: 14px 16px 10px;
  border-bottom: 1px solid #f0f0f0;
}

.section-title {
  font-size: 16px;
  font-weight: 700;
  color: #333;
}

.empty-reminder {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
}

.empty-text {
  font-size: 14px;
  color: #999;
}

.reminder-list {
  flex: 1;
  overflow-y: auto;
  padding: 0 16px 12px;
}

.reminder-item {
  display: flex;
  align-items: center;
  padding: 14px 0;
  border-bottom: 1px solid #f5f5f5;
}

.reminder-item:last-child {
  border-bottom: none;
}

.medicine-icon {
  width: 40px;
  height: 40px;
  background: #f0f0f0;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 10px;
  font-size: 20px;
}

.reminder-info {
  flex: 1;
  min-width: 0;
}

.medicine-name-row {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 4px;
}

.medicine-name {
  font-size: 15px;
  font-weight: 600;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.medicine-dosage {
  font-size: 12px;
  color: #999;
  flex-shrink: 0;
}

.reminder-details {
  display: flex;
  gap: 14px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.detail-text {
  font-size: 12px;
  color: #666;
}

.add-button {
  position: fixed;
  right: 14px;
  bottom: calc(70px + env(safe-area-inset-bottom));
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background-color: var(--app-primary);
  box-shadow: 0 8px 24px rgba(76, 175, 80, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.add-icon {
  font-size: 34px;
  color: #fff;
  font-weight: 300;
  line-height: 1;
}
</style>
