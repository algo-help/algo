// 임시 스크립트: avatar_url 컬럼 추가
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('환경 변수가 설정되지 않았습니다.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function addAvatarColumn() {
  try {
    // SQL 쿼리 실행
    const { data, error } = await supabase.rpc('execute_sql', {
      query: `
        ALTER TABLE users 
        ADD COLUMN IF NOT EXISTS avatar_url TEXT;
      `
    });

    if (error) {
      // RPC가 없는 경우 직접 쿼리 시도
      console.log('RPC 함수가 없습니다. Supabase Dashboard에서 직접 실행해주세요:');
      console.log('ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;');
      return;
    }

    console.log('avatar_url 컬럼이 성공적으로 추가되었습니다.');
  } catch (error) {
    console.error('오류 발생:', error);
    console.log('\nSupabase Dashboard SQL Editor에서 다음 쿼리를 실행해주세요:');
    console.log('ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;');
  }
}

addAvatarColumn();