const https = require('https');

const data = JSON.stringify([{
  id: 'db909e55-12cc-4e2c-841c-e5014872a8e6',
  email: 'test@algocarelab.com',
  password_hash: '$2b$10$68AbaOMGLH4n2Xuel9ylU.KioN7S77SHVRw9RcmN9gb/BrLvQXGl6',
  role: 'admin',
  is_active: true
}]);

const options = {
  hostname: 'ewkfmzqvflbmdiwojnse.supabase.co',
  port: 443,
  path: '/rest/v1/users?on_conflict=email',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length,
    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV3a2ZtenF2ZmxibWRpd29qbnNlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzMxODczNiwiZXhwIjoyMDYyODk0NzM2fQ.p4ZOhm9bwEObj7r3t0C5U2DLdqsBq1uyY-YxkUFwxYI',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV3a2ZtenF2ZmxibWRpd29qbnNlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzMxODczNiwiZXhwIjoyMDYyODk0NzM2fQ.p4ZOhm9bwEObj7r3t0C5U2DLdqsBq1uyY-YxkUFwxYI',
    'Prefer': 'resolution=merge-duplicates,return=representation'
  }
};

const req = https.request(options, (res) => {
  console.log(`statusCode: ${res.statusCode}`);
  console.log(`headers: ${JSON.stringify(res.headers)}`);

  res.on('data', (d) => {
    process.stdout.write(d);
    console.log('\n');
    
    if (res.statusCode === 201 || res.statusCode === 200) {
      console.log('✅ 관리자 계정이 성공적으로 생성되었습니다!');
      console.log('=====================================');
      console.log('이메일: test@algocarelab.com');
      console.log('비밀번호: pass123');
      console.log('역할: admin');
      console.log('상태: 활성화됨');
      console.log('=====================================');
    }
  });
});

req.on('error', (error) => {
  console.error(error);
});

req.write(data);
req.end();