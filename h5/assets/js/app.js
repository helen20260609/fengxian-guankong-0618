/* ============================================================
   app.js — H5 小程序共享框架
   提供：底部 Tab Bar 渲染、顶部导航栏、吐司、加载、页面跳转、
         全局状态、日期格式化等能力。
   ============================================================ */
(function () {
    'use strict';

    var TAB_CONFIG = {
        public: [
            { id: 'home', icon: 'fa-house', label: '首页', href: 'index.html', root: true },
            { id: 'mine', icon: 'fa-user', label: '我的', href: 'pages/mine.html', root: false }
        ],
        default: [
            { id: 'home', icon: 'fa-house', label: '首页', href: 'index.html', root: true },
            { id: 'workspace', icon: 'fa-table-cells-large', label: '工作台', href: 'pages/workspace.html', root: false },
            { id: 'messages', icon: 'fa-comment-dots', label: '消息', href: 'pages/messages.html', root: false },
            { id: 'mine', icon: 'fa-user', label: '我的', href: 'pages/mine.html', root: false }
        ]
    };

    // 管理人员常用应用预定义池
    var MANAGER_APP_POOL = [
        { id: 'todo', icon: 'fa-list-check', label: '待办事项', href: 'pages/inspection-tasks.html' },
        { id: 'inspection-tasks', icon: 'fa-clipboard-check', label: '巡查任务', href: 'pages/inspection-domains.html' },
        { id: 'risk-list', icon: 'fa-book-open', label: '风险清单', href: 'pages/risk-list.html' },
        { id: 'hidden-danger-list', icon: 'fa-triangle-exclamation', label: '隐患管理', href: 'pages/hidden-danger-list.html' },
        { id: 'monitoring', icon: 'fa-tower-broadcast', label: '实时监测', href: 'pages/monitoring.html' },
        { id: 'warning-center', icon: 'fa-bell', label: '预警中心', href: 'pages/warning-center.html' },
        { id: 'real-time-release', icon: 'fa-bullhorn', label: '实时发布', href: 'pages/real-time-release.html' },
        { id: 'decision-info', icon: 'fa-sitemap', label: '辅助决策', href: 'pages/decision-info.html' },
        { id: 'event-display', icon: 'fa-chart-column', label: '事件分类', href: 'pages/event-display.html' },
        { id: 'score-evaluation', icon: 'fa-star-half-stroke', label: '分数评价', href: 'pages/score-evaluation.html' },
        { id: 'assessment', icon: 'fa-chart-pie', label: '评估分析', href: 'pages/assessment.html' },
        { id: 'one-map', icon: 'fa-map', label: '一张图', href: 'pages/one-map.html' },
        { id: 'report-generation', icon: 'fa-file-lines', label: '报告生成', href: 'pages/report-generation.html' },
        { id: 'patrol-track', icon: 'fa-route', label: '巡查轨迹', href: 'pages/patrol-track.html' },
        { id: 'key-guarantee', icon: 'fa-shield-halved', label: '重点保障区域', href: 'pages/h5-key-guarantee-list.html' },
        { id: 'route-plan', icon: 'fa-map-location-dot', label: '路线规划', href: 'pages/route-plan.html' },
        { id: 'online-inspection', icon: 'fa-person-walking-arrow-right', label: '在线排查', href: 'pages/online-inspection.html' },
        { id: 'contacts', icon: 'fa-address-book', label: '通讯录', href: 'pages/contacts.html' },
        { id: 'messages', icon: 'fa-comment-dots', label: '消息中心', href: 'pages/messages.html' },
        { id: 'snap-report', icon: 'fa-camera', label: '随手拍', href: 'pages/snap-report.html' },
        { id: 'emergency-leadership', icon: 'fa-users', label: '应急领导小组', href: 'pages/emergency-leadership-list.html' },
        { id: 'personnel-transfer', icon: 'fa-people-roof', label: '人员转移安置', href: 'pages/personnel-transfer-list.html' },
        { id: 'disaster-management', icon: 'fa-house-crack', label: '灾情管理', href: 'pages/disaster-management-list.html' },
        { id: 'knowledge-flood-typhoon', icon: 'fa-cloud-showers-heavy', label: '防汛防台', href: 'pages/knowledge-flood-typhoon.html' },
        { id: 'gas-monitor-list', icon: 'fa-tower-broadcast', label: '风险隐患监测', href: 'pages/gas-monitor-list.html' }
    ];

    // 巡查人员首页常用功能预定义池
    var INSPECTOR_APP_POOL = [
        { id: 'todo', icon: 'fa-list-check', label: '巡查任务', href: 'pages/rural-patrol-mission.html' },
        { id: 'patrol', icon: 'fa-person-walking', label: '进入巡查', href: 'pages/inspection-execute.html' },
        { id: 'route-plan', icon: 'fa-map-location-dot', label: '路线规划', href: 'pages/route-plan.html' },
        { id: 'patrol-track', icon: 'fa-route', label: '巡查轨迹', href: 'pages/patrol-track.html' },
        { id: 'warning', icon: 'fa-bell', label: '预警信息', href: 'pages/warning-center.html' },
        { id: 'region', icon: 'fa-map-location-dot', label: '管辖区域', href: 'pages/region-management.html' },
        { id: 'risk', icon: 'fa-book-open', label: '风险清单', href: 'pages/risk-list.html' },
        { id: 'review-2026', icon: 'fa-rotate-left', label: '2026回头看', href: 'pages/review-2026.html' },
        { id: 'key-guarantee', icon: 'fa-shield-halved', label: '重点保障区域', href: 'pages/h5-key-guarantee-list.html' },
        { id: 'danger-report', icon: 'fa-triangle-exclamation', label: '隐患上报', href: 'pages/hidden-danger-manage.html' },
        { id: 'emergency-leadership', icon: 'fa-users', label: '应急领导小组', href: 'pages/emergency-leadership-list.html' },
        { id: 'personnel-transfer', icon: 'fa-people-roof', label: '人员转移安置', href: 'pages/personnel-transfer-list.html' },
        { id: 'disaster-management', icon: 'fa-house-crack', label: '灾情管理', href: 'pages/disaster-management-list.html' },
        { id: 'feedback-center', icon: 'fa-comments', label: '反馈中心', href: 'pages/feedback-center.html' },
        { id: 'online-inspection', icon: 'fa-person-walking-arrow-right', label: '在线排查', href: 'pages/online-inspection.html' },
        { id: 'real-time-release', icon: 'fa-bullhorn', label: '实时发布', href: 'pages/real-time-release.html' },
        { id: 'knowledge', icon: 'fa-scale-balanced', label: '知识栏目', href: 'pages/knowledge-laws.html' },
        { id: 'inspection-tasks', icon: 'fa-clipboard-list', label: '巡查任务', href: 'pages/gas-patrol-mission.html' },
        { id: 'monitoring', icon: 'fa-tower-broadcast', label: '监测要素', href: 'pages/monitoring.html' },
        { id: 'contacts', icon: 'fa-address-book', label: '通讯录', href: 'pages/contacts.html' },
        { id: 'messages', icon: 'fa-comment-dots', label: '消息中心', href: 'pages/messages.html' },
        { id: 'snap-report', icon: 'fa-camera', label: '随手拍', href: 'pages/snap-report.html' },
        { id: 'hidden-danger-list', icon: 'fa-triangle-exclamation', label: '隐患管理', href: 'pages/hidden-danger-list.html' },
        { id: 'assessment', icon: 'fa-chart-pie', label: '评估分析', href: 'pages/assessment.html' },
        { id: 'gas-monitor-list', icon: 'fa-tower-broadcast', label: '风险隐患监测', href: 'pages/gas-monitor-list.html' }
    ];
    var INSPECTOR_HOME_DEFAULT = ['todo', 'danger-report', 'warning', 'region', 'risk', 'review-2026'];

    // 企业人员首页常用功能预定义池
    var ENTERPRISE_APP_POOL = [
        { id: 'danger-report', icon: 'fa-triangle-exclamation', label: '隐患上报', href: 'pages/hidden-danger-report.html' },
        { id: 'rectify-feedback', icon: 'fa-reply', label: '整改反馈', href: 'pages/hidden-danger-list.html' },
        { id: 'self-inspect', icon: 'fa-clipboard-check', label: '自查填报', href: 'pages/inspection-execute.html' },
        { id: 'risk-list', icon: 'fa-book-open', label: '风险清单', href: 'pages/risk-list.html' },
        { id: 'knowledge', icon: 'fa-book-open-reader', label: '知识栏目', href: 'pages/knowledge-laws.html' },
        { id: 'snap-report', icon: 'fa-camera', label: '随手拍', href: 'pages/snap-report.html' },
        { id: 'monitoring', icon: 'fa-tower-broadcast', label: '实时监测', href: 'pages/monitoring.html' },
        { id: 'warning-center', icon: 'fa-bell', label: '预警中心', href: 'pages/warning-center.html' },
        { id: 'one-map', icon: 'fa-map', label: '一张图', href: 'pages/one-map.html' },
        { id: 'contacts', icon: 'fa-address-book', label: '通讯录', href: 'pages/contacts.html' },
        { id: 'messages', icon: 'fa-comment-dots', label: '消息中心', href: 'pages/messages.html' },
        { id: 'report-generation', icon: 'fa-file-lines', label: '报告生成', href: 'pages/report-generation.html' },
        { id: 'my-feedback', icon: 'fa-comments', label: '我的反馈', href: 'pages/my-feedback.html' }
    ];
    // 默认常用应用：隐患上报、整改反馈、自查填报、风险清单、知识栏目
    var ENTERPRISE_HOME_DEFAULT = ['danger-report', 'rectify-feedback', 'self-inspect', 'risk-list', 'knowledge'];

    var App = {
        role: localStorage.getItem('risk-role') || DataStore.user.role || 'public',
        // inspector / manager / enterprise / public
        state: {
            todo: 12,
            warning: 3,
            inspection: 8,
            unread: 5,
            approval: 3
        },
        setRole: function (role) {
            App.role = role;
            localStorage.setItem('risk-role', role);
            App.syncCurrentUser();
        },
        // 按当前角色同步用户档案（姓名/单位/头像/角色标签），切换角色后随之变化
        syncCurrentUser: function (role) {
            var r = role || App.role;
            var profile = DataStore.usersByRole && DataStore.usersByRole[r];
            if (!profile || !DataStore.user) return;
            DataStore.user.name = profile.name;
            DataStore.user.role = r;
            DataStore.user.roleLabel = DataStore.roleLabels[r] || '普通用户';
            DataStore.user.org = profile.org;
            if (profile.avatar) DataStore.user.avatar = profile.avatar;
        },
        getRoleLabel: function (role) {
            var r = role || App.role;
            return DataStore.roleLabels[r] || '普通用户';
        },
        isPublic: function () { return App.role === 'public'; },
        isManager: function () { return App.role === 'manager'; },
        isInspector: function () { return App.role === 'inspector'; },
        isEnterprise: function () { return App.role === 'enterprise'; },
        go: function (url) {
            window.location.href = App.resolveHref(url);
        },
        back: function () {
            if (window.history.length > 1) {
                window.history.back();
            } else {
                App.go('index.html');
            }
        },
        formatDistance: function (meters) {
            if (meters === undefined || meters === null) return '--';
            if (meters < 1000) return Math.round(meters) + ' m';
            return (meters / 1000).toFixed(2) + ' km';
        },
        formatDuration: function (minutes) {
            if (minutes === undefined || minutes === null) return '--';
            if (minutes < 60) return minutes + ' 分钟';
            var h = Math.floor(minutes / 60);
            var m = minutes % 60;
            return h + ' 小时' + (m > 0 ? m + ' 分钟' : '');
        },
        // 模拟 GPS 定位（Promise）
        getLocation: function () {
            return new Promise(function (resolve) {
                setTimeout(function () {
                    resolve({
                        lat: 30.9123,
                        lng: 121.4726,
                        address: '上海市奉贤区南桥镇解放路 123 号',
                        accuracy: 12
                    });
                }, 800);
            });
        },
        // 模拟拍照（返回 base64 占位图）
        takePhoto: function () {
            return Promise.resolve('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgZmlsbD0iIzMzNzNkYyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjE0IiBmaWxsPSIjZmZmIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+5Yqg6L295a6a5pmvPC90ZXh0Pjwvc3ZnPg==');
        },
        // 模拟录像
        recordVideo: function () {
            return Promise.resolve({ url: 'data:video/mp4;base64,', duration: 5, poster: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgZmlsbD0iI2U1NDM0MyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjE0IiBmaWxsPSIjZmZmIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+5Yqg6L296aaZ6JWJPC90ZXh0Pjwvc3ZnPg==' });
        },
        // 模拟录音
        recordAudio: function () {
            return Promise.resolve({ url: 'data:audio/mp3;base64,', duration: 8 });
        },
        // 确认对话框
        confirm: function (msg, onOk, onCancel) {
            var mask = document.createElement('div');
            mask.className = 'modal-mask show';
            mask.innerHTML = '<div class="modal-sheet" style="padding:20px;text-align:center">' +
                '<div style="font-size:16px;font-weight:700;margin-bottom:8px">确认</div>' +
                '<div style="font-size:14px;color:var(--text-secondary);margin-bottom:20px">' + App.escapeHtml(msg) + '</div>' +
                '<div style="display:flex;gap:10px">' +
                    '<button class="btn btn-outline" style="flex:1" id="appConfirmCancel">取消</button>' +
                    '<button class="btn btn-primary" style="flex:1" id="appConfirmOk">确定</button>' +
                '</div>' +
            '</div>';
            _mountShell().appendChild(mask);
            function close() {
                if (mask.parentNode) mask.remove();
            }
            document.getElementById('appConfirmOk').addEventListener('click', function () {
                close();
                if (typeof onOk === 'function') onOk();
            });
            document.getElementById('appConfirmCancel').addEventListener('click', function () {
                close();
                if (typeof onCancel === 'function') onCancel();
            });
            mask.addEventListener('click', function (e) {
                if (e.target === mask) {
                    close();
                    if (typeof onCancel === 'function') onCancel();
                }
            });
        },

        // 防抖
        debounce: function (fn, delay) {
            var timer = null;
            return function () {
                var context = this, args = arguments;
                clearTimeout(timer);
                timer = setTimeout(function () {
                    fn.apply(context, args);
                }, delay || 300);
            };
        },

        // 表单校验
        validateForm: function (fields, formSelector) {
            var valid = true;
            var errors = [];
            var form = formSelector ? document.querySelector(formSelector) : document;
            fields.forEach(function (f) {
                var el = form.querySelector('#' + f.id);
                var msgEl = form.querySelector('#' + f.id + 'Error');
                if (!el) return;
                var value = el.value.trim();
                var error = '';
                (f.rules || []).forEach(function (rule) {
                    if (error) return;
                    if (rule === 'required' && !value) error = '请填写' + f.name;
                    if (rule === 'phone' && value && !/^1[3-9]\d{9}$/.test(value)) error = '请输入正确的手机号';
                });
                if (error) {
                    valid = false;
                    errors.push({ id: f.id, msg: error });
                    el.classList.add('input-error');
                    if (msgEl) msgEl.textContent = error;
                } else {
                    el.classList.remove('input-error');
                    if (msgEl) msgEl.textContent = '';
                }
            });
            return { valid: valid, errors: errors };
        },

        // 清除表单错误
        clearFormErrors: function (formSelector) {
            var form = formSelector ? document.querySelector(formSelector) : document;
            if (!form) return;
            form.querySelectorAll('.input-error').forEach(function (el) { el.classList.remove('input-error'); });
            form.querySelectorAll('.error-msg').forEach(function (el) { el.textContent = ''; });
        },

        // 清除单个字段错误
        clearFieldError: function (fieldId, formSelector) {
            var form = formSelector ? document.querySelector(formSelector) : document;
            if (!form) return;
            var el = form.querySelector('#' + fieldId);
            var msgEl = form.querySelector('#' + fieldId + 'Error');
            if (el) el.classList.remove('input-error');
            if (msgEl) msgEl.textContent = '';
        },

        // 校验单个字段
        validateField: function (field, formSelector) {
            var form = formSelector ? document.querySelector(formSelector) : document;
            if (!form) return { valid: true, error: '' };
            var el = form.querySelector('#' + field.id);
            var msgEl = form.querySelector('#' + field.id + 'Error');
            if (!el) return { valid: true, error: '' };
            var value = el.value.trim();
            var error = '';
            (field.rules || []).forEach(function (rule) {
                if (error) return;
                if (rule === 'required' && !value) error = '请填写' + field.name;
                if (rule === 'phone' && value && !/^1[3-9]\d{9}$/.test(value)) error = '请输入正确的手机号';
            });
            if (error) {
                el.classList.add('input-error');
                if (msgEl) msgEl.textContent = error;
            } else {
                el.classList.remove('input-error');
                if (msgEl) msgEl.textContent = '';
            }
            return { valid: !error, error: error };
        }
    };

    // 启动时按当前角色同步用户档案
    App.syncCurrentUser();

    // 动态渲染底部 Tab Bar
    App.renderTabBar = function (activeId, role) {
        var r = role || App.role;
        var config = TAB_CONFIG[r === 'public' ? 'public' : 'default'];
        var container = document.querySelector('.tab-bar');
        if (!container) return;
        var html = config.map(function (tab) {
            var isActive = tab.id === activeId;
            var badge = '';
            if (tab.id === 'workspace') badge = '<span class="badge-num">' + App.state.todo + '</span>';
            if (tab.id === 'messages') badge = '<span class="badge-num">' + App.state.unread + '</span>';
            // 工作台按角色路由到独立的物理文件
            var href = tab.href;
            if (tab.id === 'workspace') {
                var wsRole = (r === 'public') ? 'manager' : r;
                href = 'pages/workspace-' + wsRole + '.html';
            }
            href = App.resolveHref(href);
            return '<a class="tab-item ' + (isActive ? 'active' : '') + '" href="' + href + '">' +
                badge +
                '<i class="fa-solid ' + tab.icon + '"></i><span>' + tab.label + '</span></a>';
        }).join('');
        container.innerHTML = html;
    };

    // 管理人员常用应用本地持久化
    App.getManagerApps = function () {
        var saved = localStorage.getItem('risk-manager-apps');
        if (saved) {
            try {
                // 过滤已移除的 rural-house 入口
                return JSON.parse(saved).filter(function(id) { return id !== 'rural-house'; });
            } catch (e) {}
        }
        // 默认常用应用：待办事项、预警中心、实时监测、实时发布、辅助决策、通讯录、一张图
        return ['todo', 'warning-center', 'monitoring', 'real-time-release', 'decision-info', 'contacts', 'one-map'];
    };
    App.setManagerApps = function (appIds) {
        localStorage.setItem('risk-manager-apps', JSON.stringify(appIds));
    };
    App.getManagerAppPool = function () {
        return MANAGER_APP_POOL;
    };

    // 巡查人员首页常用功能本地持久化
    App.getInspectorHomeApps = function () {
        var saved = localStorage.getItem('risk-inspector-home-apps');
        if (saved) {
            try {
                // 过滤已移除的 rural-patrol 入口
                var ids = JSON.parse(saved).filter(function(id) { return id !== 'rural-patrol'; });
                // 兼容旧缓存：确保 review-2026 存在且位于 risk 右侧
                if (ids.indexOf('review-2026') === -1) {
                    var riskIdx = ids.indexOf('risk');
                    ids.splice(riskIdx === -1 ? ids.length : riskIdx + 1, 0, 'review-2026');
                }
                return ids;
            } catch (e) {}
        }
        return INSPECTOR_HOME_DEFAULT.slice();
    };
    App.setInspectorHomeApps = function (appIds) {
        localStorage.setItem('risk-inspector-home-apps', JSON.stringify(appIds));
    };
    App.getInspectorAppPool = function () {
        return INSPECTOR_APP_POOL;
    };
    App.getInspectorAppById = function (id) {
        return INSPECTOR_APP_POOL.find(function (app) { return app.id === id; });
    };

    // 企业人员首页常用功能本地持久化
    App.getEnterpriseHomeApps = function () {
        var saved = localStorage.getItem('risk-enterprise-home-apps');
        if (saved) {
            try {
                // 过滤已移除的 rural-house 入口
                return JSON.parse(saved).filter(function(id) { return id !== 'rural-house'; });
            } catch (e) {}
        }
        return ENTERPRISE_HOME_DEFAULT.slice();
    };
    App.setEnterpriseHomeApps = function (appIds) {
        localStorage.setItem('risk-enterprise-home-apps', JSON.stringify(appIds));
    };
    App.getEnterpriseAppPool = function () {
        return ENTERPRISE_APP_POOL;
    };

    // 按角色派发首页常用应用读写（管理人员/企业人员共用同一套编辑交互）
    App.getHomeApps = function (role) {
        role = role || App.role;
        if (role === 'enterprise') return App.getEnterpriseHomeApps();
        return App.getManagerApps();
    };
    App.setHomeApps = function (appIds, role) {
        role = role || App.role;
        if (role === 'enterprise') App.setEnterpriseHomeApps(appIds);
        else App.setManagerApps(appIds);
    };
    App.getHomeAppPool = function (role) {
        role = role || App.role;
        if (role === 'enterprise') return App.getEnterpriseAppPool();
        return App.getManagerAppPool();
    };

    // 根据当前页面层级解析相对路径
    App.resolveHref = function (href) {
        var inPages = window.location.pathname.indexOf('/pages/') !== -1 ||
                      window.location.pathname.indexOf('\\pages\\') !== -1;
        if (!inPages) return href;
        // 在 pages/ 下：根页需要 ../，其他子页去掉 pages/ 前缀
        if (href === 'index.html') return '../index.html';
        return href.replace(/^pages\//, '');
    };

    // 顶部导航栏（返回 + 标题 + 可选操作）
    App.renderNavBar = function (title, options) {
        options = options || {};
        var container = document.querySelector('.nav-bar');
        if (!container) return;
        var backHtml = options.hideBack ? '' :
            '<div class="nav-back tap" onclick="App.back()"><i class="fa-solid fa-chevron-left"></i></div>';
        var actionHtml = options.action ?
            '<div class="nav-action tap" onclick="' + options.action.onclick + '">' + options.action.html + '</div>' :
            '<div class="nav-action"></div>';
        container.innerHTML = backHtml +
            '<div class="nav-title">' + title + '</div>' +
            actionHtml;
    };

    // 页面挂载点（优先 .phone-shell，不存在则回退 body）
    var _mountShell = function () {
        return document.querySelector('.phone-shell') || document.body;
    };

    // Toast 提示
    App.showToast = function (msg, duration) {
        duration = duration || 2000;
        var mask = document.createElement('div');
        mask.className = 'toast-mask';
        mask.innerHTML = '<div class="toast">' + msg + '</div>';
        _mountShell().appendChild(mask);
        var toast = mask.querySelector('.toast');
        requestAnimationFrame(function () {
            toast.classList.add('show');
        });
        setTimeout(function () {
            toast.classList.remove('show');
            setTimeout(function () {
                mask.remove();
            }, 200);
        }, duration);
    };

    // Loading 遮罩
    App.showLoading = function (msg) {
        if (document.querySelector('.loading-mask')) return;
        var mask = document.createElement('div');
        mask.className = 'loading-mask';
        mask.innerHTML = '<div class="spinner"></div>' + (msg ? '<div style="margin-top:10px;color:var(--text-primary)">' + msg + '</div>' : '');
        _mountShell().appendChild(mask);
        requestAnimationFrame(function () {
            mask.classList.add('show');
        });
    };
    App.hideLoading = function () {
        var mask = document.querySelector('.loading-mask');
        if (mask) mask.remove();
    };

    // 日期格式化
    App.formatDate = function (date, fmt) {
        date = new Date(date);
        fmt = fmt || 'yyyy-MM-dd hh:mm';
        var o = {
            'M+': date.getMonth() + 1,
            'd+': date.getDate(),
            'h+': date.getHours(),
            'm+': date.getMinutes(),
            's+': date.getSeconds()
        };
        if (/(y+)/.test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length));
        }
        for (var k in o) {
            if (new RegExp('(' + k + ')').test(fmt)) {
                var v = o[k] + '';
                fmt = fmt.replace(RegExp.$1, RegExp.$1.length === 1 ? v : ('00' + v).substr(v.length));
            }
        }
        return fmt;
    };

    App.relativeTime = function (date) {
        var diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
        if (diff < 60) return '刚刚';
        if (diff < 3600) return Math.floor(diff / 60) + ' 分钟前';
        if (diff < 86400) return Math.floor(diff / 3600) + ' 小时前';
        if (diff < 604800) return Math.floor(diff / 86400) + ' 天前';
        return App.formatDate(date, 'MM-dd');
    };

    // 从 URL 取参数
    App.getQuery = function (name) {
        var reg = new RegExp('[?&]' + name + '=([^&#]*)');
        var match = window.location.search.match(reg);
        return match ? decodeURIComponent(match[1]) : '';
    };

    // 安全 HTML 转义
    App.escapeHtml = function (text) {
        var div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    };

    // 点击空白处关闭弹窗等通用委托
    document.addEventListener('click', function (e) {
        var mask = e.target.closest('.modal-mask');
        if (mask && mask.classList.contains('show')) {
            var sheet = mask.querySelector('.modal-sheet');
            if (sheet && !sheet.contains(e.target)) {
                mask.classList.remove('show');
            }
        }
    });

    window.App = App;
})();
