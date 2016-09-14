document.getElementById('btn0').onclick = function() {
    // 全屏
    var fsStr = '';
    for(var i = 0; i < 200; i++) {
        fsStr += 'This is a fullscreen dialog.';
    }
    Dialog.Create({
        content: fsStr,
        autoShow: 1,
        fullscreen: 1,
        show: function() {
            window.setTimeout(function() {
                this.close();
            }.bind(this), 1000);
        }
    });
};
document.getElementById('btn1').onclick = function() {
    // 左上
    Dialog.Create({
        content: 'This is a ' + this.innerText + ' dialog.',
        autoShow: 1,
        position: 1,
        width: '400px',
        height: '300px'
    });
};
document.getElementById('btn2').onclick = function() {
    // 中上
    Dialog.Create({
        content: 'This is a ' + this.innerText + ' dialog.<div class="test" style="width:2048px;height:1024px;"></div>',
        autoShow: 1,
        position: 2,
        slide: 'down',
        width: '100%',
        height: '300px',
        slide: 'down'
    });
};
document.getElementById('btn3').onclick = function() {
    // 右上
    Dialog.Create({
        content: 'This is a ' + this.innerText + ' dialog.',
        autoShow: 1,
        position: 3,
        width: '400px',
        height: '30%',
        withBorder: true,
        ready: function() {
            alert('Your dialog is ready. 贴靠边缘的 border 不会被隐藏.');
        }
    });
};
document.getElementById('btn4').onclick = function() {
    // 左中
    Dialog.Create({
        content: 'This is a ' + this.innerText + ' dialog.<div class="test" style="height:2048px"></div>',
        autoShow: 1,
        position: 4,
        slide: 'right',
        width: '50%',
        height: '100%'
    });
};
document.getElementById('btn5').onclick = function() {
    // 中中
    Dialog.Create({
        content: 'This is a ' + this.innerText + ' dialog.',
        autoShow: 1,
        position: 5,
        width: '400px',
        height: '300px',
        close: function() {
            alert('You close the dialog.');
        }
    });
};
document.getElementById('btn6').onclick = function() {
    // 右中
    Dialog.Create({
        content: 'This is a ' + this.innerText + ' dialog.',
        autoShow: 1,
        position: 6,
        slide: 'left',
        width: '400px',
        height: '60%',
        top: '40%' // 百分比相对于屏幕，dialog 中心到屏幕边缘距离
    });
};
document.getElementById('btn7').onclick = function() {
    // 左下
    Dialog.Create({
        content: 'This is a ' + this.innerText + ' dialog.',
        autoShow: 1,
        position: 7,
        width: '400px',
        height: '300px'
    });
};
document.getElementById('btn8').onclick = function() {
    // 中下
    Dialog.Create({
        content: 'This is a ' + this.innerText + ' dialog.'
            + '<input class="test" type="text" style="position:absolute;bottom:0;left:0;">',
        autoShow: 1,
        position: 8,
        slide: 'up',
        opacity: 0.2,
        fade: true,
        height: '50%'
    });
};
document.getElementById('btn9').onclick = function() {
    // 右下
    Dialog.Create({
        content: 'This is a ' + this.innerText + ' dialog.',
        autoShow: 1,
        position: 9,
        width: '400px',
        height: '300px'
    });
};
document.getElementById('btn10').onclick = function() {
    // 无遮罩，创建即显示，点击不关闭
    window.dialog2 = Dialog.Create({
        content: 'This is a ' + this.innerText + ' dialog.',
        block: 1,
        autoShow: 1,
        noMask: 1,
        zIndex: 100,
        width: '50%',
        height: '50%',
        position: 5
    });
};
document.getElementById('btn11').onclick = function() {
    // 中间带
    Dialog.Create({
        content: 'This is a ' + this.innerText + ' dialog.',
        autoShow: 1,
        position: 5,
        height: '300px'
    });
};
var udlg0;
window.onload = function() {
    udlg0 = Dialog.Create({
        content: 'This is a ' + this.innerText + ' dialog.',
        position: 2,
        width: '50%',
        height: '50%',
        stay: 1,
        top: 100,
        slide: 'down'
    });
};
document.getElementById('btn12').onclick = function() {
    // 中上，坠落，定 top
    udlg0.show();
};
var udlg1;
document.getElementById('btn13').onclick = function() {
    // 不确定宽高
    if(udlg1 && udlg1.main) udlg1.close();
    udlg1 = Dialog.Create({
        content: 'This is a ' + this.innerText + ' dialog. <img width="600" height="400" src="http://photos.tuchong.com/242557/f/2493506.jpg">'
            + '1111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111'
            + '<input class="test" type="text"><div style="height:20px;"></div>',
        autoShow: 1,
        position: 5,
        unknown: true
    });
};
var udlg2;
document.getElementById('btn14').onclick = function() {
    // 不确定宽高
    if(!udlg2) {
        udlg2 = Dialog.Create({
            content: 'This is a ' + this.innerText + ' dialog. <img width="600" height="400" src="http://photos.tuchong.com/242557/f/2493506.jpg">'
                + '1111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111'
                + '<input class="test" type="text"><div style="height:20px;"></div>',
            stay: 1,
            position: 5,
            unknown: true
        });
    }
    udlg2.show();
};