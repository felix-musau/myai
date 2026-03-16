const axios = require('axios');

async function run() {
  try {
    console.log('=== REGISTER ===');
    const reg = await axios.post('http://localhost:10000/api/auth/register', {
      username: 'testreg',
      email: 'testreg@example.com',
      password: 'Password123!'
    }, {
      headers: { 'Content-Type': 'application/json' },
      validateStatus: () => true
    });
    console.log('register status', reg.status);
    console.log('register data', reg.data);

    console.log('\n=== LOGIN ===');
    const login = await axios.post('http://localhost:10000/api/auth/login', {
      email: 'testreg@example.com',
      password: 'Password123!'
    }, {
      headers: { 'Content-Type': 'application/json' },
      validateStatus: () => true
    });
    console.log('login status', login.status);
    console.log('login data', login.data);

    console.log('\nCookies:', login.headers['set-cookie']);
  } catch (err) {
    console.error('err', err.toString());
    if (err.response) {
      console.error('resp', err.response.status, err.response.data);
    }
  }
}

run();
