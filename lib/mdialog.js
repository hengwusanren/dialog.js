/****************
 * Dialog 类
 ****************/
var Dialog = function(conf) {
    this.constructor = Dialog;
    this.timestamp = (new Date().getTime()).toString();
    this.id = 'Dialog_' + this.timestamp; // 时间戳

    // 选项
    this.content = conf.content || ''; // 内部内容
    this.onClose = conf.close || function() {}; // 关闭后执行
    this.onReady = conf.ready || function() {}; // 加载完后执行
    this.stay = !!conf.stay; // 关闭是隐藏还是删除
    this.unknown = !conf.width && !conf.height; // 不确定宽高
    this.width = conf.width || '100%';
    this.height = conf.height || 'auto';
    this.position = conf.position || 1; // 1-9
    this.block = !!conf.block; // 点击空白处是否导致关闭
    this.noOverlay = !!conf.noMask; // 是否显示半透明遮罩
    this.fullscreen = !!conf.fullscreen; // 是否占据全屏
    if (this.fullscreen) this.unknown = true; // ?
    this.zIndex = conf.zIndex || 1;
    this.top = conf.top || 0;
    this.right = conf.right || 0;
    this.bottom = conf.bottom || 0;
    this.left = conf.left || 0;
    this.withBorder = !!conf.withBorder; // 是否停靠时也显示边框
    this.parentEl = conf.container || document.body;
    this.slide = conf.slide;
    this.slideConf = conf.slideConf || '200ms ease';
    this.fade = conf.fade;
    this.opacity = conf.opacity || '0.4';
    var opct = parseFloat(this.opacity);
    if (isNaN(opct) || opct < 0 || opct > 1) this.opacity = '0.4';
    this._bgLock = false;

    // dom 缓存
    this.wrapper = null; // the wrapper node
    this.main = null; // the main body node, 与 wrapper 的存在性同步

    this.init();

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
            el.parentNode.className = el.parentNode.className +
                ' dialog-docker-p' + this.position;
            el.parentNode.style.width = this.width;
            el.parentNode.style.height = this.height;
            el.style.width = '100%';
            if (this.height != 'auto') el.style.height = '100%';

            if (this.position == 5) {
                if ('string' == typeof this.top && this.top.charAt(this
                        .top.length - 1) == '%') {
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
            for (var i = 0; i < ds.length; i++) {
                var di = ds[i];
                (function(d) {
                    var dv = GetStyle(el, d);
                    if (dv == 'auto') return;
                    var borderWidth = GetStyle(el, 'border-' + d +
                        '-width');
                    borderWidth = borderWidth.split(' ')[0];
                    if (borderWidth.lastIndexOf('px') !=
                        borderWidth.length - 2) return;
                    borderWidth = parseFloat(borderWidth.substring(
                        0, borderWidth.length - 2));
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
        this._xoffset = xy[0];
        this._yoffset = xy[1];
        this._contentWidth = el.clientWidth;
        this._contentHeight = el.clientHeight;
    },
    init: function() {
        var el = this.render(this.content, this.style, this.id);

        el.onclick = (function(event) {
            event = event || window.event;

            var obj = event.srcElement || event.target;
            if (obj.className.indexOf('dialog-wrapper') >= 0 ||
                obj.className.indexOf('dialog-docker') >= 0) {
                if (!this.block) {
                    this.close();
                    this.onClose();
                }
            } else if (obj.className.indexOf('btn-close') >= 0) {
                this.close();
                this.onClose();
            }

            event.preventDefault ? event.preventDefault() : (
                event.returnValue = false);
        }).bind(this);

        this.onReady(el);

        window[this.id] = this.resize.bind(this);

        AddEvent(window, 'resize', window[this.id]);

        var inputs = el.getElementsByTagName('input');
        for (var i = 0; i < inputs.length; i++) {
            AddEvent(inputs[i], 'focus', this.constructor.ListenWinSize);
            AddEvent(inputs[i], 'blur', this.constructor.UnlistenWinSize);
        }

        this.constructor.Table[this.timestamp] = this;
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
            if (this.unknown) {
                el.innerHTML =
                    '<div id="{id}" class="dialog-wrapper"><div class="dialog-unknown">{content}</div></div>';
            } else {
                el.innerHTML =
                    '<div id="{id}" class="dialog-wrapper"><div class="dialog-docker"><div class="dialog">{content}</div></div></div>';
            }
            this.wrapper = el.getElementsByClassName('dialog-wrapper')[
                0];
            this.wrapper.style.backgroundColor = 'rgba(0,0,0,' + this.opacity + ')';
            this.wrapper.id = id;
            this.wrapper.style.visibility = 'hidden';
            this.wrapper.style.zIndex = this.zIndex;
            if (this.noOverlay) this.wrapper.className += ' ' + this.wrapper
                .className + '-noOverlay';
            this.main = this.wrapper.getElementsByClassName(this.unknown ? 'dialog-unknown' : 'dialog')[0];
            this.parentEl.appendChild(this.wrapper);
        }

        // 渲染内容
        if ('string' == typeof content) {
            this.main.innerHTML = content;
        } else if (content instanceof Node) {
            this.main.innerHTML = '';
            this.main.appendChild(content);
        }

        if (!this.unknown) this._setLayout();
        else this.resize();
        this.hide();
        this.wrapper.style.visibility = 'visible';

        return this.wrapper;
    },
    resize: function(e) {
        if (!this.unknown) return;
        if (this.main.scrollHeight <= this.wrapper.clientHeight) {
            this.main.style.maxHeight = '';
            return;
        }
        this.main.style.maxHeight = this.wrapper.clientHeight + 'px';
        this.main.style.overflow = 'auto';
    },
    //resize: function() {},
    show: function() {
        setTimeout(function() {
            // disableScroll {
            if (!this._bgLock) {
                // 修改外部后需要恢复的量
                this._bgLock = true;
                this._bodyPosition = GetStyle(document.body,
                    'position');
                this._bodyTop = GetStyle(document.body, 'top');
                this._bodyLeft = GetStyle(document.body, 'left');
                this._bodyWidth = GetStyle(document.body,
                    'width');
                this._bodyClientWidth = document.body.clientWidth;
                this._bodyScrollTop = document.body.scrollTop;
                this._bodyScrollLeft = document.body.scrollLeft;
                this._bodyOverflow = GetStyle(document.body,
                    'overflow');
                this._htmlVisible = document.documentElement.style
                    .overflow;

                function setStyle(el, strCss) {
                    function endsWith(str, suffix) {
                        var l = str.length - suffix.length;
                        return l >= 0 && str.indexOf(suffix, l) ==
                            l;
                    }
                    var sty = el.style,
                        cssText = sty.cssText;
                    if (!endsWith(cssText, ';')) cssText += ';';
                    sty.cssText = cssText + strCss;
                }

                setStyle(document.documentElement,
                    'overflow: visible !important;');
                document.body.style.position = 'fixed';
                document.body.style.width = this._bodyClientWidth +
                    'px';
                document.body.style.top = (0 - this._bodyScrollTop) +
                    'px';
                document.body.style.left = (0 - this._bodyScrollLeft) +
                    'px';
                document.body.style.overflow = 'hidden';
            }
            // }

            if (this.slide || this.fade) {
                if (this.fade && this.wrapper.className.indexOf(
                        'dialog-wrapper-fadein') < 0)
                    this.wrapper.className += ' ' +
                    'dialog-wrapper-fadein';

                if (this.slide && this.main.className.indexOf(
                        'slide-' + this.slide) < 0) {
                    //this.main.className += ' ' + 'slide-' + this.slide;

                    var styles = window.getComputedStyle(
                            document.documentElement, ''),
                        pre = (Array.prototype.slice
                            .call(styles)
                            .join('')
                            .match(/-(moz|webkit|ms)-/) || (
                                styles.OLink === '' && ['', 'o']
                            )
                        )[1];
                    pre = '-' + pre + '-';
                    var myTransform = (('-webkit-moz-ms-o-'.indexOf(pre) >= 0) ? pre : '') +
                        'transform';
                    var myTransition = (('-webkit-moz-ms-o-'.indexOf(pre) >= 0) ? pre : '') +
                        'transition';

                    var xbefore = 0,
                        ybefore = 0;
                    switch (this.slide) {
                        case 'up':
                            xbefore = this._xoffset;
                            ybefore = this._yoffset + this._contentHeight;
                            break;
                        case 'down':
                            xbefore = this._xoffset;
                            ybefore = this._yoffset - this._contentHeight;
                            break;
                        case 'right':
                            xbefore = this._xoffset - this._contentWidth;
                            ybefore = this._yoffset;
                            break;
                        case 'left':
                            xbefore = this._xoffset + this._contentWidth;
                            ybefore = this._yoffset;
                            break;
                        default:

                    }
                    this.main.style.setProperty(myTransform, 'translate(' +
                        xbefore +
                        'px,' + ybefore + 'px)');
                    //console.log('this.main -> transform(' + xbefore + ',' + ybefore + ')');
                    this.main.style.setProperty(myTransition, 'transform ' + this.slideConf);
                    //console.log('this.main -> transition(transform 200ms ease)');

                    window.setTimeout(function() {
                        this.main.style.setProperty(myTransform, 'translate(' +
                            this._xoffset +
                            'px,' + this._yoffset + 'px)');
                        //console.log('this.main -> transform(' + this._xoffset + ',' + this._yoffset + ')');
                    }.bind(this), 10);
                }
            }


            this.wrapper.style.display = 'block';

            if (this.unknown) this.resize();

        }.bind(this), 100);

        var st = this.constructor.Stack;
        for (var i = st.length - 1; i >= 0; i--) {
            if (st[i] == this.timestamp) {
                st.splice(i, 1);
            }
        }
        st.push(this.timestamp);
    },
    hide: function() {
        // restoreScroll {
        // 外部恢复
        if (this._bgLock && this._bodyScrollTop != null) {
            document.body.style.position = this._bodyPosition;
            document.body.style.width = this._bodyWidth;
            document.body.style.top = this._bodyTop;
            document.body.style.left = this._bodyLeft;
            document.body.scrollTop = this._bodyScrollTop;
            document.body.scrollLeft = this._bodyScrollLeft;
            document.body.style.overflow = this._bodyOverflow;
            document.documentElement.style.overflow = this._htmlVisible;
            this._bgLock = false;
        }
        // }

        this.wrapper.style.display = 'none';

        var st = this.constructor.Stack;
        for (var i = st.length - 1; i >= 0; i--) {
            if (st[i] == this.timestamp) {
                st.splice(i, 1);
            }
        }
    },
    remove: function() {
        RemoveEvent(window, 'resize', window[this.id]);
        delete window[this.id];

        this.hide();
        this.wrapper.parentNode.removeChild(this.wrapper);
        this.main = null;
        this.wrapper = null;

        delete this.constructor.Table[this.timestamp];
    },
    close: function() {
        this.stay ? this.hide() : this.remove();
    }
};
Dialog.Table = {};
Dialog.Stack = [];
Dialog.Relay = function() {
    //TODO: 根据Stack中的顺序重新分配z-index
};
Dialog._ListenWinSizeInterval = null;
Dialog._InputFocusCount = 0;
Dialog._WinSize = null;
Dialog.ListenWinSize = function() {
    this._InputFocusCount++;
    if (this._ListenWinSizeInterval) return;
    this._ListenWinSizeInterval = setInterval(function() {
        var newWinSize = GetWinSize();
        //TODO: if changed, callback
        if (this._WinSize != null && (this._WinSize.width != newWinSize.width)) {
            this._WinSize = newWinSize;
            for (var i in this.Table) {
                this.Table[i].resize();
            }
        }
    }.bind(this), 500);
}.bind(Dialog);
Dialog.UnlistenWinSize = function() {
    if (!this._ListenWinSizeInterval) return;
    this._InputFocusCount--;
    if (this._InputFocusCount <= 0) {
        this._InputFocusCount = 0;
        clearInterval(this._ListenWinSizeInterval);
    }
}.bind(Dialog);
Dialog.Create = function(conf) {
    return new(this)(conf);
};
Dialog.Alert = function(text) {
    (new(this)({
        content: text
    })).show();
};

function GetWinSize() {
    var e = window,
        a = 'inner';

    if (!('innerWidth' in window)) {
        a = 'client';
        e = document.documentElement || document.body;
    }

    return {
        width: e[a + 'Width'],
        height: e[a + 'Height']
    };
}

/****************
 * 辅助函数：获取元素的样式值
 * 参考：Jquery 作者 John Resig
 ****************/
function GetStyle(el, name, doc) {
    var _document = doc || document,
        nameWords = name.split('-');
    for (var i = 1, len = nameWords.length; i < len; i++) {
        if (!nameWords[i].length) continue;
        nameWords[i] = nameWords[i].charAt(0).toUpperCase() + nameWords[i].substr(
            1);
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

/****************
 * 辅助函数：事件
 * 参考：Dean Edwards
 ****************/
function AddEvent(element, type, handler) {
    // 为每一个事件处理函数分派一个唯一的ID
    if (!handler.$$guid) handler.$$guid = AddEvent.guid++;
    // 为元素的事件类型创建一个哈希表
    if (!element.events) element.events = {};
    // 为每一个"元素/事件"对创建一个事件处理程序的哈希表
    var handlers = element.events[type];
    if (!handlers) {
        handlers = element.events[type] = {};
        // 存储存在的事件处理函数(如果有)
        if (element["on" + type]) {
            handlers[0] = element["on" + type];
        }
    }
    // 将事件处理函数存入哈希表
    handlers[handler.$$guid] = handler;
    // 指派一个全局的事件处理函数来做所有的工作
    element["on" + type] = HandleEvent;
};
// 用来创建唯一的ID的计数器
AddEvent.guid = 1;

function RemoveEvent(element, type, handler) {
    // 从哈希表中删除事件处理函数
    if (element.events && element.events[type]) {
        delete element.events[type][handler.$$guid];
    }
};

function HandleEvent(event) {
    var returnValue = true;
    // 抓获事件对象(IE使用全局事件对象)
    event = event || FixEvent(window.event);
    // 取得事件处理函数的哈希表的引用
    var handlers = this.events[event.type];
    // 执行每一个处理函数
    for (var i in handlers) {
        this.$$handleEvent = handlers[i];
        if (this.$$handleEvent(event) === false) {
            returnValue = false;
        }
    }
    return returnValue;
};
// 为IE的事件对象添加一些“缺失的”函数
function FixEvent(event) {
    // 添加标准的W3C方法
    event.preventDefault = FixEvent.preventDefault;
    event.stopPropagation = FixEvent.stopPropagation;
    return event;
};
FixEvent.preventDefault = function() {
    this.returnValue = false;
};
FixEvent.stopPropagation = function() {
    this.cancelBubble = true;
};
