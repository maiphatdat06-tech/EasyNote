import { marked } from 'marked'
import DOMPurify from 'dompurify'

/**
 * 安全的 Markdown 解析工具
 * 集成了 DOMPurify 以规避 XSS 风险
 */
export const renderMarkdown = (text) => {
  if (!text) return ''
  const rawHtml = marked.parse(text)
  return DOMPurify.sanitize(rawHtml)
}