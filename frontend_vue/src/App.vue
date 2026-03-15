<script setup>
import {
  EventsEmit,
  EventsOff,
  EventsOn,
  Quit,
  WindowFullscreen,
  WindowHide,
  WindowUnfullscreen,
  WindowSetTitle
} from '../wailsjs/runtime'
import { h, onBeforeMount, onBeforeUnmount, onMounted, ref } from "vue"
import { RouterLink, useRouter } from 'vue-router'
import { createDiscreteApi, darkTheme, lightTheme, NIcon, NText, dateZhCN, zhCN } from 'naive-ui'
import {
  AlarmOutline,
  AnalyticsOutline,
  BarChartSharp,
  DiamondOutline,
  ExpandOutline,
  Flag,
  FlaskOutline,
  LogoGithub,
  NewspaperOutline,
  NewspaperSharp,
  PowerOutline,
  Pulse,
  ReorderTwoOutline,
  SettingsOutline,
  SparklesOutline,
  StarOutline,
  TimeOutline,
} from '@vicons/ionicons5'
import { GetConfig, GetGroupList, GetVersionInfo, GlobalStockIndexes } from "../wailsjs/go/main/App"
import FloatingAiAssistant from "./components/FloatingAiAssistant.vue"
import { Dragon, FirefoxBrowser, Gripfire, Robot } from "@vicons/fa"
import { Prompt, ReportAnalytics, ReportSearch } from "@vicons/tabler"
import { AppsList20Regular, BoxSearch20Regular } from "@vicons/fluent"
import { NotificationFilled, StockOutlined } from "@vicons/antd"
import MarketTicker from "./components/layout/MarketTicker.vue"

const router = useRouter()
const loading = ref(true)
const loadingMsg = ref("加载数据中...")
const enableNews = ref(false)
const contentStyle = ref("")
const enableFund = ref(false)
const enableAgent = ref(false)
const enableDarkTheme = ref(null)
const isFullscreen = ref(false)
const activeKey = ref('stock')
const containerRef = ref({})
const realtimeProfit = ref(0)
const telegraph = ref([])
const groupList = ref([])
const officialStatement = ref("")
const marketIndexes = ref(null)

function isWails() {
  return typeof window !== 'undefined' && window.go && window.runtime
}

const menuOptions = ref([
  {
    label: () =>
      h(
        RouterLink,
        {
          to: { name: 'stock', query: { groupName: '全部', groupId: 0 }, params: {} },
          onClick: () => { activeKey.value = 'stock'; EventsEmit("changeTab", { ID: 0, name: '全部' }) },
        },
        { default: () => '股票自选' }
      ),
    key: 'stock',
    icon: renderIcon(StarOutline),
  },
  {
    label: () =>
      h(
        RouterLink,
        {
          to: { name: 'market', query: { name: '市场快讯' } },
          onClick: () => { activeKey.value = 'market'; EventsEmit("changeMarketTab", { ID: 0, name: '市场快讯' }) },
        },
        { default: () => '市场行情' }
      ),
    key: 'market',
    icon: renderIcon(NewspaperOutline),
  },
  {
    label: () => h(RouterLink, { to: { name: 'fund', query: { name: '基金自选' } }, onClick: () => { activeKey.value = 'fund' } }, { default: () => '基金自选' }),
    show: enableFund.value,
    key: 'fund',
    icon: renderIcon(SparklesOutline),
  },
  {
    label: () => h(RouterLink, { to: { name: 'agent', query: { name: "Ai智能体" } }, onClick: () => { activeKey.value = 'agent' } }, { default: () => 'Ai智能体' }),
    key: 'agent',
    show: enableAgent.value,
    icon: renderIcon(Robot),
  },
  {
    label: () =>
      h(
        RouterLink,
        {
          to: { name: 'research', query: { name: "研究中心" } },
          onClick: () => { activeKey.value = 'research'; setTimeout(() => EventsEmit("changeResearchTab", { ID: 0, name: 'AI分析报告' }), 100) },
        },
        { default: () => '研究中心' }
      ),
    key: 'research',
    icon: renderIcon(FlaskOutline),
  },
  {
    label: () => h(RouterLink, { to: { name: 'settings', query: { name: "设置" } }, onClick: () => { activeKey.value = 'settings' } }, { default: () => '设置' }),
    key: 'settings',
    icon: renderIcon(SettingsOutline),
  },
  {
    label: () => h(RouterLink, { to: { name: 'about', query: { name: "关于" } }, onClick: () => { activeKey.value = 'about' } }, { default: () => '关于' }),
    key: 'about',
    icon: renderIcon(LogoGithub),
  },
  { show: false, label: () => h("a", { href: '#', onClick: toggleFullscreen, title: '全屏 Ctrl+F 退出全屏 Esc' }, { default: () => isFullscreen.value ? '取消全屏' : '全屏' }), key: 'full', icon: renderIcon(ExpandOutline) },
  { label: () => h("a", { href: '#', onClick: WindowHide, title: '隐藏到托盘区 Ctrl+Z' }, { default: () => '隐藏到托盘区' }), key: 'hide', icon: renderIcon(ReorderTwoOutline) },
  { label: () => h("a", { href: '#', onClick: Quit }, { default: () => '退出程序' }), key: 'exit', icon: renderIcon(PowerOutline) },
])

function renderIcon(icon) {
  return () => h(NIcon, null, { default: () => h(icon) })
}

function toggleFullscreen() {
  activeKey.value = 'full'
  if (isFullscreen.value) {
    WindowUnfullscreen()
  } else {
    WindowFullscreen()
  }
  isFullscreen.value = !isFullscreen.value
}

if (isWails()) {
  EventsOn("realtime_profit", (data) => {
    realtimeProfit.value = data
  })
  EventsOn("telegraph", (data) => {
    telegraph.value = data
  })
  EventsOn("loadingMsg", (data) => {
    if (data === "done") {
      loadingMsg.value = "加载完成..."
      EventsEmit("loadingDone", "app")
      loading.value = false
    } else {
      loading.value = true
      loadingMsg.value = data
    }
  })
} else {
  loading.value = false
  loadingMsg.value = "加载完成..."
}

if (isWails()) {
  setTimeout(() => {
    if (loading.value) {
      loading.value = false
      loadingMsg.value = "加载完成..."
    }
  }, 8000)
}

onBeforeUnmount(() => {
  if (isWails()) {
    EventsOff("realtime_profit")
    EventsOff("loadingMsg")
    EventsOff("telegraph")
    EventsOff("newsPush")
  }
})

window.onerror = function (msg, source, lineno, colno, error) {
  if (isWails()) {
    EventsEmit("frontendError", {
      page: "App.vue",
      message: msg,
      source: source,
      lineno: lineno,
      colno: colno,
      error: error ? error.stack : null,
    })
  }
  return true
}

onBeforeMount(() => {
  if (!isWails()) {
    loading.value = false
    loadingMsg.value = "加载完成..."
    return
  }
  GetVersionInfo().then((result) => {
    if (result.officialStatement) {
      officialStatement.value = result.officialStatement
    }
  }).catch(() => {})
  GetGroupList().then((result) => {
    groupList.value = result
  }).catch(() => {})
  GetConfig().then((res) => {
    enableFund.value = res.enableFund
    enableAgent.value = res.enableAgent
    menuOptions.value.forEach((item) => {
      if (item.key === 'fund') item.show = res.enableFund
      if (item.key === 'agent') item.show = res.enableAgent
    })
    enableDarkTheme.value = res.darkTheme ? darkTheme : null
  }).catch(() => {})
})

onMounted(() => {
  contentStyle.value = "max-height: calc(92vh);overflow: hidden"
  if (isWails()) {
    try {
      WindowSetTitle("大聪明")
    } catch (_) {}
    GlobalStockIndexes().then((res) => {
      marketIndexes.value = res
    }).catch(() => {
      marketIndexes.value = null
    })
    GetConfig().then((res) => {
      if (res.enableNews) enableNews.value = true
      enableFund.value = res.enableFund
      enableAgent.value = res.enableAgent
      const { notification } = createDiscreteApi(["notification"], {
        configProviderProps: { theme: enableDarkTheme.value ? darkTheme : lightTheme, max: 3 },
      })
      EventsOn("newsPush", (data) => {
        if (data.isRed) {
          notification.create({
            title: data.time,
            content: () => h('div', { style: { "text-align": "left", "font-size": "14px", color: "#f67979" } }, { default: () => data.content }),
            meta: () => h(NText, { type: "warning" }, { default: () => data.source }),
            duration: 1000 * 40,
          })
        } else {
          notification.create({
            title: data.time,
            content: () => h('div', { style: { "text-align": "left", "font-size": "14px", color: "#549EC8" } }, { default: () => data.content }),
            meta: () => h(NText, { type: "warning" }, { default: () => data.source }),
            duration: 1000 * 30,
          })
        }
      })
    }).catch(() => {})
  }
})
</script>

<template>
  <n-config-provider ref="containerRef" :theme="enableDarkTheme" :locale="zhCN" :date-locale="dateZhCN">
    <n-message-provider>
      <n-notification-provider>
        <n-modal-provider>
          <n-dialog-provider>
            <FloatingAiAssistant />
            <div class="app-root">
              <div class="app-bg-blurs" aria-hidden="true">
                <div class="app-blur app-blur--blue" />
                <div class="app-blur app-blur--purple" />
                <div class="app-blur app-blur--cyan" />
              </div>
              <div class="app-main">
                <n-layout-sider
                  bordered
                  collapse-mode="width"
                  :collapsed-width="64"
                  :width="220"
                  class="app-sidebar"
                  content-style="padding: 0; background: transparent;"
                  :native-scrollbar="false"
                  style="--wails-draggable: drag"
                >
                  <div class="app-sidebar-header">
                    <span class="app-sidebar-title">大聪明</span>
                  </div>
                  <n-menu
                    v-model:value="activeKey"
                    :options="menuOptions"
                    mode="vertical"
                    class="app-sidebar-menu"
                  />
                </n-layout-sider>
                <div class="app-content">
                  <MarketTicker :telegraph="telegraph" :indexes="marketIndexes" />
                  <n-spin :show="loading" style="min-height: 100vh">
                    <template #description>{{ loadingMsg }}</template>
                    <div class="app-view" :style="contentStyle + '; height: calc(100vh - 56px)'">
                      <n-skeleton v-if="loading" height="calc(100vh)" />
                      <RouterView />
                    </div>
                  </n-spin>
                </div>
              </div>
            </div>
          </n-dialog-provider>
        </n-modal-provider>
      </n-notification-provider>
    </n-message-provider>
  </n-config-provider>
</template>

<style scoped>
.app-sidebar :deep(.n-layout-sider-scroll-content) {
  background: transparent !important;
}
</style>
