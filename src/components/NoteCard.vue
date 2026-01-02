<script setup>
import { renderMarkdown } from '../utils/markdown'
import { ref, onMounted } from 'vue' // 1. 引入 ref 和 onMounted

const props = defineProps({
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

// 2. 定义视频元素的引用
const videoRef = ref(null)

// 3. 组件挂载后，强制尝试播放
onMounted(() => {
  if (props.note.video && videoRef.value) {
    // 双重保险：JS 层面再次强制静音
    videoRef.value.muted = true;
    
    // 执行播放，并捕获可能的浏览器拦截错误
    videoRef.value.play().catch(e => {
      console.warn("自动播放被浏览器拦截，可能需要用户交互:", e);
    });
  }
})
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

    <div v-if="note.video" class="note-media-wrapper">
      <video 
        ref="videoRef"
        :src="note.video" 
        controls 
        autoplay 
        muted 
        loop
        playsinline
        class="media-content"
      ></video>
    </div>

    <div v-if="note.audio" class="note-audio-wrapper">
      <audio :src="note.audio" controls class="media-audio"></audio>
    </div>

    <div class="note-markdown-body" v-html="renderMarkdown(note.content)"></div>
    <div class="note-footer">{{ note.time }}</div>
  </el-card>
</template>

<style scoped>
/* 原有的图片容器样式 */
.note-image-wrapper {
  width: 100%;
  height: 200px;
  overflow: hidden;
  border-radius: 8px;
  margin: 15px 0;
  background-color: #f5f7fa;
  display: block;
  position: relative;
}
.note-image-wrapper :deep(.el-image) { width: 100%; height: 100%; }
.note-image-wrapper :deep(.el-image__inner) { width: 100% !important; height: 100% !important; object-fit: cover !important; object-position: center; }
.filter-vintage :deep(.el-image__inner) { filter: sepia(0.4) saturate(0.8); }
.filter-cyberpunk :deep(.el-image__inner) { filter: hue-rotate(190deg) saturate(1.5); }
.filter-noir :deep(.el-image__inner) { filter: grayscale(100%) contrast(1.5); }
.note-image-wrapper:hover :deep(.el-image__inner) { transform: scale(1.05); transition: transform 0.5s ease; }

/* --- 新增媒体样式 --- */
.note-media-wrapper {
  width: 100%;
  margin: 15px 0;
  border-radius: 8px;
  overflow: hidden;
  background: #000;
}
.media-content {
  width: 100%;
  max-height: 200px; /* 限制视频高度与图片一致 */
  display: block;
}

.note-audio-wrapper {
  margin: 10px 0;
  width: 100%;
}
.media-audio {
  width: 100%;
  height: 40px;
}
/* ---------------- */
</style>