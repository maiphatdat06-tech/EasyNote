<template>
  <div class="app-container">
    <NoteHeader v-model:search="searchQuery" @add="openAddDialog" />

    <div class="notes-grid" v-if="filteredNotes.length > 0">
      <NoteCard 
        v-for="item in filteredNotes" 
        :key="item.id" 
        :note="item" 
        @delete="deleteNote" 
        @edit="openEditDialog"
      />
    </div>
    <el-empty v-else description="画布一片空白，快去创造吧！" />

    <NoteDialog 
  v-model:visible="dialogVisible" 
  :initial-data="currentEditNote" 
  @submit="handleSave" 
/>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import NoteHeader from './components/NoteHeader.vue'
import NoteCard from './components/NoteCard.vue'
import NoteDialog from './components/NoteDialog.vue'
import { useNotes } from './composables/useNotes'

// 1. 确保从 useNotes 中导出了 saveNote 方法
const { notesList, deleteNote, saveNote } = useNotes()

const searchQuery = ref('')
const dialogVisible = ref(false)
const currentEditNote = ref(null)

// 2. 补全缺失的保存处理函数
const handleSave = (noteData) => {
  saveNote(noteData); // 调用逻辑层保存数据
  dialogVisible.value = false; // 关闭弹窗
}

const filteredNotes = computed(() => {
  return notesList.value.filter(n => 
    n.title.includes(searchQuery.value) || n.content.includes(searchQuery.value)
  )
})

const openAddDialog = () => { currentEditNote.value = null; dialogVisible.value = true }
const openEditDialog = (note) => { 
  currentEditNote.value = { ...note }; // 浅拷贝，防止直接修改列表数据
  dialogVisible.value = true 
}
</script>
<style scoped>
.app-container {
  padding: 20px;
  max-width: 1400px; /* 限制整体宽度，防止在大屏幕上拉得太开 */
  margin: 0 auto;
}

/* --- 控制一行显示多个卡片的容器 --- */
.notes-grid {
  display: grid; /* 启用网格布局 */
  
  /* 自动填充列：每列最小 300px，最大平分剩余空间 */
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); 
  
  gap: 20px;     /* 卡片之间的间距 */
  padding: 20px 0;
  width: 100%;
}

/* 响应式微调：如果是手机端，可以缩小间距 */
@media (max-width: 600px) {
  .notes-grid {
    grid-template-columns: 1fr; /* 手机端强制一行一个 */
    gap: 15px;
  }
}
</style>