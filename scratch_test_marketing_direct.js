const http = require('http');

const req = http.request({
  hostname: '127.0.0.1',
  port: 3005,
  path: '/marketing/campaigns',
  method: 'GET',
  headers: {
    'x-tenant-id': 'test-tenant'
  }
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log(`STATUS: ${res.statusCode}`);
    console.log(`BODY: ${data}`);
  });
});

req.on('error', (e) => {
  console.error(`problem with request: ${e.message}`);
});

req.end();
