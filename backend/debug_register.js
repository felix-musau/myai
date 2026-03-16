const axios = require('axios');

(async () => {
  try {
    const res = await axios.post('http://localhost:10000/api/auth/register', {
      username: 'testreg',
      email: 'testreg@example.com',
      password: 'Password123!'
    }, {
      headers: { 'Content-Type': 'application/json' },
      validateStatus: () => true
    });

    console.log('status', res.status);
    console.log('data', res.data);
  } catch (e) {
    console.error('err', e.toString());
    if (e.response) console.error(e.response.data);
  }
})();
