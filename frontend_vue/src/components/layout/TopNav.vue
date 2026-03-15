<script setup>
defineProps({
  activeTab: { type: String, default: '' }
})
const emit = defineEmits(['tab-change'])
const marketTabs = [
  '市场快讯',
  '全球股指',
  '重大指数',
  '行业排名',
  '个股资金流向',
  '龙虎榜',
  '个股研报',
  '公司公告',
  '行业研究',
  '当前热门',
  '指标选股',
  '名站优选',
]
</script>

<template>
  <div class="top-nav">
    <div class="top-nav-scroll scrollbar-hide">
      <button
        v-for="tab in marketTabs"
        :key="tab"
        type="button"
        :class="['top-nav-tab', { 'is-active': activeTab === tab }]"
        @click="emit('tab-change', tab)"
      >
        {{ tab }}
        <span v-if="activeTab === tab" class="top-nav-tab-line" />
      </button>
    </div>
  </div>
</template>
