const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const frontendDir = __dirname;

const server = http.createServer((req, res) => {
    // Headers CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // Servir index.html
    if (req.url === '/' || req.url === '/index.html') {
        const filePath = path.join(frontendDir, 'index.html');
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('<h1>404 - Archivo no encontrado</h1>');
                return;
            }
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(data);
        });
    } else {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end('<h1>404 - No encontrado</h1>');
    }
});

server.listen(PORT, () => {
    console.log(`🚀 Servidor del frontend ejecutándose en http://localhost:${PORT}`);
    console.log(`📂 Sirviendo archivos desde: ${frontendDir}`);
});
