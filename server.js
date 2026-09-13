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

    // POST /api/farm-review-records -> 保存 农房回头看 排查记录（全量覆盖）
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
            var farmReviewFile = path.join(dataDir, 'farm-review-records.json');
            fs.writeFile(farmReviewFile, JSON.stringify(list, null, 2), 'utf8', function(err2) {
                if (err2) {
                    sendJson(res, 500, { error: '保存失败' });
                    return;
                }
                sendJson(res, 200, { success: true, count: list.length });
            });
        });
        return true;
    }

    // GET /api/farm-review-pending -> 读取 农房回头看 待排查任务
    if (req.method === 'GET' && urlPath === '/api/farm-review-pending') {
        var pendingFile = path.join(dataDir, 'farm-review-pending.json');
        fs.readFile(pendingFile, 'utf8', function(err, data) {
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
            var pendingFile = path.join(dataDir, 'farm-review-pending.json');
            fs.writeFile(pendingFile, JSON.stringify(list, null, 2), 'utf8', function(err2) {
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

    // 工具：读取数组 json 文件（容错 UTF-8 BOM；带 mtime 内存缓存：文件未变更则直接返回缓存，避免每次全量读盘+JSON.parse）
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

    // 工具：写数组 json 文件（写后立即失效缓存，保证下次读取拿到最新内容）
    function writeListFile(fileName, list, cb) {
        var fp = path.join(dataDir, fileName);
        fs.writeFile(fp, JSON.stringify(list, null, 2), 'utf8', function(err) {
            delete _listFileCache[fileName];
            cb(err);
        });
    }

    // GET /api/farm-review-records/page?page=1&size=50&town=xx&status=xx&hazard=xx&q=xx&dateFrom=&dateTo=
    if (req.method === 'GET' && urlPath === '/api/farm-review-records/page') {
        var urlObj = new URL(req.url, 'http://localhost');
        var page = parseInt(urlObj.searchParams.get('page') || '1', 10);
        var size = parseInt(urlObj.searchParams.get('size') || '50', 10);
        var town = (urlObj.searchParams.get('town') || '').trim();
        var village = (urlObj.searchParams.get('village') || '').trim();
        var status = (urlObj.searchParams.get('status') || '').trim();
        var hazard = (urlObj.searchParams.get('hazard') || '').trim();
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

            var headers = ['唯一标识','镇','村','地址','产权人','联系电话','房屋用途','层数','建筑面积','建成年份','隐患等级','状态','排查人','排查时间','初步判定','详细描述','临时管控','整改措施','计划整改期限','备注'];
            var lines = ['\ufeff' + headers.join(',')]; // BOM for Excel
            filtered.forEach(function(r) {
                lines.push([
                    escCsv(r.houseNo), escCsv(r.town), escCsv(r.village), escCsv(r.houseAddress),
                    escCsv(r.owner), escCsv(r.phone), escCsv(r.houseUsage), escCsv(r.floors),
                    escCsv(r.area), escCsv(r.buildYear), escCsv(r.hazardLevel), escCsv(r.status),
                    escCsv(r.inspector), escCsv(r.inspectTime), escCsv(r.inspectResult),
                    escCsv(r.checkRemark), escCsv(r.tempControl), escCsv(r.rectification),
                    escCsv(r.deadline), escCsv(r.remark)
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
                    list.unshift(payload);
                } else {
                    // 合并更新
                    var old = list[idx];
                    for (var k in payload) {
                        if (payload.hasOwnProperty(k)) old[k] = payload[k];
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
        var pQ = (pUrlObj.searchParams.get('q') || '').trim().toLowerCase();
        var pDispatched = (pUrlObj.searchParams.get('dispatched') || '').trim();

        readListFile('farm-review-pending.json', function(err, list) {
            if (err) { sendJson(res, 500, { error: '读取失败' }); return; }

            // 闭环：待排查列表需扣除已完成排查的房屋（records 里的 houseNo），避免"已排查又出现待办"
            readListFile('farm-review-records.json', function(errR, records) {
                if (errR) records = [];
                var doneSet = {};
                (records || []).forEach(function(x) { if (x && x.houseNo) doneSet[x.houseNo] = true; });
                list = (list || []).filter(function(r) { return r && r.houseNo && !doneSet[r.houseNo]; });

            var filtered = list.filter(function(r) {
                if (!r) return false;
                if (pTown && (r.town || '') !== pTown) return false;
                if (pVillage && (r.village || '') !== pVillage) return false;
                if (pHazard && (r.hazardLevel || '') !== pHazard) return false;
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

            // 闭环：导出待排查同样扣除已完成排查的房屋
            readListFile('farm-review-records.json', function(errR, records) {
                if (errR) records = [];
                var doneSet = {};
                (records || []).forEach(function(x) { if (x && x.houseNo) doneSet[x.houseNo] = true; });
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

            var headers = ['唯一标识','镇','村','地址','产权人','房屋用途','具体用途','层数','建筑面积','建成年份','隐患等级','初步判定','详细描述','导入时间'];
            var lines = ['﻿' + headers.join(',')];
            filtered.forEach(function(r) {
                lines.push([
                    escCsvP(r.houseNo), escCsvP(r.town), escCsvP(r.village), escCsvP(r.houseAddress),
                    escCsvP(r.owner), escCsvP(r.houseUsage), escCsvP(r.specificUsage), escCsvP(r.floors),
                    escCsvP(r.area), escCsvP(r.buildYear), escCsvP(r.hazardLevel), escCsvP(r.initialJudgment),
                    escCsvP(r.checkRemark), escCsvP(r.importTime)
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
