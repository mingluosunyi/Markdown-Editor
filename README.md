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

###保存笔记
+ 核心是利用浏览器的**localStorage**，把笔记保存在浏览器中。
+ **用watch侦听content**，当content改变时，使其自动调用函数saveNote()。
+ saveNote()的**核心**其实就是`localStorage.setItem('note',val)` **val&oldval是侦听器的参数**，saveNote()定义在methods属性中。
+ 之后可以选择在**created()声明周期**获取保存的note，或者在data中直接获取note。