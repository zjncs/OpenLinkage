<template>
  <div class="moment-container app-page with-tabbar">
    <div class="header">
      <div class="header-title">动态</div>
      <div class="publish-btn" :class="{ disabled: posting }" @click="postMoment">发布</div>
    </div>

    <div class="content">
      <textarea
        v-model="content"
        class="text-input"
        placeholder="这一刻的想法..."
        maxlength="500"
      />

      <div class="image-section">
        <div class="image-list">
          <div v-for="(img, idx) in images" :key="img" class="image-item">
            <img class="image" :src="img" alt="img" />
            <div class="delete-btn" @click="deleteImage(idx)">
              <div class="delete-icon">×</div>
            </div>
          </div>

          <div v-if="images.length < 9" class="add-image-btn" @click="chooseImage">
            <div class="add-icon">+</div>
          </div>
        </div>
        <input ref="fileInputRef" class="file-input" type="file" accept="image/*" multiple @change="onFiles" />
      </div>

      <div class="recent-title">最近发布</div>
      <van-pull-refresh v-model="refreshing" @refresh="refresh">
        <van-list v-model:loading="loading" :finished="finished" finished-text="没有更多了" @load="loadMore">
          <van-cell-group inset>
            <van-cell v-for="m in moments" :key="m.id" :title="formatDate(m.createdAt)" :label="m.content" />
          </van-cell-group>
        </van-list>
      </van-pull-refresh>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { showToast } from 'vant'
import { createMoment, listMoments, type MomentItem } from '@/api/moment'

const content = ref('')
const posting = ref(false)
const images = ref<string[]>([])
const fileInputRef = ref<HTMLInputElement | null>(null)

const moments = ref<MomentItem[]>([])
const page = ref(1)
const limit = 10
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)

const formatDate = (iso: string) => {
  const d = new Date(iso)
  const y = d.getFullYear()
  const m = (d.getMonth() + 1).toString().padStart(2, '0')
  const day = d.getDate().toString().padStart(2, '0')
  const hh = d.getHours().toString().padStart(2, '0')
  const mm = d.getMinutes().toString().padStart(2, '0')
  return `${y}-${m}-${day} ${hh}:${mm}`
}

const fetchPage = async (p: number, replace: boolean) => {
  const res: any = await listMoments(p, limit)
  const list = (res.data?.moments || []) as MomentItem[]
  if (replace) moments.value = list
  else moments.value = [...moments.value, ...list]
  finished.value = list.length < limit
}

const refresh = async () => {
  refreshing.value = true
  page.value = 1
  try {
    await fetchPage(1, true)
  } finally {
    refreshing.value = false
  }
}

const loadMore = async () => {
  if (finished.value) return
  loading.value = true
  try {
    await fetchPage(page.value, page.value === 1)
    page.value += 1
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  refresh()
})

const postMoment = async () => {
  const text = content.value.trim()
  if (!text) {
    showToast('内容不能为空')
    return
  }

  posting.value = true
  try {
    await createMoment({ content: text, images: images.value })
    showToast('发布成功')
    content.value = ''
    images.value = []
    await refresh()
  } catch (e: any) {
    showToast(e?.message || '发布失败')
  } finally {
    posting.value = false
  }
}

const chooseImage = () => {
  fileInputRef.value?.click()
}

const readAsDataURL = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = () => reject(new Error('读取图片失败'))
    reader.readAsDataURL(file)
  })

const onFiles = async (e: Event) => {
  const input = e.target as HTMLInputElement
  const files = Array.from(input.files || [])
  if (files.length === 0) return

  const remain = 9 - images.value.length
  const picked = files.slice(0, remain)
  try {
    const dataUrls = await Promise.all(picked.map(readAsDataURL))
    images.value = [...images.value, ...dataUrls].filter(Boolean).slice(0, 9)
  } catch (err: any) {
    showToast(err?.message || '选择图片失败')
  } finally {
    input.value = ''
  }
}

const deleteImage = (index: number) => {
  images.value = images.value.filter((_, i) => i !== index)
}
</script>

<style scoped>
.moment-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--app-bg);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  padding-top: calc(10px + env(safe-area-inset-top));
  background-color: #fff;
  border-bottom: 1px solid #e0e0e0;
}

.header-title {
  font-size: 16px;
  font-weight: 800;
  color: #333;
}

.publish-btn {
  font-size: 16px;
  color: var(--app-primary);
  font-weight: 700;
}

.publish-btn.disabled {
  opacity: 0.5;
  pointer-events: none;
}

.content {
  flex: 1;
  padding: 12px;
  overflow-y: auto;
}

.text-input {
  width: 100%;
  min-height: 120px;
  font-size: 16px;
  line-height: 1.6;
  color: #333;
  background-color: transparent;
  border: none;
  outline: none;
  box-sizing: border-box;
  resize: none;
}

.image-section {
  margin-top: 14px;
}

.image-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.image-item {
  width: 100px;
  height: 100px;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
}

.image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.delete-btn {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
}

.delete-icon {
  font-size: 20px;
  color: #fff;
  line-height: 1;
  font-weight: 300;
}

.add-image-btn {
  width: 100px;
  height: 100px;
  border-radius: 12px;
  border: 2px dashed #ccc;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #fafafa;
}

.add-icon {
  font-size: 40px;
  color: #999;
  line-height: 1;
  font-weight: 300;
}

.file-input {
  display: none;
}

.recent-title {
  margin-top: 16px;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 800;
  color: #333;
}
</style>
