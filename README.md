# 🎨 EasyNote | 智能灵感空间

[![Vue](https://img.shields.io/badge/Vue-3.x-4fc08d?logo=vue.js)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.x-646cff?logo=vite)](https://vitejs.dev/)
[![Security](https://img.shields.io/badge/Security-DOMPurify-red)](https://github.com/cure53/dompurify)

一款面向多媒体创作者的轻量级灵感笔记应用。集成了 **Markdown 实时排版**、**数媒滤镜特效**与**企业级安全加固**。

---

## 🌟 核心特性

- **📝 富文本排版**：集成 `Marked.js` 解析引擎，支持全语法 Markdown 渲染。
- **🛡️ 安全加固**：通过 `DOMPurify` 构建 XSS 过滤流水线，确保 `v-html` 渲染内容的安全性。
- **🎭 视觉滤镜**：利用 CSS3 Filter 实现了包括赛博朋克、复古映画在内的 5 种实时图像处理算法。
- **🖱️ 智能交互**：采用 **Sticky 粘性定位**与 **JS 定时器**实现的智能隐藏吸顶工具栏，提升沉浸式体验。
- **💾 健壮存储**：基于 LocalStorage 的数据持久化，并具备完整的 `QuotaExceededError`（空间溢出）异常捕获逻辑。

---

## 📸 项目预览

> **江农大 120 周年校庆灵感卡片**：展示了完美的 Markdown 渲染效果与响应式布局。
![EasyNote Preview](https://github.com/你的用户名/EasyNote/blob/main/src/assets/preview.png?raw=true) 
*(注：请将你的预览截图 image_dfadd9.png 放在项目的 assets 文件夹并替换此链接)*

---

## 📂 模块化工程架构

本项目遵循 **关注点分离 (SoC)** 原则进行了重构，有效规避了标识符冲突问题：

- **`src/utils/`**: 存放类型安全的 Markdown 解析逻辑。
- **`src/composables/`**: 封装笔记增删改查及持久化业务逻辑。
- **`src/components/`**: 拆分 UI 组件，提升代码复用率。
- **`App.vue`**: 负责全局模块的组合与调度。

---

## 🛠️ 技术挑战与解决方案

### 1. 存储溢出优化
针对 LocalStorage 5MB 限制，通过 `try...catch` 机制解决了 Base64 图片存储导致的 UI 卡死问题，确保应用在极端数据下的稳定性。

### 2. TypeScript 类型安全
通过 `marked.parseSync` 解决了异步解析导致的类型冲突问题，实现了全链路的静态类型加固。

---

## 🚀 快速启动

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev