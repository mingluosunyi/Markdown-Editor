# Markdown-Editor
## 最终效果预览
![preview](./readme-md-pictures/截屏2022-03-16%20下午9.23.37.png)
## 开始
### 核心功能实现
+ **导入marked.js** 这个库的功能是把markdown文本"编译"成html文本
+ **在页面上创建两个区域**。左侧区域用来给用户输入markdown文本，右侧区域负责渲染markdown文本。
+ 左侧区域 使用标签\<textarea\>，**用v-model绑定数据content**
+ 右侧区域 使用\<aside\>，**定义计算属性contentPreview得到"编译"后的html文本**，**用v-html在页面上渲染该文本**。
> 问题：关闭页面后之前的笔记都消失了！！！如何才能保存自己的笔记使下次打开时依然能继续编辑呢？

### 保存笔记
+ 核心是利用浏览器的**localStorage**，把笔记保存在浏览器中。
+ **用watch侦听content**，当content改变时，使其自动调用函数saveNote()。
+ saveNote()的**核心**其实就是`localStorage.setItem('note',val)` **val&oldval是侦听器的参数**，saveNote()定义在methods属性中。
+ 之后可以选择在**created()声明周期**获取保存的note，或者在data中直接获取note。
现在已经实现了编辑器的基础功能

### 多条笔记
> 现在我们想要继续完善编辑器的功能。我们希望在当前页面的左侧添加一个笔记的**目录列表**，上面有一个**按钮**支持**添加一条笔记**。按下该按钮后添加的笔记可以自动显示在目录列表中。这个功能该如何实现呢？
+ 在没什么思路的情况下不如先**搭建view吧(写html)**。我们先在现有的页面左侧添加一个`aside`标签用来布局。然后在`aside`中放入`button`按钮。假设点击`button`按钮会调用一个叫做`addNote`的函数，那么我们可以用`v-on:click='addNote'`绑定这个函数。
+ 下面我们试着定义`addNote()`，之前的基础版编辑器的`data`中只有`content`属性，现在我们需要多条笔记，自然想到了添加新的一个属性`notes:[]`来实现。这是一个数组，数组的元素是一些对象，每个对象都有一个content属性。添加一条笔记就是给这个数组添加一个对象。那么`addNote()`的定义就很清晰了。
```javascript
data () {
  return {
    content: '**hi**',
    notes:[]
  }
},

method: {
  addNote () {
    this.notes.push({
      content: '**hi**'
    })
  }
}
```
+ 不过我们目前忽略了一些细节，显然一条笔记只有内容是不够的。假如我们要在若干条笔记中找到一条笔记**仅用content属性是不行的**，我们应该给每条笔记增加一个**主键**，也就是**id属性**。这样就可以用它来唯一标识一条笔记了。
+ 同时，笔记应该有一个**文件名(笔记名)**,用户不可能通过id来猜测笔记的内容，一个合适的笔记名可以方便用户得知笔记的具体内容。

接下来我们修改之前的addNote(),使其更加符合程序的功能。

```javascript
method: {
  addNote () {
    const time = Date.now()
    const note = {
      id: String(time),
      title: 'New note' + (this.notes.length + 1),
      content: '**hi**'
    }
    this.notes.push(note)
  }
}
```
**现在我们点击按钮就能添加一条笔记了，不过只是在数据层实现了功能，页面上并不能体现变化。我们可以用vue调试工具查看data下notes的变化。**

#### 显示笔记数量
> 如果能在Add note按钮上提示现有多少条笔记就好了！
+ 只要利用html的`title`属性就能添加提示了，假如你知道`v-bind`，那你一定已经想到了这么做：
```javascript
<button v-bind:title="notes.length + 'note(s) already'"></button>
```
不过尽量不要在html中编写太多的代码，我们可以把title的值作为计算属性编写：
```javascript
computed: {
  addButtonTitle () {
    return this.notes.length + 'note(s) already'
  }
}
<button :title="addButtonTitle"></button>
```
现在就能看到目前有多少条笔记了。

#### 渲染笔记列表
> 差点忘了我们还没实现如效果图所示的笔记列表！

这个功能其实很简单，前提是你了解Vue的`v-for`指令。
+ 我们在之前添加的左侧`<aside>`标签中的`<button>`标签下添加一个`<div>`在`<div>`里面再写一个`<div>`用来存放单条笔记。总之代码如下:
```javascript
<div class="notes">
  <div class="note" v-for="note in notes">{{ note.title }}</div>
</div>
```
使用按钮添加几条笔记，可以看到笔记列表会自动更新。

### 选中一条笔记
