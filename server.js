var http = require('http');
var fs = require('fs');
var path = require('path');

var port = process.env.PORT || 8000;
var pagesDir = path.join(__dirname, 'pages');

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

http.createServer(function(req, res) {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
        res.writeHead(405, {'Content-Type': 'text/plain'});
        res.end('Method Not Allowed');
        return;
    }

    var urlPath = req.url.split('?')[0];
    urlPath = urlPath === '/' ? 'tp-overview.html' : urlPath;
    var baseDir = pagesDir;

    // 静态资源（js/css/data/backups/tools/temp/fonts）从根目录提供
    if (/^\/(js|css|data|backups|tools|temp|assets|fonts)\//.test(urlPath)) {
        baseDir = __dirname;
    }

    var filePath = path.join(baseDir, urlPath);
    var ext = path.extname(filePath).toLowerCase();
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
