var http = require('http');
var fs = require('fs');
var path = require('path');

var port = 8000;
var baseDir = path.join(__dirname, 'pages');

var mimeTypes = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

http.createServer(function(req, res) {
    var filePath = path.join(baseDir, req.url === '/' ? 'tp-expert.html' : req.url);
    var ext = path.extname(filePath).toLowerCase();
    var contentType = mimeTypes[ext] || 'application/octet-stream';
    fs.readFile(filePath, function(err, data) {
        if (err) {
            res.writeHead(404, {'Content-Type': 'text/plain'});
            res.end('Not found');
            return;
        }
        res.writeHead(200, {
            'Content-Type': contentType,
            'Access-Control-Allow-Origin': '*'
        });
        res.end(data);
    });
}).listen(port, function() {
    console.log('Server running at http://localhost:' + port);
});
