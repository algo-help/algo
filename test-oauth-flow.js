// OAuth 흐름 테스트 스크립트
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function testOAuthFlow() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  console.log('🔹 Testing OAuth configuration...');
  console.log('Supabase URL:', supabaseUrl);
  
  const supabase = createClient(supabaseUrl, anonKey);
  
  // OAuth URL 생성 테스트
  console.log('\n🔹 Generating OAuth URL...');
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: 'https://algo-topaz.vercel.app/api/auth/callback',
      scopes: 'email profile',
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      }
    }
  });
  
  if (error) {
    console.error('❌ OAuth URL generation error:', error);
  } else {
    console.log('✅ OAuth URL generated successfully');
    console.log('URL:', data?.url);
    
    // URL 파싱
    if (data?.url) {
      const url = new URL(data.url);
      console.log('\n🔹 OAuth URL breakdown:');
      console.log('- Host:', url.host);
      console.log('- Pathname:', url.pathname);
      console.log('- Redirect URI:', url.searchParams.get('redirect_uri'));
      console.log('- Client ID:', url.searchParams.get('client_id'));
      console.log('- State:', url.searchParams.get('state'));
    }
  }
  
  // Supabase 프로젝트 정보
  console.log('\n🔹 Supabase project info:');
  console.log('- Project ID:', supabaseUrl.split('.')[0].replace('https://', ''));
  console.log('- Expected callback:', `${supabaseUrl}/auth/v1/callback`);
}

testOAuthFlow().catch(console.error);