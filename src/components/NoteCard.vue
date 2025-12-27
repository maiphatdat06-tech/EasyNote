<script setup>
import { renderMarkdown } from '../utils/markdown'

defineProps({
  note: {
    type: Object,
    required: true
  }
})

defineEmits(['edit', 'delete'])

const getTagType = (category) => {
  const map = { '学习': 'success', '生活': 'warning', '代码': 'danger' }
  return map[category] || 'info'
}
</script>

<template>
  <el-card class="note-item" shadow="hover">
    <template #header>
      <div class="note-header">
        <el-tag :type="getTagType(note.category)" effect="dark" round size="small">
          {{ note.category }}
        </el-tag>
        <div class="actions">
          <el-button icon="Edit" circle size="small" @click="$emit('edit', note)" />
          <el-button icon="Delete" circle size="small" type="danger" @click="$emit('delete', note.id)" />
        </div>
      </div>
      <div class="note-title" v-html="renderMarkdown(note.title)"></div>
    </template>

   <div v-if="note.image" class="note-image-wrapper">
  <el-image 
    :src="note.image" 
    :preview-src-list="[note.image]" 
    class="note-image" 
    :class="'filter-' + (note.imageFilter || 'normal')" 
    fit="cover" 
  />
</div>

    <div class="note-markdown-body" v-html="renderMarkdown(note.content)"></div>
    <div class="note-footer">{{ note.time }}</div>
  </el-card>
</template>

<style scoped>
/* 1. 约束外层容器 */
.note-image-wrapper {
  width: 100%;
  height: 200px;         /* 强制锁定容器高度 */
  overflow: hidden;      /* 核心：确保溢出的部分被切掉 */
  border-radius: 8px;
  margin: 15px 0;
  background-color: #f5f7fa;
  display: block;        /* 改为 block 或保持 flex 但要确保子项受限 */
  position: relative;    /* 绝对定位 */
}
/* 2. 约束 el-image 组件本身 */
.note-image-wrapper :deep(.el-image) {
  width: 100%;
  height: 100%;
}

/* 3. 强制约束 el-image 内部真正的图片标签 */
.note-image-wrapper :deep(.el-image__inner) {
  width: 100% !important;
  height: 100% !important;
  object-fit: cover !important; /* 确保图片等比填充不爆框 */
  object-position: center;
}

/* 增加滤镜效果（确保也作用于内部图片） */
.filter-vintage :deep(.el-image__inner) { filter: sepia(0.4) saturate(0.8); }
.filter-cyberpunk :deep(.el-image__inner) { filter: hue-rotate(190deg) saturate(1.5); }
.filter-noir :deep(.el-image__inner) { filter: grayscale(100%) contrast(1.5); }

/* 鼠标悬停动效 */
.note-image-wrapper:hover :deep(.el-image__inner) {
  transform: scale(1.05);
  transition: transform 0.5s ease;
}
</style>