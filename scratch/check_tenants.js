const axios = require('axios');

async function check() {
  try {
    const res = await axios.get('http://127.0.0.1:3002/tenants');
    console.log('Tenants Response:', JSON.stringify(res.data, null, 2));
  } catch (err) {
    console.error('Error fetching tenants:', err.message);
    if (err.response) {
      console.error('Status:', err.response.status);
      console.error('Data:', err.response.data);
    }
  }
}

check();
