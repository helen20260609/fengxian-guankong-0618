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
