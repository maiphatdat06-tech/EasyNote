import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

// 1. 保持接口定义不变，包含视频和音频字段
interface Note {
  id?: number
  title: string
  content: string
  category: string
  image: string
  imageFilter: string
  video?: string 
  audio?: string
  time?: string
}

/* =========================================================
   IndexedDB 工具函数封装 (不依赖第三方库，原生实现)
   ========================================================= */
const DB_NAME = 'EasyNoteDB_v2' // 数据库名称
const STORE_NAME = 'notes'  // 对象仓库名称
const DB_VERSION = 1  // 数据库版本

// 打开数据库
const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    
    request.onerror = () => {
      ElMessage.error('无法打开数据库，请检查浏览器权限')
      reject(request.error)
    }

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      // 创建一个对象仓库，主键为 id
      if (!db.objectStoreNames.contains(STORE_NAME))  {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' })
      }   
    }
    // 确保唯一性
    request.onsuccess = () => resolve(request.result)
  })
}

// 获取所有笔记
const getAllNotesFromDB = async (): Promise<Note[]> => {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly')
    const store = transaction.objectStore(STORE_NAME)
    const request = store.getAll()

    request.onsuccess = () => {
      // IndexedDB 默认按插入顺序或 ID 排序，我们需要按时间倒序（最新的在前面）
      // 这里简单地反转数组，假设 ID 是时间戳生成的
      const res = request.result as Note[]
      resolve(res.reverse()) 
    }
    request.onerror = () => reject(request.error)
  })
}

// 保存单个笔记 (新增或修改)
const putNoteToDB = async (note: Note) => {
  const db = await openDB()
  return new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite')
    const store = transaction.objectStore(STORE_NAME)
    const request = store.put(JSON.parse(JSON.stringify(note))) // 深拷贝以去除 Vue 的代理对象

    request.onsuccess = () => resolve()
    request.onerror = () => {
      console.error('写入失败', request.error)
      ElMessage.error('写入数据库失败，文件可能过大')
      reject(request.error)
    }
  })
}

// 删除单个笔记
const deleteNoteFromDB = async (id: number) => {
  const db = await openDB()
  return new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite')
    const store = transaction.objectStore(STORE_NAME)
    const request = store.delete(id)

    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

/* =========================================================
   Vue Composable (业务逻辑层)
   ========================================================= */
export function useNotes() {
  const notesList = ref<Note[]>([])

  // 1. 初始化加载：从 IndexedDB 获取数据
  onMounted(async () => {
    try {
      const savedNotes = await getAllNotesFromDB()
      notesList.value = savedNotes
    } catch (e) {
      console.error("加载数据失败", e)
    }
  })

  // 注意：我们移除了之前的 watch(notesList)。
  // 因为 IndexedDB 是异步的，而且数据量大，不再适合监听整个数组变化后全量写入。
  // 我们改为在 saveNote 和 deleteNote 时进行“单条操作”。

  // 2. 保存逻辑：兼容新增和编辑
  const saveNote = async (noteData: Note) => {
    // 构造完整的笔记对象
    let noteToSave: Note

    if (noteData.id) {
      // --- 编辑模式 ---
      // 1. 先更新 UI (为了即时反馈，无需等待数据库)
      const index = notesList.value.findIndex(n => n.id === noteData.id)
      if (index !== -1) {
        noteToSave = { 
          ...noteData, 
          time: new Date().toLocaleString() 
        }
        notesList.value[index] = noteToSave
        ElMessage.success('灵感已更新！')
        
        // 2. 后台异步存入 IndexedDB
        await putNoteToDB(noteToSave)
      }
    } else {
      // --- 新增模式 ---
      noteToSave = {
        ...noteData,
        id: Date.now(), // 使用时间戳作为主键 ID
        time: new Date().toLocaleString()
      }
      // 1. 先更新 UI
      notesList.value.unshift(noteToSave)
      ElMessage.success('成功捕捉到灵感！')
      
      // 2. 后台异步存入 IndexedDB
      await putNoteToDB(noteToSave)
    }
  }

  // 3. 删除逻辑
  const deleteNote = async (id: number) => {
    // 1. 先更新 UI
    notesList.value = notesList.value.filter(n => n.id !== id)
    
    // 2. 后台异步删除
    await deleteNoteFromDB(id)
    ElMessage.success('已删除')
  }

  return { 
    notesList, 
    deleteNote, 
    saveNote 
  }
}