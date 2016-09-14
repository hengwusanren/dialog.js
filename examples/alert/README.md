# 功能

弹出提示框。基于对话框组件。

# 用法

## 引入文件

先引入css文件和js文件：

    <link rel="stylesheet" type="text/css" href="../dialog/lib/dialog.css">
    <script type="text/javascript" src="../dialog/lib/dialog.js"></script>

再引入自定义的css，其中包含对特定class的样式定义：

    <link rel="stylesheet" type="text/css" href="./demo.css">

## 自定义特定class的样式

    .dialog-alert-wrapper // 包装
        .content // 内容
        .btn // 按钮

## 创建对话框

使用工厂方法：

    Dialog.Alert(contentString, conf)

其中，`contentString` 是内容，字符串形式，可以是html字符串。
`conf` 是其他配置，包括：`btnText` 按钮文字，`callback` 是按钮回调，`time` 是（无按钮时）自动关闭的时间，`noBlock` 是对话框不阻塞。

# 示例

弹出提示框，提示一段文字，按钮文字自定义，可以定义按钮回调：

    Dialog.Alert('This is an alerting dialog.', {
        btnText: 'great' // 按钮文字
        //, callback: function() { console.log('alerting dialog closed'); } // 按钮回调
    });

弹出提示框，不阻塞页面，1秒后自动关闭：

    Dialog.Alert('This is an alerting dialog.', {
        time: 1, // 指定时间后关闭，单位为秒
        noBlock: 1 // 不需要阻塞，即点击空白处亦可关闭
    });

# 兼容性

移动端。