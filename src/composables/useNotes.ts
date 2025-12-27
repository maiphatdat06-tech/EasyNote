import { ref, watch, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

// 定义笔记接口，增强代码的可读性与安全性
interface Note {
  id?: number
  title: string
  content: string
  category: string
  image: string
  imageFilter: string
  time?: string
}

export function useNotes() {
  const notesList = ref<Note[]>([])

  // 1. 初始化加载：从本地存储获取数据
  onMounted(() => {
    const saved = localStorage.getItem('my_notes_visual_plus')
    if (saved) {
      try {
        notesList.value = JSON.parse(saved)
      } catch (e) {
        console.error("数据解析失败", e)
      }
    }
  })

  // 2. 数据持久化：监听列表变化并存入 LocalStorage
  watch(notesList, (newVal) => {
    try {
      localStorage.setItem('my_notes_visual_plus', JSON.stringify(newVal))
    } catch (e: any) {
      // 还原存储溢出报错逻辑
      if (e.name === 'QuotaExceededError') {
        ElMessage.error('存储空间满啦，删掉一些旧图试试！')
      }
    }
  }, { deep: true })

  // 3. 保存逻辑：兼容新增和编辑
  const saveNote = (noteData: Note) => {
    if (noteData.id) {
      // 编辑：找到旧笔记并替换
      const index = notesList.value.findIndex(n => n.id === noteData.id)
      if (index !== -1) {
        notesList.value[index] = { 
          ...noteData, 
          time: new Date().toLocaleString() 
        }
        ElMessage.success('灵感已更新！')
      }
    } else {
      // 新增：生成 ID 和时间戳
      const newNote = {
        ...noteData,
        id: Date.now(),
        time: new Date().toLocaleString()
      }
      notesList.value.unshift(newNote) // 将新笔记插入到最前面
      ElMessage.success('成功捕捉到灵感！')
    }
  }

  // 4. 删除逻辑
  const deleteNote = (id: number) => {
    notesList.value = notesList.value.filter(n => n.id !== id)
  }

  // 必须返回 saveNote，否则 App.vue 无法调用
  return { 
    notesList, 
    deleteNote, 
    saveNote 
  }
}