<script setup>
const tabs = ['快讯', '指数', '核心指数', '行业榜', '资金流向', '龙虎榜', '研报', '公告', '行业研究', '热门', '选股', '精选']
defineProps({ activeTab: String })
const emit = defineEmits(['update:activeTab'])
</script>

<template>
  <div class="bg-slate-900/30 backdrop-blur-xl border-b border-white/10">
    <div class="flex items-center overflow-x-auto scrollbar-hide">
      <button
        v-for="tab in tabs"
        :key="tab"
        type="button"
        class="px-6 py-4 text-sm whitespace-nowrap transition-all relative"
        :class="activeTab === tab ? 'text-cyan-400' : 'text-gray-400 hover:text-white'"
        @click="emit('update:activeTab', tab)"
      >
        {{ tab }}
        <div
          v-if="activeTab === tab"
          class="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-500 to-blue-500"
        />
      </button>
    </div>
  </div>
</template>
