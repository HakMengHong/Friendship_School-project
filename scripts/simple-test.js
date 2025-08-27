const http = require('http');

function testSkipLockoutEndpoint() {
  console.log('🧪 Testing Skip Lockout Endpoint');
  console.log('================================');
  
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/users/2/skip-lockout',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    }
  };

  const req = http.request(options, (res) => {
    console.log(`📡 Status: ${res.statusCode}`);
    console.log(`📡 Headers: ${JSON.stringify(res.headers)}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log(`📝 Response: ${data}`);
      
      if (res.statusCode === 401) {
        console.log('✅ Endpoint exists and correctly requires authentication');
      } else if (res.statusCode === 404) {
        console.log('❌ Endpoint not found');
      } else {
        console.log(`ℹ️  Unexpected status: ${res.statusCode}`);
      }
    });
  });

  req.on('error', (e) => {
    console.log(`❌ Error: ${e.message}`);
  });

  req.write(JSON.stringify({}));
  req.end();
}

// Test if server is running
const testServer = http.request({
  hostname: 'localhost',
  port: 3000,
  path: '/',
  method: 'GET'
}, (res) => {
  console.log('✅ Server is running');
  testSkipLockoutEndpoint();
});

testServer.on('error', (e) => {
  console.log('❌ Server is not running');
});

testServer.end();
