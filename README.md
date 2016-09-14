# 功能

弹出对话框。对话框可以是多种形式，有很强的可定制性。

# 创建 Dialog

## new

    var dialog1 = new Dialog({
        content: 'This is a dialog.',
        stay: 1
    });
    dialog1.show();

`dialog1.main` 是创建的 dom 节点，但不是最外层节点；最外层节点是 `dialog1.wrapper`。

## 工厂

    Dialog.Create({
        content: 'This is a dialog.',
        autoShow: 1,
        position: 2,
        width: '50%',
        height: '50%',
        top: 100
    });

不需要控制返回对象，可以简单这么做。

# 配置项

## autoShow

创建后自动显示。

## width, height

宽、高，'100px'，'100%'。建议指定宽和高的值。

## position

1到9的数字，位置对应：

    1 2 3

    4 5 6

    7 8 9

默认为5，即在屏幕中心显示；2、4、6、8可配合100%的宽或高；4、6可用于 panel 弹出；3、9可用于 notification。

## content

最重要的，`this.main` 的子元素，可以是字符串也可以是 Node。

## block

是否阻塞页面，如果是，则点击周围空白不关闭。

## noMask

是否要有遮罩（即背后的半透明阴影层）。

## stay

是否常驻。默认为否，即 dialog 关闭时从文档中删除；如果常驻则隐藏不删。
对于常驻的对话框（比较重量级的），创建时可以用 `new`，将对象保存，后续使用 `show()` 和 `close()` 方法控制显示/隐藏。

## top, left...

用于调整到屏幕边缘的距离。

## ready

dialog 渲染后回调。

## show

dialog 打开时执行。

## close

dialog 关闭后回调。

## fullscreen

是否全屏显示。

# 主要成员

## main

包裹了 `content` 的元素。

## wrapper

整个 dialog 元素（如果有 iframe 则不包含在内）。

# 主要方法

## render(content)

渲染，`content` 可以是字符串或 Element。

## show()

显示。对于不常驻的对话框，一般在创建时加入 `autoShow` 配置项即可创建完自动显示，不需要调用 `show()`，关闭时也即刻删除，很少需要调用 `close()`。对于常驻的对话框，创建一次后，将对象保存，后续调用 `show()` 即可再次显示。

## close()

关闭。如果 `stay` 则隐藏，否则删除。

# IE兼容性

IE7 及以上。不确定内容宽高的对话框建议仅在移动端使用。