const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
  let filePath = '';
  
  if (req.url === '/' || req.url === '/index.html') {
    filePath = path.join(__dirname, 'prototype.html');
  } else if (req.url === '/prototype.html') {
    filePath = path.join(__dirname, 'prototype.html');
  } else {
    res.writeHead(404);
    res.end('File not found');
    return;
  }

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(500);
      res.end('Server error');
      return;
    }

    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(content);
  });
});

const PORT = 8888;
server.listen(PORT, () => {
  console.log(`🦕 DinoApp Prototype Server running at:`);
  console.log(`   Local:   http://localhost:${PORT}`);
  console.log(`   Network: http://192.168.1.109:${PORT}`);
  console.log(`\n📱 프로토타입을 확인하려면 브라우저에서 위 주소로 접속하세요!`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`Port ${PORT} is already in use. Trying port ${PORT + 1}...`);
    server.listen(PORT + 1);
  } else {
    console.error('Server error:', err);
  }
});