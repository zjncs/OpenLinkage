<template>
  <div class="add-reminder-container app-page">
    <van-nav-bar title="添加提醒" left-arrow @click-left="$router.back()" fixed />

    <div class="content">
      <div class="form-section">
        <div class="form-item">
          <div class="form-label">药品名称 *</div>
          <input v-model="medicineName" class="form-input" placeholder="请输入药品名称" />
        </div>

        <div class="form-item">
          <div class="form-label">剂量</div>
          <input v-model="dosage" class="form-input" placeholder="如：100mg" />
        </div>

        <div class="form-item">
          <div class="form-label">提醒时间 *</div>
          <div class="picker-view" @click="showTimePicker = true">
            <div class="picker-text">{{ reminderTime || '请选择时间' }}</div>
            <div class="picker-arrow">›</div>
          </div>
        </div>

        <div class="form-item">
          <div class="form-label">频率</div>
          <div class="picker-view" @click="showFrequencyPicker = true">
            <div class="picker-text">{{ frequency }}</div>
            <div class="picker-arrow">›</div>
          </div>
        </div>

        <div class="form-item">
          <div class="form-label">备注</div>
          <textarea v-model="notes" class="form-textarea" placeholder="添加备注信息" maxlength="200" />
        </div>
      </div>

      <div class="button-section">
        <button class="cancel-btn" :disabled="loading" @click="router.back()">取消</button>
        <button class="submit-btn" :disabled="loading" @click="submit">
          {{ loading ? '创建中…' : '创建提醒' }}
        </button>
      </div>
    </div>

    <van-popup v-model:show="showTimePicker" position="bottom" round>
      <van-datetime-picker
        type="time"
        title="选择时间"
        :min-hour="0"
        :max-hour="23"
        :formatter="timeFormatter"
        @cancel="showTimePicker = false"
        @confirm="onTimeConfirm"
      />
    </van-popup>

    <van-popup v-model:show="showFrequencyPicker" position="bottom" round>
      <van-picker
        title="选择频率"
        :columns="frequencyOptions"
        @cancel="showFrequencyPicker = false"
        @confirm="onFrequencyConfirm"
      />
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { createReminder } from '@/api/reminder'

const router = useRouter()
const medicineName = ref('')
const dosage = ref('')
const reminderTime = ref('')
const frequency = ref('每天')
const notes = ref('')
const loading = ref(false)
const showTimePicker = ref(false)
const showFrequencyPicker = ref(false)

const frequencyOptions: Array<{ text: string; value: string }> = [
  { text: '每天', value: '每天' },
  { text: '每周', value: '每周' },
  { text: '工作日', value: '工作日' },
  { text: '隔天', value: '隔天' },
  { text: '每月', value: '每月' }
]

const timeFormatter = (type: string, val: string) => {
  if (type === 'hour') return `${val}时`
  if (type === 'minute') return `${val}分`
  return val
}

const onTimeConfirm = (val: string) => {
  reminderTime.value = val
  showTimePicker.value = false
}

const onFrequencyConfirm = (value: any) => {
  // Vant Picker confirm payload differs by version; handle common shapes.
  if (Array.isArray(value)) frequency.value = String(value[0]?.value ?? value[0] ?? '每天')
  else if (value && Array.isArray(value.selectedValues))
    frequency.value = String(value.selectedValues[0]?.value ?? value.selectedValues[0] ?? '每天')
  else if (typeof value === 'string') frequency.value = value
  else frequency.value = '每天'
  showFrequencyPicker.value = false
}

const submit = async () => {
  if (!medicineName.value.trim() || !reminderTime.value.trim()) {
    showToast('药品和时间不能为空')
    return
  }

  loading.value = true
  try {
    await createReminder({
      medicineName: medicineName.value.trim(),
      dosage: dosage.value.trim(),
      reminderTime: reminderTime.value.trim(),
      frequency: frequency.value.trim() || '每天',
      notes: notes.value.trim()
    })
    showToast('创建成功')
    router.back()
  } catch (e: any) {
    showToast(e?.message || '保存失败')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.add-reminder-container {
  min-height: 100vh;
  background: #f5f5f5;
}

.content {
  padding-top: 46px;
  height: calc(100vh - 46px);
  padding: 12px;
}

.form-section {
  background: white;
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 12px;
}

.form-item {
  margin-bottom: 16px;
}

.form-item:last-child {
  margin-bottom: 0;
}

.form-label {
  font-size: 14px;
  color: #333;
  margin-bottom: 10px;
  font-weight: 700;
}

.form-input {
  width: 100%;
  height: 40px;
  padding: 0 12px;
  background: #f8f8f8;
  border-radius: 12px;
  font-size: 14px;
  border: none;
  outline: none;
}

.form-textarea {
  width: 100%;
  min-height: 90px;
  padding: 12px;
  background: #f8f8f8;
  border-radius: 12px;
  font-size: 14px;
  border: none;
  outline: none;
  resize: none;
}

.picker-view {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 40px;
  padding: 0 12px;
  background: #f8f8f8;
  border-radius: 12px;
}

.picker-text {
  font-size: 14px;
  color: #333;
}

.picker-arrow {
  font-size: 24px;
  color: #999;
  transform: rotate(90deg);
}

.button-section {
  display: flex;
  gap: 10px;
}

.cancel-btn,
.submit-btn {
  flex: 1;
  height: 46px;
  border-radius: 12px;
  font-size: 15px;
  border: none;
}

.cancel-btn {
  background: #f0f0f0;
  color: #666;
}

.submit-btn {
  background: #667eea;
  color: white;
}
</style>
