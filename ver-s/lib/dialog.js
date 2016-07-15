/****************
 * HACK: 数组 forEach
 ****************/
(function() {
    if (!Array.prototype.forEach) {
        Array.prototype.forEach = function(fun /*, thisp*/ ) {
            var len = this.length;
            if (typeof fun != "function")
                throw new TypeError();

            var thisp = arguments[1];
            for (var i = 0; i < len; i++) {
                if (i in this)
                    fun.call(thisp, this[i], i, this);
            }
        };
    }
})();

/****************
 * HACK: 函数 bind
 * 参考 https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Function/bind
 ****************/
(function() {
    if (!Function.prototype.bind) {
        Function.prototype.bind = function(oThis) {
            if (typeof this !== 'function') {
                // closest thing possible to the ECMAScript 5
                // internal IsCallable function
                throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
            }

            var aArgs = Array.prototype.slice.call(arguments, 1),
                fToBind = this,
                fNOP = function() {},
                fBound = function() {
                    return fToBind.apply(this instanceof fNOP && oThis ? this : oThis,
                        aArgs.concat(Array.prototype.slice.call(arguments)));
                };

            fNOP.prototype = this.prototype;
            fBound.prototype = new fNOP();

            return fBound;
        };
    }
})();

/****************
 * Dialog 类
 ****************/
var Dialog = function(conf) {
    this.constructor = Dialog;
    this.id = 'Dialog_' + (new Date().getTime()).toString(); // 时间戳

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

    this.insideFrame = false; // 是否在 iframe 里

    // dom 缓存
    this.wrapper = null; // the wrapper node
    this.main = null; // the main body node, 与 wrapper 的存在性同步

    // 修改外部后需要恢复
    this._bodyOverflow = this.constructor.GetStyle(document.body,
        'overflow');
    this._frameVisible = this.constructor.Visible();
    this._htmlVisible = document.documentElement.style.overflow;

    this.constructor.FrameDoc(this.parentEl);

    if (!!conf.autoShow) this.show(); // 创建即显示
};
Dialog.prototype = {
    init: function() {
        var el = this.render(this.content, this.style, this
            .id);

        el.onclick = (function(event) {
            event = event ? event : window.event;

            var obj = event.srcElement ? event.srcElement : event.target;
            if (obj.className.indexOf(
                    'dialog-wrapper') >= 0 || obj.className.indexOf(
                    'dialog-docker') >= 0) {
                if (!this.block) {
                    this.close();
                    this.onClose();
                }
            } else if (obj.className.indexOf(
                    'btn-close') >= 0) {
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
            if (this.main) this.main.parentNode.removeChild(
                this.main);
            if (this.wrapper) this.wrapper.parentNode.removeChild(
                this.wrapper);
            this.main = null;
            this.wrapper = null;
            var el = document.createElement('div');
            el.innerHTML = this.constructor.Template;
            this.wrapper = this.constructor.GetElementsByClassName(this.constructor
                .WrapClassName, null, el)[0];
            this.wrapper.id = id;
            this.wrapper.style.visibility = 'hidden';
            this.wrapper.style.zIndex = this.zIndex;
            if (this.noOverlay) this.wrapper.className += ' ' + this.wrapper.className + '-noOverlay';
            this.main = this.constructor.GetElementsByClassName(
                this.constructor.MainClassName, null, this.wrapper)[0];
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
    _disableScroll: function() {
        //console.log('disableScroll');
        function setStyle(el, strCss){
            function endsWith(str, suffix) {
                var l = str.length - suffix.length;
                return l >= 0 && str.indexOf(suffix, l) == l;
            }
            var sty = el.style,
            cssText = sty.cssText;
            if(!endsWith(cssText, ';')){
                cssText += ';';
            }
            sty.cssText = cssText + strCss;
        }
        this.constructor.Visible(true);
        setStyle(document.documentElement, 'overflow: visible !important;');
        document.body.style.overflow = 'hidden';
    },
    _restoreScroll: function() {
        //console.log('restoreScroll');
        //console.log('frameVisible: ' + this._frameVisible);
        this.constructor.Visible(this._frameVisible);
        document.body.style.overflow = this._bodyOverflow;
        document.documentElement.style.overflow = this._htmlVisible;
    },
    _setLayout: function(el) {
        if (!el) var el = this.main;

        if (this.fullscreen) {
            this.width = '100%';
            this.height = '100%';
            this.position = 0;
        }

        if (this.position >= 0 && this.position <= 9) {
            el.style.width = this.width;
            el.style.height = this.height;
            //console.log('width: ' + this.width + ', height: ' + this.height);
            el.parentNode.className = el.parentNode
                .className + ' dialog-docker-p' +
                this.position;
            el.parentNode.style.width = this.width;
            el.parentNode.style.height = this.height;
            el.style.width = '100%';
            if (this.height != 'auto') el.style.height =
                '100%';

            if (this.position == 5) {
                if ('string' == typeof this.top && this.top
                    .charAt(this.top.length - 1) == '%') {
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
    _setOffset: function(el, ds) {
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
            ds.forEach(function(d) {
                var dv = this.constructor.GetStyle(el, d);
                //console.log('d: ' + d);
                //console.log('value of ' + d + ': ' + dv);
                if (dv == 'auto') return;
                var borderWidth = this.constructor.GetStyle(
                    el, 'border-' + d + '-width');
                //console.log('borderWidth: ' + borderWidth);
                //if (borderWidth.split(' ') < 3) return;
                borderWidth = borderWidth.split(' ')[0];
                if (borderWidth.lastIndexOf('px') !=
                    borderWidth.length - 2) return;
                borderWidth = parseFloat(borderWidth.substring(
                    0, borderWidth.length - 2));
                //console.log('borderWidth parsed: ' + borderWidth);
                if (d == 'top') {
                    xy[1] -= borderWidth;
                } else if (d == 'right') {
                    xy[0] += borderWidth;
                } else if (d == 'bottom') {
                    xy[1] += borderWidth;
                } else if (d == 'left') {
                    xy[0] -= borderWidth;
                }
            }.bind(this));
        }

        var translateVal = 'translate(' + xy[0] + 'px,' +
            xy[1] + 'px)';
        el.style.transform = translateVal;
        el.style.WebkitTransform = translateVal;
        el.style.MozTransform = translateVal;
        el.style.OTransform = translateVal;
        el.style.msTransform = translateVal;

        var ieVer = this.constructor.IEVersionCheck();
        if (ieVer > 0 && ieVer <= 8) {
            if (ieVer < 8) {
                el.setAttribute('style', el.getAttribute('style') + ';filter: progid:DXImageTransform.Microsoft.Matrix(M11=1,M12=0,M21=0,M22=1,SizingMethod=\'auto expand\')');
            } else {
                el.setAttribute('style', el.getAttribute('style') + ';-ms-filter: "progid:DXImageTransform.Microsoft.Matrix(M11=1, M12=0, M21=0, M22=1, SizingMethod=\'auto expand\')"');
            }
            if (this.constructor.GetStyle(el, 'top') != 'auto') el.style.marginTop = xy[1] + 'px';
            else el.style.bottom = -xy[1] + 'px';
            if (this.constructor.GetStyle(el, 'left') != 'auto') el.style.marginLeft = xy[0] + 'px';
            else el.style.right = -xy[0] + 'px';
        }
    },
    show: function() {
        if (!this.wrapper) this.init(); // 如果还没 init 则 init
        else {
            this.wrapper.style.display = 'block';
            this._disableScroll();
        }
    },
    hide: function() {
        this._restoreScroll();
        this.wrapper.style.display = 'none';
    },
    remove: function() {
        this.wrapper.parentNode.removeChild(this.wrapper);
        this._restoreScroll();
        this.main = null;
        this.wrapper = null;
    },
    close: function() {
        this.stay ? this.hide() : this.remove();
    }
};

/****************
 * 静态成员
 ****************/
Dialog.WrapClassName = 'dialog-wrapper';
Dialog.MainClassName = 'dialog';
/*
 * getElementsByClassName 兼容
 * Developed by Robert Nyman, http://www.robertnyman.com
 * Code/licensing: http://code.google.com/p/getelementsbyclassname/
 */
Dialog.GetElementsByClassName = function(className, tag, elm) {
    if (document.getElementsByClassName) {
        _getElementsByClassName = function(className, tag, elm) {
            var _document = document;
            elm = elm || _document;
            var elements = elm.getElementsByClassName(className),
                nodeName = (tag) ? new RegExp("\\b" + tag + "\\b", "i") : null,
                returnElements = [],
                current;
            for (var i = 0, il = elements.length; i < il; i += 1) {
                current = elements[i];
                if (!nodeName || nodeName.test(current.nodeName)) {
                    returnElements.push(current);
                }
            }
            return returnElements;
        };
    } else if (document.evaluate) {
        _getElementsByClassName = function(className, tag, elm) {
            tag = tag || "*";
            var _document = document;
            elm = elm || _document;
            var classes = className.split(" "),
                classesToCheck = "",
                xhtmlNamespace = "http://www.w3.org/1999/xhtml",
                namespaceResolver = (_document.documentElement.namespaceURI === xhtmlNamespace) ? xhtmlNamespace : null,
                returnElements = [],
                elements,
                node;
            for (var j = 0, jl = classes.length; j < jl; j += 1) {
                classesToCheck += "[contains(concat(' ', @class, ' '), ' " + classes[j] + " ')]";
            }
            try {
                elements = _document.evaluate(".//" + tag + classesToCheck, elm, namespaceResolver, 0, null);
            } catch (e) {
                elements = _document.evaluate(".//" + tag + classesToCheck, elm, null, 0, null);
            }
            while ((node = elements.iterateNext())) {
                returnElements.push(node);
            }
            return returnElements;
        };
    } else {
        _getElementsByClassName = function(className, tag, elm) {
            tag = tag || "*";
            var _document = document;
            elm = elm || _document;
            var classes = className.split(" "),
                classesToCheck = [],
                elements = (tag === "*" && elm.all) ? elm.all : elm.getElementsByTagName(tag),
                current,
                returnElements = [],
                match;
            for (var k = 0, kl = classes.length; k < kl; k += 1) {
                classesToCheck.push(new RegExp("(^|\\s)" + classes[k] + "(\\s|$)"));
            }
            for (var l = 0, ll = elements.length; l < ll; l += 1) {
                current = elements[l];
                match = false;
                for (var m = 0, ml = classesToCheck.length; m < ml; m += 1) {
                    match = classesToCheck[m].test(current.className);
                    if (!match) {
                        break;
                    }
                }
                if (match) {
                    returnElements.push(current);
                }
            }
            return returnElements;
        };
    }
    return _getElementsByClassName(className, tag, elm);
};
Dialog._FrameId = null;
Dialog.FrameWin = function() {
    var iframe = document.getElementById(this._FrameId);
    return iframe.contentWindow || iframe;
};
Dialog.FrameDoc = function(parentEl, cssPath) {
    if (!(parentEl || document.body)) return null;
    //var doc = null;//20160715
    if (!this._FrameId) {
        this._FrameId = 'DialogFrame_' + (new Date().getTime()).toString(); // 时间戳

        var iframe = document.createElement('iframe');
        iframe.id = this._FrameId;
        iframe.setAttribute('frameBorder', '0');
        iframe.setAttribute('scrolling', 'no');
        iframe.setAttribute('width', '100%');
        iframe.setAttribute('allowTransparency', 'true');

        iframe.style.position = 'fixed';
        iframe.style.top = '0';
        iframe.style.left = '0';
        iframe.style.width = '100%';
        iframe.style.height = '100%';
        iframe.style.zoom = '1';
        iframe.style.zIndex = '2147483647';
        iframe.style.minHeight = '0';
        iframe.style.background = 'none';
        iframe.style.display = 'none';
        //iframe.style.visibility = 'hidden';

        (parentEl || document.body).appendChild(iframe);

        //doc = iframe.contentDocument || document.frames[this._FrameId].document;//20160715
        //doc.write('<!doctype html><html><head></head><body></body></html>');//20160715
    }
};
Dialog.Template =
    '<div id="{id}" class="dialog-wrapper"><div class="dialog-docker"><div class="dialog">{content}</div></div></div>';

/****************
 * 辅助函数：获取元素的样式值
 * 参考 Jquery 作者 John Resig
 ****************/
Dialog.GetStyle = function(el, name, doc) {
    var _document = doc || document;
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
};
Dialog.Create = function(conf) {
    return new(this)(conf);
};
Dialog.Visible = function(v) {
    if (!arguments.length) return this._FrameId
        && this.GetStyle(document.getElementById(this._FrameId), 'display') != 'none';
        //&& this.GetStyle(document.getElementById(this._FrameId), 'visibility') != 'hidden';
    if (v) this._ShowFrame();
    else this._HideFrame();
};
Dialog.Alert = function(text) {
    (new(this)({
        content: text
    })).show();
};
Dialog.Init = function(parentEl, cssPath) {
    if (cssPath) {
        var cssLink = document.createElement('link');
        cssLink.href = cssPath || './dialog.css';
        cssLink.rel = 'stylesheet';
        cssLink.type = 'text/css';
        (document.head || document.getElementsByTagName('head')[0]).appendChild(cssLink);
    }

    if (document.readyState === 'complete')
        this.FrameDoc(parentEl, cssPath);

    (function(dlg, p, s) {
        var initFunc = function() {
            dlg.FrameDoc(p, s);
        };
        if (window.addEventListener)
            window.addEventListener('load', initFunc, false);
        else if (window.attachEvent)
            window.attachEvent('onload', initFunc);
        else window.onload = initFunc;

        //console.log('event bind');
    })(this, parentEl, cssPath);
};
Dialog._ShowFrame = function() {
    if (!this._FrameId) return;
    document.getElementById(this._FrameId).style.display = 'block';
    //document.getElementById(this._FrameId).style.visibility = 'visible';
};
Dialog._HideFrame = function() {
    if (!this._FrameId) return;
    document.getElementById(this._FrameId).style.display = 'none';
    //document.getElementById(this._FrameId).style.visibility = 'hidden';
};
Dialog.IEVersionCheck = function() {
    var userAgent = navigator.userAgent;
    var ie = (!!window.ActiveXObject || "ActiveXObject" in window) || (userAgent.indexOf("compatible") >= 0 && userAgent.indexOf("MSIE") > -1 && userAgent.indexOf("Opera") < 0);
    if (!ie) return -1;

    var re = new RegExp("MSIE (\\d+\\.\\d+);");
    re.test(userAgent);
    var fIEVersion = parseFloat(RegExp["$1"]);
    if (fIEVersion < 6) return 5;
    if (fIEVersion < 7) return 6;
    if (fIEVersion < 8) return 7;
    if (fIEVersion < 9) return 8;
    if (fIEVersion < 10) return 9;
    if (fIEVersion < 11) return 10;
    return 11;
};

Dialog.Init();
