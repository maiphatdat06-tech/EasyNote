<template>
  <el-dialog :model-value="visible" @update:model-value="v => $emit('update:visible', v)" :title="isEdit ? '编辑灵感' : '捕捉灵感'" width="550px">
    <el-form label-position="top">
      <el-form-item label="分类">
        <el-radio-group v-model="form.category" size="small">
          <el-radio-button label="学习" /><el-radio-button label="生活" /><el-radio-button label="代码" />
        </el-radio-group>
      </el-form-item>

      <div class="media-tabs">
        <span :class="{ active: mediaType === 'image' }" @click="mediaType = 'image'">图片</span>
        <span :class="{ active: mediaType === 'video' }" @click="mediaType = 'video'">视频</span>
        <span :class="{ active: mediaType === 'audio' }" @click="mediaType = 'audio'">音频</span>
      </div>

      <div class="upload-section">
        <div v-if="mediaType === 'image'" style="width: 100%">
          <el-upload action="#" :auto-upload="false" :show-file-list="false" :on-change="handleImageChange" accept="image/*">
            <img v-if="form.image" :src="form.image" class="preview-img" :class="'filter-' + form.imageFilter" />
            <div v-else class="upload-placeholder">
              <el-icon class="icon-plus"><Plus /></el-icon> 点击上传图片
            </div>
          </el-upload>
          <div class="filter-selector" v-if="form.image">
            <el-select v-model="form.imageFilter" placeholder="选择风格" size="small">
              <el-option label="原图" value="normal" />
              <el-option label="复古黄" value="vintage" />
              <el-option label="赛博朋克" value="cyberpunk" />
            </el-select>
          </div>
        </div>

        <div v-if="mediaType === 'video'" style="width: 100%">
          <el-upload action="#" :auto-upload="false" :show-file-list="false" :on-change="handleVideoChange" accept="video/*">
            <video v-if="form.video" :src="form.video" controls class="preview-media"></video>
            <div v-else class="upload-placeholder">
               <el-icon class="icon-plus"><VideoPlay /></el-icon> 点击上传视频 
            </div>
          </el-upload>
          <el-button v-if="form.video" type="danger" link size="small" @click="form.video = ''">删除视频</el-button>
        </div>

        <div v-if="mediaType === 'audio'" style="width: 100%">
          <el-upload action="#" :auto-upload="false" :show-file-list="false" :on-change="handleAudioChange" accept="audio/*">
            <audio v-if="form.audio" :src="form.audio" controls class="preview-media-audio"></audio>
            <div v-else class="upload-placeholder">
               <el-icon class="icon-plus"><Microphone /></el-icon> 点击上传音频 
            </div>
          </el-upload>
           <el-button v-if="form.audio" type="danger" link size="small" @click="form.audio = ''">删除音频</el-button>
        </div>
      </div>

      <el-form-item label="标题"><el-input v-model="form.title" /></el-form-item>
      <el-form-item label="内容"><el-input v-model="form.content" type="textarea" :rows="4" /></el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="$emit('update:visible', false)">取消</el-button>
      <el-button type="primary" @click="save" color="#626aef" style="color:white">保存灵感</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { reactive, watch, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, VideoPlay, Microphone } from '@element-plus/icons-vue' // 需要引入图标

const props = defineProps(['visible', 'isEdit', 'initialData'])
const emit = defineEmits(['update:visible', 'submit'])

// 新增 video 和 audio 字段
const form = reactive({ title: '', content: '', category: '学习', image: '', imageFilter: 'normal', video: '', audio: '' })
const mediaType = ref('image') // 控制当前显示的上传 Tab

watch(() => props.initialData, (val) => {
  if (val) {
    Object.assign(form, val)
    // 自动切换到有内容的 Tab
    if (val.video) mediaType.value = 'video'
    else if (val.audio) mediaType.value = 'audio'
    else mediaType.value = 'image'
  } else {
    // 重置
    Object.assign(form, { title: '', content: '', category: '学习', image: '', imageFilter: 'normal', video: '', audio: '' })
    mediaType.value = 'image'
  }
}, { immediate: true })

const handleImageChange = (file) => {
  const isLt2M = file.raw.size / 1024 / 1024 < 2;
  if (!isLt2M) { ElMessage.error('图片请控制在 2MB 以内！'); return false; }
  readFile(file.raw, (res) => { form.image = res; form.imageFilter = 'normal'; ElMessage.success('图片已就绪') })
}

// 新增：视频处理
const handleVideoChange = (file) => {
  // const isLt5M = file.raw.size / 1024 / 1024 < 5; // 视频限制 5MB
  // if (!isLt5M) { ElMessage.error('LocalStore限制：视频必须小于 5MB！'); return false; }
  // readFile(file.raw, (res) => { form.video = res; ElMessage.success('视频已就绪') })
  readFile(file.raw, (res) => { form.video = res; ElMessage.success('视频已就绪') })
}

// 新增：音频处理
const handleAudioChange = (file) => {
  // const isLt3M = file.raw.size / 1024 / 1024 < 3; // 音频限制 3MB
  // if (!isLt3M) { ElMessage.error('LocalStore限制：音频必须小于 3MB！'); return false; }
  // readFile(file.raw, (res) => { form.audio = res; ElMessage.success('音频已就绪') })
  readFile(file.raw, (res) => { form.audio = res; ElMessage.success('音频已就绪') })
}

// 封装通用的读取函数
const readFile = (file, callback) => {
  const reader = new FileReader()
  reader.readAsDataURL(file)
  reader.onload = () => callback(reader.result)
}

const save = () => { emit('submit', { ...form }); emit('update:visible', false) }
</script>

<style scoped>
.upload-section { display: flex; flex-direction: column; align-items: center; gap: 15px; margin-bottom: 20px; width: 100%; }
.preview-img { width: 100%; max-height: 250px; object-fit: contain; border-radius: 8px; background-color: #f8f9fa; border: 1px dashed #dcdfe6; }
/* 新增：媒体预览样式 */
.preview-media { width: 100%; max-height: 250px; border-radius: 8px; background: #000; }
.preview-media-audio { width: 100%; margin-top: 20px; }

.upload-section :deep(.el-upload) { width: 100%; display: block; }
.upload-placeholder { width: 100%; height: 150px; display: flex; align-items: center; justify-content: center; gap: 8px; border: 1px dashed #dcdfe6; border-radius: 8px; color: #909399; cursor: pointer; transition: border-color 0.3s; flex-direction: column; }
.upload-placeholder:hover { border-color: #626aef; color: #626aef; }
.filter-vintage { filter: sepia(0.4) saturate(0.8); }
.filter-cyberpunk { filter: hue-rotate(190deg) saturate(1.5); }
.filter-selector { width: 100%; }

/* 新增：简单的 Tab 样式 */
.media-tabs { display: flex; gap: 10px; margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 5px; width: 100%; }
.media-tabs span { cursor: pointer; padding: 5px 10px; font-size: 14px; color: #666; border-radius: 4px; transition: all 0.3s; }
.media-tabs span:hover { background: #f5f7fa; }
.media-tabs span.active { background: #626aef; color: white; font-weight: bold; }
</style>