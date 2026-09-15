var http = require('http');
var fs = require('fs');
var path = require('path');

var port = process.env.PORT || 8000;
var pagesDir = path.join(__dirname, 'pages');
var dataDir = path.join(__dirname, 'data');

if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

var mimeTypes = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.eot': 'application/vnd.ms-fontobject',
    '.pdf': 'application/pdf',
    '.txt': 'text/plain'
};

function logRequest(req, statusCode, filePath) {
    var now = new Date().toISOString();
    console.log('[' + now + '] ' + req.method + ' ' + req.url + ' -> ' + statusCode + (filePath ? ' (' + filePath + ')' : ''));
}

function readJsonBody(req, callback) {
    var body = '';
    req.on('data', function(chunk) { body += chunk; });
    req.on('end', function() {
        try {
            callback(null, body ? JSON.parse(body) : null);
        } catch(e) {
            callback(e, null);
        }
    });
}

function sendJson(res, statusCode, data) {
    res.writeHead(statusCode, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end(JSON.stringify(data));
}

// 读取奉贤区真实镇村字典；不存在时返回 null，由调用方回退到动态提取
// 性能优化：启动时加载一次到内存，后续直接返回缓存（文件极少变动，重启服务即刷新）
var _fengxianTownVillagesCache = (function() {
    var fp = path.join(dataDir, 'fengxian-town-villages.json');
    if (!fs.existsSync(fp)) return null;
    try {
        return JSON.parse(fs.readFileSync(fp, 'utf8'));
    } catch(e) {
        return null;
    }
})();
function readFengxianTownVillages() {
    return _fengxianTownVillagesCache;
}

// ============ 列表文件读写工具（含 mtime 缓存 + 自动备份） ============
var _listFileCache = {}; // fileName -> { mtimeMs, list }
function readListFile(fileName, cb) {
    var fp = path.join(dataDir, fileName);
    fs.stat(fp, function(statErr, st) {
        if (statErr) {
            if (statErr.code === 'ENOENT') return cb(null, []);
            return cb(statErr);
        }
        var cached = _listFileCache[fileName];
        if (cached && cached.mtimeMs === st.mtimeMs) {
            return cb(null, cached.list);
        }
        fs.readFile(fp, 'utf8', function(err, data) {
            if (err) {
                if (err.code === 'ENOENT') return cb(null, []);
                return cb(err);
            }
            try {
                if (data && data.charCodeAt(0) === 0xFEFF) data = data.slice(1);
                var list = JSON.parse(data);
                var arr = Array.isArray(list) ? list : [];
                _listFileCache[fileName] = { mtimeMs: st.mtimeMs, list: arr };
                cb(null, arr);
            } catch (e) { cb(e); }
        });
    });
}

// 写数组 json 文件（写后立即失效缓存；全量覆盖前自动备份到 data/.bak/）
function writeListFile(fileName, list, cb) {
    var fp = path.join(dataDir, fileName);
    var bakDir = path.join(dataDir, '.bak');
    // 备份旧文件（存在才备份；异步，不阻塞主流程）
    fs.stat(fp, function(statErr) {
        if (!statErr) {
            fs.mkdir(bakDir, { recursive: true }, function() {
                var bakName = fileName.replace(/\.json$/, '') + '.' + Date.now() + '.json';
                fs.copyFile(fp, path.join(bakDir, bakName), function() { /* 备份失败静默 */ });
            });
        }
    });
    fs.writeFile(fp, JSON.stringify(list, null, 2), 'utf8', function(err) {
        delete _listFileCache[fileName];
        cb(err);
    });
}

function handleApi(req, res, urlPath) {
    // GET /api/dispatch-tasks -> 读取调度记录
    if (req.method === 'GET' && urlPath === '/api/dispatch-tasks') {
        var filePath = path.join(dataDir, 'dispatch-tasks.json');
        fs.readFile(filePath, 'utf8', function(err, data) {
            if (err) {
                if (err.code === 'ENOENT') {
                    sendJson(res, 200, []);
                } else {
                    sendJson(res, 500, { error: '读取失败' });
                }
                return;
            }
            try {
                var list = JSON.parse(data);
                sendJson(res, 200, list);
            } catch(e) {
                sendJson(res, 500, { error: '数据格式错误' });
            }
        });
        return true;
    }

    // POST /api/dispatch-tasks -> 保存调度记录
    if (req.method === 'POST' && urlPath === '/api/dispatch-tasks') {
        readJsonBody(req, function(err, list) {
            if (err) {
                sendJson(res, 400, { error: '请求体格式错误' });
                return;
            }
            if (!Array.isArray(list)) {
                sendJson(res, 400, { error: '数据必须是数组' });
                return;
            }
            var filePath = path.join(dataDir, 'dispatch-tasks.json');
            fs.writeFile(filePath, JSON.stringify(list, null, 2), 'utf8', function(err) {
                if (err) {
                    sendJson(res, 500, { error: '保存失败' });
                    return;
                }
                sendJson(res, 200, { success: true });
            });
        });
        return true;
    }

    // POST /api/houses/:no/coordinates -> 保存房屋坐标纠偏
    if (req.method === 'POST' && /^\/api\/houses\/[^\/]+\/coordinates$/.test(urlPath)) {
        var no = decodeURIComponent(urlPath.replace('/api/houses/', '').replace('/coordinates', ''));
        readJsonBody(req, function(err, body) {
            if (err) {
                sendJson(res, 400, { error: '请求体格式错误' });
                return;
            }
            if (body === null || typeof body.lat !== 'number' || typeof body.lng !== 'number') {
                sendJson(res, 400, { error: '缺少经纬度' });
                return;
            }
            var filePath = path.join(dataDir, 'house-corrections.json');
            fs.readFile(filePath, 'utf8', function(errRead, data) {
                var list = [];
                if (!errRead) {
                    try { list = JSON.parse(data); if (!Array.isArray(list)) list = []; } catch(e) { list = []; }
                }
                list.push({
                    no: no,
                    lat: body.lat,
                    lng: body.lng,
                    time: new Date().toISOString()
                });
                fs.writeFile(filePath, JSON.stringify(list, null, 2), 'utf8', function(errWrite) {
                    if (errWrite) {
                        sendJson(res, 500, { error: '保存失败' });
                        return;
                    }
                    sendJson(res, 200, { success: true });
                });
            });
        });
        return true;
    }

    // GET /api/review-2026-records -> 读取 2026回头看 排查记录
    if (req.method === 'GET' && urlPath === '/api/review-2026-records') {
        var reviewFile = path.join(dataDir, 'review-2026-records.json');
        fs.readFile(reviewFile, 'utf8', function(err, data) {
            if (err) {
                if (err.code === 'ENOENT') {
                    sendJson(res, 200, []);
                } else {
                    sendJson(res, 500, { error: '读取失败' });
                }
                return;
            }
            try {
                var list = JSON.parse(data);
                sendJson(res, 200, Array.isArray(list) ? list : []);
            } catch (e) {
                sendJson(res, 500, { error: '数据格式错误' });
            }
        });
        return true;
    }

    // POST /api/review-2026-records -> 保存 2026回头看 排查记录（全量覆盖）
    if (req.method === 'POST' && urlPath === '/api/review-2026-records') {
        readJsonBody(req, function(err, list) {
            if (err) {
                sendJson(res, 400, { error: '请求体格式错误' });
                return;
            }
            if (!Array.isArray(list)) {
                sendJson(res, 400, { error: '数据必须是数组' });
                return;
            }
            var reviewFile = path.join(dataDir, 'review-2026-records.json');
            fs.writeFile(reviewFile, JSON.stringify(list, null, 2), 'utf8', function(err2) {
                if (err2) {
                    sendJson(res, 500, { error: '保存失败' });
                    return;
                }
                sendJson(res, 200, { success: true, count: list.length });
            });
        });
        return true;
    }

    // GET /api/farm-review-records -> 读取 农房回头看 排查记录
    if (req.method === 'GET' && urlPath === '/api/farm-review-records') {
        var farmReviewFile = path.join(dataDir, 'farm-review-records.json');
        fs.readFile(farmReviewFile, 'utf8', function(err, data) {
            if (err) {
                if (err.code === 'ENOENT') {
                    sendJson(res, 200, []);
                } else {
                    sendJson(res, 500, { error: '读取失败' });
                }
                return;
            }
            try {
                var list = JSON.parse(data);
                sendJson(res, 200, Array.isArray(list) ? list : []);
            } catch (e) {
                sendJson(res, 500, { error: '数据格式错误' });
            }
        });
        return true;
    }

    // POST /api/farm-review-records -> 保存 农房回头看 排查记录（全量覆盖，自动备份）
    if (req.method === 'POST' && urlPath === '/api/farm-review-records') {
        readJsonBody(req, function(err, list) {
            if (err) {
                sendJson(res, 400, { error: '请求体格式错误' });
                return;
            }
            if (!Array.isArray(list)) {
                sendJson(res, 400, { error: '数据必须是数组' });
                return;
            }
            writeListFile('farm-review-records.json', list, function(err2) {
                if (err2) {
                    sendJson(res, 500, { error: '保存失败' });
                    return;
                }
                sendJson(res, 200, { success: true, count: list.length });
            });
        });
        return true;
    }

    // GET /api/farm-review-pending -> 读取 农房回头看 待排查任务（排除已有排查记录的房屋）
    if (req.method === 'GET' && urlPath === '/api/farm-review-pending') {
        readListFile('farm-review-pending.json', function(err, list) {
            if (err) { sendJson(res, 500, { error: '读取失败' }); return; }
            // 闭环：扣除已完成排查的房屋（records 里状态为 submitted/rectified 的 houseNo），避免"已排查又出现待办"
            // 注意：draft（草稿）不视为已完成，仍保留在待排查中
            readListFile('farm-review-records.json', function(errR, records) {
                if (errR) records = [];
                var doneSet = {};
                (records || []).forEach(function(x) {
                    if (x && x.houseNo && (x.status === 'submitted' || x.status === 'rectified')) doneSet[x.houseNo] = true;
                });
                var filtered = (list || []).filter(function(r) { return r && r.houseNo && !doneSet[r.houseNo]; });
                sendJson(res, 200, filtered);
            });
        });
        return true;
    }

    // POST /api/farm-review-pending -> 保存 农房回头看 待排查任务（全量覆盖）
    if (req.method === 'POST' && urlPath === '/api/farm-review-pending') {
        readJsonBody(req, function(err, list) {
            if (err) {
                sendJson(res, 400, { error: '请求体格式错误' });
                return;
            }
            if (!Array.isArray(list)) {
                sendJson(res, 400, { error: '数据必须是数组' });
                return;
            }
            writeListFile('farm-review-pending.json', list, function(err2) {
                if (err2) {
                    sendJson(res, 500, { error: '保存失败' });
                    return;
                }
                sendJson(res, 200, { success: true, count: list.length });
            });
        });
        return true;
    }

    // GET /api/house-arch -> 读取 房屋建筑档案（对象 keyed by houseNo）
    if (req.method === 'GET' && urlPath === '/api/house-arch') {
        var houseArchFile = path.join(dataDir, 'house-arch.json');
        fs.readFile(houseArchFile, 'utf8', function(err, data) {
            if (err) {
                if (err.code === 'ENOENT') {
                    sendJson(res, 200, {});
                } else {
                    sendJson(res, 500, { error: '读取失败' });
                }
                return;
            }
            try {
                var obj = JSON.parse(data);
                sendJson(res, 200, (obj && typeof obj === 'object' && !Array.isArray(obj)) ? obj : {});
            } catch (e) {
                sendJson(res, 500, { error: '数据格式错误' });
            }
        });
        return true;
    }

    // POST /api/house-arch -> 保存 房屋建筑档案（全量覆盖）
    if (req.method === 'POST' && urlPath === '/api/house-arch') {
        readJsonBody(req, function(err, obj) {
            if (err) {
                sendJson(res, 400, { error: '请求体格式错误' });
                return;
            }
            if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
                sendJson(res, 400, { error: '数据必须是对象' });
                return;
            }
            var houseArchFile = path.join(dataDir, 'house-arch.json');
            fs.writeFile(houseArchFile, JSON.stringify(obj, null, 2), 'utf8', function(err2) {
                if (err2) {
                    sendJson(res, 500, { error: '保存失败' });
                    return;
                }
                sendJson(res, 200, { success: true, count: Object.keys(obj).length });
            });
        });
        return true;
    }

    // ============ 农房回头看 高级接口 ============
    // readListFile / writeListFile 已提升到 handleApi 外（顶部），此处直接用

    // GET /api/farm-review-records/page?page=1&size=50&town=xx&status=xx&hazard=xx&q=xx&dateFrom=&dateTo=
    if (req.method === 'GET' && urlPath === '/api/farm-review-records/page') {
        var urlObj = new URL(req.url, 'http://localhost');
        var page = parseInt(urlObj.searchParams.get('page') || '1', 10);
        var size = parseInt(urlObj.searchParams.get('size') || '50', 10);
        var town = (urlObj.searchParams.get('town') || '').trim();
        var village = (urlObj.searchParams.get('village') || '').trim();
        var status = (urlObj.searchParams.get('status') || '').trim();
        var hazard = (urlObj.searchParams.get('hazard') || '').trim();
        var houseUsage = (urlObj.searchParams.get('houseUsage') || '').trim();
        var houseType = (urlObj.searchParams.get('houseType') || '').trim();
        var specificUsage = (urlObj.searchParams.get('specificUsage') || '').trim();
        var q = (urlObj.searchParams.get('q') || '').trim().toLowerCase();
        var dateFrom = (urlObj.searchParams.get('dateFrom') || '').trim();
        var dateTo = (urlObj.searchParams.get('dateTo') || '').trim();

        readListFile('farm-review-records.json', function(err, list) {
            if (err) { sendJson(res, 500, { error: '读取失败' }); return; }

            var filtered = list.filter(function(r) {
                if (!r) return false;
                if (town && (r.town || '') !== town) return false;
                if (village && (r.village || '') !== village) return false;
                if (status && (r.status || '') !== status) return false;
                if (hazard && (r.hazardLevel || '') !== hazard) return false;
                if (houseUsage && (r.houseUsage || '') !== houseUsage) return false;
                if (houseType && (r.houseType || '') !== houseType) return false;
                if (specificUsage) {
                    var suArr = specificUsage.split(/[,,]/).map(function(s) { return s.trim(); }).filter(Boolean);
                    var recSu = (r.specificUsage || '');
                    var recSuArr = recSu.split(/[,,、]/).map(function(s) { return s.trim(); }).filter(Boolean);
                    var hit = suArr.some(function(s) { return recSuArr.indexOf(s) > -1; });
                    if (!hit) return false;
                }
                if (dateFrom && (r.inspectTime || r.submitTime || '') < dateFrom) return false;
                if (dateTo && (r.inspectTime || r.submitTime || '') > dateTo + ' 23:59') return false;
                if (q) {
                    var hay = ((r.houseNo || '') + '|' + (r.houseAddress || '')).toLowerCase();
                    if (hay.indexOf(q) < 0) return false;
                }
                return true;
            });

            var total = filtered.length;
            var start = (page - 1) * size;
            var rows = filtered.slice(start, start + size);

            // 优先使用真实奉贤镇村字典，否则从数据动态提取
            var townVillagesOut = readFengxianTownVillages();
            if (!townVillagesOut) {
                var towns = {};
                var townVillages = {};
                list.forEach(function(r) {
                    if (!r || !r.town) return;
                    towns[r.town] = 1;
                    if (r.village) {
                        if (!townVillages[r.town]) townVillages[r.town] = {};
                        townVillages[r.town][r.village] = 1;
                    }
                });
                townVillagesOut = {};
                Object.keys(townVillages).forEach(function(t) { townVillagesOut[t] = Object.keys(townVillages[t]).sort(); });
            }
            var townsOut = Object.keys(townVillagesOut).sort();

            sendJson(res, 200, {
                total: total,
                page: page,
                size: size,
                rows: rows,
                towns: townsOut,
                townVillages: townVillagesOut
            });
        });
        return true;
    }

    // GET /api/farm-review-records/export.csv -> 导出 CSV（带筛选）
    if (req.method === 'GET' && urlPath === '/api/farm-review-records/export.csv') {
        var urlObj2 = new URL(req.url, 'http://localhost');
        var town2 = (urlObj2.searchParams.get('town') || '').trim();
        var village2 = (urlObj2.searchParams.get('village') || '').trim();
        var status2 = (urlObj2.searchParams.get('status') || '').trim();
        var hazard2 = (urlObj2.searchParams.get('hazard') || '').trim();

        readListFile('farm-review-records.json', function(err, list) {
            if (err) { sendJson(res, 500, { error: '读取失败' }); return; }

            var filtered = list.filter(function(r) {
                if (!r) return false;
                if (town2 && (r.town || '') !== town2) return false;
                if (village2 && (r.village || '') !== village2) return false;
                if (status2 && (r.status || '') !== status2) return false;
                if (hazard2 && (r.hazardLevel || '') !== hazard2) return false;
                return true;
            });

            function escCsv(v) {
                if (v === null || v === undefined) return '';
                var s = String(v);
                if (s.indexOf(',') >= 0 || s.indexOf('"') >= 0 || s.indexOf('\n') >= 0) {
                    s = '"' + s.replace(/"/g, '""') + '"';
                }
                return s;
            }

            var STATUS_LABEL = { draft: '草稿', submitted: '已提交', rectified: '已整改' };
            function arrText(v) { return Array.isArray(v) ? v.join('、') : (v || ''); }
            function fmtT(s) { return s ? String(s).slice(0, 16).replace('T', ' ') : ''; }

            var headers = ['唯一标识','街镇','村居委','地址','房屋产权人','联系电话','房屋用途','具体用途','房屋层数','建筑面积','建成年份','房屋类型','隐患等级','状态','现场排查人员','排查时间','排查发现时间','结构安全问题','临时管控措施','整改措施','计划整改完成时限','备注'];
            var lines = ['\ufeff' + headers.join(',')]; // BOM for Excel
            filtered.forEach(function(r) {
                var rectifyTypes = (r.rectify && r.rectify.measures && r.rectify.measures.controlTypes) || r.rectifyTypes || '';
                var rectifyDate = (r.rectify && r.rectify.measures && r.rectify.measures.ownerDate) || r.ownerDate || '';
                var hazardsText = Array.isArray(r.hazards) ? r.hazards.map(function(h, i) {
                    return (i + 1) + '. 【' + (h.part || '') + '】' + (h.description || '');
                }).join('；') : (r.structuralProblems || '');
                lines.push([
                    escCsv(r.houseNo), escCsv(r.town), escCsv(r.village || r.villageName), escCsv(r.houseAddress),
                    escCsv(r.houseOwner || r.owner), escCsv(r.contactPhone || r.phone), escCsv(r.houseUsage),
                    escCsv(r.specificUsage), escCsv(r.houseFloors || r.floors), escCsv(r.area), escCsv(r.buildYear),
                    escCsv(r.houseType), escCsv(r.hazardLevel), escCsv(STATUS_LABEL[r.status] || r.status),
                    escCsv(r.inspector || r.inspectorName), escCsv(fmtT(r.submitTime || r.saveTime || r.inspectTime)),
                    escCsv(r.checkFindTime), escCsv(hazardsText),
                    escCsv(arrText(r.tempControlMeasures)), escCsv(arrText(rectifyTypes)),
                    escCsv(rectifyDate), escCsv(r.checkRemark)
                ].join(','));
            });

            res.writeHead(200, {
                'Content-Type': 'text/csv; charset=utf-8',
                'Content-Disposition': 'attachment; filename="farm-review-records.csv"',
                'Access-Control-Allow-Origin': '*'
            });
            res.end(lines.join('\r\n'));
        });
        return true;
    }

    // POST /api/farm-review-records/import -> 批量导入排查结果
    // body: { mode: 'append'|'overwrite'|'merge', rows: [...] }
    if (req.method === 'POST' && urlPath === '/api/farm-review-records/import') {
        readJsonBody(req, function(err, payload) {
            if (err || !payload || !Array.isArray(payload.rows)) {
                sendJson(res, 400, { error: '请求体格式错误，需 {mode, rows:[]}' });
                return;
            }
            var mode = payload.mode || 'merge';
            var newRows = payload.rows.filter(function(r) { return r && r.houseNo; });

            readListFile('farm-review-records.json', function(err2, existing) {
                if (err2) { sendJson(res, 500, { error: '读取现有数据失败' }); return; }

                var map = {};
                existing.forEach(function(r) { if (r && r.houseNo) map[r.houseNo] = r; });

                var added = 0, updated = 0, skipped = 0;
                newRows.forEach(function(r) {
                    var key = r.houseNo;
                    if (map[key]) {
                        if (mode === 'append') {
                            skipped++;
                            return;
                        } else if (mode === 'overwrite') {
                            map[key] = r;
                            updated++;
                        } else { // merge：新数据优先，空字段保留旧值
                            var old = map[key];
                            var merged = {};
                            for (var k in old) merged[k] = old[k];
                            for (var k2 in r) {
                                if (r[k2] !== '' && r[k2] !== null && r[k2] !== undefined) {
                                    merged[k2] = r[k2];
                                }
                            }
                            map[key] = merged;
                            updated++;
                        }
                    } else {
                        map[key] = r;
                        added++;
                    }
                });

                var list = Object.keys(map).map(function(k) { return map[k]; });
                // 按 submitTime 倒序
                list.sort(function(a, b) {
                    var ta = (a && (a.submitTime || a.inspectTime)) || '';
                    var tb = (b && (b.submitTime || b.inspectTime)) || '';
                    return tb > ta ? 1 : (tb < ta ? -1 : 0);
                });

                writeListFile('farm-review-records.json', list, function(err3) {
                    if (err3) { sendJson(res, 500, { error: '保存失败' }); return; }
                    sendJson(res, 200, { success: true, added: added, updated: updated, skipped: skipped, total: list.length });
                });
            });
        });
        return true;
    }

    // POST /api/farm-review-pending/import -> 批量导入待排查任务
    if (req.method === 'POST' && urlPath === '/api/farm-review-pending/import') {
        readJsonBody(req, function(err, payload) {
            if (err || !payload || !Array.isArray(payload.rows)) {
                sendJson(res, 400, { error: '请求体格式错误，需 {mode, rows:[]}' });
                return;
            }
            var mode = payload.mode || 'merge';
            var newRows = payload.rows.filter(function(r) { return r && r.houseNo; });

            readListFile('farm-review-pending.json', function(err2, existing) {
                if (err2) { sendJson(res, 500, { error: '读取现有数据失败' }); return; }

                var map = {};
                existing.forEach(function(r) { if (r && r.houseNo) map[r.houseNo] = r; });

                var added = 0, updated = 0, skipped = 0;
                newRows.forEach(function(r) {
                    var key = r.houseNo;
                    if (map[key]) {
                        if (mode === 'append') { skipped++; return; }
                        else if (mode === 'overwrite') { map[key] = r; updated++; }
                        else {
                            var old = map[key];
                            var merged = {};
                            for (var k in old) merged[k] = old[k];
                            for (var k2 in r) {
                                if (r[k2] !== '' && r[k2] !== null && r[k2] !== undefined) merged[k2] = r[k2];
                            }
                            map[key] = merged;
                            updated++;
                        }
                    } else {
                        map[key] = r;
                        added++;
                    }
                });

                var list = Object.keys(map).map(function(k) { return map[k]; });
                writeListFile('farm-review-pending.json', list, function(err3) {
                    if (err3) { sendJson(res, 500, { error: '保存失败' }); return; }
                    sendJson(res, 200, { success: true, added: added, updated: updated, skipped: skipped, total: list.length });
                });
            });
        });
        return true;
    }

    // GET /api/farm-review-records/:houseNo -> 单条查询（详情页用，避免拉取全表）
    if (req.method === 'GET' && urlPath.indexOf('/api/farm-review-records/') === 0 &&
        urlPath !== '/api/farm-review-records/page' && urlPath !== '/api/farm-review-records/export.csv') {
        var gHouseNo = decodeURIComponent(urlPath.substring('/api/farm-review-records/'.length));
        readListFile('farm-review-records.json', function(err, list) {
            if (err) { sendJson(res, 500, { error: '读取失败' }); return; }
            var found = null;
            for (var i = 0; i < list.length; i++) {
                if (list[i] && list[i].houseNo === gHouseNo) { found = list[i]; break; }
            }
            if (found) sendJson(res, 200, found);
            else sendJson(res, 404, { error: 'not found' });
        });
        return true;
    }

    // GET /api/farm-review-pending/:houseNo -> 单条查询（详情页用，避免拉取全表）
    if (req.method === 'GET' && urlPath.indexOf('/api/farm-review-pending/') === 0 &&
        urlPath !== '/api/farm-review-pending/page' && urlPath !== '/api/farm-review-pending/export.csv' &&
        urlPath !== '/api/farm-review-pending/dispatch') {
        var gpHouseNo = decodeURIComponent(urlPath.substring('/api/farm-review-pending/'.length));
        readListFile('farm-review-pending.json', function(err, list) {
            if (err) { sendJson(res, 500, { error: '读取失败' }); return; }
            var found = null;
            for (var i = 0; i < list.length; i++) {
                if (list[i] && list[i].houseNo === gpHouseNo) { found = list[i]; break; }
            }
            if (found) sendJson(res, 200, found);
            else sendJson(res, 404, { error: 'not found' });
        });
        return true;
    }

    // POST /api/farm-review-records/:houseNo -> 单条更新
    if (req.method === 'POST' && urlPath.indexOf('/api/farm-review-records/') === 0 && urlPath !== '/api/farm-review-records/import') {
        var houseNo = decodeURIComponent(urlPath.substring('/api/farm-review-records/'.length));
        readJsonBody(req, function(err, payload) {
            if (err || !payload) {
                sendJson(res, 400, { error: '请求体格式错误' });
                return;
            }
            readListFile('farm-review-records.json', function(err2, list) {
                if (err2) { sendJson(res, 500, { error: '读取失败' }); return; }
                var idx = -1;
                for (var i = 0; i < list.length; i++) {
                    if (list[i] && list[i].houseNo === houseNo) { idx = i; break; }
                }
                if (idx < 0) {
                    // 不存在则新建
                    payload.houseNo = houseNo;
                    // 首次推送计数
                    if (payload.pushedTime) payload.pushCount = 1;
                    list.unshift(payload);
                } else {
                    // 合并更新
                    var old = list[idx];
                    // 推送时间戳变化 → 累加推送次数（用于前端显示"已推送×N"）
                    var pushTimeChanged = payload.pushedTime && payload.pushedTime !== old.pushedTime;
                    for (var k in payload) {
                        if (payload.hasOwnProperty(k)) old[k] = payload[k];
                    }
                    if (pushTimeChanged) {
                        old.pushCount = (parseInt(old.pushCount, 10) || 0) + 1;
                    }
                    old.houseNo = houseNo;
                }
                writeListFile('farm-review-records.json', list, function(err3) {
                    if (err3) { sendJson(res, 500, { error: '保存失败' }); return; }
                    sendJson(res, 200, { success: true });
                });
            });
        });
        return true;
    }

    // ============ 农房回头看 · 待排查任务 ============

    // GET /api/farm-review-pending/page?page=1&size=50&town=xx&hazard=xx&q=xx
    if (req.method === 'GET' && urlPath === '/api/farm-review-pending/page') {
        var pUrlObj = new URL(req.url, 'http://localhost');
        var pPage = parseInt(pUrlObj.searchParams.get('page') || '1', 10);
        var pSize = parseInt(pUrlObj.searchParams.get('size') || '50', 10);
        var pTown = (pUrlObj.searchParams.get('town') || '').trim();
        var pVillage = (pUrlObj.searchParams.get('village') || '').trim();
        var pHazard = (pUrlObj.searchParams.get('hazard') || '').trim();
        var pHouseUsage = (pUrlObj.searchParams.get('houseUsage') || '').trim();
        var pHouseType = (pUrlObj.searchParams.get('houseType') || '').trim();
        var pSpecificUsage = (pUrlObj.searchParams.get('specificUsage') || '').trim();
        var pQ = (pUrlObj.searchParams.get('q') || '').trim().toLowerCase();
        var pDispatched = (pUrlObj.searchParams.get('dispatched') || '').trim();

        readListFile('farm-review-pending.json', function(err, list) {
            if (err) { sendJson(res, 500, { error: '读取失败' }); return; }

            // 闭环：待排查列表需扣除已完成排查的房屋（records 里的 houseNo），避免"已排查又出现待办"
            // 注意：只排除已提交/已整改，草稿（draft）不算完成，仍保留在待排查中
            readListFile('farm-review-records.json', function(errR, records) {
                if (errR) records = [];
                var doneSet = {};
                (records || []).forEach(function(x) {
                    if (x && x.houseNo && (x.status === 'submitted' || x.status === 'rectified')) doneSet[x.houseNo] = true;
                });
                list = (list || []).filter(function(r) { return r && r.houseNo && !doneSet[r.houseNo]; });

            var filtered = list.filter(function(r) {
                if (!r) return false;
                if (pTown && (r.town || '') !== pTown) return false;
                if (pVillage && (r.village || '') !== pVillage) return false;
                if (pHazard && (r.hazardLevel || '') !== pHazard) return false;
                if (pHouseUsage && (r.houseUsage || '') !== pHouseUsage) return false;
                if (pHouseType && (r.houseType || '') !== pHouseType) return false;
                if (pSpecificUsage) {
                    var pSuArr = pSpecificUsage.split(/[,,]/).map(function(s) { return s.trim(); }).filter(Boolean);
                    var pRecSu = (r.specificUsage || '');
                    var pRecSuArr = pRecSu.split(/[,,、]/).map(function(s) { return s.trim(); }).filter(Boolean);
                    var pHit = pSuArr.some(function(s) { return pRecSuArr.indexOf(s) > -1; });
                    if (!pHit) return false;
                }
                if (pDispatched) {
                    var isDisp = r.dispatched === true || r.dispatched === 'true';
                    if (pDispatched === 'yes' && !isDisp) return false;
                    if (pDispatched === 'no' && isDisp) return false;
                }
                if (pQ) {
                    var hay = ((r.houseNo || '') + '|' + (r.houseAddress || '')).toLowerCase();
                    if (hay.indexOf(pQ) < 0) return false;
                }
                return true;
            });

            var total = filtered.length;
            var start = (pPage - 1) * pSize;
            var rows = filtered.slice(start, start + pSize);

            // 优先使用真实奉贤镇村字典，否则从数据动态提取
            var townVillagesOut = readFengxianTownVillages();
            if (!townVillagesOut) {
                var towns = {};
                var townVillages = {};
                list.forEach(function(r) {
                    if (!r || !r.town) return;
                    towns[r.town] = 1;
                    if (r.village) {
                        if (!townVillages[r.town]) townVillages[r.town] = {};
                        townVillages[r.town][r.village] = 1;
                    }
                });
                townVillagesOut = {};
                Object.keys(townVillages).forEach(function(t) { townVillagesOut[t] = Object.keys(townVillages[t]).sort(); });
            }
            var townsOut = Object.keys(townVillagesOut).sort();

            sendJson(res, 200, {
                total: total,
                page: pPage,
                size: pSize,
                rows: rows,
                towns: townsOut,
                townVillages: townVillagesOut
            });
            });
        });
        return true;
    }

    // GET /api/farm-review-pending/export.csv -> 导出待排查 CSV
    if (req.method === 'GET' && urlPath === '/api/farm-review-pending/export.csv') {
        var pUrlObj2 = new URL(req.url, 'http://localhost');
        var pTown2 = (pUrlObj2.searchParams.get('town') || '').trim();
        var pVillage2 = (pUrlObj2.searchParams.get('village') || '').trim();
        var pHazard2 = (pUrlObj2.searchParams.get('hazard') || '').trim();

        readListFile('farm-review-pending.json', function(err, list) {
            if (err) { sendJson(res, 500, { error: '读取失败' }); return; }

            // 闭环：导出待排查同样扣除已完成排查的房屋（草稿不算完成）
            readListFile('farm-review-records.json', function(errR, records) {
                if (errR) records = [];
                var doneSet = {};
                (records || []).forEach(function(x) {
                    if (x && x.houseNo && (x.status === 'submitted' || x.status === 'rectified')) doneSet[x.houseNo] = true;
                });
                list = (list || []).filter(function(r) { return r && r.houseNo && !doneSet[r.houseNo]; });

            var filtered = list.filter(function(r) {
                if (!r) return false;
                if (pTown2 && (r.town || '') !== pTown2) return false;
                if (pVillage2 && (r.village || '') !== pVillage2) return false;
                if (pHazard2 && (r.hazardLevel || '') !== pHazard2) return false;
                return true;
            });

            function escCsvP(v) {
                if (v === null || v === undefined) return '';
                var s = String(v);
                if (s.indexOf(',') >= 0 || s.indexOf('"') >= 0 || s.indexOf('\n') >= 0) {
                    s = '"' + s.replace(/"/g, '""') + '"';
                }
                return s;
            }

            var headers = ['唯一标识','街镇','村居委','组','路','号栋','地址','房屋产权人','房屋用途','具体用途','房屋层数','建筑面积','建成年份','隐患等级','初步判定','鉴定结论','导入时间'];
            var lines = ['﻿' + headers.join(',')];
            filtered.forEach(function(r) {
                lines.push([
                    escCsvP(r.houseNo), escCsvP(r.town), escCsvP(r.villageName || r.village), escCsvP(r.groupName),
                    escCsvP(r.roadName), escCsvP(r.buildingNo), escCsvP(r.houseAddress),
                    escCsvP(r.houseOwner || r.owner), escCsvP(r.houseUsage), escCsvP(r.specificUsage),
                    escCsvP(r.floors || r.houseFloors), escCsvP(r.area), escCsvP(r.buildYear),
                    escCsvP(r.hazardLevel), escCsvP(r.initialJudgment), escCsvP(r.appraisalResult),
                    escCsvP(r.importTime)
                ].join(','));
            });

            res.writeHead(200, {
                'Content-Type': 'text/csv; charset=utf-8',
                'Content-Disposition': 'attachment; filename="farm-review-pending.csv"',
                'Access-Control-Allow-Origin': '*'
            });
            res.end(lines.join('\r\n'));
            });
        });
        return true;
    }

    // POST /api/farm-review-pending/dispatch -> 批量设置下发标记（原子读-改-写，避免并发全量覆盖）
    // 请求体: { houseNos: [...], dispatched: true|false }
    if (req.method === 'POST' && urlPath === '/api/farm-review-pending/dispatch') {
        readJsonBody(req, function(err, payload) {
            if (err || !payload || !Array.isArray(payload.houseNos)) {
                sendJson(res, 400, { error: '请求体格式错误，需 { houseNos: [], dispatched: bool }' });
                return;
            }
            var flag = payload.dispatched === true || payload.dispatched === 'true';
            var timeStr = flag ? new Date().toLocaleString('sv-SE').slice(0, 16) : '';
            var dispatchedToMap = (payload.dispatchedToMap && typeof payload.dispatchedToMap === 'object') ? payload.dispatchedToMap : null;
            var want = {};
            payload.houseNos.forEach(function(n) { if (n) want[n] = true; });
            readListFile('farm-review-pending.json', function(err2, list) {
                if (err2) { sendJson(res, 500, { error: '读取失败' }); return; }
                var updated = 0;
                (list || []).forEach(function(r) {
                    if (r && r.houseNo && want[r.houseNo]) {
                        r.dispatched = flag;
                        r.dispatchedTime = timeStr;
                        if (dispatchedToMap && flag) {
                            r.dispatchedTo = dispatchedToMap[r.houseNo] || '';
                        } else if (!flag) {
                            r.dispatchedTo = '';
                        }
                        updated++;
                    }
                });
                writeListFile('farm-review-pending.json', list, function(err3) {
                    if (err3) { sendJson(res, 500, { error: '保存失败' }); return; }
                    sendJson(res, 200, { success: true, updated: updated });
                });
            });
        });
        return true;
    }

    // POST /api/farm-review-pending/:houseNo -> 单条更新待排查
    if (req.method === 'POST' && urlPath.indexOf('/api/farm-review-pending/') === 0 && urlPath !== '/api/farm-review-pending/import' && urlPath !== '/api/farm-review-pending/dispatch') {
        var pHouseNo = decodeURIComponent(urlPath.substring('/api/farm-review-pending/'.length));
        readJsonBody(req, function(err, payload) {
            if (err || !payload) {
                sendJson(res, 400, { error: '请求体格式错误' });
                return;
            }
            readListFile('farm-review-pending.json', function(err2, list) {
                if (err2) { sendJson(res, 500, { error: '读取失败' }); return; }
                var idx = -1;
                for (var i = 0; i < list.length; i++) {
                    if (list[i] && list[i].houseNo === pHouseNo) { idx = i; break; }
                }
                if (idx < 0) {
                    payload.houseNo = pHouseNo;
                    list.unshift(payload);
                } else {
                    var old = list[idx];
                    for (var k in payload) {
                        if (payload.hasOwnProperty(k)) old[k] = payload[k];
                    }
                    old.houseNo = pHouseNo;
                }
                writeListFile('farm-review-pending.json', list, function(err3) {
                    if (err3) { sendJson(res, 500, { error: '保存失败' }); return; }
                    sendJson(res, 200, { success: true });
                });
            });
        });
        return true;
    }

    // DELETE /api/farm-review-pending/:houseNo -> 排查完成后从待排查列表移除该房屋（原子操作，避免全量覆盖）
    if (req.method === 'DELETE' && urlPath.indexOf('/api/farm-review-pending/') === 0) {
        var dHouseNo = decodeURIComponent(urlPath.substring('/api/farm-review-pending/'.length));
        if (!dHouseNo) { sendJson(res, 400, { error: '缺少 houseNo' }); return true; }
        readListFile('farm-review-pending.json', function(err, list) {
            if (err) { sendJson(res, 500, { error: '读取失败' }); return; }
            var newList = (list || []).filter(function(r) { return r && r.houseNo !== dHouseNo; });
            writeListFile('farm-review-pending.json', newList, function(err2) {
                if (err2) { sendJson(res, 500, { error: '保存失败' }); return; }
                sendJson(res, 200, { success: true, removed: (list || []).length - newList.length });
            });
        });
        return true;
    }

    // GET /api/farm-monitor-records -> 读取 农房常态化监测 排查记录
    if (req.method === 'GET' && urlPath === '/api/farm-monitor-records') {
        var farmFile = path.join(dataDir, 'farm-monitor-records.json');
        fs.readFile(farmFile, 'utf8', function(err, data) {
            if (err) {
                if (err.code === 'ENOENT') {
                    sendJson(res, 200, []);
                } else {
                    sendJson(res, 500, { error: '读取失败' });
                }
                return;
            }
            try {
                var list = JSON.parse(data);
                sendJson(res, 200, Array.isArray(list) ? list : []);
            } catch (e) {
                sendJson(res, 500, { error: '数据格式错误' });
            }
        });
        return true;
    }

    // POST /api/farm-monitor-records -> 保存 农房常态化监测 排查记录（全量覆盖）
    if (req.method === 'POST' && urlPath === '/api/farm-monitor-records') {
        readJsonBody(req, function(err, list) {
            if (err) {
                sendJson(res, 400, { error: '请求体格式错误' });
                return;
            }
            if (!Array.isArray(list)) {
                sendJson(res, 400, { error: '数据必须是数组' });
                return;
            }
            var farmFile = path.join(dataDir, 'farm-monitor-records.json');
            fs.writeFile(farmFile, JSON.stringify(list, null, 2), 'utf8', function(err2) {
                if (err2) {
                    sendJson(res, 500, { error: '保存失败' });
                    return;
                }
                sendJson(res, 200, { success: true, count: list.length });
            });
        });
        return true;
    }

    return false;
}

http.createServer(function(req, res) {
    if (req.method === 'OPTIONS') {
        res.writeHead(204, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        });
        res.end();
        return;
    }

    var urlPath = req.url.split('?')[0];

    if (handleApi(req, res, urlPath)) {
        logRequest(req, 200, urlPath);
        return;
    }

    if (req.method !== 'GET' && req.method !== 'HEAD') {
        res.writeHead(405, {'Content-Type': 'text/plain'});
        res.end('Method Not Allowed');
        return;
    }

    var ext = path.extname(urlPath).toLowerCase();
    var baseDir = __dirname;

    // 页面及页面内相对资源请求，统一映射到 pages 目录
    if (urlPath.startsWith('/pages/')) {
        baseDir = pagesDir;
        urlPath = urlPath.replace('/pages/', '/');
    }

    var filePath = path.join(baseDir, urlPath);
    var contentType = mimeTypes[ext] || 'application/octet-stream';

    // 兼容从 /css 或 /js 访问根目录静态资源（页面内 ../css/... 不能直接匹配 /pages/*）
    if ((urlPath.startsWith('/css/') || urlPath.startsWith('/js/')) && !fs.existsSync(filePath)) {
        filePath = path.join(__dirname, urlPath);
    }

    fs.readFile(filePath, function(err, data) {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404, {'Content-Type': 'text/plain'});
                res.end('Not found');
                logRequest(req, 404, filePath);
            } else {
                res.writeHead(500, {'Content-Type': 'text/plain'});
                res.end('Internal Server Error');
                logRequest(req, 500, filePath);
            }
            return;
        }
        res.writeHead(200, {
            'Content-Type': contentType,
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'no-cache'
        });
        res.end(data);
        logRequest(req, 200, filePath);
    });
}).listen(port, function() {
    console.log('Server running at http://localhost:' + port);
});
