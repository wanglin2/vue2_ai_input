<template>
  <div
    class="hx-sender-trigger"
    v-if="isSuggestionVisible"
    :style="{
      left: left + 'px',
      top: top + 'px'
    }"
    ref="trigger"
    @click.stop
    @mousedown.stop
  >
    <div class="hx-sender-trigger-title">{{ mentionTrigger.title }}</div>
    <div class="hx-sender-trigger-list">
      <div
        v-for="(item, index) in list"
        :key="item.id"
        class="hx-sender-trigger-item"
        :class="{ selected: activeIndex === index }"
        @mousedown="_onClick($event, item)"
      >
        {{ item.name }}
      </div>
    </div>
    <div class="hx-sender-trigger-status-box">
      <span v-if="isLoading" class="hx-sender-trigger-status-loading">
        <loading class="hx-sender-trigger-status-loading-icon" />
        加载中
      </span>
      <span v-else-if="isError" class="hx-sender-trigger-status-error">
        加载失败
      </span>
    </div>
  </div>
</template>

<script>
import Loading from './Loading.vue'

export default {
  components: {
    Loading
  },
  props: {
    rangeHandle: {
      type: Object
    },
    triggerList: {
      type: Array,
      default: () => []
    },
    getEditorEl: {
      type: Function,
      default: () => null
    }
  },
  data() {
    return {
      isSuggestionVisible: false,
      mentionStartPos: -1,
      mentionTrigger: null,
      activeIndex: -1,
      left: -99999,
      top: -99999,
      margin: 5,
      list: [],
      isLoading: false,
      isError: false
    }
  },
  methods: {
    handleInput() {
      if (this.triggerList.length <= 0) return
      // 获取光标前的文本
      const textBeforeCursor = this.rangeHandle.getTextBeforeCursor()
      // 检查是否输入了指定符号
      const triggerItem = this.triggerList.find(item => {
        return textBeforeCursor.lastIndexOf(item.prefix) !== -1
      })
      if (!triggerItem) {
        this._hideSuggestion()
        return
      }
      // 保存触发项相关数据
      this.mentionTrigger = triggerItem
      const atIndex = textBeforeCursor.lastIndexOf(triggerItem.prefix)
      if (atIndex !== -1) {
        const searchText = textBeforeCursor.substring(atIndex + 1)
        this.mentionStartPos = atIndex
        this._showSuggestions(searchText)
        // 检查@是否是在开头
        //   if (atIndex === 0) {}
      }
    },

    async _showSuggestions(searchText) {
      const hasCustomHandle = typeof this.mentionTrigger.handle === 'function'
      if (hasCustomHandle) {
        this.mentionTrigger.handle('show', {
          searchText,
          getPosition: () => this._getPosition()
        })
        return
      }
      // 复位列表数据
      this.isError = false
      this.isLoading = false
      this.list = []
      this.activeIndex = -1
      // 加载列表DOM
      this.isSuggestionVisible = true
      // 如果是固定列表，直接设置
      if (this.mentionTrigger.tagList) {
        this.list = this.mentionTrigger.tagList.filter(item =>
          item.name.includes(searchText)
        )
      } else if (this.mentionTrigger.getTagList) {
        // 如果是动态请求，则显示loading，等待数据返回
        try {
          this.isError = false
          this.isLoading = true
          this.$nextTick(() => {
            this._updateSuggestionPosition()
          })
          const data = await this.mentionTrigger.getTagList(searchText)
          if (!this.isSuggestionVisible) {
            this._hideSuggestion()
            return
          }
          this.list = data
          this.isLoading = false
        } catch (error) {
          this.isLoading = false
          this.isError = true
        }
      }
      if (this.isError) {
        this.$nextTick(() => {
          this._updateSuggestionPosition()
        })
        return
      }
      if (this.list.length > 0) {
        this.activeIndex = 0
      } else {
        this._hideSuggestion()
        return
      }
      this.$nextTick(() => {
        this._updateSuggestionPosition()
      })
    },

    hide() {
      this._hideSuggestion()
    },

    _hideSuggestion() {
      if (
        this.mentionTrigger &&
        typeof this.mentionTrigger.handle === 'function'
      ) {
        this.mentionTrigger.handle('hide')
        this.mentionTrigger = null
        this.mentionStartPos = -1
        return
      }
      if (!this.isSuggestionVisible) {
        return
      }
      this.isSuggestionVisible = false
      this.list = []
      this.activeIndex = -1
      this.mentionTrigger = null
      this.mentionStartPos = -1
      this.isError = false
      this.isLoading = false
      this.left = -99999
      this.top = -99999
    },

    _updateSuggestionPosition() {
      const el = this.$refs.trigger
      if (!el) return
      const width = el.offsetWidth
      const height = el.offsetHeight
      const windowWidth = window.innerWidth
      const windowHeight = window.innerHeight
      document.body.appendChild(el)
      const position = this._getPosition()
      if (position.left + width > windowWidth) {
        this.left = windowWidth - width
      } else {
        this.left = position.left
      }
      const _top = position.top - this.margin - height
      if (_top <= 0) {
        this.top = position.top + position.height + this.margin
      } else {
        this.top = _top
      }
    },

    _getPosition() {
      const range = this.rangeHandle.getSel().range
      const rect = range.getBoundingClientRect()
      return rect
    },

    _onClick(e, item) {
      e.preventDefault()
      this._handleSelect(item)
    },

    insert(data) {
      this._handleSelect(data)
    },

    _handleSelect(item) {
      const prefix = this.mentionTrigger.prefix
      this._hideSuggestion()
      const textBeforeCursor = this.rangeHandle.getTextBeforeCursor()
      const atIndex = textBeforeCursor.lastIndexOf(prefix)
      const searchText = textBeforeCursor.substring(atIndex + 1)
      // 删除当前光标前的搜索文本和匹配字符
      // 获取光标位置
      this.rangeHandle.deleteText(searchText.length + 1)
      // 插入标签
      this.rangeHandle.insertHtmlTo(
        `<span class="hx-sender-custom-trigger-tag" data-prefix="${prefix}" data-value="${item.id}" data-name="${item.name}" contenteditable="false">${prefix}${item.name}</span>`
      )
      this.$emit('change')
    },

    handleKeydown(e) {
      if (!this.isSuggestionVisible) return false
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault()
          this._moveSelection(-1)
          return true
        case 'ArrowDown':
          e.preventDefault()
          this._moveSelection(1)
          return true
        case 'Enter':
          e.preventDefault()
          this._selectActiveItem()
          return true
        case 'Escape':
          e.preventDefault()
          this._hideSuggestion()
          return true
      }
      return false
    },

    _moveSelection(direction) {
      this.activeIndex += direction
      if (this.activeIndex < 0) {
        this.activeIndex = this.list.length - 1
      } else if (this.activeIndex >= this.list.length) {
        this.activeIndex = 0
      }
      // 更新滚动
      this.$refs.trigger
        .querySelector('.hx-sender-trigger-list')
        .children[this.activeIndex].scrollIntoView({
          block: 'nearest'
        })
    },

    _selectActiveItem() {
      if (this.activeIndex >= 0 && this.activeIndex < this.list.length) {
        this._handleSelect(this.list[this.activeIndex])
      }
    }
  }
}
</script>

<style lang="less" scoped>
.hx-sender-trigger {
  position: fixed;
  z-index: 1000;
  min-width: 70px;
  overflow: hidden;
  padding: 4px;
  list-style-type: none;
  background-color: #fff;
  background-clip: padding-box;
  border-radius: 8px;
  outline: none;
  box-shadow:
    0 6px 16px 0 rgba(0, 0, 0, 0.08),
    0 3px 6px -4px rgba(0, 0, 0, 0.12),
    0 9px 28px 8px rgba(0, 0, 0, 0.05);

  .hx-sender-trigger-title {
    font-weight: bold;
    font-size: 14px;
    padding: 8px 12px;
  }

  .hx-sender-trigger-list {
    max-height: 200px;
    overflow-y: auto;

    .hx-sender-trigger-item {
      display: flex;
      margin: 0;
      padding: 5px 12px;
      color: rgba(0, 0, 0, 0.88);
      font-weight: normal;
      font-size: 14px;
      line-height: 1.5;
      cursor: pointer;
      transition: all 0.2s;
      border-radius: 4px;

      &:hover {
        background-color: rgba(0, 0, 0, 0.04);
      }

      &.selected {
        color: #6e4bfa;
        background-color: rgba(110, 75, 250, 0.09);
      }
    }
  }

  .hx-sender-trigger-status-box {
    .hx-sender-trigger-status-loading,
    .hx-sender-trigger-status-error {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 8px 12px;
      font-size: 14px;
      line-height: 1.5;
      color: rgba(0, 0, 0, 0.88);
    }

    .hx-sender-trigger-status-loading {
      .hx-sender-trigger-status-loading-icon {
        width: 20px;
        margin-right: 10px;
      }
    }

    .hx-sender-trigger-status-error {
    }
  }
}
</style>
