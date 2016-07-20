/****************
 * Dialog 类
 ****************/
var Dialog = function(conf) {
    this.timestamp = (new Date().getTime()).toString();
    this.id = 'Dialog_' + this.timestamp; // 时间戳

    // 选项
    this.content = conf.content || ''; // 内部内容
    this.onClose = conf.close || function() {}; // 关闭后执行
    this.onReady = conf.ready || function() {}; // 加载完后执行
    this.stay = !!conf.stay; // 关闭是隐藏还是删除
    this.width = conf.width || '100%';
    this.height = conf.height || 'auto';
    this.position = conf.position || 1; // 1-9
    this.block = !!conf.block; // 点击空白处是否导致关闭
    this.noOverlay = !!conf.noMask; // 是否显示半透明遮罩
    this.fullscreen = !!conf.fullscreen; // 是否占据全屏
    this.zIndex = conf.zIndex || 1;
    this.top = conf.top || 0;
    this.right = conf.right || 0;
    this.bottom = conf.bottom || 0;
    this.left = conf.left || 0;
    this.withBorder = !!conf.withBorder; // 是否停靠时也显示边框
    this.parentEl = conf.container || document.body;

    // dom 缓存
    this.wrapper = null; // the wrapper node
    this.main = null; // the main body node, 与 wrapper 的存在性同步

    if (!!conf.autoShow) this.show(); // 创建即显示
};
Dialog.prototype = {
    _setLayout: function(el) { // 设置 dialog 的布局
        if (!el) var el = this.main;

        if (this.fullscreen) {
            this.width = '100%';
            this.height = '100%';
            this.position = 0;
        }

        if (this.position >= 0 && this.position <= 9) {
            el.style.width = this.width;
            el.style.height = this.height;
            el.parentNode.className = el.parentNode.className + ' dialog-docker-p' + this.position;
            el.parentNode.style.width = this.width;
            el.parentNode.style.height = this.height;
            el.style.width = '100%';
            if (this.height != 'auto') el.style.height = '100%';

            if (this.position == 5) {
                if ('string' == typeof this.top && this.top.charAt(this.top.length - 1) == '%') {
                    el.parentNode.style.top = this.top;
                }
            }

            var dsTable = [
                [],
                ['top', 'left'],
                ['top', 'left'],
                ['top', 'right'],
                ['top', 'left'],
                ['top', 'left'],
                ['top', 'right'],
                ['bottom', 'left'],
                ['bottom', 'left'],
                ['bottom', 'right'],
            ];

            this._setOffset(el, dsTable[this.position]);
        }
    },
    _setOffset: function(el, ds) { // 设置 dialog 的边缘
        if (!el) var el = this.main;
        if (!ds) var ds = ['top', 'right', 'bottom', 'left'];
        var xy = [0, 0];
        if (this.top && 'number' == typeof this.top) {
            xy[1] += this.top;
        }
        if (this.right && 'number' == typeof this.right) {
            xy[0] -= this.right;
        }
        if (this.bottom && 'number' == typeof this.bottom) {
            xy[1] -= this.bottom;
        }
        if (this.left && 'number' == typeof this.left) {
            xy[0] += this.left;
        }

        if (!this.withBorder) {
            for(var i = 0; i < ds.length; i++) {
                var di = ds[i];
                (function(d) {
                    var dv = GetStyle(el, d);
                    if (dv == 'auto') return;
                    var borderWidth = GetStyle(el, 'border-' + d + '-width');
                    borderWidth = borderWidth.split(' ')[0];
                    if (borderWidth.lastIndexOf('px') != borderWidth.length - 2) return;
                    borderWidth = parseFloat(borderWidth.substring(0, borderWidth.length - 2));
                    if (d == 'top') {
                        xy[1] -= borderWidth;
                    } else if (d == 'right') {
                        xy[0] += borderWidth;
                    } else if (d == 'bottom') {
                        xy[1] += borderWidth;
                    } else if (d == 'left') {
                        xy[0] -= borderWidth;
                    }
                }.bind(this))(di);
            };
        }

        var translateVal = 'translate(' + xy[0] + 'px,' + xy[1] + 'px)';
        el.style.transform = translateVal;
        el.style.WebkitTransform = translateVal;
        el.style.MozTransform = translateVal;
        el.style.OTransform = translateVal;
        el.style.msTransform = translateVal;
    },
    init: function() {
        var el = this.render(this.content, this.style, this.id);

        el.onclick = (function(event) {
            event = event || window.event;

            var obj = event.srcElement || event.target;
            if (obj.className.indexOf('dialog-wrapper') >= 0
                || obj.className.indexOf('dialog-docker') >= 0) {
                if (!this.block) {
                    this.close();
                    this.onClose();
                }
            } else if (obj.className.indexOf('btn-close') >= 0) {
                this.close();
                this.onClose();
            }

            event.preventDefault ? event.preventDefault() : (event.returnValue = false);
        }).bind(this);

        this.onReady(el);
    },
    render: function(content, style, id) {
        if (!id) var id = this.id;

        // 准备好 wrapper 和 main 元素
        if (!this.main || !this.wrapper) {
            if (this.main) this.main.parentNode.removeChild(this.main);
            if (this.wrapper) this.wrapper.parentNode.removeChild(this.wrapper);
            this.main = null;
            this.wrapper = null;
            var el = document.createElement('div');
            el.innerHTML = '<div id="{id}" class="dialog-wrapper"><div class="dialog-docker"><div class="dialog">{content}</div></div></div>';
            this.wrapper = el.getElementsByClassName('dialog-wrapper')[0];
            this.wrapper.id = id;
            this.wrapper.style.visibility = 'hidden';
            this.wrapper.style.zIndex = this.zIndex;
            if (this.noOverlay) this.wrapper.className += ' ' + this.wrapper.className + '-noOverlay';
            this.main = this.wrapper.getElementsByClassName('dialog')[0];
            this.parentEl.appendChild(this.wrapper);
        }

        // 渲染内容
        if ('string' == typeof content) {
            this.main.innerHTML = content;
        } else if (content instanceof Node) {
            this.main.innerHTML = '';
            this.main.appendChild(content);
        }

        this._setLayout();
        this.wrapper.style.visibility = 'visible';
        this.show();

        return this.wrapper;
    },
    show: function() {
        if (!this.wrapper) this.init(); // 如果还没 init 则 init
        else {
            this.wrapper.style.display = 'block';

            // disableScroll {
            // 修改外部后需要恢复的量
            this._bodyPosition = GetStyle(document.body, 'position');
            this._bodyTop = GetStyle(document.body, 'top');
            this._bodyLeft = GetStyle(document.body, 'left');
            this._bodyWidth = GetStyle(document.body, 'width');
            this._bodyClientWidth = document.body.clientWidth;
            this._bodyScrollTop = document.body.scrollTop;
            this._bodyScrollLeft = document.body.scrollLeft;
            this._bodyOverflow = GetStyle(document.body, 'overflow');
            this._htmlVisible = document.documentElement.style.overflow;

            function setStyle(el, strCss) {
                function endsWith(str, suffix) {
                    var l = str.length - suffix.length;
                    return l >= 0 && str.indexOf(suffix, l) == l;
                }
                var sty = el.style,
                    cssText = sty.cssText;
                if (!endsWith(cssText, ';')) cssText += ';';
                sty.cssText = cssText + strCss;
            }

            setStyle(document.documentElement, 'overflow: visible !important;');
            document.body.style.position = 'fixed';
            document.body.style.width = this._bodyClientWidth + 'px';
            document.body.style.top = (0 - this._bodyScrollTop) + 'px';
            document.body.style.left = (0 - this._bodyScrollLeft) + 'px';
            document.body.style.overflow = 'hidden';
            // }
        }
    },
    hide: function() {
        // restoreScroll {
        document.body.style.position = this._bodyPosition;
        document.body.style.width = this._bodyWidth;
        document.body.style.top = this._bodyTop;
        document.body.style.left = this._bodyLeft;
        document.body.scrollTop = this._bodyScrollTop;
        document.body.scrollLeft = this._bodyScrollLeft;
        document.body.style.overflow = this._bodyOverflow;
        document.documentElement.style.overflow = this._htmlVisible;
        // }

        this.wrapper.style.display = 'none';
    },
    remove: function() {
        this.hide();
        this.wrapper.parentNode.removeChild(this.wrapper);
        this.main = null;
        this.wrapper = null;
    },
    close: function() {
        this.stay ? this.hide() : this.remove();
    }
};
Dialog.Create = function(conf) {
    return new(this)(conf);
};
Dialog.Alert = function(text) {
    (new(this)({
        content: text
    })).show();
};

/****************
 * 辅助函数：获取元素的样式值
 * 参考 Jquery 作者 John Resig
 ****************/
function GetStyle(el, name, doc) {
    var _document = doc || document,
        nameWords = name.split('-');
    for (var i = 1, len = nameWords.length; i < len; i++) {
        if (!nameWords[i].length) continue;
        nameWords[i] = nameWords[i].charAt(0).toUpperCase() + nameWords[i].substr(1);
    }
    name = nameWords.join('');

    if (el.style[name]) {
        return el.style[name];
    } else if (el.currentStyle) {
        return el.currentStyle[name];
    } else if (_document.defaultView && _document.defaultView.getComputedStyle) {
        name = name.replace(/([A-Z])/g, '-$1');
        name = name.toLowerCase();
        var s = _document.defaultView.getComputedStyle(el, '');
        return s && s.getPropertyValue(name);
    } else {
        return null;
    }
}