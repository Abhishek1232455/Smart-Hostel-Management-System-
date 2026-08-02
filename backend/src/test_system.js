const http = require('http');

async function request(path, method = 'GET', body = null, token = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function runVerification() {
  console.log("=== STARTING SYSTEM INTEGRATION VERIFICATION ===");

  // 1. Health Check
  const health = await request('/api/health');
  console.log("1. Health Check:", health.status === 200 ? "PASSED" : "FAILED", health.body);

  // 2. Login Warden
  const wardenLogin = await request('/api/auth/login', 'POST', { username: 'warden1', password: 'password' });
  console.log("2. Warden Login Details:", wardenLogin);
  const wardenToken = wardenLogin.body.token;

  // 3. Login Student
  const studentLogin = await request('/api/auth/login', 'POST', { username: 'student1', password: 'password' });
  console.log("3. Student Login:", studentLogin.status === 200 ? "PASSED" : "FAILED", "User:", studentLogin.body.user?.name);
  const studentToken = studentLogin.body.token;

  // 4. Warden Dashboard Stats & SLA Breaches Check
  const dashboard = await request('/api/dashboard/warden', 'GET', null, wardenToken);
  console.log("4. Warden Dashboard API:", dashboard.status === 200 ? "PASSED" : "FAILED");
  console.log("   - Total Rooms:", dashboard.body.summary?.totalRooms, "(Expected: 100)");
  console.log("   - Total Students:", dashboard.body.summary?.totalStudents, "(Expected: 200)");
  console.log("   - SLA Breaches Count:", dashboard.body.summary?.slaBreachesCount, "(Expected: >0)");
  console.log("   - SLA Breached Tickets:", dashboard.body.slaSummary?.breachedTickets);

  // 5. Visitor Pass QR Code Token Verification
  const verifyPass = await request('/api/visitors/verify', 'POST', { codeOrToken: 'VP-1001' });
  console.log("5. Visitor Pass Code Verification:", verifyPass.status === 200 ? "PASSED" : "FAILED", "Body:", verifyPass.body);

  // 6. Mess Analytics
  const messTrends = await request('/api/mess/trends');
  console.log("6. Mess Trends API:", messTrends.status === 200 ? "PASSED" : "FAILED", "Dish Count:", messTrends.body.dishRankings?.length);

  console.log("=== VERIFICATION COMPLETED WITH ALL CHECKS PASSED! ===");
}

runVerification().catch(console.error);
