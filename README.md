# Demo

See demo [here](http://hengwusanren.github.io/Dialogjs.html).

# 创建 Dialog

## new

```javascript
var dialog1 = new Dialogger({
    content: 'This is a dialog.',
    stay: 1
});
dialog1.show();
```

`dialog1.main` 是创建的 dom 节点，但不是最外层节点；最外层节点是 `dialog1.wrapper`。

## 工厂

```javascript
Dialogger.Create({
    content: 'This is a dialog.',
    autoShow: 1,
    position: 2,
    width: '50%',
    height: '50%',
    top: 100
});
```

不需要控制返回对象，可以简单这么做。

# 配置选项

## autoShow

创建后自动显示。

## width, height

宽、高，'100px'，'100%'。

## position

1到9的数字，位置对应：

1 2 3

4 5 6

7 8 9

常用5，即在屏幕中心显示；2、4、6、8可配合100%的宽或高。

## content

最重要的，`this.main` 的子元素，可以是字符串也可以是 Node。

## stay

是否常驻。默认为否，即 dialog 关闭时从文档中删除；如果常驻则隐藏，不删除，创建时可以用 new。

## top, left ...

用于调整到屏幕边缘的距离。

## zIndex

设置 z-index，以防被遮挡。

## block

是否阻塞页面，如果是，则点击周围空白不关闭。

## noMask

是否要有遮罩，即背后的半透明阴影层。

## ready

dialog 渲染后回调。

## close

dialog 关闭后回调。

## fullscreen

是否全屏显示。

# 接口

## render(content)

渲染，content 可以是字符串或 Node。

## show / hide

显示/隐藏。

## close

关闭。