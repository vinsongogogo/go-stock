<script setup>
const sentiment = 16.1
const percentage = sentiment
</script>

<template>
  <div class="bg-slate-900/40 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-2xl hover:border-cyan-500/30 transition-all">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-sm text-cyan-400 tracking-wide flex items-center gap-2">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
        市场情绪强弱
      </h3>
      <span class="text-xs text-gray-500">REALTIME</span>
    </div>

    <div class="relative w-full aspect-square max-w-[280px] mx-auto">
      <svg viewBox="0 0 200 200" class="w-full h-full transform -rotate-90">
        <defs>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#06b6d4" />
            <stop offset="50%" stop-color="#3b82f6" />
            <stop offset="100%" stop-color="#8b5cf6" />
          </linearGradient>
        </defs>
        <circle cx="100" cy="100" r="80" fill="none" stroke="rgba(148,163,184,0.1)" stroke-width="16" stroke-linecap="round" />
        <circle
          cx="100" cy="100" r="80"
          fill="none"
          stroke="url(#progressGradient)"
          stroke-width="16"
          stroke-linecap="round"
          :stroke-dasharray="`${(percentage / 100) * 502} 502`"
          class="transition-all duration-1000"
          style="filter: drop-shadow(0 0 8px rgba(6, 182, 212, 0.6))"
        />
        <circle cx="100" cy="100" r="65" fill="none" stroke="rgba(6,182,212,0.2)" stroke-width="1" stroke-dasharray="4 4" class="animate-spin" style="animation-duration: 20s" />
      </svg>

      <div class="absolute inset-0 flex flex-col items-center justify-center">
        <div class="text-5xl font-light text-cyan-400 mb-1" style="text-shadow: 0 0 20px rgba(6, 182, 212, 0.5)">{{ sentiment }}</div>
        <div class="text-xs text-gray-400 tracking-widest">SENTIMENT</div>
        <div class="mt-3 flex items-center gap-2">
          <div class="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span class="text-xs text-gray-500">中性偏强</span>
        </div>
      </div>

      <div class="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2">
        <svg class="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
      </div>
      <div class="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-2">
        <svg class="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
      </div>
    </div>

    <div class="mt-6 grid grid-cols-3 gap-4">
      <div class="bg-green-500/10 rounded-lg p-3 border border-green-500/20">
        <div class="text-xs text-gray-400 mb-1">看涨</div>
        <div class="text-lg text-green-400">62%</div>
      </div>
      <div class="bg-yellow-500/10 rounded-lg p-3 border border-yellow-500/20">
        <div class="text-xs text-gray-400 mb-1">中性</div>
        <div class="text-lg text-yellow-400">23%</div>
      </div>
      <div class="bg-red-500/10 rounded-lg p-3 border border-red-500/20">
        <div class="text-xs text-gray-400 mb-1">看跌</div>
        <div class="text-lg text-red-400">15%</div>
      </div>
    </div>
  </div>
</template>
