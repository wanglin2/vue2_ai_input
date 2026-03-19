# Sender

> 时间有限，以下结论只在chrome浏览器下测试得出。

# 部分实现细节方案对比

## 一.textarea vs div

|  | textarea | div |
| --- | --- | --- |
| 实现 | ✅ 简单 | ⚠️复杂 |
| 功能 | ⚠️ 单一（纯文本） | ✅ 丰富（文本、输入标签、选择标签、html等） |
| 稳定性 | ✅ 高 | ⚠️ 低 |
| 浏览器兼容性 | ✅ 无 | ⚠️ 非常多（粘贴行为、光标移动、空行处理等） |
| 性能 | ✅ 好 | ⚠️ 差 |
| 易用性 | ✅ 简单 | ⚠️ 复杂 |
| 数据处理 | ✅ 直接 | ⚠️ 需解析 |
| 安全性 | ✅ 高 | ⚠️ 需注意 |

### 两者相结合

很多AI产品选择`textarea + div`的方式：默认使用`textarea`输入框，当点击`技能`时自动转换为富文本输入框并插入模板，当富文本输入框中的`技能`标签被删除时自动清空输入框并转换回`textarea`输入框。

### 结论

组件库选择富文本模式。在组件文档增加一个最佳实践部分，并提供Demo供参考。

## 二.输入框富文本结构

-   结构1：输入文本时不额外处理

```html
<div contenteditable="true">
    文本文本
    <span contenteditable="false" class="input-custom-no-width">&nbsp;</span>
    <span class="input-tag" contenteditable="true"></span>
    <span contenteditable="false" class="input-custom-no-width">&nbsp;</span>
    文本文本
    <span class="select-tag" contenteditable="false">选择标签</span>
</div>
```

优点：输入文本时不需要额外的处理逻辑。

缺点：在Chrome外的浏览器上可能会存在兼容性问题。

-   结构2：输入的文本也通过标签包裹

```html
<div contenteditable="true">
    <span><span>文本文本</span></span>
    <span contenteditable="false" class="input-custom-no-width">&nbsp;</span>
    <span class="input-tag" contenteditable="true"></span>
    <span contenteditable="false" class="input-custom-no-width">&nbsp;</span>
    <span><span>文本文本</span></span>
    <span class="select-tag" contenteditable="false">选择标签</span>
</div>
```

优点：在各个浏览器上的效果比较一致，符合预期。

缺点：输入文本时需要手动添加span标签进行包裹（比如监听`input`事件或者使用`MutationObserver`监听进行替换元素，或其他未知方式），输入长文本时可能存在性能问题。

### 结论

如果对浏览器兼容性要求不高，优先选择结构1，实现简单，输入文本时不需要额外的处理逻辑，避免带来隐性bug和性能问题，也可以保持富文本内容结构简洁清晰。

长期来说最好还是改为结构2。

## 三.input-custom-no-width元素的处理

这个标签主要用于解决输入标签和文本之间的光标插入问题，没有这个标签，光标无法移动到输入标签和文本之间，当输入标签后面没有文本时，光标也无法移出输入标签，相当于没有办法在输入标签后面继续输入文本。

-   方式1

只在插入输入标签的同时插入该标签，后续编辑时即使按删除键删除了该标签，也不会自动补充。

优点：实现简单，只需在设置内容时添加该标签即可，后续不用再处理。

缺点：当用户删除掉该标签后，且输入标签后面无其他内容时，光标无法再移动到输入标签的后面，也就是无法在输入标签后面再输入文本。

-   方式2

在插入输入标签的同时插入该标签，同时监听`input`事件或者使用`MutationObserver`监听，然后自动补充。

优点：不会出现光标无法移动到输入标签后面的问题。

缺点：实现复杂，且存在浏览器兼容性问题。

### 结论

选择方式2，至少在Chrome下可以正常运行。

## 四.placeholder的实现

输入框和输入标签都支持`placeholder`，但是不像`input`元素，`div`元素设置`placeholder`属性不会生效，所以需要其他方法来实现这个功能。

-   方式1：DOM结构如下，需CSS、JS配合实现

```html
<span contenteditable="false">
    <span contenteditable="true"></span>
    <span>占位</span>
</span>
```

-   方式2：DOM结构如下，需CSS、JS配合实现

```html
<span contenteditable="true">
    <span contenteditable="false">占位</span>
</span>
```

-   方式3：DOM结构如下，纯CSS实现

```html
<span contenteditable="true" placeholder="占位"></span >
```

```css
:empty::after {
  content: attr(placeholder);
  color: rgba(78, 110, 242, 0.4);
}
```

### 结论

方式1和方式2只是结构不一样，但是都需要配合`js`控制占位元素的添加和删除，比较麻烦，方式3是纯css方式，实现简单且效果好，所以毫无疑问选3。

## 五.input vs MutationObserver

前面有些地方都需要修改富文本编辑器的DOM结构，监听`input`事件和使用`MutationObserver`监听都可以触发操作。

|  | input | MutationObserver |
| --- | --- | --- |
| 实现 | ✅ 简单 | ⚠️复杂（容易造成无限循环） |
| 性能 | ✅ 好（只在用户实际输入时触发） | ⚠️ 差（会监听所有DOM变化） |

### 结论

都可以实现需求的情况下优先选择监听`input`事件来发对富文本内容的检查和处理。

# 基本实现原理

-   渲染富文本内容

遍历传入的格式化数据，拼接为指定格式的`html`字符串，设置到编辑器元素内。

-   获取格式化数据

遍历编辑器元素的子节点列表，根据节点类型、特定类名、节点属性保存的数据来解析出格式化数据。

-   监听编辑器元素的`input`事件

抛出内容修改事件。

检查并修复富文本结构，比如给输入标签前后传入`span`标签。

-   监听编辑器元素的`paste`事件

去除格式，只粘贴纯文本。

-   使用事件代理监听标签的点击事件

实现删除标签、显示选择标签的下拉列表等功能。

-   监听编辑器元素的`keydown`事件

监听回车键抛出发送事件。

监听删除键，修复输入标签内容为空时被自动删除的问题。

实现快捷指令，阻止默认行为。

-   快捷指令

检查当前光标前的文本节点内容，判断是否输入了指定的触发字符，同时提取触发字符后面到光标前的文本作为搜索内容，弹出选择列表，选择后删除触发字符和搜索字符，并且插入指令标签。

-   使用选区和范围API

实现光标的定位、全选、内容的插入替换、快捷指令等。