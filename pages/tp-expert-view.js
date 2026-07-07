function getParam(key) {
    var params = new URLSearchParams(window.location.search);
    return params.get(key);
}
function getExpertList() {
    if (parentExpertList && parentExpertList.length) return parentExpertList;
    // 优先使用统一数据层，保证专家信息与机构库联动
    if (typeof getAllExperts === 'function') {
        var unified = getAllExperts();
        if (unified && unified.length) {
            return unified.map(function(e) {
                return {
                    name: e.name,
                    gender: e.gender || '男',
                    birth: e.birth || '',
                    org: e.expertType === '独立专家' || !e.orgId ? '独立专家' : (e.orgName || e.workplace || ''),
                    orgId: e.orgId || '',
                    expertType: e.expertType || (e.orgId ? '机构专家' : '独立专家'),
                    domain: e.domain || '',
                    direction: e.direction || '',
                    title: e.title || '',
                    titleOrg: e.titleOrg || '',
                    titleTime: e.titleTime || '',
                    years: e.years ? String(e.years) : '',
                    phone: e.phone || '',
                    email: e.email || '',
                    address: e.address || '',
                    emergencyPosition: e.emergencyPosition || '',
                    originalDepartment: e.originalDepartment || '',
                    emergencySpecialty: e.emergencySpecialty || '',
                    workplace: e.workplace || e.orgName || '',
                    status: e.status === '正常' ? '启用' : (e.status || '启用'),
                    history: e.history && e.history.length ? e.history : [
                        { time: '2025-06-18 14:30:00', action: '新增', operator: '系统管理员', remark: '专家信息录入，提交审核' },
                        { time: '2025-06-18 15:10:00', action: '审核通过', operator: '审核员', remark: '资料齐全，同意入库' }
                    ]
                };
            });
        }
    }
    try {
        var saved = localStorage.getItem('expertListData');
        if (saved) return JSON.parse(saved);
    } catch(e) {}
    return getFallbackList();
}
function getFallbackList() {
    return [
        { name: '张奉贤', gender: '男', birth: '1978-05', org: '上海市奉贤区建设工程安全质量监督站', domain: '建筑施工安全', direction: '隐患排查', title: '高级工程师', titleOrg: '上海市人力资源和社会保障局', titleTime: '2018-11', years: '22', phone: '138-1678-9523', email: 'zhangfengxian@example.com', address: '上海市奉贤区南桥镇解放东路23号', emergencyPosition: '安全评估组组长', originalDepartment: '工程质量监督科', emergencySpecialty: '建筑工地事故应急、坍塌救援技术指导', workplace: '奉贤区', status: '启用', history: [
            { time: '2025-06-18 14:30:00', action: '新增', operator: '系统管理员', remark: '专家信息录入，提交审核' },
            { time: '2025-06-18 15:10:00', action: '审核通过', operator: '审核员', remark: '资料齐全，同意入库' }
        ] },
        { name: '李秀芳', gender: '女', birth: '1982-09', org: '上海市奉贤区应急管理局', domain: '消防安全', direction: '应急咨询', title: '副教授', titleOrg: '上海市人力资源和社会保障局', titleTime: '2016-06', years: '18', phone: '137-6543-2109', email: 'lixiufang@example.com', address: '上海市奉贤区南桥镇解放东路8号', workplace: '奉贤区', status: '启用', history: [
            { time: '2025-06-18 10:20:00', action: '新增', operator: '系统管理员', remark: '专家信息录入，提交审核' },
            { time: '2025-06-18 11:05:00', action: '审核通过', operator: '审核员', remark: '资料齐全，同意入库' }
        ] },
        { name: '王建国', gender: '男', birth: '1970-03', org: '上海市奉贤区燃气管理所', domain: '燃气安全', direction: '隐患排查', title: '高级工程师', titleOrg: '上海市住房和城乡建设管理委员会', titleTime: '2015-09', years: '25', phone: '136-7890-1234', email: 'wangjianguo@example.com', address: '上海市奉贤区南桥镇沪杭公路999号', workplace: '奉贤区', status: '启用', history: [
            { time: '2025-06-17 09:00:00', action: '新增', operator: '系统管理员', remark: '专家信息录入，提交审核' },
            { time: '2025-06-17 10:30:00', action: '审核通过', operator: '审核员', remark: '同意入库' }
        ] },
        { name: '陈志强', gender: '男', birth: '1985-12', org: '上海市奉贤区交通运输局', domain: '交通安全', direction: '安全评估', title: '工程师', titleOrg: '上海市人力资源和社会保障局', titleTime: '2019-12', years: '12', phone: '135-4321-8765', email: 'chenzhiqiang@example.com', address: '上海市奉贤区南桥镇解放东路23号', workplace: '奉贤区', status: '启用', history: [
            { time: '2025-06-16 14:00:00', action: '新增', operator: '系统管理员', remark: '专家信息录入，提交审核' },
            { time: '2025-06-16 16:20:00', action: '审核通过', operator: '审核员', remark: '同意入库' }
        ] },
        { name: '刘美华', gender: '女', birth: '1979-07', org: '上海市奉贤区住房保障和房屋管理局', domain: '结构安全', direction: '检测检验', title: '高级工程师', titleOrg: '上海市人力资源和社会保障局', titleTime: '2017-05', years: '20', phone: '139-8765-4321', email: 'liumaihua@example.com', address: '上海市奉贤区南桥镇解放东路8号', workplace: '奉贤区', status: '停用', history: [
            { time: '2025-06-15 08:30:00', action: '新增', operator: '系统管理员', remark: '专家信息录入，提交审核' },
            { time: '2025-06-15 09:45:00', action: '审核通过', operator: '审核员', remark: '同意入库' },
            { time: '2025-06-20 16:00:00', action: '停用', operator: '审核员', remark: '因长期未参与项目，暂停使用' }
        ] },
        { name: '赵文华', gender: '男', birth: '1975-11', org: '上海市奉贤区建筑管理所', domain: '建筑施工安全', direction: '安全评估', title: '教授', titleOrg: '上海市教育委员会', titleTime: '2014-07', years: '28', phone: '138-1234-5678', email: 'zhaowenhua@example.com', address: '上海市奉贤区南桥镇解放东路23号', workplace: '奉贤区', status: '启用', history: [
            { time: '2025-06-14 11:00:00', action: '新增', operator: '系统管理员', remark: '专家信息录入，提交审核' },
            { time: '2025-06-14 14:00:00', action: '审核通过', operator: '审核员', remark: '同意入库' }
        ] },
        { name: '孙丽华', gender: '女', birth: '1983-04', org: '上海市奉贤区市政公路管理所', domain: '交通安全', direction: '隐患排查', title: '高级工程师', titleOrg: '上海市人力资源和社会保障局', titleTime: '2018-03', years: '16', phone: '137-9876-5432', email: 'sunlihua@example.com', address: '上海市奉贤区南桥镇沪杭公路999号', workplace: '奉贤区', status: '启用', history: [
            { time: '2025-06-13 10:00:00', action: '新增', operator: '系统管理员', remark: '专家信息录入，提交审核' },
            { time: '2025-06-13 11:30:00', action: '审核通过', operator: '审核员', remark: '同意入库' }
        ] },
        { name: '周海涛', gender: '男', birth: '1980-08', org: '上海市奉贤区市场监管局', domain: '化工安全', direction: '事故调查', title: '工程师', titleOrg: '上海市市场监督管理局', titleTime: '2020-08', years: '14', phone: '136-5678-9012', email: 'zhouhaitao@example.com', address: '上海市奉贤区南桥镇解放东路8号', workplace: '奉贤区', status: '启用', history: [
            { time: '2025-06-12 09:30:00', action: '新增', operator: '系统管理员', remark: '专家信息录入，提交审核' },
            { time: '2025-06-12 11:00:00', action: '审核通过', operator: '审核员', remark: '同意入库' }
        ] },
        { name: '吴建平', gender: '男', birth: '1973-02', org: '上海市奉贤区城管执法局', domain: '环境安全', direction: '应急咨询', title: '高级工程师', titleOrg: '上海市人力资源和社会保障局', titleTime: '2012-11', years: '30', phone: '138-3456-7890', email: 'wujianping@example.com', address: '上海市奉贤区南桥镇解放东路23号', workplace: '奉贤区', status: '停用', history: [
            { time: '2025-06-11 13:00:00', action: '新增', operator: '系统管理员', remark: '专家信息录入，提交审核' },
            { time: '2025-06-11 15:00:00', action: '审核通过', operator: '审核员', remark: '同意入库' },
            { time: '2025-06-19 10:00:00', action: '停用', operator: '审核员', remark: '因工作调动，暂停使用' }
        ] },
        { name: '郑小燕', gender: '女', birth: '1986-06', org: '上海市奉贤区生态环境局', domain: '环境安全', direction: '检测检验', title: '工程师', titleOrg: '上海市人力资源和社会保障局', titleTime: '2021-04', years: '10', phone: '139-2345-6789', email: 'zhengxiaoyan@example.com', address: '上海市奉贤区南桥镇解放东路8号', workplace: '奉贤区', status: '启用', history: [
            { time: '2025-06-10 14:00:00', action: '新增', operator: '系统管理员', remark: '专家信息录入，提交审核' },
            { time: '2025-06-10 16:30:00', action: '审核通过', operator: '审核员', remark: '同意入库' }
        ] },
        { name: '徐明辉', gender: '男', birth: '1977-10', org: '上海市奉贤区消防支队', domain: '消防安全', direction: '隐患排查', title: '高级工程师', titleOrg: '上海市消防救援总队', titleTime: '2016-09', years: '23', phone: '137-8765-1234', email: 'xuminghui@example.com', address: '上海市奉贤区南桥镇解放东路23号', workplace: '奉贤区', status: '启用', history: [
            { time: '2025-06-09 08:00:00', action: '新增', operator: '系统管理员', remark: '专家信息录入，提交审核' },
            { time: '2025-06-09 10:00:00', action: '审核通过', operator: '审核员', remark: '同意入库' }
        ] },
        { name: '杨慧敏', gender: '女', birth: '1984-01', org: '上海市奉贤区玻璃幕墙管理办', domain: '结构安全', direction: '检测检验', title: '高级工程师', titleOrg: '上海市人力资源和社会保障局', titleTime: '2019-01', years: '15', phone: '136-7890-4567', email: 'yanghuimin@example.com', address: '上海市奉贤区南桥镇沪杭公路999号', workplace: '奉贤区', status: '启用', history: [
            { time: '2025-06-08 09:00:00', action: '新增', operator: '系统管理员', remark: '专家信息录入，提交审核' },
            { time: '2025-06-08 11:00:00', action: '审核通过', operator: '审核员', remark: '同意入库' }
        ] }
    ];
}

// 子页面接收父页面主动推送的专家数据
var parentExpertList = null;
window.addEventListener('message', function(e) {
    if (e.data && e.data.action === 'setExpertData') {
        parentExpertList = e.data.list || [];
        render();
    }
    if (e.data && e.data.action === 'setTheme') {
        document.documentElement.setAttribute('data-theme', e.data.theme);
    }
});

function goToTPOrgOrgView(orgId) {
    if (typeof goToTPOrg === 'function') {
        goToTPOrg(orgId);
    } else if (parent && typeof parent.goToTPOrg === 'function') {
        parent.goToTPOrg(orgId);
    } else if (parent && parent.location) {
        parent.location.href = 'tp-warehouse.html?orgId=' + encodeURIComponent(orgId);
    } else {
        window.location.href = 'tp-warehouse.html?orgId=' + encodeURIComponent(orgId);
    }
}

function render() {
    var name = getParam('name');
    var params = getTPQueryParams();
    var list = getExpertList();
    if (params.orgId) {
        list = list.filter(function(e) { return e.orgId === params.orgId; });
    }
    var item = list.find(function(e) { return e.name === name; });
    if (!item) {
        document.getElementById('infoTable').innerHTML = '<tr><td colspan="2" style="text-align:center;color:var(--text-secondary);padding:24px;">未找到该专家信息</td></tr>';
        document.getElementById('fileList').innerHTML = '';
        document.getElementById('historyTimeline').innerHTML = '';
        return;
    }
    var statusClass = item.status === '启用' ? 'tag-success' : 'tag-danger';
    var isInd = item.expertType === '独立专家' || !item.orgId;
    var orgHtml = isInd ?
        '<span style="display:inline-block;padding:2px 8px;background:#f0f4ff;color:#2a5cff;border-radius:4px;font-size:12px;">独立专家</span>' :
        '<a style="cursor:pointer;color:var(--primary);text-decoration:underline;" onclick="goToTPOrgOrgView(\'' + item.orgId + '\')">' + (item.org || '') + '</a>';
    var rows = [
        ['姓名', item.name],
        ['性别', item.gender],
        ['出生年月', item.birth],
        ['工作单位', orgHtml],
        ['专业领域', item.domain],
        ['专业方向', item.direction],
        ['职称', item.title],
        ['工作地点', item.workplace || ''],
        ['发证机构', item.titleOrg],
        ['取得时间', item.titleTime],
        ['工作年限', item.years + ' 年'],
        ['联系电话', item.phone],
        ['电子邮箱', item.email],
        ['通讯地址', item.address],
        ['应急管理职务', item.emergencyPosition || '—'],
        ['原单位部门', item.originalDepartment || '—'],
        ['应急管理特长', item.emergencySpecialty || '—'],
        ['状态', '<span class="tag ' + statusClass + '">' + item.status + '</span>']
    ];
    document.getElementById('infoTable').innerHTML = rows.map(function(r) {
        return '<tr><td>' + r[0] + '</td><td>' + r[1] + '</td></tr>';
    }).join('');
    renderFiles(item);
    renderHistory(item);
}

function renderFiles(item) {
    var container = document.getElementById('fileList');
    if (!container) return;
    var files = [
        { name: '专家入库申请表.pdf', status: '已上传' },
        { name: '职称证书扫描件.pdf', status: '已上传' },
        { name: '身份证扫描件.pdf', status: '已上传' },
        { name: '学历学位证书.pdf', status: '已上传' }
    ];
    container.innerHTML = files.map(function(f) {
        return '<div class="file-item"><i class="fas fa-file-pdf"></i><span class="file-name">' + f.name + '</span><span class="file-status">' + f.status + '</span></div>';
    }).join('');
}

function renderHistory(item) {
    var container = document.getElementById('historyTimeline');
    if (!container) return;
    var list = item.history || [];
    if (list.length === 0) {
        container.innerHTML = '<div class="timeline-empty">暂无变更历史</div>';
        return;
    }
    var map = {
        '新增': 'add', '编辑': 'edit', '审核通过': 'audit', '审核驳回': 'reject',
        '删除': 'delete', '启用': 'enable', '停用': 'disable'
    };
    container.innerHTML = '<div class="timeline">' + list.map(function(r) {
        var cls = map[r.action] || 'edit';
        var diffHtml = '';
        if (r.diff && r.diff.length) {
            diffHtml = '<div class="timeline-diff">' + r.diff.map(function(d) {
                return '<div class="timeline-diff-item">' + d + '</div>';
            }).join('') + '</div>';
        }
        return '<div class="timeline-item">' +
            '<div class="timeline-dot ' + cls + '"></div>' +
            '<div class="timeline-time">' + r.time + '</div>' +
            '<div class="timeline-title">' +
                '<span class="timeline-badge ' + cls + '">' + r.action + '</span>' +
            '</div>' +
            '<div class="timeline-meta">操作人：' + (r.operator || '-') + '</div>' +
            '<div class="timeline-remark">' + (r.remark || '') + '</div>' +
            diffHtml +
        '</div>';
    }).join('') + '</div>';
}

render();
