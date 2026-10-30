/* ===== 统一友好弹窗（替代浏览器原生 alert/confirm） =====
 * 引入本文件后：
 *   alert(msg)                 —— 自动以友好样式弹窗呈现（覆盖原生）
 *   uiAlert(msg, opts)         —— 提示框，返回 Promise
 *   uiConfirm(msg, opts)       —— 确认框，返回 Promise<boolean>
 * opts: { title, type: info|success|warning|danger, okText, cancelText, danger }
 */
(function () {
    var ICONS = {
        info: 'fa-circle-info',
        success: 'fa-circle-check',
        warning: 'fa-triangle-exclamation',
        danger: 'fa-circle-xmark',
        question: 'fa-circle-question'
    };

    function build(opts) {
        var mask = document.createElement('div');
        mask.className = 'ui-modal-mask';
        mask.innerHTML =
            '<div class="ui-modal-box">' +
                '<div class="ui-modal-head">' +
                    '<div class="ui-modal-icon ' + opts.type + '"><i class="fas ' + (ICONS[opts.type] || ICONS.info) + '"></i></div>' +
                    '<div class="ui-modal-title">' + opts.title + '</div>' +
                '</div>' +
                '<div class="ui-modal-body"></div>' +
                '<div class="ui-modal-foot"></div>' +
            '</div>';
        mask.querySelector('.ui-modal-body').textContent = opts.message;
        return mask;
    }

    function open(mask) {
        document.body.appendChild(mask);
        requestAnimationFrame(function () { mask.classList.add('ui-modal-show'); });
    }

    function close(mask, cb) {
        mask.classList.remove('ui-modal-show');
        setTimeout(function () { mask.remove(); if (cb) cb(); }, 180);
    }

    function uiAlert(message, opts) {
        opts = opts || {};
        return new Promise(function (resolve) {
            var mask = build({
                type: opts.type || 'info',
                title: opts.title || '提示',
                message: String(message == null ? '' : message)
            });
            var foot = mask.querySelector('.ui-modal-foot');
            var ok = document.createElement('button');
            ok.className = 'ui-modal-btn primary' + (opts.type === 'danger' ? ' danger' : '');
            ok.textContent = opts.okText || '确 定';
            ok.onclick = function () { close(mask, resolve); };
            foot.appendChild(ok);
            open(mask);
            ok.focus();
            mask.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === 'Escape') ok.click(); });
        });
    }

    function uiConfirm(message, opts) {
        opts = opts || {};
        return new Promise(function (resolve) {
            var mask = build({
                type: 'question',
                title: opts.title || '确认操作',
                message: String(message == null ? '' : message)
            });
            var foot = mask.querySelector('.ui-modal-foot');
            var cancel = document.createElement('button');
            cancel.className = 'ui-modal-btn ghost';
            cancel.textContent = opts.cancelText || '取 消';
            cancel.onclick = function () { close(mask, function () { resolve(false); }); };
            var ok = document.createElement('button');
            ok.className = 'ui-modal-btn primary' + (opts.danger ? ' danger' : '');
            ok.textContent = opts.okText || '确 定';
            ok.onclick = function () { close(mask, function () { resolve(true); }); };
            foot.appendChild(cancel);
            foot.appendChild(ok);
            open(mask);
            ok.focus();
            mask.addEventListener('keydown', function (e) { if (e.key === 'Escape') cancel.click(); });
        });
    }

    window.uiAlert = uiAlert;
    window.uiConfirm = uiConfirm;
    // 覆盖原生 alert：项目中所有 alert(...) 自动变为统一样式弹窗
    window.alert = uiAlert;
})();
