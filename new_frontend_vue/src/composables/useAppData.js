/**
 * 与 frontend App.vue 一致：GetConfig / GetGroupList / GetVersionInfo / GlobalStockIndexes
 * 事件 realtime_profit, telegraph, loadingMsg
 */
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { GetConfig, GetGroupList, GetVersionInfo, GlobalStockIndexes } from '../../wailsjs/go/main/App.js'
import { EventsOn, EventsOff, EventsEmit } from '../../wailsjs/runtime/runtime.js'

export function isWails() {
  return typeof window !== 'undefined' && window.go && window.runtime
}

/** 行情条单项（指数或快讯） */
export function buildTickerItems(indexes, telegraph) {
  const list = []
  if (indexes && typeof indexes === 'object') {
    const regions = ['common', 'america', 'europe', 'asia', 'other']
    regions.forEach((key) => {
      const arr = indexes[key]
      if (Array.isArray(arr)) {
        arr.forEach((item) => {
          list.push({
            name: item.name ?? '',
            value: item.zxj != null ? String(item.zxj) : '',
            change: item.zdf != null ? (item.zdf >= 0 ? `+${item.zdf}%` : `${item.zdf}%`) : '',
            isUp: item.zdf != null ? item.zdf >= 0 : true,
          })
        })
      }
    })
  }
  if (Array.isArray(telegraph) && telegraph.length) {
    telegraph.forEach((text) => {
      list.push({ name: text, value: '', change: '', isUp: true, isTelegraph: true })
    })
  }
  return list
}

export function useAppData() {
  const loading = ref(true)
  const loadingMsg = ref('加载数据中...')
  const config = ref(null)
  const groupList = ref([])
  const versionInfo = ref(null)
  const marketIndexes = ref(null)
  const telegraph = ref([])
  const realtimeProfit = ref(0)
  let loadingTimer = null

  const tickerItems = computed(() => buildTickerItems(marketIndexes.value, telegraph.value))

  onMounted(() => {
    if (!isWails()) {
      loading.value = false
      loadingMsg.value = '加载完成...'
      return
    }
    GetVersionInfo().then((r) => { if (r?.officialStatement) versionInfo.value = r }).catch(() => {})
    GetGroupList().then((r) => { groupList.value = Array.isArray(r) ? r : [] }).catch(() => {})
    GetConfig().then((r) => { config.value = r }).catch(() => {})
    GlobalStockIndexes().then((r) => { marketIndexes.value = r }).catch(() => { marketIndexes.value = null })

    EventsOn('realtime_profit', (data) => { realtimeProfit.value = data })
    EventsOn('telegraph', (data) => { telegraph.value = Array.isArray(data) ? data : [] })
    EventsOn('loadingMsg', (data) => {
      if (data === 'done') {
        loadingMsg.value = '加载完成...'
        loading.value = false
        EventsEmit('loadingDone', 'app')
      } else {
        loading.value = true
        loadingMsg.value = data || '加载数据中...'
      }
    })

    loadingTimer = setTimeout(() => {
      if (loading.value) {
        loading.value = false
        loadingMsg.value = '加载完成...'
      }
    }, 8000)
  })

  onUnmounted(() => {
    if (loadingTimer) clearTimeout(loadingTimer)
    if (isWails()) EventsOff('realtime_profit', 'telegraph', 'loadingMsg', 'newsPush')
  })

  return {
    loading,
    loadingMsg,
    config,
    groupList,
    versionInfo,
    marketIndexes,
    telegraph,
    tickerItems,
    realtimeProfit,
  }
}
