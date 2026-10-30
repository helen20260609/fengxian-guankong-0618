/* =========================================================
 * 第三方服务机构模块 - 统一友好提示组件
 * 替换浏览器原生 alert() / confirm()
 * 用法：
 *   showTip(message[, type][, callback])   type: success | warning | info（不传则按文案自动识别）
 *   showConfirm(message[, detail][, okText]).then(function(ok){ ... })
 *   页面中已有的 alert(...) 调用会自动转为友好提示，无需修改
 * ========================================================= */
(function () {
    if (window.__tpFriendlyTipLoaded) return;
    window.__tpFriendlyTipLoaded = true;

    /* ----- 样式 ----- */
    var css = ''
        + '.tp-tip-overlay{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.45);z-index:999999;display:none;align-items:center;justify-content:center;padding:20px;font-family:\'Microsoft YaHei\',\'PingFang SC\',sans-serif;}'
        + '.tp-tip-overlay.show{display:flex;}'
        + '.tp-tip-box{background:#fff;border-radius:12px;width:100%;max-width:400px;overflow:hidden;box-shadow:0 10px 40px rgba(0,0,0,0.25);animation:tpTipPop .18s ease-out;}'
        + '@keyframes tpTipPop{from{transform:scale(0.92);opacity:0;}to{transform:scale(1);opacity:1;}}'
        + '.tp-tip-body{padding:28px 24px 20px;text-align:center;}'
        + '.tp-tip-icon{width:52px;height:52px;line-height:52px;border-radius:50%;margin:0 auto 14px;font-size:26px;font-weight:700;color:#fff;}'
        + '.tp-tip-icon.success{background:#1e8e3e;}'
        + '.tp-tip-icon.warning{background:#e37400;}'
        + '.tp-tip-icon.info{background:#1a73e8;}'
        + '.tp-tip-message{font-size:15px;color:#202124;line-height:1.7;word-break:break-all;}'
        + '.tp-tip-detail{margin-top:8px;font-size:13px;color:#5f6368;line-height:1.7;word-break:break-all;}'
        + '.tp-tip-footer{padding:0 24px 22px;display:flex;gap:12px;justify-content:center;}'
        + '.tp-tip-btn{min-width:96px;padding:9px 20px;border-radius:8px;font-size:14px;cursor:pointer;border:none;font-family:inherit;transition:all .2s;}'
        + '.tp-tip-btn-primary{background:#1a73e8;color:#fff;}'
        + '.tp-tip-btn-primary:hover{background:#1557b0;}'
        + '.tp-tip-btn-danger{background:#d93025;color:#fff;}'
        + '.tp-tip-btn-danger:hover{background:#b3261e;}'
        + '.tp-tip-btn-plain{background:#f1f3f4;color:#202124;border:1px solid #dadce0;}'
        + '.tp-tip-btn-plain:hover{background:#e8eaed;}'
        + '[data-theme="dark"] .tp-tip-box{background:#112240;}'
        + '[data-theme="dark"] .tp-tip-message{color:#e2e8f0;}'
        + '[data-theme="dark"] .tp-tip-detail{color:#94a3b8;}'
        + '[data-theme="dark"] .tp-tip-btn-plain{background:#1a2f4a;color:#e2e8f0;border-color:#1e3a5f;}'
        + '[data-theme="dark"] .tp-tip-btn-plain:hover{background:#22395a;}';
    var style = document.createElement('style');
    style.type = 'text/css';
    style.appendChild(document.createTextNode(css));
    (document.head || document.documentElement).appendChild(style);

    /* ----- DOM ----- */
    function buildDom() {
        if (document.getElementById('tpTipModal')) return;
        var wrap = document.createElement('div');
        wrap.innerHTML = ''
            + '<div class="tp-tip-overlay" id="tpTipModal">'
            + '  <div class="tp-tip-box" role="dialog">'
            + '    <div class="tp-tip-body">'
            + '      <div class="tp-tip-icon info" id="tpTipIcon">i</div>'
            + '      <div class="tp-tip-message" id="tpTipMessage"></div>'
            + '    </div>'
            + '    <div class="tp-tip-footer"><button type="button" class="tp-tip-btn tp-tip-btn-primary" id="tpTipOkBtn">确 定</button></div>'
            + '  </div>'
            + '</div>'
            + '<div class="tp-tip-overlay" id="tpConfirmModal">'
            + '  <div class="tp-tip-box" role="dialog">'
            + '    <div class="tp-tip-body">'
            + '      <div class="tp-tip-icon warning">!</div>'
            + '      <div class="tp-tip-message" id="tpConfirmMessage" style="font-weight:600;"></div>'
            + '      <div class="tp-tip-detail" id="tpConfirmDetail" style="display:none;"></div>'
            + '    </div>'
            + '    <div class="tp-tip-footer">'
            + '      <button type="button" class="tp-tip-btn tp-tip-btn-plain" id="tpConfirmCancelBtn">取 消</button>'
            + '      <button type="button" class="tp-tip-btn tp-tip-btn-danger" id="tpConfirmOkBtn">确 定</button>'
            + '    </div>'
            + '  </div>'
            + '</div>';
        while (wrap.firstChild) document.body.appendChild(wrap.firstChild);

        document.getElementById('tpTipOkBtn').onclick = function () { window.closeTip(); };
        document.getElementById('tpConfirmCancelBtn').onclick = function () { window.closeConfirmModal(false); };
        document.getElementById('tpConfirmOkBtn').onclick = function () { window.closeConfirmModal(true); };
    }
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', buildDom);
    } else {
        buildDom();
    }

    /* ----- 提示框 ----- */
    var tipCallback = null;
    window.showTip = function (message, type, callback) {
        message = String(message == null ? '' : message);
        if (!type) {
            if (/成功|已提交|已保存|已导入|已删除|已通过|完成|已发送|已生成/.test(message)) type = 'success';
            else if (/请|暂无|不能|没有|尚未|失败|异常|错误|不可|不能|超过|至少/.test(message)) type = 'warning';
            else type = 'info';
        }
        var iconMap = { success: '✓', warning: '!', info: 'i' };
        var icon = document.getElementById('tpTipIcon');
        icon.className = 'tp-tip-icon ' + type;
        icon.textContent = iconMap[type] || iconMap.info;
        document.getElementById('tpTipMessage').textContent = message;
        tipCallback = callback || null;
        document.getElementById('tpTipModal').classList.add('show');
    };
    window.closeTip = function () {
        document.getElementById('tpTipModal').classList.remove('show');
        if (tipCallback) { var cb = tipCallback; tipCallback = null; cb(); }
    };
    window.alert = function (msg) { window.showTip(msg); };

    /* ----- 确认框 ----- */
    var confirmResolve = null;
    window.showConfirm = function (message, detail, okText, danger) {
        return new Promise(function (resolve) {
            document.getElementById('tpConfirmMessage').textContent = String(message == null ? '' : message);
            var d = document.getElementById('tpConfirmDetail');
            if (detail) { d.textContent = String(detail); d.style.display = 'block'; }
            else { d.style.display = 'none'; }
            var okBtn = document.getElementById('tpConfirmOkBtn');
            okBtn.textContent = okText || '确 定';
            okBtn.className = 'tp-tip-btn ' + (danger === false ? 'tp-tip-btn-primary' : 'tp-tip-btn-danger');
            confirmResolve = resolve;
            document.getElementById('tpConfirmModal').classList.add('show');
        });
    };
    window.closeConfirmModal = function (result) {
        document.getElementById('tpConfirmModal').classList.remove('show');
        if (confirmResolve) { var r = confirmResolve; confirmResolve = null; r(!!result); }
    };
})();
