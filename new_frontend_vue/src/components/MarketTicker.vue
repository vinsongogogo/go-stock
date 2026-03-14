<script setup>
import { computed } from 'vue'

const FALLBACK = [
  { name: '上证指数', value: '4106.96', change: '-0.64%', isUp: false },
  { name: '深证指数', value: '14270.35', change: '+1.36%', isUp: true },
  { name: '恒生指数', value: '25579.95', change: '+1.23%', isUp: true },
  { name: '道琼斯', value: '42716.13', change: '-0.08%', isUp: false },
  { name: '纳指500', value: '6775.80', change: '-0.08%', isUp: false },
  { name: '主要股指', value: '', change: '', isUp: true },
]

const props = defineProps({
  items: { type: Array, default: () => [] },
})
const list = computed(() => (props.items?.length ? props.items : FALLBACK))
const doubled = computed(() => [...list.value, ...list.value])
</script>

<template>
  <div class="bg-slate-900/20 backdrop-blur-sm border-b border-white/5 overflow-hidden">
    <div class="flex animate-scroll">
      <div
        v-for="(item, index) in doubled"
        :key="`${index}-${item.name}`"
        class="flex items-center gap-2 px-6 py-3 whitespace-nowrap border-r border-white/5"
        :class="item.isTelegraph ? 'text-cyan-400/90' : ''"
      >
        <span class="text-xs text-gray-400">{{ item.name }}</span>
        <template v-if="!item.isTelegraph && item.value">
          <span class="text-sm font-mono">{{ item.value }}</span>
          <span class="text-xs flex items-center gap-1" :class="item.isUp ? 'text-green-400' : 'text-red-400'">
            <svg v-if="item.isUp" class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
            <svg v-else class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
            {{ item.change }}
          </span>
        </template>
      </div>
    </div>
  </div>
</template>
