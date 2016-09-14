# 功能

弹出确认框。基于对话框组件。

# 用法

## 引入文件

先引入css文件和js文件：

    <link rel="stylesheet" type="text/css" href="../dialog/lib/dialog.css">
    <script type="text/javascript" src="../dialog/lib/dialog.js"></script>

再引入自定义的css，其中包含对特定class的样式定义：

    <link rel="stylesheet" type="text/css" href="./demo.css">

## 自定义特定class的样式

    .dialog-confirm-wrapper // 包装
        .content // 内容
        .footer // 按钮区
            .btn // 按钮
            .btn-sure // 确认按钮
            .btn-cancel // 取消按钮

## 创建对话框

使用工厂方法：

    Dialog.Confirm(contentString, sureCallback, cancelCallback, conf)

其中，`contentString` 是内容，字符串形式，可以是html字符串；`sureCallback` 是确认按钮的回调；`cancelCallback` 是取消按钮的回调。

# 示例

弹出确认框，显示一段文字，确认按钮和取消按钮各自定义了按钮文字和回调：

    Dialog.Confirm('This is an confirming dialog.', function() {
            console.log('You choose 1.');
        }, function() {
            console.log('You choose 0.');
        }, {
            sureText: 'ok', // 确认按钮的文字
            cancelText: 'cancel' // 取消按钮的文字
        }
    );

# 兼容性

移动端。