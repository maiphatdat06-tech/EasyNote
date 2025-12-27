<script setup>
/**
 * 【逻辑大脑区】
 * 包含数据存储、交互逻辑和数媒专业的视觉处理逻辑。
 */
import { ref, reactive, watch, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Edit, Delete, Search, Picture as IconPicture } from '@element-plus/icons-vue'
import { marked } from 'marked' // 引入 Markdown 解析器
import DOMPurify from 'dompurify' // 引入安全过滤器

// --- 1. 数据状态定义 ---
const notesList = ref([])
const searchQuery = ref('')
const dialogVisible = ref(false)
const isEdit = ref(false)
const currentEditId = ref(null)

// 滤镜选项定义（数媒专项）
const filterOptions = [
  { label: '原图 (Normal)', value: 'normal' },
  { label: '复古黄 (Vintage)', value: 'vintage' },
  { label: '黑白映画 (Noir)', value: 'noir' },
  { label: '赛博朋克 (Cyberpunk)', value: 'cyberpunk' },
  { label: '拍立得 (Polaroid)', value: 'polaroid' }
]

// 【响应式表单】新增 imageFilter 字段记录滤镜选择
const noteForm = reactive({
  title: '',
  content: '',
  category: '学习',
  image: '',       // 图片 Base64
  imageFilter: 'normal' // 默认无滤镜
})

// 颜色映射
const getTagType = (category) => {
  const map = { '学习': 'success', '生活': 'warning', '代码': 'danger' }
  return map[category] || 'info'
}

// --- 2. 数据持久化 ---
onMounted(() => {
  const saved = localStorage.getItem('my_notes_visual_plus')
  if (saved) notesList.value = JSON.parse(saved)
})

watch(notesList, (newVal) => {
  localStorage.setItem('my_notes_visual_plus', JSON.stringify(newVal))
}, { deep: true })

// --- 3. 交互逻辑 ---

// 图片处理与大小限制校验
const handleImageChange = (file) => {
  const isLt2M = file.raw.size / 1024 / 1024 < 2; // 限制 2MB 以内
  if (!isLt2M) {
    ElMessage.error('为了保证流畅度，请上传 2MB 以内的图片');
    return false;
  }
  const reader = new FileReader()
  reader.readAsDataURL(file.raw)
  reader.onload = () => {
    noteForm.image = reader.result
    noteForm.imageFilter = 'normal' // 新上传图片时重置滤镜
  }
}

const openAddDialog = () => {
  isEdit.value = false
  // 重置表单所有数据，包括滤镜
  Object.assign(noteForm, { title: '', content: '', category: '学习', image: '', imageFilter: 'normal' })
  dialogVisible.value = true
}

const openEditDialog = (item) => {
  isEdit.value = true
  currentEditId.value = item.id
  // 回显数据，包括之前保存的滤镜效果
  Object.assign(noteForm, { ...item, imageFilter: item.imageFilter || 'normal' })
  dialogVisible.value = true
}

const handleSave = () => {
  try {
    if (!noteForm.title && !noteForm.content) {
       ElMessage.warning('标题和内容至少写一项吧~'); return;
    }
    const noteData = { ...noteForm, time: new Date().toLocaleString() }

    if (isEdit.value) {
      const index = notesList.value.findIndex(n => n.id === currentEditId.value)
      if(index !== -1) notesList.value[index] = { ...noteData, id: currentEditId.value }
    } else {
      notesList.value.unshift({ ...noteData, id: Date.now() })
    }
    ElMessage.success('灵感已保存！')
    dialogVisible.value = false
  } catch (e) {
    if (e.name === 'QuotaExceededError') ElMessage.error('存储空间满啦，删掉一些旧图试试！')
    dialogVisible.value = false
  }
}

const deleteNote = (id) => {
  notesList.value = notesList.value.filter(n => n.id !== id)
}

const getFilteredNotes = () => {
  return notesList.value.filter(n => 
    n.title.includes(searchQuery.value) || n.content.includes(searchQuery.value)
  )
}
const renderMarkdown = (text) => {
  if (!text) return ''
  // 1. 将 Markdown 转为 HTML
  const rawHtml = marked.parse(text)
  // 2. 过滤危险标签，确保安全渲染
  return DOMPurify.sanitize(rawHtml)
}
// 在 <script setup> 中添加
const isHeaderVisible = ref(true) // 控制顶部栏显示状态
let hideTimer = null // 定时器变量

// 开启自动隐藏计时器
const startHideTimer = () => {
  clearTimeout(hideTimer) // 清理旧定时器
  hideTimer = setTimeout(() => {
    isHeaderVisible.value = false // 3秒无操作后隐藏
  }, 3000) 
}

// 鼠标进入时：立即显示并停止计时
const showHeader = () => {
  isHeaderVisible.value = true
  clearTimeout(hideTimer)
}

// 页面加载后开始计时
onMounted(() => {
  startHideTimer()
})
</script>

<template>
  <div class="app-container">
          <el-card 
        shadow="hover" 
        :class="['header-card', { 'header-hidden': !isHeaderVisible }]"
        @mouseenter="showHeader"
        @mouseleave="startHideTimer"
      >
        <div class="header-content">
          <span class="logo">🎨 EasyNote | 视觉灵感库</span>
          <el-button type="primary" @click="openAddDialog">+ 捕捉新灵感</el-button>
        </div>
        <el-input v-model="searchQuery" placeholder="搜索..." :prefix-icon="Search" clearable class="search-input" />
      </el-card>

    <div class="notes-grid" v-if="getFilteredNotes().length > 0">
      <el-card v-for="item in getFilteredNotes()" :key="item.id" class="note-item" shadow="hover">
        <template #header>
          <div class="note-header">
            <el-tag :type="getTagType(item.category)" effect="dark" round size="small">{{ item.category }}</el-tag>
            <div class="actions">
              <el-button :icon="Edit" circle size="small" @click="openEditDialog(item)" />
              <el-button :icon="Delete" circle size="small" type="danger" @click="deleteNote(item.id)" />
            </div>
          </div>
                  <div 
            class="note-title" 
            v-if="item.title" 
            v-html="renderMarkdown(item.title)"
          ></div>
        </template>

        <div v-if="item.image" class="note-image-wrapper">
          <el-image 
            :src="item.image" 
            :preview-src-list="[item.image]" 
            fit="cover" 
            class="note-image"
            :class="'filter-' + (item.imageFilter || 'normal')"
          />
        </div>

        <div 
        class="note-markdown-body" 
        v-html="renderMarkdown(item.content)"
      ></div>
        <div class="note-footer">{{ item.time }}</div>
      </el-card>
    </div>
    <el-empty v-else description="画布一片空白，快去创造吧！" />

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑灵感' : '捕捉灵感'" width="500px" class="custom-dialog">
      <el-form label-position="top">
        <div class="form-row">
           <el-form-item label="分类" style="flex: 1;">
            <el-radio-group v-model="noteForm.category" size="small">
              <el-radio-button label="学习" />
              <el-radio-button label="生活" />
              <el-radio-button label="代码" />
            </el-radio-group>
          </el-form-item>
        </div>

        <div class="upload-section">
          <el-upload class="img-uploader" action="#" :auto-upload="false" :show-file-list="false" :on-change="handleImageChange">
            <img v-if="noteForm.image" :src="noteForm.image" class="preview-img" :class="'filter-' + noteForm.imageFilter" />
            <div v-else class="upload-placeholder">
              <el-icon class="uploader-icon"><IconPicture /></el-icon>
              <span>点击上传配图</span>
            </div>
          </el-upload>

          <div class="filter-selector" v-if="noteForm.image">
            <div class="filter-label">✨ 选择风格滤镜 :</div>
            <el-select v-model="noteForm.imageFilter" placeholder="选择滤镜风格" size="small">
              <el-option
                v-for="item in filterOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              >
                 <span :class="'filter-text-' + item.value">{{ item.label }}</span>
              </el-option>
            </el-select>
          </div>
        </div>

        <el-form-item label="标题"><el-input v-model="noteForm.title" placeholder="加个标题..."/></el-form-item>
        <el-form-item label="内容 (必填)"><el-input v-model="noteForm.content" type="textarea" :rows="4" placeholder="写点什么..."/></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave" color="#626aef" style="color: white">保存灵感</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
/* === CSS3 滤镜定义区 (数媒核心) === */
/* 普通 */
.filter-normal { filter: none; }
/* 复古黄：暖色调，低饱和，加一点对比 */
.filter-vintage { filter: sepia(0.4) saturate(0.8) contrast(1.1) brightness(0.9); }
/* 黑白映画：完全去色，高对比度 */
.filter-noir { filter: grayscale(100%) contrast(1.5) brightness(0.9); }
/* 赛博朋克：色相旋转偏移，高饱和，高亮度 */
.filter-cyberpunk { filter: hue-rotate(190deg) saturate(1.5) contrast(1.2) brightness(1.1); }
/* 拍立得：轻微曝光过度，褪色感 */
.filter-polaroid { filter: contrast(0.9) brightness(1.2) saturate(0.8); }

/* 下拉菜单文字预览样式 */
.filter-text-vintage { color: #d35400; font-family: 'Courier New', serif; }
.filter-text-cyberpunk { color: #0984e3; text-shadow: 0 0 2px #00d2d3; font-weight: bold;}

/* 容器与布局优化 */
.app-container { padding: 30px; background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); min-height: 100vh; }
.header-card { margin-bottom: 25px; border-radius: 16px; border: none; }
.header-content { display: flex; justify-content: space-between; align-items: center; }
.logo { font-size: 24px; font-weight: 800; color: #626aef; /* 使用更有设计感的紫色 */ }
.search-input { margin-top: 20px; width: 100%; max-width: 400px; }

.notes-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 25px; }
.note-item { border-radius: 12px; transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1); border: none; overflow: hidden;}
.note-item:hover { transform: translateY(-8px); box-shadow: 0 12px 24px rgba(0,0,0,0.1); }

.note-header { display: flex; justify-content: space-between; align-items: center; }
.note-title { font-weight: 700; font-size: 17px; margin-top: 12px; color: #2c3e50; }
.note-body { color: #57606f; line-height: 1.7; max-height: 80px; overflow-y: auto; margin: 12px 0; white-space: pre-wrap; font-size: 14px;}
.note-footer { font-size: 12px; color: #a4b0be; text-align: right; padding-top: 10px; }

/* 图片展示优化 */
.note-image-wrapper { height: 160px; border-radius: 8px; overflow: hidden; margin: 15px 0 10px 0; background: #eee; position: relative; }
.note-image { width: 100%; height: 100%; transition: transform 0.5s; }
/* 鼠标悬停时，图片轻微放大，增加交互感 */
.note-image-wrapper:hover .note-image { transform: scale(1.05); }

/* 弹窗样式优化 */
.form-row { display: flex; gap: 20px; }
.upload-section { display: flex; gap: 20px; margin-bottom: 20px; align-items: flex-start; background: #f8f9fa; padding: 15px; border-radius: 8px;}
.img-uploader { border: 2px dashed #dce4ec; border-radius: 8px; width: 110px; height: 110px; display: flex; justify-content: center; align-items: center; cursor: pointer; overflow: hidden; background: white; transition: border-color 0.3s;}
.img-uploader:hover { border-color: #626aef; }
.preview-img { width: 100%; height: 100%; object-fit: cover; }
.upload-placeholder { display: flex; flex-direction: column; align-items: center; color: #a4b0be; font-size: 12px; }
.uploader-icon { font-size: 28px; margin-bottom: 5px; }
.filter-selector { flex: 1; display: flex; flex-direction: column; gap: 10px; }
.filter-label { font-size: 13px; font-weight: bold; color: #2c3e50; }
/* Markdown 内容样式美化 */
.note-markdown-body {
  color: #57606f;
  line-height: 1.6;
  font-size: 14px;
  max-height: 120px; /* 增加高度以容纳格式化内容 */
  overflow-y: auto;
  margin: 10px 0;
}

/* 针对 Markdown 内部标签的样式微调 */
.note-markdown-body :deep(h1), 
.note-markdown-body :deep(h2) {
  margin: 10px 0 5px 0;
  font-size: 16px;
  color: #2c3e50;
}
.note-markdown-body :deep(ul) {
  padding-left: 20px;
  margin: 5px 0;
}
.note-markdown-body :deep(code) {
  background: #f1f2f6;
  padding: 2px 4px;
  border-radius: 4px;
  font-family: monospace;
}
/* 针对标题区域的 Markdown 样式微调 */
.note-title :deep(h1),
.note-title :deep(h2),
.note-title :deep(h3) {
  margin: 0;
  font-size: 18px; /* 统一标题字号，避免过大 */
  color: #303133;
  display: inline; /* 让标题不换行，保持整齐 */
}
.header-card {
  margin-bottom: 25px;
  border-radius: 12px;
  
  /* --- 核心：实现吸顶效果 --- */
  position: sticky;   /* 粘性定位 */
  top: 0;             /* 距离顶部 0 像素时固定 */
  z-index: 100;       /* 确保它在笔记卡片的上方，不被遮挡 */
  
  /* --- 进阶美化：增加一点阴影感 --- */
  background-color: rgba(255, 255, 255, 0.95); /* 半透明背景，更有质感 */
  backdrop-filter: blur(10px);               /* 毛玻璃效果，数媒同学最爱 */
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);  /* 滚动时与下方内容产生层次感 */
}
.header-card {
  position: sticky;
  top: 0;
  z-index: 100;
  transition: all 0.5s cubic-bezier(0.25, 0.8, 0.25, 1); /* 丝滑过渡 */
  transform: translateY(0);
  opacity: 1;
}

/* 隐藏状态：向上偏移并变透明 */
.header-hidden {
  transform: translateY(-80%); /* 向上滑出 80%，留下一条窄边方便鼠标触碰 */
  opacity: 0.3; /* 保持半透明，给用户视觉引导 */
}

/* 鼠标悬停在上方区域时，即使在隐藏状态也要加强感知 */
.header-card:hover {
  transform: translateY(0);
  opacity: 1;
}
</style>