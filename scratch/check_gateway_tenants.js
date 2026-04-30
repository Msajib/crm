const axios = require('axios');

async function check() {
  try {
    // We need a token to pass through the gateway
    // I'll try to call a public route or just see if the gateway responds
    const res = await axios.get('http://127.0.0.1:3100/api/tenants');
    console.log('Gateway Response:', res.data);
  } catch (err) {
    console.error('Gateway Error:', err.message);
    if (err.response) {
      console.error('Status:', err.response.status);
      console.error('Data:', err.response.data);
    }
  }
}

check();
