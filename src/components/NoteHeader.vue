<template>
  <el-card 
    shadow="hover" 
    :class="['header-card', { 'header-hidden': !isHeaderVisible }]"
    @mouseenter="showHeader"
    @mouseleave="startHideTimer"
  >
    <div class="header-content">
      <span class="logo">🎨 EasyNote | 视觉灵感库</span>
      <el-button type="primary" @click="$emit('add')">+ 捕捉新灵感</el-button>
    </div>
    <el-input 
      :model-value="search" 
      @update:model-value="v => $emit('update:search', v)"
      placeholder="搜索..." 
      :prefix-icon="Search" 
      clearable 
      class="search-input" 
    />
  </el-card>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Search } from '@element-plus/icons-vue'
defineProps(['search']); defineEmits(['add', 'update:search'])

const isHeaderVisible = ref(true)
let hideTimer = null

const startHideTimer = () => {
  clearTimeout(hideTimer)
  hideTimer = setTimeout(() => { isHeaderVisible.value = false }, 3000) // 3秒隐藏
}
const showHeader = () => { isHeaderVisible.value = true; clearTimeout(hideTimer) }
onMounted(() => startHideTimer())
</script>

<style scoped>
/* 还原你的 Sticky 样式与过渡曲线 */
.header-card { position: sticky; top: 0; z-index: 100; transition: all 0.5s cubic-bezier(0.25, 0.8, 0.25, 1); background: rgba(255,255,255,0.9); backdrop-filter: blur(10px); }
.header-hidden { transform: translateY(-80%); opacity: 0.3; }
.header-content { display: flex; justify-content: space-between; align-items: center; }
.logo { font-size: 24px; font-weight: 800; color: #626aef; }
</style>