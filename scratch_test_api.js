const axios = require('axios');

async function testApi() {
  try {
    const loginRes = await axios.post('http://localhost:3000/api/v1/auth/login', {
      email: 'admin@acme.com',
      password: 'Password123!'
    });
    const token = loginRes.data.accessToken;

    const patchRes = await axios.patch('http://localhost:3000/api/v1/auth/users/me', {
      avatar: 'base64_test_string_12345'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log("PATCH Response:", patchRes.data);

    const getRes = await axios.get('http://localhost:3000/api/v1/auth/users/me', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log("GET Response:", getRes.data);
  } catch (e) {
    console.error(e.response ? e.response.data : e.message);
  }
}
testApi();
