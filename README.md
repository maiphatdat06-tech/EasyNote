# 🎨 EasyNote | 视觉灵感库 (Visual Inspiration Library)

> 一个基于 Vue 3 + Element Plus 的多媒体灵感收集应用。不仅支持 Markdown 笔记，更支持图片、视频、音频的混合记录与大容量本地存储。

## ✨ 主要特性 (Features)

### 1. 多媒体支持 (Multimedia Support) `NEW`
- **🖼️ 图片上传**：支持图片上传并内置滤镜（复古黄、赛博朋克、黑白）。
- **🎥 视频集成**：支持上传 MP4 等格式视频，**卡片内自动静音循环播放**，捕捉动态灵感。
- **🎵 音频记录**：支持上传音频文件，随时回放语音备忘或灵感音乐。

### 2. 强大的本地存储 (IndexedDB Storage) `NEW`
- **🚀 告别容量焦虑**：底层存储架构已从 `LocalStorage` 迁移至 **原生 IndexedDB**。
- **💾 大文件存储**：打破了浏览器 5MB 的存储限制，现在可以流畅存储 **几百MB** 的视频或高清素材（取决于硬盘空间）。
- **⚡ 异步读写**：采用异步数据库操作，确保界面操作流畅不卡顿。

### 3. 编辑与交互体验
- **📝 Markdown 渲染**：集成 `marked.js` 与 `DOMPurify`，支持安全的富文本渲染。
- **🎨 交互式卡片**：悬停缩放特效、标签分类（学习/生活/代码）、一键增删改。
- **🔍 实时搜索**：顶部搜索栏支持对标题和内容的实时过滤。

## 🛠️ 技术栈 (Tech Stack)

- **前端框架**: [Vue 3](https://vuejs.org/) (Composition API / Script Setup)
- **UI 组件库**: [Element Plus](https://element-plus.org/)
- **本地数据库**: **Native IndexedDB** (原生封装，无第三方库依赖)
- **工具库**: 
  - `marked`: Markdown 解析
  - `dompurify`: HTML 清洗与安全防护
- **构建工具**: Vite

## 🚀 快速开始 (Setup)

### 1. 安装依赖
```bash
npm install