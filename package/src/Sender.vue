<template>
  <div class="hx-sender-container">
    <!-- 头部容器 -->
    <Transition name="slide">
      <div v-if="$slots.header" class="hx-sender-header">
        <div class="hx-sender-header-container">
          <slot name="header" />
        </div>
      </div>
    </Transition>
    <!-- 内容容器 -->
    <div
      class="hx-sender-content"
      :class="{ 'content-variant-updown': variant === 'updown' }"
    >
      <!-- Prefix 前缀 -->
      <div
        v-if="$slots.prefix && variant === 'default'"
        class="hx-sender-prefix"
      >
        <slot name="prefix" />
      </div>
      <!-- 输入区域 -->
      <div class="hx-sender-input-wrap" @mousedown.stop="() => {}">
        <div
          ref="editor"
          class="hx-sender-input"
          :class="{ disabled: disabled }"
          :contenteditable="!disabled"
          :placeholder="placeholder"
          :style="{ minHeight: minHeight + 'px', maxHeight: maxHeight + 'px' }"
          @input="_handleInput"
          @keydown="_handleKeydown"
          @paste="_handlePaste"
          @click="_handleClick"
          @blur="_handleBlur"
        ></div>
      </div>
      <!-- 默认操作列表 -->
      <div v-if="variant === 'default'" class="hx-sender-action-list">
        <!-- Prefix 后缀 -->
        <div
          v-if="$slots.suffix && variant === 'default'"
          class="hx-sender-suffix"
        >
          <slot name="suffix" />
        </div>
        <slot name="action-list">
          <div class="hx-sender-action-list-presets"></div>
        </slot>
      </div>
      <!-- 变体操作列表 -->
      <div
        v-else-if="variant === 'updown'"
        class="hx-sender-updown-action-list"
      >
        <!-- 变体 updown： Prefix 前缀 -->
        <div v-if="$slots.prefix" class="hx-sender-prefix">
          <slot name="prefix" />
        </div>
        <!-- 变体 updown：操作列表 -->
        <div class="hx-sender-action-list">
          <slot name="action-list">
            <div class="hx-sender-action-list-presets"></div>
          </slot>
        </div>
      </div>
    </div>
    <!-- 底部容器 -->
    <Transition name="slide">
      <div v-if="$slots.footer" class="hx-sender-footer">
        <slot name="footer" />
      </div>
    </Transition>
    <SelectDropdown
      :show.sync="showSelectDropdown"
      :position="selectDropdownPosition"
      :value="selectDropdownValue"
      :data="selectDropdownData"
      @change="_handleSelectChange"
    ></SelectDropdown>
    <Trigger
      ref="trigger"
      :rangeHandle="rangeHandle"
      :triggerList="triggerList"
      :getEditorEl="_getEditorEl"
      @change="_handleInput"
    ></Trigger>
  </div>
</template>

<script>
import { getParentByClassName, generateRandomString } from './utils.js'
import SelectDropdown from './SelectDropdown.vue'
import Trigger from './Trigger.vue'
import RangeHandle from './RangeHandle.js'

export default {
  name: 'Sender',
  components: {
    SelectDropdown,
    Trigger
  },
  props: {
    selectTagList: {
      type: Array,
      default: () => []
    },
    triggerList: {
      type: Array,
      default: () => []
    },
    minHeight: {
      type: Number,
      default: 100
    },
    maxHeight: {
      type: Number,
      default: 300
    },
    placeholder: {
      type: String,
      default: 'Enter 发送，Shift + Enter 换行'
    },
    onkeydown: {
      type: Function,
      default: null
    },
    autoFocus: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    },
    variant: {
      type: String,
      default: 'default'
    }
  },
  data() {
    return {
      value: '',
      rangeHandle: null,
      // 选择标签下拉列表
      showSelectDropdown: false,
      selectDropdownId: '', // 选择标签当前id
      selectDropdownValue: '', // 选择标签当前值
      selectDropdownPosition: null, // 选择标签下拉列表位置信息
      selectDropdownData: null // 选择标签下拉列表数据
    }
  },
  watch: {
    showSelectDropdown(val) {
      if (!val) {
        this._onCloseSelectDropdown()
      }
    }
  },
  created() {
    document.body.addEventListener('click', this._handleBodyClick)
  },
  mounted() {
    this.rangeHandle = new RangeHandle({ editorEl: this.$refs.editor })
    if (this.autoFocus) {
      this.focus()
    }
  },
  beforeDestroy() {
    document.body.removeEventListener('click', this._handleBodyClick)
  },
  methods: {
    // _value：字符串或内容数组
    setValue(_value, autoFocus = true) {
      let html = ''
      if (typeof _value === 'string') {
        html = _value
      } else if (Array.isArray(_value)) {
        html = this._jsonToHtml(_value)
      }
      this.$refs.editor.innerHTML = html
      if (autoFocus) {
        this.$nextTick(() => {
          this.focus()
        })
      }
      // 触发输入事件
      this._handleInput()
    },

    // _value：字符串或内容数组
    insertValue(_value) {
      let html = ''
      // 在当前光标处插入
      if (typeof _value === 'string') {
        html = _value
        this.rangeHandle.insertTextTo(html)
      } else if (Array.isArray(_value)) {
        html = this._jsonToHtml(_value)
        this.rangeHandle.insertHtmlTo(html)
      }
      // 触发输入事件
      this._handleInput()
    },

    // 获取格式化后的内容
    getValue() {
      const editor = this.$refs.editor
      let html = editor.innerHTML.trim()
      if (html === '' || html === '<br>') {
        editor.innerHTML = ''
        html = ''
      }
      return {
        html,
        json: this._htmlToJson(editor)
      }
    },

    clear() {
      this.setValue('')
    },

    // 聚焦输入框，pos可选值：start、end、标签id
    focus(pos = 'end') {
      const editor = this.$refs.editor
      if (pos === 'start') {
        this.rangeHandle.focusEl(editor, true)
      } else if (pos === 'end') {
        this.rangeHandle.focusEl(editor)
      } else {
        // 聚焦到指定输入标签
        const inputTag = editor.querySelector(`[data-id="${pos}"]`)
        if (inputTag) {
          this.rangeHandle.focusEl(inputTag)
        }
      }
    },

    blur() {
      this.rangeHandle.blur()
    },

    selectAll() {
      this.rangeHandle.selectAll()
    },

    insertTrigger(data) {
      if (this.$refs.trigger) this.$refs.trigger.insert(data)
    },

    _jsonToHtml(json) {
      let html = ''
      json.forEach(item => {
        item.id = item.id || generateRandomString()
        if (item.type === 'text') {
          // 文本
          html += item.value
        } else if (item.type === 'tag') {
          // 普通标签
          html += `<span class="hx-sender-tag" data-id="${item.id}" data-key="${
            item.key
          }" data-value="${
            item.value
          }" contenteditable="false"><span class="hx-sender-tag-name">${this._getTagName(
            item.key,
            item.value
          )}</span>${
            item.showClose
              ? `<span class="hx-sender-tag-close el-icon-close"></span>`
              : ''
          }</span>`
        } else if (item.type === 'select') {
          // 选择标签
          html += `<span class="hx-sender-select-tag" data-id="${
            item.id
          }" data-key="${item.key}" data-value="${
            item.value
          }" contenteditable="false"><span class="hx-sender-select-tag-name">${this._getTagName(
            item.key,
            item.value
          )}</span><span class="hx-sender-select-tag-arrow-icon el-icon-caret-bottom"></span></span>`
        } else if (item.type === 'input') {
          // 输入标签
          html += `<span data-id="${item.id}" contenteditable="true" placeholder="${item.placeholder}" class="hx-sender-input-tag">${item.value}</span><span contenteditable="false" class="hx-sender-no-width">&nbsp;</span>`
        } else if (item.type === 'html') {
          // html标签
          html += `<span data-id="${item.id}" class="hx-sender-html-tag" contenteditable="false">${item.value}</span>`
        } else if (item.type === 'trigger') {
          // 自定义指令标签
          html += `<span  data-id="${item.id}" class="hx-sender-custom-trigger-tag" data-prefix="${item.prefix}" data-value="${item.value}" data-name="${item.name}"  contenteditable="false">${item.prefix}${item.name}</span>`
        }
      })
      return html
    },

    _htmlToJson(el) {
      const json = []
      el.childNodes.forEach(node => {
        if (node.nodeType === 3) {
          // 文本
          json.push({
            type: 'text',
            value: node.textContent
          })
        } else if (node.nodeType === 1) {
          const data = {}
          // id
          if (node.getAttribute('data-id')) {
            data.id = node.getAttribute('data-id')
          }
          if (node.classList.contains('hx-sender-tag')) {
            // 普通标签
            data.type = 'tag'
            data.key = node.getAttribute('data-key')
            data.value = node.getAttribute('data-value')
            if (node.querySelector('.hx-sender-tag-close')) {
              data.showClose = true
            }
          } else if (node.classList.contains('hx-sender-select-tag')) {
            // 选择标签
            data.type = 'select'
            data.key = node.getAttribute('data-key')
            data.value = node.getAttribute('data-value')
          } else if (node.classList.contains('hx-sender-input-tag')) {
            // 输入标签
            data.type = 'input'
            data.placeholder = node.getAttribute('placeholder')
            data.value = node.textContent
          } else if (node.classList.contains('hx-sender-html-tag')) {
            // html标签
            data.type = 'html'
            data.value = node.innerHTML
          } else if (node.classList.contains('hx-sender-custom-trigger-tag')) {
            // 自定义指令标签
            data.type = 'trigger'
            data.prefix = node.getAttribute('data-prefix')
            data.value = node.getAttribute('data-value')
            data.name = node.getAttribute('data-name')
          }
          // 加入内容数组
          json.push(data)
        }
      })
      return json
    },

    _getTagName(key, value) {
      const tagGroup = this.selectTagList.find(tag => tag.key === key)
      if (!tagGroup) return ''
      const option = (tagGroup.options || []).find(opt => opt.id === value)
      return option ? option.name : ''
    },

    _handleInput() {
      if (this.$refs.trigger) {
        this.$refs.trigger.handleInput()
      }
      this._fixInputTag()
      const { html, json } = this.getValue()
      this.$emit('change', {
        html,
        json
      })
    },

    _handlePaste(e) {
      e.preventDefault()
      const text = (e.clipboardData || window.clipboardData).getData('text')
      this.rangeHandle.insertTextTo(text)
    },

    _handleClick(e) {
      const target = e.target
      // 点击删除普通标签
      if (target.classList.contains('hx-sender-tag-close')) {
        const tag = getParentByClassName(
          target,
          'hx-sender-tag',
          this.$refs.editor
        )
        tag.remove()
        // 触发输入事件
        this._handleInput(e)
      } else {
        const el = getParentByClassName(
          target,
          'hx-sender-select-tag',
          this.$refs.editor
        )
        if (el) {
          // 点击了选择标签
          e.stopPropagation()
          const arrowIconEl = el.querySelector(
            '.hx-sender-select-tag-arrow-icon'
          )
          const id = el.getAttribute('data-id')
          // 如果当前有选择标签下拉列表显示
          if (this.showSelectDropdown) {
            if (arrowIconEl) {
              arrowIconEl.classList.remove('hx-sender-select-tag-arrow-rotate')
            }
            if (this.selectDropdownId === id) {
              this.showSelectDropdown = false
              return
            } else {
              this.showSelectDropdown = false
            }
          }
          this.$nextTick(() => {
            // 显示选择标签下拉列表
            this.selectDropdownId = id
            this.selectDropdownValue = el.getAttribute('data-value') || ''
            this.selectDropdownData = this.selectTagList.find(
              tag => tag.key === el.getAttribute('data-key')
            )
            // 计算el相当于浏览器窗口的位置
            const rect = el.getBoundingClientRect()
            this.selectDropdownPosition = {
              left: rect.left,
              top: rect.top,
              width: rect.width,
              height: rect.height
            }
            if (arrowIconEl) {
              arrowIconEl.classList.add('hx-sender-select-tag-arrow-rotate')
            }
            this.showSelectDropdown = true
          })
        }
      }
    },

    _resetSelectDropdown(id) {
      const arrowIconEl = document.querySelector(
        `.hx-sender-select-tag[data-id="${id}"] .hx-sender-select-tag-arrow-icon`
      )
      if (arrowIconEl) {
        arrowIconEl.classList.remove('hx-sender-select-tag-arrow-rotate')
      }
    },

    _onCloseSelectDropdown() {
      if (this.selectDropdownId) {
        this._resetSelectDropdown(this.selectDropdownId)
        this.selectDropdownId = ''
      }
      this.selectDropdownValue = ''
      this.selectDropdownPosition = null
      this.selectDropdownData = null
    },

    _handleSelectChange(id) {
      const el = document.querySelector(
        `.hx-sender-select-tag[data-id="${this.selectDropdownId}"]`
      )
      if (el) {
        el.setAttribute('data-value', id)
        const tagName = this._getTagName(el.getAttribute('data-key'), id)
        const nameEl = el.querySelector('.hx-sender-select-tag-name')
        if (nameEl) {
          nameEl.textContent = tagName
        }
        this._handleInput()
      }
    },

    _handleBodyClick() {
      if (this.showSelectDropdown) {
        this.showSelectDropdown = false
      }
      if (this.$refs.trigger) {
        this.$refs.trigger.hide()
      }
    },

    _handleKeydown(e) {
      const { key, shiftKey } = e
      let isHandle = false
      if (typeof this.onkeydown === 'function') {
        isHandle = this.onkeydown(e)
      }
      if (isHandle) return
      if (this.$refs.trigger) {
        isHandle = this.$refs.trigger.handleKeydown(e)
      }
      if (isHandle) return
      // 回车发送
      if (key === 'Enter' && !shiftKey) {
        e.preventDefault()
        this.$emit('submit')
        return
      }
      // 处理退格键
      if (key === 'Backspace') {
        if (this._handleBackspaceKey(e)) return
      }
    },

    // 处理退格键删除逻辑
    _handleBackspaceKey(e) {
      const editor = this.$refs.editor
      if (!editor) return false
      const selection = window.getSelection()
      if (!selection || selection.rangeCount === 0) return false
      const { focusOffset, anchorNode } = selection
      if (!anchorNode || !editor.contains(anchorNode)) {
        return false
      }
      if (focusOffset === 1 && anchorNode.nodeType === Node.TEXT_NODE) {
        const parentElement = anchorNode.parentNode
        const isInputTagEl = parentElement.classList.contains(
          'hx-sender-input-tag'
        )
        // 删除输入标签中的最后一个字符时禁止浏览器删除该元素
        if (isInputTagEl && anchorNode.textContent?.length === 1) {
          e.preventDefault()
          anchorNode.parentNode.innerHTML = ''
          return true
        }
      }
      // 获取当前光标前的元素
      // const range = selection.getRangeAt(0)
      // if (focusOffset === 1 && anchorNode.nodeType === Node.TEXT_NODE) {
      //   const prevEl = anchorNode.previousElementSibling
      //   if (
      //     prevEl &&
      //     prevEl.nodeType === Node.ELEMENT_NODE &&
      //     prevEl.classList.contains('hx-sender-no-width')
      //   ) {
      //     // 光标往前移一位
      //     const prevEl2 = prevEl.previousElementSibling
      //     if (
      //       prevEl2 &&
      //       prevEl2.nodeType === Node.ELEMENT_NODE &&
      //       prevEl2.classList.contains('hx-sender-input-tag')
      //     ) {
      //       const deleteRange = document.createRange()
      //       deleteRange.setStart(range.endContainer, range.endOffset - 1)
      //       deleteRange.setEnd(range.endContainer, range.endOffset)
      //       deleteRange.deleteContents()
      //       focusEl(prevEl2)
      //       e.preventDefault()
      //       return true
      //     }
      //   }
      // }
      return false
    },

    _fixInputTag() {
      // 如果hx-sender-no-width元素前面没有hx-sender-input-tag元素，则删除该元素
      Array.from(
        this.$refs.editor.querySelectorAll('.hx-sender-no-width')
      ).forEach(el => {
        const prevEl = el.previousElementSibling
        if (!prevEl || !prevEl.classList.contains('hx-sender-input-tag')) {
          el.remove()
        }
      })
      // 确保每个hx-sender-input-tag后面都有一个hx-sender-no-width元素
      Array.from(
        this.$refs.editor.querySelectorAll('.hx-sender-input-tag')
      ).forEach(el => {
        // 获取下一个相邻的元素
        const nextEl = el.nextElementSibling
        if (!nextEl || !nextEl.classList.contains('hx-sender-no-width')) {
          // 插入hx-sender-no-width元素
          const noWidthEl = document.createElement('span')
          noWidthEl.setAttribute('contenteditable', 'false')
          noWidthEl.classList.add('hx-sender-no-width')
          noWidthEl.innerHTML = '&nbsp;'
          el.after(noWidthEl)
        }
      })
    },

    _getEditorEl() {
      return this.$refs.editor
    },

    _handleBlur() {
      const sel = window.getSelection()
      this.rangeHandle.updateLastRange(
        sel.rangeCount > 0 ? sel.getRangeAt(0).cloneRange() : null
      )
    }
  }
}
</script>

<style lang="less" scoped>
.hx-sender-container {
  overflow: hidden;
  margin: 0;
  padding: 0;
  box-shadow: 0px 4px 25px rgba(119, 167, 255, 0.12);
  border: 1px solid #ddd;
  border-radius: 10px;

  &:after {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
    transition: border-color 300ms;
    border-radius: inherit;
    border-style: inherit;
    border-color: inherit;
    border-width: 1px;
  }

  &:focus-within {
    box-shadow:
      0px 12px 32px 4px rgba(0, 0, 0, 0.04),
      0px 8px 20px rgba(0, 0, 0, 0.08);
    border-color: #6e4bfa;

    &::after {
      border-width: 2px;
    }
  }

  * {
    margin: 0;
    padding: 0;
  }

  .slide-enter-active,
  .slide-leave-active {
    height: calc-size(max-content, size);
    opacity: 1;
    transition:
      height 300ms,
      opacity 300ms,
      border 300ms;
    overflow: hidden;
  }
  .slide-enter,
  .slide-leave-to {
    height: 0;
    opacity: 0 !important;
  }

  // 头部
  .hx-sender-header {
    display: flex;
    flex-direction: column;
    width: 100%;

    .hx-sender-header-container {
      border-bottom-width: 1px;
      border-bottom-style: solid;
      border-bottom-color: #ddd;
    }
  }

  // 中间
  .hx-sender-content {
    display: flex;
    width: 100%;
    box-sizing: border-box;
    align-items: flex-end;

    .hx-sender-prefix {
      flex: none;
    }

    .hx-sender-input-wrap {
      position: relative;
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      flex-direction: column;
      align-self: center;
      box-sizing: border-box;

      /deep/ .hx-sender-input {
        flex-shrink: 0;
        width: 100%;
        outline: none;
        line-height: 1.5;
        font-size: 16px;
        color: #333;
        resize: none;
        word-wrap: break-word;
        white-space: pre-wrap;
        user-select: text;
        overflow-x: hidden;
        overflow-y: scroll;
        cursor: text;
        text-align: left;
        position: relative;
        scrollbar-width: thin;
        scrollbar-color: rgba(183, 185, 193, 0.6) transparent;
        padding: 6px;

        &:empty {
          &::before {
            content: attr(placeholder);
            color: #9195a3;
          }
        }

        &.disabled {
          cursor: not-allowed;
        }

        .hx-sender-tag,
        .hx-sender-select-tag,
        .hx-sender-custom-trigger-tag {
          padding: 0 6px;
          border-radius: 6px;
          color: #6e4bfa;
          background-color: rgba(110, 75, 250, 0.09);
          display: inline-flex;
          cursor: pointer;
          align-items: center;
          height: 24px;
          display: inline-flex;
          position: relative;
          line-height: 24px;
          margin-inline: 4px;
        }

        .hx-sender-tag {
          .hx-sender-tag-name {
          }

          .hx-sender-tag-close {
            display: inline-block;
          }
        }

        .hx-sender-select-tag {
          .hx-sender-select-tag-name {
          }

          .hx-sender-select-tag-arrow-icon {
            transform: rotate(0deg);
            transition: transform 0.3s ease-in-out;

            &.hx-sender-select-tag-arrow-rotate {
              transform: rotate(180deg);
            }
          }
        }

        .hx-sender-input-tag {
          padding: 0 6px;
          border-radius: 6px;
          max-width: calc(100% - 27px);
          font-weight: 500;
          color: #6e4bfa;
          background-color: rgba(110, 75, 250, 0.09);
          line-height: 24px;
          display: inline-block;
          min-width: 1px;
          min-height: 1em;
          margin-inline: 4px;

          &:empty {
            &::after {
              display: inline-block;
              height: inherit;
              content: attr(placeholder);
              color: rgba(78, 110, 242, 0.4);
            }
          }
        }

        .hx-sender-no-width {
          user-select: none;
          width: 3px;
          display: inline-block;
        }
      }
    }

    .hx-sender-action-list {
      .hx-sender-suffix {
      }

      .hx-sender-action-list-presets {
      }
    }
  }

  // 底部
  .hx-sender-footer {
    border-top-width: 1px;
    border-top-style: solid;
    border-top-color: #ddd;
  }
}
</style>
