const { createClient } = require('@supabase/supabase-js');

// .env.local 파일 수동 로드
const fs = require('fs');
const envContent = fs.readFileSync('.env.local', 'utf8');
const envLines = envContent.split('\n');
envLines.forEach(line => {
  if (line.includes('=') && !line.startsWith('#')) {
    const [key, value] = line.split('=');
    process.env[key] = value;
  }
});

// Admin 클라이언트 생성 테스트
function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  console.log('🔹 Environment check:', {
    hasUrl: !!supabaseUrl,
    hasServiceKey: !!serviceRoleKey,
    urlStart: supabaseUrl?.substring(0, 30),
    serviceKeyStart: serviceRoleKey?.substring(0, 30)
  });
  
  if (!supabaseUrl) {
    throw new Error('Supabase URL이 설정되지 않았습니다.');
  }

  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY가 설정되지 않았습니다.');
  }
  
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

async function testUserLookup() {
  try {
    console.log('🔹 Testing user lookup for jeff@algocarelab.com...');
    
    const adminSupabase = createAdminClient();
    console.log('🔹 Admin client created successfully');
    
    const { data: userData, error: userError } = await adminSupabase
      .from('users')
      .select('id, email, role, is_active, password_hash, created_at, avatar_url')
      .eq('email', 'jeff@algocarelab.com')
      .single();
      
    console.log('🔹 User lookup result:', { 
      userData, 
      userError, 
      errorCode: userError?.code,
      errorMessage: userError?.message 
    });
    
    if (userData) {
      console.log('🔹 User found! Details:', {
        id: userData.id,
        email: userData.email,
        role: userData.role,
        is_active: userData.is_active
      });
    }
    
  } catch (error) {
    console.error('🔹 Test failed:', error);
  }
}

testUserLookup();