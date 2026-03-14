<script setup>
import { ref, computed, onMounted } from 'vue'
import { GetTelegraphList, ReFleshTelegraphList } from '../../wailsjs/go/main/App.js'
import { isWails } from '../composables/useAppData.js'

const channels = [
  { source: '财联社', apiSource: '财联社电报', color: 'from-green-500 to-emerald-600' },
  { source: '新浪财经', apiSource: '新浪财经', color: 'from-blue-500 to-cyan-600' },
  { source: '外媒', apiSource: '外媒', color: 'from-purple-500 to-pink-600' },
]

const channelData = ref(channels.map((c) => ({ ...c, items: [], loading: false, error: false })))
const liveTime = ref(new Date())

function mapItem(t) {
  const title = t.title || t.content || ''
  const tags = Array.isArray(t.subjects) ? t.subjects : []
  let priority = 'medium'
  if (t.isRed) priority = 'high'
  else if (t.sentimentResult === '看涨' || t.sentimentResult === '看跌') priority = 'high'
  return {
    time: t.time || '',
    title: title.length > 80 ? title.slice(0, 80) + '...' : title,
    content: t.content || '',
    tags,
    priority,
    url: t.url,
  }
}

function getPriorityClass(p) {
  if (p === 'high') return 'border-l-red-500 bg-red-500/5'
  if (p === 'medium') return 'border-l-yellow-500 bg-yellow-500/5'
  return 'border-l-gray-500 bg-gray-500/5'
}

async function loadChannel(apiSource) {
  try {
    const raw = await GetTelegraphList(apiSource)
    const list = Array.isArray(raw) ? raw : []
    return list.map(mapItem)
  } catch {
    return []
  }
}

async function refreshChannel(apiSource) {
  if (!isWails()) return
  const ch = channelData.value.find((c) => c.apiSource === apiSource)
  if (!ch) return
  ch.loading = true
  ch.error = false
  try {
    await ReFleshTelegraphList(apiSource)
    const raw = await GetTelegraphList(apiSource)
    ch.items = Array.isArray(raw) ? raw.map(mapItem) : []
  } catch {
    ch.error = true
  } finally {
    ch.loading = false
  }
}

onMounted(() => {
  setInterval(() => { liveTime.value = new Date() }, 1000)
  if (isWails()) {
    channels.forEach((config, i) => {
      GetTelegraphList(config.apiSource)
        .then((raw) => {
          channelData.value[i].items = Array.isArray(raw) ? raw.map(mapItem) : []
          channelData.value[i].error = false
        })
        .catch(() => { channelData.value[i].error = true })
    })
  } else {
    // 非 Wails 使用占位数据
    channelData.value[0].items = [
      { time: '12:06:31', title: '财联社午间新闻播报', content: '', tags: ['快讯'], priority: 'high' },
      { time: '12:05:18', title: '央行逆回购操作', content: '', tags: ['货币政策'], priority: 'medium' },
    ]
    channelData.value[1].items = [
      { time: '12:04:49', title: '比亚迪刀片电池技术', content: '', tags: ['新能源'], priority: 'high' },
    ]
    channelData.value[2].items = [
      { time: '12:05:42', title: '监管层强调房住不炒', content: '', tags: ['政策'], priority: 'high' },
    ]
  }
})

function formatTime(d) {
  return d.toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
}
</script>

<template>
  <div class="bg-slate-900/40 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-2xl">
    <div class="flex items-center justify-between mb-6">
      <h3 class="text-lg text-cyan-400 tracking-wide flex items-center gap-2">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
        实时资讯流
      </h3>
      <span class="text-xs text-gray-500">{{ formatTime(liveTime) }}</span>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div v-for="(ch, chIndex) in channelData" :key="ch.apiSource" class="space-y-2">
        <div class="rounded-lg px-3 py-2 flex items-center gap-2 border border-white/10 bg-opacity-20" :class="['bg-gradient-to-r', ch.color]">
          <span class="text-sm text-white font-light flex-1">{{ ch.source }}</span>
          <button
            v-if="isWails()"
            type="button"
            class="p-1 rounded hover:bg-white/10 disabled:opacity-50"
            :disabled="ch.loading"
            title="刷新"
            @click="refreshChannel(ch.apiSource)"
          >
            <svg class="w-4 h-4 text-white" :class="ch.loading ? 'animate-spin' : ''" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
          </button>
          <div class="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
        </div>

        <div class="space-y-2">
          <div v-if="ch.loading && !ch.items.length" class="py-8 text-center text-sm text-gray-500">加载中...</div>
          <template v-else-if="ch.items.length">
            <div
              v-for="(item, idx) in ch.items"
              :key="`${ch.apiSource}-${idx}`"
              class="border-l-2 rounded-r-lg p-3 hover:bg-white/5 transition-all cursor-pointer group"
              :class="getPriorityClass(item.priority)"
            >
              <div class="flex items-start gap-2">
                <span class="text-xs font-mono text-cyan-400 flex-shrink-0 mt-0.5">{{ item.time }}</span>
                <div class="flex-1 min-w-0">
                  <p class="text-xs text-gray-300 leading-relaxed line-clamp-2 group-hover:text-white transition-colors">{{ item.title }}</p>
                  <div v-if="item.tags.length" class="flex items-center gap-1.5 mt-2 flex-wrap">
                    <span
                      v-for="(tag, ti) in item.tags"
                      :key="ti"
                      class="px-1.5 py-0.5 bg-white/5 rounded text-[10px] text-gray-400 border border-white/10"
                    >
                      {{ tag }}
                    </span>
                  </div>
                </div>
                <svg class="w-3 h-3 text-gray-600 group-hover:text-cyan-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
              </div>
            </div>
          </template>
          <div v-else class="py-8 text-center text-sm text-gray-500">暂无资讯</div>
        </div>

        <button
          v-if="isWails()"
          type="button"
          class="w-full py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs text-gray-500 hover:text-cyan-400 transition-all border border-white/5 hover:border-cyan-500/30 disabled:opacity-50"
          :disabled="ch.loading"
          @click="refreshChannel(ch.apiSource)"
        >
          {{ ch.loading ? '刷新中...' : `刷新 ${ch.source}` }}
        </button>
      </div>
    </div>

    <div class="mt-6 pt-4 border-t border-white/10 grid grid-cols-4 gap-4">
      <div class="text-center">
        <div class="text-xs text-gray-500 mb-1">今日资讯</div>
        <div class="text-lg text-cyan-400">—</div>
      </div>
      <div class="text-center">
        <div class="text-xs text-gray-500 mb-1">重要公告</div>
        <div class="text-lg text-yellow-400">—</div>
      </div>
      <div class="text-center">
        <div class="text-xs text-gray-500 mb-1">研报更新</div>
        <div class="text-lg text-purple-400">—</div>
      </div>
      <div class="text-center">
        <div class="text-xs text-gray-500 mb-1">实时监控</div>
        <div class="text-lg text-green-400 flex items-center justify-center gap-1">
          <div class="w-2 h-2 rounded-full bg-green-400 animate-pulse" /> ON
        </div>
      </div>
    </div>
  </div>
</template>
