// 사용자 ID 확인 스크립트
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkUserId() {
  try {
    // 이메일로 사용자 찾기
    const { data, error } = await supabase
      .from('users')
      .select('id, email, avatar_url')
      .eq('email', 'developer@algocarelab.com')
      .single();

    if (error) {
      console.error('Error:', error);
      return;
    }

    console.log('User data:', data);
    console.log('Users table ID:', data?.id);
    console.log('Current avatar_url:', data?.avatar_url);
  } catch (error) {
    console.error('Error:', error);
  }
}

checkUserId();