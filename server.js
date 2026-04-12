const http = require('http');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const PORT = process.env.PORT || 3000;

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.otf': 'font/otf',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.pdf': 'application/pdf',
  '.xml': 'application/xml',
  '.txt': 'text/plain; charset=utf-8',
  '.map': 'application/json',
};

// Extensions that benefit from gzip compression
const compressible = new Set(['.html', '.css', '.js', '.json', '.svg', '.xml', '.txt', '.map']);

// Cache durations
function getCacheHeader(ext) {
  // Static assets: cache for 1 year
  if (['.css', '.js', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.webp', '.woff', '.woff2', '.ttf', '.eot', '.otf'].includes(ext)) {
    return 'public, max-age=31536000, immutable';
  }
  // HTML: cache for 1 hour, revalidate
  if (ext === '.html') {
    return 'public, max-age=3600, must-revalidate';
  }
  return 'public, max-age=86400';
}

function sendResponse(req, res, statusCode, contentType, content, ext) {
  const headers = { 'Content-Type': contentType };

  // Add cache headers
  if (ext) {
    headers['Cache-Control'] = getCacheHeader(ext);
  }

  // Check if client accepts gzip and content is compressible
  const acceptEncoding = req.headers['accept-encoding'] || '';
  const shouldCompress = ext && compressible.has(ext) && acceptEncoding.includes('gzip') && content.length > 1024;

  if (shouldCompress) {
    zlib.gzip(content, (err, compressed) => {
      if (err) {
        res.writeHead(statusCode, headers);
        res.end(content);
      } else {
        headers['Content-Encoding'] = 'gzip';
        headers['Vary'] = 'Accept-Encoding';
        res.writeHead(statusCode, headers);
        res.end(compressed);
      }
    });
  } else {
    res.writeHead(statusCode, headers);
    res.end(content);
  }
}

const server = http.createServer((req, res) => {
  const url = decodeURIComponent(req.url.split('?')[0]);

  // Security: prevent directory traversal
  if (url.includes('..')) {
    res.writeHead(400);
    res.end('Bad Request');
    return;
  }

  // Redirect /favicon.ico to actual location
  if (url === '/favicon.ico') {
    const faviconPath = path.join(__dirname, 'assets', 'icons', 'favicon.ico');
    fs.readFile(faviconPath, (err, content) => {
      if (err) {
        res.writeHead(404);
        res.end();
      } else {
        res.writeHead(200, {
          'Content-Type': 'image/x-icon',
          'Cache-Control': 'public, max-age=31536000, immutable'
        });
        res.end(content);
      }
    });
    return;
  }

  let filePath = path.join(__dirname, url);

  fs.stat(filePath, (err, stats) => {
    if (!err && stats.isFile()) {
      // Serve the file directly
      const ext = path.extname(filePath).toLowerCase();
      const contentType = mimeTypes[ext] || 'application/octet-stream';
      fs.readFile(filePath, (readErr, content) => {
        if (readErr) {
          res.writeHead(500);
          res.end('Internal Server Error');
        } else {
          sendResponse(req, res, 200, contentType, content, ext);
        }
      });
    } else if (!err && stats.isDirectory()) {
      // Try index.html inside the directory
      const indexPath = path.join(filePath, 'index.html');
      fs.readFile(indexPath, (readErr, content) => {
        if (readErr) {
          // List projects if it's a category directory
          if (['/frontend', '/backend', '/fullstack'].includes(url) || ['/frontend/', '/backend/', '/fullstack/'].includes(url)) {
            fs.readdir(filePath, { withFileTypes: true }, (dirErr, entries) => {
              if (dirErr) {
                res.writeHead(500);
                res.end('Internal Server Error');
              } else {
                const dirs = entries.filter(e => e.isDirectory()).map(e => e.name);
                const category = url.replace(/\//g, '');
                const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${category} Projects</title><style>body{font-family:system-ui;max-width:800px;margin:2rem auto;padding:0 1rem}a{display:block;padding:0.5rem 0;font-size:1.2rem}</style></head><body><h1>${category} Projects</h1>${dirs.map(d => `<a href="${url.endsWith('/') ? url : url + '/'}${d}/">${d}</a>`).join('')}<br><a href="/">&larr; Back to Portfolio</a></body></html>`;
                sendResponse(req, res, 200, 'text/html; charset=utf-8', Buffer.from(html), '.html');
              }
            });
          } else {
            res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end('<h1>404 Not Found</h1><a href="/">Back to Portfolio</a>');
          }
        } else {
          // Redirect to trailing slash if needed
          if (!url.endsWith('/')) {
            res.writeHead(301, { 'Location': url + '/' });
            res.end();
          } else {
            sendResponse(req, res, 200, 'text/html; charset=utf-8', content, '.html');
          }
        }
      });
    } else {
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end('<h1>404 Not Found</h1><a href="/">Back to Portfolio</a>');
    }
  });
});

server.listen(PORT, () => {
  console.log(`Portfolio server running on port ${PORT}`);
  console.log(`Visit: http://localhost:${PORT}`);
});
