const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function checkDatabase() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
  
  // 1. users 테이블 구조 확인
  console.log('🔹 Checking users table structure...');
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('*')
    .limit(1);
  
  if (!usersError) {
    console.log('✅ Users table exists and is accessible');
    if (users.length > 0) {
      console.log('Sample user structure:', Object.keys(users[0]));
      console.log('ID type check:', { 
        id: users[0].id, 
        type: typeof users[0].id,
        length: users[0].id?.length 
      });
    }
  } else {
    console.error('❌ Users table error:', usersError);
  }
  
  // 2. 현재 사용자 목록
  console.log('\n🔹 Current users:');
  const { data: allUsers, error: allError } = await supabase
    .from('users')
    .select('email, id, auth_id, role, is_active')
    .order('created_at', { ascending: false });
  
  if (!allError) {
    allUsers.forEach(user => {
      console.log(`- ${user.email}: ID=${user.id}, auth_id=${user.auth_id}, role=${user.role}, active=${user.is_active}`);
    });
  }
  
  // 3. Supabase Auth 설정 확인을 위한 테스트
  console.log('\n🔹 Testing Supabase Auth...');
  const { data: authData, error: authError } = await supabase.auth.getSession();
  console.log('Auth test:', { hasSession: !!authData?.session, error: authError?.message });
}

checkDatabase().catch(console.error);