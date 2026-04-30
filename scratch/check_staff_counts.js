const axios = require('axios');

async function check() {
  try {
    // Note: This needs a token in a real app, but let's see if the route exists
    const res = await axios.get('http://127.0.0.1:3001/users/internal/staff-counts');
    console.log('Staff Counts Response:', JSON.stringify(res.data, null, 2));
  } catch (err) {
    console.error('Error fetching staff counts:', err.message);
    if (err.response) {
      console.error('Status:', err.response.status);
      console.error('Data:', err.response.data);
    }
  }
}

check();
