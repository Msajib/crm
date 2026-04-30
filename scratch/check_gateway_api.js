
const http = require('http');

http.get('http://localhost:3000/api/tenants/system/templates', (res) => {
  console.log('Status:', res.statusCode);
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log('Data:', data);
  });
}).on('error', (err) => {
  console.error('Error:', err.message);
});
