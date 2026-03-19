一个基于Vue2的AI输入框组件。

# 本地开发

```bash
git clone https://github.com/wanglin2/vue2_ai_input.git
cd package
npm i
npm link
cd ..
cd demo
npm i
npm link @wanglin1994/ai-input
npm run serve
```

# 安装

```bash
npm i @wanglin1994/ai-input
```

> 注意：源码未打包直接发布，有需要请自行配置打包文件。

# 引入

```js
import AiInput from '@wanglin1994/ai-input'
Vue.use(AiInput)
```

```vue
<template>
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
</template>
```

完整示例代码请参考：[demo](./demo/src/AiTest.vue)。

# 基础用法

# API

## 属性

| 参数  | 说明                               | 类型   | 可选值 | 默认值 |
| ----- | ---------------------------------- | ------ | ------ | ------ |
| placeholder | 输入框的提示语文本 | String | —      | Enter 发送，Shift + Enter 换行 |
| autoFocus | 是否在组件挂载后自动聚焦到输入框 | Boolean | —      | false |
| variant | 输入框的变体类型，default为水平布局，updown为垂直布局 | String | —      | default |
| disabled | 是否禁用输入框 | Boolean | —      | false |
| minHeight | 输入框的最小高度 | Number | —      | 100 |
| maxHeight | 输入框的最大高度 | Number | —      | 300 |
| onkeydown | 键盘按下事件触发时回调 | Function | —      | null |
| selectTagList | 可选择的标签列表 | Array | —      | [] |
| triggerList | 触发器列表 | Array | —      | [] |

### selectTagList结构

```js
[
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
]
```

### triggerList结构

```js
[
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
]
```


## 事件

| 事件  | 说明                               | 回调函数参数 |
| ----- | ---------------------------------- | ------ |
| submit | 提交内容时触发 |  |
| change | 输入内容发生变化时触发 | data：{  html, json } |

## 方法

| 方法名  | 说明                               | 参数 |
| ----- | ---------------------------------- | ------ |
| clear | 清空输入框内容 |  |
| setValue | 清空并设置内容 | value（字符串或内容数组） |
| focus | 将光标聚焦到输入框，头部、尾部、指定输入标签 |  |
| blur | 将光标移除焦点 |  |
| getValue | 获取当前输入框的内容 | pos（可选值：start、end、标签id） |
| selectAll | 全选输入框内容 |  |
| insertValue | 在光标处插入内容 | value（字符串或内容数组） |
| insertTrigger | 插入自定义弹窗的触发配置列表 | triggerList（触发器列表） |

### 内容数组结构

```js
[
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
]
```

## 插槽

| 方法名  | 说明                               |
| ----- | ---------------------------------- |
| #header | 自定义输入框的头部内容 |
| #prefix	 | 自定义输入框的前缀内容 |
| #postfix	 | 自定义输入框的后缀内容 |
| #action-list	 | 自定义输入框的操作列表内容 |
| #footer	 | 自定义输入框的底部内容 |

# 许可证

MIT