<template>
  <div class="aiTest">
    <div class="chatListBox">
      <div class="chatList">
        <div class="chatItem" v-for="(item, index) in chatList" :key="index">
          {{ item }}
        </div>
      </div>
    </div>
    <div class="actionBox">
      <el-button size="mini" @click="handleClick('clear')">清空</el-button>
      <el-button size="mini" @click="handleClick('write')">AI写作</el-button>
      <el-button size="mini" @click="handleClick('img')">AI生图</el-button>
      <el-button size="mini" @click="handleClick('html')">html</el-button>
      <el-button size="mini" @click="handleClick('focusTo')"
        >聚焦到帮我画输入标签</el-button
      >
      <el-button size="mini" @click="handleClick('focusToStart')"
        >聚焦到头部</el-button
      >
      <el-button size="mini" @click="handleClick('focusToEnd')"
        >聚焦到尾部</el-button
      >
      <el-button size="mini" @click="handleClick('insertHtml')"
        >在光标处插入结构化数据</el-button
      >
      <el-button size="mini" @click="handleClick('insertText')"
        >在光标处插入文本</el-button
      >
      <el-button size="mini" @click="handleClick('selectAll')">全选</el-button>
      <el-button size="mini" @click="handleClick('blur')">失焦</el-button>
      <el-button size="mini" @click="handleClick('getData')"
        >获取数据</el-button
      >
      <el-button size="mini" @click="showHeaderFlag = true">打开头部</el-button>
    </div>
    <div class="chatBox">
      <Sender
        ref="sender"
        :selectTagList="selectTagList"
        :triggerList="triggerList"
        :onkeydown="onkeydown"
        @change="handleChange"
        @submit="handleSubmit"
      >
        <template v-if="showHeaderFlag" #header>
          <div class="header-self-wrap">
            <div class="header-self-title">
              <div class="header-left">💯 欢迎使用 Ai-input</div>
              <div class="header-right">
                <el-button @click.stop="showHeaderFlag = false">
                  <el-icon><CircleClose /></el-icon>
                  <span>关闭头部</span>
                </el-button>
              </div>
            </div>
            <div class="header-self-content">🦜 自定义头部内容</div>
          </div>
        </template>
        <template #prefix>
          <div>自定义前缀内容</div>
        </template>
        <template #suffix>
          <div>自定义后缀内容</div>
        </template>
        <template #footer>
          <div>自定义脚部内容</div>
        </template>
      </Sender>
      <div class="triggerOptions" v-if="showTriggerSelect">
        <div
          class="triggerItem"
          v-for="(item, index) in triggerOptions"
          :key="item"
          :class="{ selected: activeIndex === index }"
          @click="onClickTrigger($event, item)"
        >
          {{ item }}
        </div>
      </div>
    </div>
    <div class="valueShowBox" v-if="htmlContent || jsonContent">
      <textarea v-model="htmlContent" rows="10" cols="50"></textarea>
      <textarea v-model="jsonContent" rows="10" cols="50"></textarea>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      lastContent: [],
      content: [
        {
          type: 'tag',
          key: 'skill',
          value: '1',
          showClose: true
        },
        {
          type: 'text',
          value: '帮我写一篇关于'
        },
        {
          type: 'select',
          key: 'subject',
          value: '1'
        },
        {
          type: 'text',
          value: '和'
        },
        {
          type: 'select',
          key: 'subject',
          value: '3'
        },
        {
          type: 'text',
          value: '的作文，字数不少于'
        },
        {
          id: 'wordCountTag',
          type: 'input',
          placeholder: '[填写内容]',
          value: '300'
        },
        {
          type: 'text',
          value: '字。'
        },
        {
          type: 'select',
          key: 'largeData',
          value: 1
        }
      ],
      content2: [
        {
          type: 'tag',
          key: 'skill',
          value: '2',
          showClose: true
        },
        {
          type: 'text',
          value: '帮我画'
        },
        {
          id: 'drawContentTag',
          type: 'input',
          placeholder: '[填写内容]',
          value: ''
        },
        {
          type: 'text',
          value: '。'
        }
      ],
      selectTagList: [
        {
          title: '技能类型',
          key: 'skill',
          options: [
            { id: '1', name: 'AI写作' },
            { id: '2', name: 'AI生图' },
            { id: '3', name: 'AI编程' }
          ]
        },
        {
          title: '主题类型',
          key: 'subject',
          options: [
            { id: '1', name: '爱情' },
            { id: '2', name: '亲情' },
            { id: '3', name: '友情' }
          ]
        },
        {
          title: '大量数据',
          key: 'largeData',
          options: new Array(100).fill(0).map((item, index) => ({
            id: index + 1,
            name: `数据${index + 1}`
          }))
        }
      ],
      triggerList: [
        {
          title: '选择弹框标题',
          prefix: '@',
          tagList: [
            { id: '1', name: '用户1', icon: '' },
            { id: '2', name: '用户2', icon: '' }
          ]
        },
        {
          title: '大数据',
          prefix: '$',
          tagList: new Array(100).fill(0).map((item, index) => ({
            id: index + 1,
            name: `数据${index + 1}`
          }))
        },
        {
          title: '选择弹框标题',
          prefix: '#',
          // 异步请求，searchVal为#后面输入的内容
          getTagList: searchVal => {
            return new Promise((resolve, reject) => {
              setTimeout(() => {
                if (Math.random() >= 0.2) {
                  resolve(
                    [
                      { id: '1', name: '用户1', icon: '' },
                      { id: '2', name: '用户2', icon: '' },
                      { id: '3', name: '用户3', icon: '' }
                    ].filter(item => item.name.includes(searchVal))
                  )
                } else {
                  reject()
                }
              }, 2000)
            })
          }
        },
        {
          title: '选择弹框标题',
          prefix: '/',
          // 自定义处理函数，不显示内置弹框
          handle: (action, { searchText, getPosition } = {}) => {
            if (action === 'hide') {
              this.hideTriggerList()
            } else if (action === 'show') {
              this.showTriggerSelect = true
              this.activeIndex = 0
              this.triggerOptions = this.allTriggerOptions.filter(item =>
                item.includes(searchText)
              )
            }
          }
        }
      ],
      jsonContent: '',
      htmlContent: '',
      chatList: [],
      isSetValue: false,
      showTriggerSelect: false,
      allTriggerOptions: [
        '/翻译',
        '/生成正则',
        '/写诗',
        '/写代码',
        '/总结',
        '/改写',
        '/续写'
      ],
      triggerOptions: [],
      activeIndex: -1,
      showHeaderFlag: true
    }
  },
  created() {
    document.title = 'ai-input'
  },
  methods: {
    handleChange({ html, json }) {
      console.log(json)
      const _lastContent = this.lastContent
      // 保存当前内容为上一次内容
      this.lastContent = JSON.parse(JSON.stringify(json))
      // 如果删除了技能标签，那么清空内容
      if (
        !this.isSetValue &&
        _lastContent.find(
          item => item.type === 'tag' && item.key === 'skill'
        ) &&
        json.length > 0 &&
        !json.find(item => item.type === 'tag' && item.key === 'skill')
      ) {
        this.$refs.sender.clear()
      }
      this.isSetValue = false
    },

    handleClick(type) {
      if (type === 'write') {
        this.isSetValue = true
        this.$refs.sender.setValue(this.content, false)
        this.$nextTick(() => {
          this.$refs.sender.focus('wordCountTag')
        })
      } else if (type === 'img') {
        this.isSetValue = true
        this.$refs.sender.setValue(this.content2)
      } else if (type === 'insertHtml') {
        this.$refs.sender.insertValue([
          {
            type: 'text',
            value: '我是动态插入的内容'
          },
          {
            type: 'select',
            key: 'subject',
            value: '3'
          },
          {
            type: 'text',
            value: '哈哈哈'
          }
        ])
      } else if (type === 'insertText') {
        this.$refs.sender.insertValue('【我是动态插入的文本】')
      } else if (type === 'selectAll') {
        this.$refs.sender.selectAll()
      } else if (type === 'focusTo') {
        this.$refs.sender.focus('drawContentTag')
      } else if (type === 'focusToStart') {
        this.$refs.sender.focus('start')
      } else if (type === 'focusToEnd') {
        this.$refs.sender.focus('end')
      } else if (type === 'blur') {
        this.$refs.sender.blur()
      } else if (type === 'clear') {
        this.$refs.sender.clear()
      } else if (type === 'getData') {
        const { html, json } = this.$refs.sender.getValue()
        this.htmlContent = html
        this.jsonContent = JSON.stringify(json, null, 2)
      } else if (type === 'html') {
        this.isSetValue = true
        this.$refs.sender.setValue([
          {
            type: 'text',
            value: '猜你想搜索“'
          },
          {
            type: 'html',
            value: '<span style="color: #6e4bfa;">什么时候放假</span>'
          },
          {
            type: 'text',
            value: '”。'
          }
        ])
      }
    },

    handleSubmit() {
      const { json } = this.$refs.sender.getValue()
      this.chatList.push(this.handleJson(json))
      this.$refs.sender.clear()
    },

    handleJson(json) {
      let str = ''
      json.forEach(item => {
        // 去除技能标签
        if (item.type === 'tag' && item.key === 'skill') {
          return
        }
        if (item.type === 'text' || item.type === 'input') {
          str += item.value
        } else if (item.type === 'tag' || item.type === 'select') {
          str += this.$refs.sender._getTagName(item.key, item.value)
        }
      })
      return str
    },

    onkeydown(e) {
      if (!this.showTriggerSelect) return false
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault()
          this.moveTriggerSelection(-1)
          return true
        case 'ArrowDown':
          e.preventDefault()
          this.moveTriggerSelection(1)
          return true
        case 'Enter':
          e.preventDefault()
          this.selectTrigger()
          return true
        case 'Escape':
          e.preventDefault()
          this.hideTriggerList()
          return true
      }
      return false
    },

    onClickTrigger(e, item) {
      e.preventDefault()
      this.handleTriggerSelect(item)
    },

    hideTriggerList() {
      this.showTriggerSelect = false
      this.triggerOptions = []
      this.activeIndex = -1
    },

    moveTriggerSelection(direction) {
      this.activeIndex += direction
      if (this.activeIndex < 0) {
        this.activeIndex = this.triggerOptions.length - 1
      } else if (this.activeIndex >= this.triggerOptions.length) {
        this.activeIndex = 0
      }
    },

    selectTrigger() {
      if (
        this.activeIndex >= 0 &&
        this.activeIndex < this.triggerOptions.length
      ) {
        this.handleTriggerSelect(this.triggerOptions[this.activeIndex])
      }
    },

    handleTriggerSelect(item) {
      this.$refs.sender.insertTrigger({
        id: item,
        name: item.slice(1)
      })
    }
  }
}
</script>

<style lang="less">
html,
body,
#app {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
}
</style>
<style lang="less" scoped>
.aiTest {
  width: 800px;
  height: 100%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 20px 0;

  .chatListBox {
    width: 100%;
    height: 100%;
    overflow-y: auto;

    .chatList {
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: flex-end;

      .chatItem {
        width: fit-content;
        margin-bottom: 20px;
        background-color: #f5f6f9;
        padding: 12px;
        border-radius: 8px;
      }
    }
  }

  .actionBox {
    flex-shrink: 0;
    margin-bottom: 12px;
  }

  .chatBox {
    flex-shrink: 0;
    position: relative;

    .triggerOptions {
      position: absolute;
      bottom: 100%;
      left: 0;
      width: 100%;
      max-height: 150px;
      overflow-y: auto;
      background-color: #fff;
      border: 1px solid #ddd;
      border-radius: 4px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
      z-index: 1000;

      .triggerItem {
        padding: 8px 12px;
        cursor: pointer;

        &:hover {
          background-color: #f5f5f5;
        }

        &.selected {
          color: #6e4bfa;
          background-color: rgba(110, 75, 250, 0.09);
        }
      }
    }
  }

  .valueShowBox {
    position: absolute;
    top: 0;
    left: 0;
    width: 400px;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.05);
    padding: 20px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    overflow: hidden;

    textarea {
      width: 100%;
      height: 50%;
    }
  }
}
</style>
