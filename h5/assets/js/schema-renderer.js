/**
 * schema-renderer.js — 排查表单 Schema 渲染器（概念验证 demo）
 *
 * 职责：按轮次 Schema 动态渲染排查表单 / 从房屋档案预填 / 收集提交 / 历史回放
 * 设计原则：渲染器不写死任何业务字段，一切字段/选项/分区由 Schema JSON 驱动。
 *
 * 用法：
 *   SchemaRenderer.render(container, schema, { house, record, readonly });
 *   var values = SchemaRenderer.collect(container, schema);
 */
(function () {
    'use strict';

    // ---------- 通用小工具 ----------
    function esc(s) {
        return String(s === null || s === undefined ? '' : s)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    // 按路径取档案值：archSource 支持 'overview.floors' 这类点路径
    function getByPath(obj, path) {
        if (!obj || !path) return undefined;
        var cur = obj;
        var parts = path.split('.');
        for (var i = 0; i < parts.length; i++) {
            if (cur === null || cur === undefined) return undefined;
            cur = cur[parts[i]];
        }
        return cur;
    }

    function nonEmpty(v) { return v !== undefined && v !== null && String(v).trim() !== ''; }

    // ---------- 预填：按字段声明的 archSource 从档案取值 ----------
    function prefillValue(field, house) {
        if (!house || !field.archSource) return '';
        var v = getByPath(house, field.archSource);
        if (!nonEmpty(v)) return '';
        v = String(v);
        if (field.suffix && v.indexOf(field.suffix) === -1) v += field.suffix;
        return v;
    }

    // ============================================================
    // 控件渲染（每种 widget 对应一个渲染函数 + 一个取值函数）
    // ============================================================
    var Widgets = {
        text: {
            render: function (f, val, ro) {
                if (ro || (f.readonly && val)) return viewText(val);
                return '<input type="text" class="form-input" data-key="' + esc(f.key) + '" value="' + esc(val) + '"' +
                    ' placeholder="' + esc(f.placeholder || ('请输入' + f.label)) + '"' + (ro ? ' disabled' : '') + '>';
            },
            read: function (el, f) { var i = el.querySelector('input[data-key="' + f.key + '"]'); return i ? i.value.trim() : ''; }
        },
        month: {
            render: function (f, val, ro) {
                return '<input type="month" class="form-input" data-key="' + esc(f.key) + '" value="' + esc(val) + '"' + (ro ? ' disabled' : '') + '>';
            },
            read: function (el, f) { var i = el.querySelector('input[data-key="' + f.key + '"]'); return i ? i.value : ''; }
        },
        date: {
            render: function (f, val, ro) {
                return '<input type="date" class="form-input" data-key="' + esc(f.key) + '" value="' + esc(val) + '"' + (ro ? ' disabled' : '') + '>';
            },
            read: function (el, f) { var i = el.querySelector('input[data-key="' + f.key + '"]'); return i ? i.value : ''; }
        },
        select: {
            render: function (f, val, ro) {
                var h = '<select class="form-input" data-key="' + esc(f.key) + '"' + (ro ? ' disabled' : '') + '>';
                h += '<option value="">— 请选择 —</option>';
                (f.options || []).forEach(function (o) {
                    h += '<option value="' + esc(o) + '"' + (o === val ? ' selected' : '') + '>' + esc(o) + '</option>';
                });
                return h + '</select>';
            },
            read: function (el, f) { var i = el.querySelector('select[data-key="' + f.key + '"]'); return i ? i.value : ''; }
        },
        radio: {
            render: function (f, val, ro) {
                var h = '<div class="radio-row" data-key="' + esc(f.key) + '">';
                (f.options || []).forEach(function (o) {
                    h += '<div class="radio-pill' + (o === val ? ' active' : '') + (ro ? ' disabled' : '') + '" data-value="' + esc(o) + '">' + esc(o) + '</div>';
                });
                if (f.allowCustom) {
                    var isCustom = nonEmpty(val) && (f.options || []).indexOf(val) === -1;
                    h += '<div class="radio-pill' + (isCustom ? ' active' : '') + (ro ? ' disabled' : '') + '" data-value="__custom__">自定义</div>';
                    h += '<input type="text" class="form-input custom-input" placeholder="' + esc(f.customPlaceholder || '请输入') + '" value="' + (isCustom ? esc(val) : '') + '" style="' + (isCustom ? '' : 'display:none;') + 'margin-top:8px;">';
                }
                return h + '</div>';
            },
            read: function (el, f) {
                var row = el.querySelector('.radio-row[data-key="' + f.key + '"]');
                if (!row) return '';
                var act = row.querySelector('.radio-pill.active');
                if (!act) return '';
                if (act.dataset.value === '__custom__') {
                    var ci = row.querySelector('.custom-input');
                    return ci ? ci.value.trim() : '';
                }
                return act.dataset.value;
            }
        },
        checkbox: {
            render: function (f, val, ro) {
                var arr = Array.isArray(val) ? val : [];
                var otherVal = '';
                var h = '<div class="checkbox-row" data-key="' + esc(f.key) + '">';
                (f.options || []).forEach(function (o) {
                    h += '<div class="checkbox-pill' + (arr.indexOf(o) > -1 ? ' active' : '') + (ro ? ' disabled' : '') + '" data-value="' + esc(o) + '">' + esc(o) + '</div>';
                });
                if (f.allowOther) {
                    var others = arr.filter(function (v) { return (f.options || []).indexOf(v) === -1; });
                    otherVal = others.join('，');
                    h += '<div class="checkbox-pill other' + (nonEmpty(otherVal) ? ' active' : '') + (ro ? ' disabled' : '') + '" data-value="__other__">其他</div>';
                    h += '<input type="text" class="form-input other-input" placeholder="' + esc(f.otherPlaceholder || '请输入其他') + '" value="' + esc(otherVal) + '" style="' + (nonEmpty(otherVal) ? '' : 'display:none;') + 'margin-top:8px;">';
                }
                return h + '</div>';
            },
            read: function (el, f) {
                var row = el.querySelector('.checkbox-row[data-key="' + f.key + '"]');
                if (!row) return [];
                var out = [];
                row.querySelectorAll('.checkbox-pill.active').forEach(function (p) {
                    if (p.dataset.value === '__other__') {
                        var oi = row.querySelector('.other-input');
                        if (oi && oi.value.trim()) out.push(oi.value.trim());
                    } else {
                        out.push(p.dataset.value);
                    }
                });
                return out;
            }
        },
        textarea: {
            render: function (f, val, ro) {
                return '<textarea class="form-textarea" data-key="' + esc(f.key) + '" rows="' + (f.rows || 2) + '"' +
                    ' placeholder="' + esc(f.placeholder || '') + '"' + (ro ? ' disabled' : '') + '>' + esc(val) + '</textarea>';
            },
            read: function (el, f) { var i = el.querySelector('textarea[data-key="' + f.key + '"]'); return i ? i.value.trim() : ''; }
        },
        'hazard-list': {
            // 动态子卡列表：每条隐患 = itemFields 一组字段
            render: function (f, val, ro) {
                var items = Array.isArray(val) && val.length ? val : [{}];
                var h = '<div class="hazard-list" data-key="' + esc(f.key) + '">';
                h += '<div class="hazard-items">';
                items.forEach(function (it, idx) {
                    h += renderHazardCard(f, it, idx, ro);
                });
                h += '</div>';
                if (!ro) {
                    h += '<div class="hazard-add" data-add-hazard><i class="fa-solid fa-plus"></i> 添加隐患</div>';
                }
                return h + '</div>';
            },
            read: function (el, f) {
                var list = el.querySelector('.hazard-list[data-key="' + f.key + '"]');
                if (!list) return [];
                var out = [];
                list.querySelectorAll('.hazard-card').forEach(function (card) {
                    var item = {};
                    (f.itemFields || []).forEach(function (sf) {
                        var w = Widgets[sf.widget];
                        if (w && w.read) item[sf.key] = w.read(card, sf);
                    });
                    // 过滤完全空白卡
                    var hasVal = Object.keys(item).some(function (k) { return nonEmpty(item[k]); });
                    if (hasVal) out.push(item);
                });
                return out;
            }
        }
    };

    function renderHazardCard(f, item, idx, ro) {
        var h = '<div class="hazard-card" data-hidx="' + idx + '">';
        h += '<div class="hc-head"><span class="hc-title">隐患 #' + (idx + 1) + '</span>' +
            (!ro && idx > 0 ? '<span class="hc-del" data-del-hazard title="删除">×</span>' : '') + '</div>';
        (f.itemFields || []).forEach(function (sf) {
            var w = Widgets[sf.widget];
            if (!w) return;
            h += '<div class="check-item"><div class="ci-label">' + esc(sf.label || '') + '</div>';
            h += w.render(sf, item[sf.key], ro);
            h += '</div>';
        });
        return h + '</div>';
    }

    // 只读文本（readonly-prefill 分区 / 回放模式用）
    function viewText(val) {
        return '<div class="view-text">' + (nonEmpty(val) ? esc(val) : '<span class="view-empty">—</span>') + '</div>';
    }

    // ============================================================
    // 主渲染入口
    //   opts: { house: 档案对象, record: 历史记录(values), readonly: bool }
    // ============================================================
    function render(container, schema, opts) {
        opts = opts || {};
        var house = opts.house || null;
        var recordValues = (opts.record && opts.record.values) || {};
        var ro = !!opts.readonly;

        var html = '';
        (schema.sections || []).forEach(function (sec, si) {
            var secReadonly = ro || sec.mode === 'readonly-prefill';
            html += '<div class="section nav-section" data-section="' + esc(sec.key) + '">';
            html += '<div class="sec-title"><span class="section-num">' + (si + 1) + '.</span>' + esc(sec.title) + '</div>';

            (sec.fields || []).forEach(function (f) {
                // 取值优先级：历史记录 > 档案预填
                var val = recordValues[f.key];
                if (val === undefined || val === '') val = prefillValue(f, house);

                if (secReadonly && Widgets[f.widget] && f.widget !== 'hazard-list') {
                    // 只读分区：单行 标签-值 展示
                    html += '<div class="bi-row"><span class="bi-label">' + esc(f.label) + '</span>' +
                        '<span class="bi-value">' + (nonEmpty(val) ? esc(Array.isArray(val) ? val.join('，') : val) : '—') + '</span></div>';
                } else {
                    var w = Widgets[f.widget];
                    if (!w) return;
                    html += '<div class="check-item" data-field-key="' + esc(f.key) + '">';
                    html += '<div class="ci-label">' + esc(f.label) + (f.required ? '<span class="req-star">*</span>' : '') + '</div>';
                    html += w.render(f, val, secReadonly);
                    html += '</div>';
                }
            });
            html += '</div>';
        });

        container.innerHTML = html;
        bind(container, schema, ro);
    }

    // ---------- 事件绑定（pill 点选 / 自定义切换 / 隐患增删） ----------
    function bind(container, schema, ro) {
        if (ro) return;
        container.addEventListener('click', function (e) {
            var pill = e.target.closest('.radio-pill, .checkbox-pill');
            if (pill && !pill.classList.contains('disabled')) {
                var row = pill.closest('.radio-row, .checkbox-row');
                if (row.classList.contains('radio-row')) {
                    row.querySelectorAll('.radio-pill').forEach(function (p) { p.classList.remove('active'); });
                    pill.classList.add('active');
                    var ci = row.querySelector('.custom-input');
                    if (ci) ci.style.display = pill.dataset.value === '__custom__' ? '' : 'none';
                } else {
                    pill.classList.toggle('active');
                    if (pill.dataset.value === '__other__') {
                        var oi = row.querySelector('.other-input');
                        if (oi) oi.style.display = pill.classList.contains('active') ? '' : 'none';
                    }
                }
            }
            // 隐患增删
            var addBtn = e.target.closest('[data-add-hazard]');
            if (addBtn) {
                var list = addBtn.closest('.hazard-list');
                var itemsBox = list.querySelector('.hazard-items');
                var field = findField(schema, list.dataset.key);
                var idx = itemsBox.querySelectorAll('.hazard-card').length;
                var tmp = document.createElement('div');
                tmp.innerHTML = renderHazardCard(field, {}, idx, false);
                itemsBox.appendChild(tmp.firstElementChild);
                renumberHazards(itemsBox);
            }
            var delBtn = e.target.closest('[data-del-hazard]');
            if (delBtn) {
                var card = delBtn.closest('.hazard-card');
                var box = card.parentElement;
                card.remove();
                renumberHazards(box);
            }
        });
    }

    function renumberHazards(box) {
        box.querySelectorAll('.hazard-card').forEach(function (c, i) {
            c.dataset.hidx = i;
            var t = c.querySelector('.hc-title');
            if (t) t.textContent = '隐患 #' + (i + 1);
        });
    }

    function findField(schema, key) {
        var found = null;
        (schema.sections || []).forEach(function (sec) {
            (sec.fields || []).forEach(function (f) { if (f.key === key) found = f; });
        });
        return found;
    }

    // ============================================================
    // 收集提交：遍历 Schema 收集 values（不写死字段名）
    // ============================================================
    function collect(container, schema) {
        var values = {};
        (schema.sections || []).forEach(function (sec) {
            if (sec.mode === 'readonly-prefill') return; // 只读分区不收集
            (sec.fields || []).forEach(function (f) {
                var w = Widgets[f.widget];
                if (!w || !w.read) return;
                var itemEl = container.querySelector('.check-item[data-field-key="' + f.key + '"]');
                if (!itemEl) return;
                values[f.key] = w.read(itemEl, f);
            });
        });
        return values;
    }

    // ---------- 必填校验 ----------
    function validate(container, schema) {
        var errs = [];
        (schema.sections || []).forEach(function (sec) {
            if (sec.mode === 'readonly-prefill') return;
            (sec.fields || []).forEach(function (f) {
                if (!f.required) return;
                var w = Widgets[f.widget];
                var itemEl = container.querySelector('.check-item[data-field-key="' + f.key + '"]');
                var v = itemEl && w && w.read ? w.read(itemEl, f) : '';
                var empty = Array.isArray(v) ? !v.length : !nonEmpty(v);
                if (empty) errs.push(f.label);
            });
        });
        return errs;
    }

    window.SchemaRenderer = {
        render: render,
        collect: collect,
        validate: validate,
        getByPath: getByPath
    };
})();
