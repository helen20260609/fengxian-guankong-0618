/* ============================================================
   theme.js — 主题切换（与 PC 端 data-theme="light|dark" 机制一致）
   PC 端在 index.html / pages/*.html 通过 html[data-theme] 切换；
   本文件实现相同逻辑，并记住用户选择。
   同时兼容 PC 端的 localStorage key "theme"，实现跨端主题同步。
   ============================================================ */
(function () {
    var H5_KEY = 'risk-theme';
    var PC_KEY = 'theme';

    function getSavedTheme() {
        return localStorage.getItem(H5_KEY) || localStorage.getItem(PC_KEY) || 'light';
    }

    var theme = getSavedTheme();
    document.documentElement.setAttribute('data-theme', theme);

    window.toggleTheme = function () {
        var cur = document.documentElement.getAttribute('data-theme');
        var next = cur === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem(H5_KEY, next);
        localStorage.setItem(PC_KEY, next);
    };

    window.setTheme = function (themeName) {
        document.documentElement.setAttribute('data-theme', themeName);
        localStorage.setItem(H5_KEY, themeName);
        localStorage.setItem(PC_KEY, themeName);
    };
})();
