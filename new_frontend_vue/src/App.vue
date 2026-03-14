<script setup>
import { ref } from 'vue'
import { useAppData } from './composables/useAppData'
import Sidebar from './components/Sidebar.vue'
import TopNav from './components/TopNav.vue'
import MarketTicker from './components/MarketTicker.vue'
import MarketGauge from './components/MarketGauge.vue'
import TreeMap from './components/TreeMap.vue'
import NewsFeed from './components/NewsFeed.vue'

const activeTab = ref('快讯')
const { tickerItems, loading, loadingMsg, config, groupList } = useAppData()
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white">
    <!-- 背景装饰 -->
    <div class="fixed inset-0 overflow-hidden pointer-events-none">
      <div class="absolute top-0 -left-4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      <div class="absolute top-1/2 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      <div class="absolute bottom-0 left-1/3 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
    </div>

    <div class="relative flex h-screen">
      <Sidebar :config="config" :group-list="groupList" />

      <div class="flex-1 flex flex-col overflow-hidden">
        <TopNav v-model:active-tab="activeTab" />

        <MarketTicker :items="tickerItems" />

        <!-- 首屏加载遮罩（与 frontend 一致） -->
        <div
          v-if="loading"
          class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm"
        >
          <div class="text-center">
            <div class="inline-block h-8 w-8 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
            <p class="mt-3 text-sm text-gray-400">{{ loadingMsg }}</p>
          </div>
        </div>

        <div class="flex-1 overflow-auto p-6">
          <div class="max-w-[1600px] mx-auto space-y-6">
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <MarketGauge />
              <div class="lg:col-span-2">
                <TreeMap />
              </div>
            </div>
            <NewsFeed />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
