import { getParentByClassName } from './utils'

export default class RangeHandle {
  constructor({ editorEl }) {
    this.editorEl = editorEl
    this.lastRange = null
  }

  // 更新最后一个选区
  updateLastRange(range) {
    this.lastRange = range
  }

  // 恢复最后一个选区
  restoreSelection() {
    const { selection, range } = this.getSel()
    // 判断当前选区是否在编辑器内，在的话就不需要恢复
    if (range) {
      const inputEl = getParentByClassName(
        range.commonAncestorContainer,
        'hx-sender-input',
        this.editorEl
      )
      if (inputEl) {
        return
      }
    }
    const newRange = document.createRange()
    if (this.lastRange) {
      newRange.setStart(
        this.lastRange.startContainer,
        this.lastRange.startOffset
      )
    } else {
      newRange.selectNodeContents(this.editorEl)
    }
    newRange.collapse(true)
    selection.removeAllRanges()
    selection.addRange(newRange)
  }

  // 获取当前选区
  getSel() {
    const selection = window.getSelection()
    return {
      selection,
      range: selection.rangeCount > 0 ? selection.getRangeAt(0) : null
    }
  }

  // 聚焦到指定元素
  focusEl(el, isStart = false) {
    // 创建一个新的 Range 对象，用于表示文档中的一个连续范围
    const range = document.createRange()
    // 获取当前文档的选区对象（用户选中的文本区域）
    const selection = this.getSel().selection
    // 将范围设置为包含 el 元素的所有内容
    // 比如 el 是一个 <div contenteditable="true">Hello World</div>，范围就会包含整个 "Hello World" 文本
    range.selectNodeContents(el)
    // 将范围折叠（收缩）到单个点
    // false 参数表示折叠到范围的末尾（true 表示折叠到开头）
    range.collapse(isStart)
    // 清除当前所有的选区（取消任何已选中的文本）
    selection.removeAllRanges()
    // 将创建的范围添加到选区中，这样光标就会出现在指定位置
    selection.addRange(range)
  }

  // 失去焦点
  blur() {
    this.editorEl.blur()
  }

  // 全选指定元素
  selectAll(el) {
    el = el || this.editorEl
    const selection = this.getSel().selection
    const range = document.createRange()
    // 选择编辑器的所有内容
    range.selectNodeContents(el)
    // 移除现有选区并添加新选区
    selection.removeAllRanges()
    selection.addRange(range)
  }

  // 在光标处插入结构化数据
  insertHtmlTo(html) {
    this.restoreSelection()
    const { selection, range } = this.getSel()
    // 如果当前光标在输入标签中，那么移动到输入标签后面
    const inputTagEl = getParentByClassName(
      range.commonAncestorContainer,
      'hx-sender-input-tag',
      this.editorEl
    )
    // 输入标签中禁止插入html内容
    if (inputTagEl) {
      // 移动到输入标签后面
      range.setStartAfter(inputTagEl)
      range.collapse(true)
      selection.removeAllRanges()
      selection.addRange(range)
    }
    range.deleteContents()
    const fragment = document.createRange().createContextualFragment(html)
    range.insertNode(fragment)
    range.collapse(false)
    selection.removeAllRanges()
    selection.addRange(range)
  }

  // 在光标处插入文本
  insertTextTo(text) {
    this.restoreSelection()
    const { selection, range } = this.getSel()
    range.deleteContents()
    range.insertNode(document.createTextNode(text))
    range.collapse(false)
    selection.removeAllRanges()
    selection.addRange(range)
  }

  // 获取光标前的文本
  getTextBeforeCursor() {
    const selection = this.getSel().selection
    if (!selection.rangeCount) return ''
    const { focusOffset, anchorNode } = selection
    if (anchorNode && anchorNode.nodeType === Node.TEXT_NODE) {
      const parentElement = anchorNode.parentElement
      if (
        parentElement &&
        parentElement.classList.contains('hx-sender-input')
      ) {
        return anchorNode.textContent.substring(0, focusOffset)
      }
    }
    return ''
    // const preCaretRange = range.cloneRange()
    // preCaretRange.selectNodeContents(this.getEditorEl())
    // preCaretRange.setEnd(range.endContainer, range.endOffset)
    // // 获取范围内的内容
    // let text = ''
    // const contents = preCaretRange.cloneContents()
    // Array.from(contents.childNodes).forEach(node => {
    //   if (node.nodeType === Node.TEXT_NODE) {
    //     text += node.textContent
    //   }
    // })
  }

  // 删除光标前的文本
  deleteText(delLength) {
    this.restoreSelection()
    const { range } = this.getSel()
    const deleteRange = document.createRange()
    deleteRange.setStart(range.endContainer, range.endOffset - delLength)
    deleteRange.setEnd(range.endContainer, range.endOffset)
    deleteRange.deleteContents()
  }
}
