<template>
  <div class="report-container app-page">
    <div class="header">
      <div class="back" @click="back">
        <van-icon name="arrow-left" size="18" />
      </div>
      <div class="header-center">
        <div class="title">健康日报</div>
        <div class="date">{{ reportDate }}</div>
      </div>
      <div class="header-right" />
    </div>

    <div class="content">
      <div class="metrics-row">
        <div class="metric-card">
          <div class="metric-value">{{ heartRate }}</div>
          <div class="metric-label">心率</div>
        </div>
        <div class="metric-card">
          <div class="metric-value">{{ bloodPressure }}</div>
          <div class="metric-label">{{ bloodPressureUnit }}</div>
        </div>
      </div>

      <div class="chart-section">
        <div class="chart-item">
          <div class="chart-header">
            <div class="chart-title">心跳</div>
          </div>
          <div ref="heartChartEl" class="chart-canvas" />
        </div>
        <div class="chart-item">
          <div class="chart-header">
            <div class="chart-title">血压</div>
          </div>
          <div ref="bloodChartEl" class="chart-canvas" />
        </div>
      </div>

      <div class="metrics-row">
        <div class="metric-card">
          <div class="metric-value">{{ hemoglobin }}</div>
          <div class="metric-unit">g/dL</div>
          <div class="metric-label">血红蛋白</div>
          <div ref="hemoTrendEl" class="trend-canvas" />
        </div>
        <div class="metric-card">
          <div class="metric-value">{{ bloodSugar }}</div>
          <div class="metric-unit">mg/dL</div>
          <div class="metric-label">糖分水平</div>
          <div ref="sugarTrendEl" class="trend-canvas" />
        </div>
      </div>

      <div class="health-status-section">
        <div class="section-title">健康状况</div>
        <div ref="statusChartEl" class="status-canvas" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import * as echarts from 'echarts'

const route = useRoute()
const router = useRouter()

const formatDate = (date: Date) => {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

const reportDate = computed(() => {
  const q = route.query.date
  if (typeof q === 'string' && q) return q
  return formatDate(new Date())
})

const seedFromString = (s: string) => {
  let h = 0
  for (let i = 0; i < s.length; i += 1) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return h || 1
}

const seeded = (seed: number) => {
  let x = seed % 2147483647
  if (x <= 0) x += 2147483646
  return () => (x = (x * 16807) % 2147483647) / 2147483647
}

const metrics = computed(() => {
  const rand = seeded(seedFromString(reportDate.value))
  const hr = Math.round(62 + rand() * 28) // 62-90
  const sys = Math.round(100 + rand() * 30) // 100-130
  const dia = Math.round(65 + rand() * 20) // 65-85
  const hemo = (13.2 + rand() * 3.2).toFixed(1)
  const sugar = Math.round(95 + rand() * 65) // 95-160
  return {
    heartRate: hr,
    bloodPressure: sys,
    bloodPressureUnit: `${dia}毫米汞柱`,
    hemoglobin: hemo,
    bloodSugar: sugar,
    rand
  }
})

const heartRate = computed(() => metrics.value.heartRate)
const bloodPressure = computed(() => metrics.value.bloodPressure)
const bloodPressureUnit = computed(() => metrics.value.bloodPressureUnit)
const hemoglobin = computed(() => metrics.value.hemoglobin)
const bloodSugar = computed(() => metrics.value.bloodSugar)

const heartChartEl = ref<HTMLDivElement | null>(null)
const bloodChartEl = ref<HTMLDivElement | null>(null)
const hemoTrendEl = ref<HTMLDivElement | null>(null)
const sugarTrendEl = ref<HTMLDivElement | null>(null)
const statusChartEl = ref<HTMLDivElement | null>(null)

let charts: echarts.ECharts[] = []
let onResize: (() => void) | null = null

const disposeCharts = () => {
  charts.forEach((c) => c.dispose())
  charts = []
  if (onResize) window.removeEventListener('resize', onResize)
  onResize = null
}

const initCharts = async () => {
  disposeCharts()
  await nextTick()

  const els = [heartChartEl.value, bloodChartEl.value, hemoTrendEl.value, sugarTrendEl.value, statusChartEl.value]
  if (els.some((el) => !el)) return

  const blue = getComputedStyle(document.documentElement).getPropertyValue('--app-blue').trim() || '#5B6EF5'

  const rand = metrics.value.rand
  const mkSeries = (n: number, base: number, amp: number) =>
    Array.from({ length: n }, (_, i) => {
      const t = i / (n - 1)
      return Math.round(base + Math.sin(t * Math.PI * 2) * amp * 0.6 + (rand() - 0.5) * amp)
    })

  const heart = echarts.init(heartChartEl.value!)
  heart.setOption({
    grid: { left: 8, right: 8, top: 10, bottom: 8, containLabel: false },
    xAxis: { type: 'category', show: false, data: Array.from({ length: 12 }, (_, i) => i) },
    yAxis: { type: 'value', show: false },
    series: [
      {
        type: 'line',
        data: mkSeries(12, heartRate.value, 10),
        smooth: true,
        symbol: 'none',
        lineStyle: { width: 2, color: blue }
      }
    ]
  })

  const blood = echarts.init(bloodChartEl.value!)
  const bpData = mkSeries(12, bloodPressure.value, 12)
  blood.setOption({
    grid: { left: 8, right: 8, top: 10, bottom: 8, containLabel: false },
    xAxis: { type: 'category', show: false, data: Array.from({ length: bpData.length }, (_, i) => i) },
    yAxis: { type: 'value', show: false },
    series: [
      {
        type: 'line',
        data: bpData,
        smooth: true,
        symbol: 'none',
        lineStyle: { width: 2, color: blue },
        areaStyle: { color: 'rgba(91,110,245,0.20)' }
      }
    ]
  })

  const spark = (el: HTMLDivElement, base: number, amp: number) => {
    const c = echarts.init(el)
    c.setOption({
      grid: { left: 0, right: 0, top: 0, bottom: 0, containLabel: false },
      xAxis: { type: 'category', show: false, data: Array.from({ length: 14 }, (_, i) => i) },
      yAxis: { type: 'value', show: false },
      series: [
        {
          type: 'line',
          data: mkSeries(14, base, amp),
          smooth: true,
          symbol: 'none',
          lineStyle: { width: 2, color: blue }
        }
      ]
    })
    return c
  }

  const hemo = spark(hemoTrendEl.value!, Number(hemoglobin.value), 1)
  const sugar = spark(sugarTrendEl.value!, bloodSugar.value, 18)

  const status = echarts.init(statusChartEl.value!)
  const score = Math.round(60 + rand() * 35)
  status.setOption({
    series: [
      {
        type: 'gauge',
        startAngle: 210,
        endAngle: -30,
        min: 0,
        max: 100,
        splitNumber: 5,
        axisLine: { lineStyle: { width: 14, color: [[score / 100, blue], [1, '#eee']] } },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: { show: false },
        pointer: { show: false },
        progress: { show: false },
        detail: {
          valueAnimation: true,
          formatter: '{value}分',
          fontSize: 24,
          color: '#333',
          offsetCenter: [0, '10%']
        },
        title: { show: true, offsetCenter: [0, '52%'], fontSize: 12, color: '#999' },
        data: [{ value: score, name: score >= 80 ? '状态：活力满满' : score >= 70 ? '状态：良好' : '状态：需关注' }]
      }
    ]
  })

  charts = [heart, blood, hemo, sugar, status]
  onResize = () => charts.forEach((c) => c.resize())
  window.addEventListener('resize', onResize)
}

watch(reportDate, () => {
  initCharts()
})

onMounted(() => {
  initCharts()
})

onBeforeUnmount(() => {
  disposeCharts()
})

const back = () => {
  if (window.history.length > 1) router.back()
  else router.replace('/history')
}
</script>

<style scoped>
.report-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--app-bg);
}

.header {
  background-color: #fff;
  padding: 16px 12px 12px;
  padding-top: calc(16px + env(safe-area-inset-top));
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
}

.back {
  width: 40px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.header-center {
  flex: 1;
  text-align: center;
}

.header-right {
  width: 40px;
}

.title {
  font-size: 18px;
  font-weight: 800;
  color: #333;
  margin-bottom: 4px;
}

.date {
  font-size: 12px;
  color: #999;
}

.content {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

.metrics-row {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.metric-card {
  flex: 1;
  background-color: #fff;
  border-radius: var(--app-radius-lg);
  padding: 14px 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.metric-value {
  font-size: 32px;
  font-weight: 900;
  color: #333;
  line-height: 1;
  margin-bottom: 6px;
}

.metric-unit {
  font-size: 12px;
  color: #999;
  margin-bottom: 8px;
}

.metric-label {
  font-size: 14px;
  color: #666;
}

.chart-section {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.chart-item {
  flex: 1;
  background-color: #fff;
  border-radius: var(--app-radius-lg);
  padding: 12px;
}

.chart-header {
  margin-bottom: 8px;
}

.chart-title {
  font-size: 14px;
  font-weight: 700;
  color: #333;
}

.chart-canvas {
  width: 100%;
  height: 100px;
}

.trend-canvas {
  width: 100%;
  height: 72px;
  margin-top: 8px;
}

.health-status-section {
  background-color: #fff;
  border-radius: var(--app-radius-lg);
  padding: 14px 12px;
  margin-bottom: 10px;
}

.section-title {
  font-size: 16px;
  font-weight: 800;
  color: #333;
  margin-bottom: 12px;
}

.status-canvas {
  width: 100%;
  height: 200px;
}
</style>
