<template>
  <el-dialog :model-value="visible" @update:model-value="v => $emit('update:visible', v)" :title="isEdit ? '编辑灵感' : '捕捉灵感'" width="500px">
    <el-form label-position="top">
      <el-form-item label="分类">
        <el-radio-group v-model="form.category" size="small">
          <el-radio-button label="学习" /><el-radio-button label="生活" /><el-radio-button label="代码" />
        </el-radio-group>
      </el-form-item>

      <div class="upload-section">
        <el-upload action="#" :auto-upload="false" :show-file-list="false" :on-change="handleImageChange">
          <img v-if="form.image" :src="form.image" class="preview-img" :class="'filter-' + form.imageFilter" />
          <div v-else class="upload-placeholder">点击上传配图</div>
        </el-upload>
        <div class="filter-selector" v-if="form.image">
          <el-select v-model="form.imageFilter" placeholder="选择风格" size="small">
            <el-option label="原图" value="normal" />
            <el-option label="复古黄" value="vintage" />
            <el-option label="赛博朋克" value="cyberpunk" />
          </el-select>
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
import { reactive, watch } from 'vue'
import { ElMessage } from 'element-plus'
const props = defineProps(['visible', 'isEdit', 'initialData'])
const emit = defineEmits(['update:visible', 'submit'])

const form = reactive({ title: '', content: '', category: '学习', image: '', imageFilter: 'normal' })

watch(() => props.initialData, (val) => {
  if (val) Object.assign(form, val)
  else Object.assign(form, { title: '', content: '', category: '学习', image: '', imageFilter: 'normal' })
}, { immediate: true })

// 在 handleImageChange 函数中加入严谨校验
const handleImageChange = (file) => {
  const isLt2M = file.raw.size / 1024 / 1024 < 2; // 限制 2MB
  if (!isLt2M) {
    ElMessage.error('为了防止存储爆仓，请上传 2MB 以内的图片！');
    return false;
  }
  
  const reader = new FileReader()
  reader.readAsDataURL(file.raw)
  reader.onload = () => {
    form.image = reader.result
    form.imageFilter = 'normal'
    ElMessage.success('配图已就绪，别忘了选个滤镜')
  }
}

const save = () => { emit('submit', { ...form }); emit('update:visible', false) }
</script>
<style scoped>
/* 1. 约束上传区域的整体布局 */
.upload-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
  width: 100%;
}

/* 2. 【核心修复】强制约束预览图尺寸，防止爆图 */
.preview-img {
  width: 100%;           /* 宽度占满父容器 */
  max-height: 250px;     /* 【关键】锁定最大高度，防止撑破弹窗 */
  object-fit: contain;   /* 确保图片完整显示且不失真 */
  border-radius: 8px;
  background-color: #f8f9fa;
  border: 1px dashed #dcdfe6;
}

/* 3. 约束 Element Plus 上传组件的宽度 */
.upload-section :deep(.el-upload) {
  width: 100%;
  display: block;
}

/* 4. 占位符样式（未上传时） */
.upload-placeholder {
  width: 100%;
  height: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px dashed #dcdfe6;
  border-radius: 8px;
  color: #909399;
  cursor: pointer;
  transition: border-color 0.3s;
}

.upload-placeholder:hover {
  border-color: #626aef;
}

/* 5. 还原滤镜效果（作用于预览图） */
.filter-vintage { filter: sepia(0.4) saturate(0.8); }
.filter-cyberpunk { filter: hue-rotate(190deg) saturate(1.5); }

.filter-selector {
  width: 100%;
}
</style>