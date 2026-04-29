const axios = require('axios');

async function run() {
  try {
    const res = await axios.post('http://localhost:3005/social/config', {
      platform: 'facebook',
      appId: '123',
      appSecret: '456',
      settings: {
        pageAccessToken: 'token'
      }
    }, {
      headers: { 'x-tenant-id': 'test-tenant' }
    });
    console.log('Success:', res.data);
  } catch (err) {
    console.error('Error:', err.response ? err.response.data : err.message);
  }
}

run();
