<script setup>
import { computed } from 'vue'

const props = defineProps({
  telegraph: { type: Array, default: () => [] },
  indexes: { type: Object, default: null },
})

const tickerItems = computed(() => {
  const list = []
  if (props.indexes && typeof props.indexes === 'object') {
    const regions = ['common', 'america', 'europe', 'asia', 'other']
    regions.forEach((key) => {
      const arr = props.indexes[key]
      if (Array.isArray(arr)) {
        arr.forEach((item) => {
          list.push({
            name: item.name,
            value: item.zxj != null ? String(item.zxj) : '',
            change: item.zdf != null ? (item.zdf >= 0 ? `+${item.zdf}%` : `${item.zdf}%`) : '',
            isUp: item.zdf != null ? item.zdf >= 0 : true,
          })
        })
      }
    })
  }
  if (Array.isArray(props.telegraph) && props.telegraph.length) {
    props.telegraph.forEach((text) => {
      list.push({ name: text, value: '', change: '', isUp: true, isTelegraph: true })
    })
  }
  return list
})

const doubledItems = computed(() => [...tickerItems.value, ...tickerItems.value])
</script>

<template>
  <div class="market-ticker">
    <div v-if="doubledItems.length" class="market-ticker-scroll">
      <div
        v-for="(item, index) in doubledItems"
        :key="index"
        class="market-ticker-item"
        :class="{ 'market-ticker-telegraph': item.isTelegraph }"
      >
        <template v-if="item.isTelegraph">
          <span class="market-ticker-name">{{ item.name }}</span>
        </template>
        <template v-else>
          <span class="market-ticker-name">{{ item.name }}</span>
          <template v-if="item.value">
            <span class="market-ticker-value">{{ item.value }}</span>
            <span :class="['market-ticker-change', item.isUp ? 'up' : 'down']">
              {{ item.change }}
            </span>
          </template>
        </template>
      </div>
    </div>
  </div>
</template>
