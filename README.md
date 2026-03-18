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

# 基础用法

# API

## 属性

| 参数  | 说明                               | 类型   | 可选值 | 默认值 |
| ----- | ---------------------------------- | ------ | ------ | ------ |
| initTime | 初始时间，中点所在的时间，默认为当天0点。可以传递数字类型的时间戳或字符串类型的时间，如：2020-12-19 18:30:00 | Number/String | —      |  |


## 事件

| 事件  | 说明                               | 回调函数参数 |
| ----- | ---------------------------------- | ------ |
| timeChange | 当前时间切换事件 | currentTime（当前时间，时间戳格式） |

## 方法

| 方法名  | 说明                               | 参数 |
| ----- | ---------------------------------- | ------ |
| updateWatchTime | 手动更新观察的时间位置，比如页面滚动后时间轴的整体位置变化了需要调用，如果没有显示自定义元素时无需调用 |  |
