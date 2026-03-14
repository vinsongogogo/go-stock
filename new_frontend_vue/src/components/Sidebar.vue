<script setup>
import { ref } from 'vue'

defineProps({
  config: { type: Object, default: null },
  groupList: { type: Array, default: () => [] },
})

const expandedSection = ref('行情中心')
const menuItems = [
  { label: '行情中心', submenu: ['快讯', '指数', '核心指数'] },
  { label: '指数', submenu: [] },
  { label: '核心指数', submenu: [] },
  { label: '行业榜', submenu: [] },
  { label: '资金流向', submenu: [] },
  { label: '龙虎榜', submenu: [] },
  { label: '研报', submenu: [] },
  { label: '公告', submenu: [] },
  { label: '行业研究', submenu: [] },
  { label: '热门', submenu: [] },
  { label: '选股', submenu: [] },
  { label: '精选', submenu: [] },
]
</script>

<template>
  <div class="w-64 bg-slate-900/50 backdrop-blur-xl border-r border-white/10 flex flex-col">
    <div class="p-6 border-b border-white/10">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/50">
          <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        </div>
        <div>
          <h1 class="text-xl font-light tracking-wide text-white">金融看板</h1>
          <p class="text-xs text-gray-400">Financial Dashboard</p>
        </div>
      </div>
    </div>

    <div class="p-4 border-b border-white/10">
      <div class="flex items-center justify-between mb-2">
        <div class="flex items-center gap-2">
          <svg class="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
          <span class="text-sm">自选列表</span>
        </div>
        <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>

    <div class="flex-1 overflow-y-auto">
      <div v-for="item in menuItems" :key="item.label">
        <button
          type="button"
          class="w-full px-4 py-3 flex items-center gap-3 hover:bg-white/5 transition-all group"
          :class="expandedSection === item.label ? 'bg-white/5 border-l-2 border-cyan-400' : ''"
          @click="expandedSection = expandedSection === item.label ? null : item.label"
        >
          <svg class="w-5 h-5 transition-colors" :class="expandedSection === item.label ? 'text-cyan-400' : 'text-gray-400 group-hover:text-cyan-400'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <span class="flex-1 text-left text-sm">{{ item.label }}</span>
          <svg v-if="item.submenu.length" class="w-4 h-4 text-gray-400 transition-transform" :class="expandedSection === item.label ? 'rotate-180' : ''" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        <div v-if="expandedSection === item.label && item.submenu.length" class="bg-slate-800/30">
          <button
            v-for="sub in item.submenu"
            :key="sub"
            type="button"
            class="w-full px-12 py-2 text-left text-sm text-gray-300 hover:bg-white/5 hover:text-cyan-400 transition-colors"
          >
            {{ sub }}
          </button>
        </div>
      </div>
    </div>

    <div class="p-4 border-t border-white/10 space-y-2">
      <button type="button" class="w-full px-4 py-2 flex items-center gap-3 hover:bg-white/5 rounded-lg transition-all">
        <span class="text-sm">研究</span>
        <svg class="w-4 h-4 text-gray-400 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
      </button>
      <button type="button" class="w-full px-4 py-2 flex items-center gap-3 hover:bg-white/5 rounded-lg transition-all">
        <span class="text-sm">设置</span>
      </button>
      <button type="button" class="w-full px-4 py-2 flex items-center gap-3 hover:bg-white/5 rounded-lg transition-all">
        <span class="text-sm">关于我们</span>
      </button>
      <div class="pt-2 text-xs text-gray-500 text-center">隐藏到托盘区</div>
    </div>
  </div>
</template>
