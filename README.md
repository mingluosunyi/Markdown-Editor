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
> 想象一下用户点击左侧的笔记列表中的一条笔记，然后这条笔记就变成了绿色，随后右边的内容也变成了这条笔记的内容。要怎么做才能实现这样的效果呢？

+ 还是先在数据层实现吧！
+ 首先笔记列表中的每条笔记肯定有要有一个**点击事件**，不然点击了也不会有任何的效果，对吧！那么我们现在先给这个事件个名字，就叫`selectNode()`好了。
+ 怎么才能知道一条笔记被选中了呢？最简单的方式是在`data`中添加一个`selectedID`属性，用于保存被选中的笔记的id。这样我们查看该属性就知道是哪个元素被选中了。
那么`selectNode()`就可以定义了:
```javascript
methods: {
  // ...
  selectNode (note) {
    this.selectedID = note.id
  }
}
```
接下来给每条笔记都绑定上点击事件吧。
```javascript
<div class="notes">
  <div class="note" v-for="note in notes" @click="selectNode(note)">{{ note.title }}</div>
</div>
```
现在，当单击一条笔记时，可以看到selectedID属性的变化。

#### 动态css属性
> 还记得用户点击之后第二步是什么吗？是让被点击的那条笔记变成绿色！

如果你了解Vue，你应该知道可以给一个标签动态的绑定css属性，比如这样：
```javascript
<div :class="{ one:true,two:false,three:true }">aaa</div>
```
这段代码给div添加了one和three两个class。

现在我们已经写好了selected类，这个样式可以实现笔记被选中后颜色的改变。我们需要做的只是在笔记被选中后把selected样式绑定到它上面。

你应该会做了吧～
```javascript
<div :class="{ selected: note.id === selectedID}"></div>
```
#### 当前笔记
> 最后一步是在main和preview区域显示当前笔记的内容。

```javascript
<textarea v-model:"selectedNote.content"></textarea>
```
+ 如果有一个数据是selectedNote就可以直接用上述写法实现了，然而我们只有selectedID，令人感叹！
+ 怎么办呢？我们试想用selectedID得到selectedNote
+ 可以用计算属性来实现
```javascript
computed: {
  selectedNote () {
    return this.notes.find(note => note.id === this.selectedID)
  }
}
```
然后修改一下preview：
```javascript
notePrview () {
  return marked.parse(this.selectedNote ? this.selectedNote.content : '')
}
```
#### v-if 和 deep
> 这样一来，我们开头试想的场景就变为现实了，多么美妙啊！ 不过别高兴的太早了，还有两个小小的改进点。
1. 我们希望在没有笔记被选中的时候隐藏主面板和预览面板
2. 我们之前做的基础版编辑器中的保存功能已经失效了，需要重新添加保存功能

**先来实现(1)的功能吧。**

我们可以在主面板和预览面板外面包一层`<template>`，然后给`<template>`加`v-if`属性控制显示与隐藏。既然是选中时显示，那`v-if`自然要绑定到`selectedID`或者`selectedNote`。这样就大功告成了。

v-if绑定到值如果是false，那么组件就不会被挂载。因为null和undefined是假值，所以没有选中笔记时主面板和预览面板会被隐藏。

> 如果使用selectedID，那么没有选中时的值是null，如果是selectedNote则是undefined,不过这两个都是假值，所以在使用上没有区别。

**接下来实现(2)的功能**

使用v-for渲染的列表会自动监听notes数组的变化，不过这种监听是表层的，直白的说他会监听数组的push，pop，sort等操作，但是更深层的变化，比如修改了content就不会被监听到。

**使用deep修饰符可以实现深层监听，不过坏处是性能不好**。

我们希望在notes数据发生变化后自动保存，因此可以添加侦听器侦听notes属性。
```javascript
watch: {
  notes:{
    handler: saveNotes(val),
    deep: true
  }
}
```
**注意**：如果要使用deep修饰符必须以对象的形式定义侦听器，val参数是侦听器特有的参数，是变化后的值，与之对应的参数还有oldval，是变化前的值，不过这里不需要就省略了。
saveNotes的具体实现也是使用localStorage，这里就不再详细解释了。

同时，我们也可以把selectedId保存到浏览器，这样用户每次打开笔记时都能继续上次未完成的编辑工作了。

最后别忘了修改notes和selectedID的初始化哦！
```javascript
data () {
    return {
      // content: 'This is a note',
      notes: JSON.parse(localStorage.getItem('notes')) || [],
      selectedId: localStorage.getItem('selected-id') || null
    }
  },
```

### 笔记工具栏
> 我们的markdown-Editor总算初具雏形了！下面跟我一起为它添加更多的功能吧！

我们要在主面板的顶部添加一个工具栏，他主要会实现3个功能。
+ 重命名笔记
+ 删除笔记
+ 收藏笔记

#### 重命名笔记
这个功能的实现非常简单，只要在工具栏添加一个`input`标签后用`v-model`绑定`selectedNote.title`就好了

#### 删除笔记
这个功能也很简单，在`input`标签后面添加一个`button`，然后给`button`创建点击事件`removeNote`。
```javascript
methods: {
  // ...
  if(this.selectedNote && confirm('确定要删除吗？')) {
    const index = this.notes.indexOf(this.selectedNote)
    if (index !== -1) {
      this.notes.splice(index,1)
    }
  }
}
```
使用confirm弹出对话框，然后用`splice()`方法删除下标为index的note。

splice的使用请查阅书本或文档。
![splice](./readme-md-pictures/截屏2022-03-17%20下午2.37.01.png)

#### 收藏笔记
现在请翻到文章的开头查看收藏按钮！

我们想要实现的功能是：
+ **点击按钮可以收藏笔记，再次点击可以取消收藏。**
+ **收藏的笔记用实心的五角星来标识(这个可以用不同的icon来实现，所以暂时不用担心)。取消的用空心五角星标识。**
+ 并且对笔记列表中所有的笔记**排序**，**被收藏的笔记排列在没被收藏的笔记前面**。如果同是(不)被收藏的笔记，则**按照被创建的时间先后排序，先创建在前**。

这时，我们的notes数据已经不满足使用要求了。虽然在程序后期修改数据可能会引起很多bug，不过在这里不必担心这件事。我们需要给每条数据加上created和favorited属性。

修改吧！
```javascript
addNote () {
      const time = Date.now()
      const note = {
        id: String(time),
        title: 'New note' + (this.notes.length + 1),
        content: '**hi**',
        created: time,
        favorite: false
      }
      this.notes.push(note)
    }
```
然后在删除按钮前面加上收藏按钮。
```javascript
<button @click="favoriteNote" title="Favorite note">
   <i class="material-icons">{{ selectedNote.favorite ? 'star' : 'star_border' }}</i>
</button>
```
怎么实现`favoriteNote`想必不用我多说了吧。

一种最笨的方法是
```javascript
this.selectedNote.favorite = this.selectedNote.favorite
```

也有更高级的方法，留给你们自己思考🤔！

#### 最后我们来实现排序
众所周知，Array()有一个原生方法sort(),这个方法需要传入一个自定义的比较方法比较两个数。我们自定义的方法需要返回一个值，如果这个值大于0，则arg1排在arg2后面，小于0则arg1在arg2前面，=0则相等。

可以用sort来给notes排排序，先不管收不收藏，给所有的笔记按时间排序。然后再判断，如果两条笔记都被收藏或者都不被收藏，则不变位置，如果一条被收藏，则把被收藏的那条放到前面，重新排序。

```javascript
 sortedNotes () {
      return this.notes.slice()
          .sort((a, b) => a.created - b.created)
          .sort((a, b) => {
            return (a.favorite === b.favorite) ? 0 : a.favorite ? -1 : 1
          })
    },
```
妙啊！

### 状态栏
再回去看一眼图吧！

>状态栏在主面板底部，用于显示一些信息：创建时间，行数，单词数和字符数。

我们需要使用momentjs库对笔记的`created`属性做一些格式化的处理，便于人类查看，不然你可能会看到：
![created](./readme-md-pictures/截屏2022-03-17%20下午3.08.56.png)
这样反人类的东西。

在html文件中引入momentjs。
```javascript
<script src="http://cdn.staticfile.org/moment.js/2.24.0/moment.js"></script>
```
然后创建过滤器。
```javascript
filters: {
    date: function (time) {
      return moment(time).format('DD/MM/YY, HH:m')
    }
  }
```
关于过滤器可以去Vue官网学习。

最后把元素放到页面上，形成status-bar
```javascript
<div class="status-bar">
  <span class="date">
    <span class="label">Created</span>
    <span class="value">{{ selectedNote.created | date }}</span>
</div>
```

接下来，我们要开始统计文本数据了。
```javascript
    linesCount () {
      if (this.selectedNote) {
        return this.selectedNote.content.split(/\r\n|\r|\n/).        length
      }
    },
    wordsCount () {
      if (this.selectedNote) {
        let s = this.selectedNote.content
        s = s.replace(/\n/g,' ')
        s = s.replace(/(^\s*)|(\s*$)/gi,'')
        s = s.replace(/\s\s+/gi,' ')
        return s.split(' ').length
      }
    },
    charactersCount () {
      if (this.selectedNote) {
        return this.selectedNote.content.split('').length
      }
    }
```
使用正则表达式处理content。但是我也不是很了解正则，就不献丑解释了。

最后把这些计算属性扔到页面上。

```javascript
<div class="status-bar">
          <span class="date">
          <span class="label">Created</span>
          <span class="value">{{ selectedNote.created | date}}</span>
        </span>
          <span class="lines">
          <span class="label">Lines</span>
          <span class="value">{{ linesCount }}</span>
        </span>
          <span class="words">
          <span class="label">Words</span>
          <span class="value">{{ wordsCount }}</span>
        </span>
          <span class="charactors">
          <span class="label">Charactors</span>
          <span class="value">{{ charactersCount }}</span>
        </span>
        </div>
```

等等等！大功告成！

### 总结
本文没有详细解释Vue特性，建立在读者已经掌握基础的Vue语法的基础上编写。如果卡住请去Vue官网学习相关语法后继续。关键性代码基本都以给出，完整代码在git仓库中，相信凭借我的讲解和适当的思考大家都能完成该项目，建议独立思考完成而不是直接看代码。希望有朝一日我们都能成为Vue潮人！