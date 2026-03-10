<script setup>
import 'md-editor-v3/lib/preview.css';
import {h, onBeforeUnmount, onMounted, ref} from 'vue';
import {CheckUpdate, GetVersionInfo, GetSponsorInfo, OpenURL} from "../../wailsjs/go/main/App";
import {EventsOff, EventsOn, Environment} from "../../wailsjs/runtime";
import {NAvatar, NButton, useNotification, NText} from "naive-ui";
import { format } from 'date-fns';

const updateLog = ref('');
const versionInfo = ref('');
const icon = ref('');
const notify = useNotification();
const vipLevel = ref("");
const vipStartTime = ref("");
const vipEndTime = ref("");
const expired = ref(false);

onMounted(() => {
  document.title = '关于';
  GetVersionInfo().then((res) => {
    updateLog.value = res.content;
    versionInfo.value = res.version;
    icon.value = res.icon || '';

    GetSponsorInfo().then((res) => {
      vipLevel.value = res.vipLevel;
      vipStartTime.value = res.vipStartTime;
      vipEndTime.value = res.vipEndTime;
      if (res.vipLevel && res.vipEndTime < format(new Date(), 'yyyy-MM-dd HH:mm:ss')) {
        notify.warning({ content: 'VIP已到期' });
        expired.value = true;
      }
    });
  });
});

onBeforeUnmount(() => {
  notify.destroyAll();
  EventsOff("updateVersion");
});

EventsOn("updateVersion", async (msg) => {
  const utcDate = new Date(msg.published_at);
  const date = new Date(utcDate.getTime());
  const formattedDate = format(date, 'yyyy-MM-dd HH:mm:ss');

  notify.info({
    avatar: () =>
      h(NAvatar, {
        size: 'small',
        round: false,
        src: icon.value
      }),
    title: '发现新版本: ' + msg.tag_name,
    content: () =>
      h('div', {
        style: { 'text-align': 'left', 'font-size': '14px' }
      }, { default: () => msg.commit?.message }),
    duration: 5000,
    meta: "发布时间:" + formattedDate,
    action: () =>
      h(NButton, {
        type: 'primary',
        size: 'small',
        onClick: () => {
          Environment().then(env => {
            env.platform === 'windows' ? window.open(msg.html_url) : OpenURL(msg.html_url);
          });
        }
      }, { default: () => '查看' })
  });
});
</script>

<template>
  <n-space vertical size="large" style="--wails-draggable:no-drag">
    <n-card size="large">
      <n-divider title-placement="center">关于</n-divider>
      <n-space vertical>
        <n-image v-if="icon" width="100" :src="icon" />
        <h1>
          <n-badge v-if="!vipLevel" :value="versionInfo" :offset="[80,10]" type="success">
            <n-gradient-text type="info" :size="50">行情中心</n-gradient-text>
          </n-badge>
          <n-badge v-if="vipLevel" :value="versionInfo" :offset="[70,10]" type="success">
            <n-gradient-text :type="expired?'error':'warning'" :size="50">行情中心</n-gradient-text>
            <n-tag v-if="vipLevel" :bordered="false" size="small" type="warning">VIP{{ vipLevel }}</n-tag>
          </n-badge>
        </h1>
        <n-gradient-text v-if="vipLevel" :type="expired?'error':'warning'">VIP 到期时间：{{ vipEndTime }}</n-gradient-text>
        <n-button size="tiny" @click="CheckUpdate(1)" type="info" tertiary>检查更新</n-button>
        <div style="justify-self: center; text-align: left">
          <p>自选股行情与市场数据查看工具。</p>
          <p v-if="updateLog">更新说明：{{ updateLog }}</p>
        </div>
      </n-space>
      <n-divider title-placement="center">鸣谢</n-divider>
      <div style="justify-self: center; text-align: left">
        <p>
          感谢以下开源项目：
          <a href="https://github.com/wailsapp/wails" target="_blank">Wails</a>
          <n-divider vertical />
          <a href="https://github.com/vuejs/core" target="_blank">Vue</a>
          <n-divider vertical />
          <a href="https://github.com/tusen-ai/naive-ui" target="_blank">NaiveUI</a>
        </p>
      </div>
    </n-card>
  </n-space>
</template>

<style scoped>
h1, h2 { margin: 0; padding: 6px 0; }
p { margin: 2px 0; }
a { color: #18a058; text-decoration: none; }
a:hover { text-decoration: underline; }
</style>
