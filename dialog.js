/**
 * 加载依赖文件
 */
(function(filename) {
    var loadExtentFile = function(filename) {
        if (filename instanceof Array) {
            filename.forEach(loadExtentFile);
            return;
        }
        if ('string' != typeof filename) return;

        var el;
        if (filename.length > 3 && filename.lastIndexOf('.js') ==
            filename.length - 3) {
            el = document.createElement('script');
            el.setAttribute('type', 'text/javascript');
            el.setAttribute('src', filename); // 绝对或相对路径
        } else if (filename.length > 4 && filename.lastIndexOf('.css') ==
            filename.length - 4) {
            el = document.createElement('link');
            el.setAttribute('rel', 'stylesheet');
            el.setAttribute('type', 'text/css');
            el.setAttribute('href', filename);
        }
        document.head.appendChild(el);
    };
    loadExtentFile(filename);
})(['./dialog.css']);


/**
 * 辅助函数：轻量级模板引擎
 * 参考 http://krasimirtsonev.com/blog/article/Javascript-template-engine-in-just-20-line
 */
var templateEngine = function(html, options) {
    var re = /{([^}]+)?}/g,
        reExp = /(^( )?(if|for|else|switch|case|break|{|}))(.*)?/g,
        code = 'var r=[];\n',
        cursor = 0,
        match;
    var add = function(line, js) {
        js ? (code += line.match(reExp) ? line + '\n' : 'r.push(' +
                line + ');\n') :
            (code += line != '' ? 'r.push("' + line.replace(/"/g, '\\"') +
                '");\n' : '');
        return add;
    };
    while (match = re.exec(html)) {
        //console.log(match[1]);
        add(html.slice(cursor, match.index))('this.' + match[1], true);
        cursor = match.index + match[0].length;
    }
    add(html.substr(cursor, html.length - cursor));
    code += 'return r.join("");';
    return new Function(code.replace(/[\r\t\n]/g, '')).apply(options);
};

/**
 * 辅助函数：获取元素的样式值
 * 参考 Jquery 作者 John Resig
 */
var getStyle = function(el, name) {
    if (el.style[name]) {
        return el.style[name];
    } else if (el.currentStyle) {
        return el.currentStyle[name];
    } else if (document.defaultView && document.defaultView.getComputedStyle) {
        name = name.replace(/([A-Z])/g, '-$1');
        name = name.toLowerCase();
        var s = document.defaultView.getComputedStyle(el, '');
        return s && s.getPropertyValue(name);
    } else {
        return null;
    }
};


/**
 * Dialog 类
 */
var Dialogger = (function(te, gs) {
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

        // dom 缓存
        this.wrapper = null; // the wrapper node
        this.main = null; // the main body node, 与 wrapper 的存在性同步

        // 修改外部后需要恢复
        this._bodyOverflow = this.constructor.GetStyle(document.body,
            'overflow');

        if (!!conf.autoShow) this.show(); // 创建即显示
    };
    Dialog.prototype = {
        init: function() {
            var el = this.render(this.content, this.style, this
                .id);

            el.onclick = (function(event) {
                if (event.target.className.indexOf(
                        'dialog-wrapper') >= 0 || event
                    .target.className.indexOf(
                        'dialog-docker') >= 0) {
                    if (!this.block) this.close();
                } else if (event.target.className ==
                    'btn-close') {
                    this.close();
                    this.onClose();
                }
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
                this.wrapper = el.getElementsByClassName(this.constructor
                    .WrapClassName)[0];
                this.wrapper.id = id;
                this.wrapper.style.visibility = 'hidden';
                this.wrapper.style.zIndex = this.zIndex;
                if (this.noOverlay) this.wrapper.style.backgroundColor =
                    'rgba(0, 0, 0, 0)';
                this.main = this.wrapper.getElementsByClassName(
                    this.constructor.MainClassName)[0];
                document.body.appendChild(this.wrapper);
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
            document.body.style.overflow = 'hidden';

            return this.wrapper;
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
                console.log('width: ' + this.width +
                    ', height: ' + this.height);
                el.parentNode.setAttribute('class', el.parentNode
                    .getAttribute(
                        'class') + ' dialog-docker-p' +
                    this.position);
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

                this._setOffset(el, null, xy);
            }
        },
        _setOffset: function(el, ds, xy) {
            if (!el) var el = this.main;

            if (!ds) var ds = ['top', 'right', 'bottom', 'left'];
            if (!xy) var xy = [0, 0];
            ds.forEach(function(d) {
                var dv = this.constructor.GetStyle(el,
                    d);
                if (dv == 'auto') return;
                var borderWidth = this.constructor.GetStyle(
                    el, 'border-' + d);
                if (borderWidth.split(' ') < 3) return;
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
            }.bind(this));

            var translateVal = 'translate(' + xy[0] + 'px,' +
                xy[
                    1] + 'px)';
            el.style.transform = translateVal;
            el.style.WebkitTransform = translateVal;
            el.style.MozTransform = translateVal;
            el.style.OTransform = translateVal;
            el.style.msTransform = translateVal;
        },
        show: function() {
            if (!this.wrapper) this.init(); // 如果还没 init 则 init

            this.wrapper.style.display = 'block';
            document.body.style.overflow = 'hidden';
        },
        hide: function() {
            document.body.style.overflow = this._bodyOverflow;
            this.wrapper.style.display = 'none';
        },
        remove: function() {
            this.wrapper.parentNode.removeChild(this.wrapper);
            document.body.style.overflow = this._bodyOverflow;
            this.main = null;
            this.wrapper = null;
        },
        close: function() {
            this.stay ? this.hide() : this.remove();
        }
    };

    /**
     * 静态成员
     */
    Dialog.WrapClassName = 'dialog-wrapper';
    Dialog.MainClassName = 'dialog';
    Dialog.TemplateEngine = te;
    Dialog.Template =
        '<div id="{id}" class="dialog-wrapper"><div class="dialog-docker"><div class="dialog">{content}</div></div></div>';
    Dialog.GetStyle = gs;
    Dialog.Create = function(conf) {
        return new(this)(conf);
    };
    Dialog.Alert = function(text) {
        (new(this)({
            content: text
        })).show();
    };

    return Dialog;
})(templateEngine, getStyle);
