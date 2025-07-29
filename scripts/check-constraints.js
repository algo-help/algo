const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkConstraints() {
  console.log('현재 users 테이블의 제약 조건을 확인합니다...\n');
  
  try {
    // 제약 조건 확인을 위한 쿼리
    const constraintQuery = `
      SELECT 
        constraint_name, 
        check_clause,
        constraint_type
      FROM information_schema.check_constraints cc
      JOIN information_schema.table_constraints tc 
        ON cc.constraint_name = tc.constraint_name
      WHERE tc.table_name = 'users'
        AND tc.constraint_type = 'CHECK';
    `;

    console.log('제약 조건 확인 중...');
    
    // Supabase에서는 직접 information_schema를 조회하기 어려우니 
    // RPC 함수나 다른 방법을 사용해야 할 수도 있습니다.
    
    console.log('\n🔧 해결 방법:');
    console.log('Supabase SQL Editor에서 다음을 순서대로 실행하세요:\n');
    
    console.log('-- 1단계: 현재 제약 조건 확인');
    console.log(`SELECT constraint_name, check_clause 
FROM information_schema.check_constraints 
WHERE constraint_name LIKE '%role%';`);
    
    console.log('\n-- 2단계: 기존 제약 조건 모두 제거');
    console.log('ALTER TABLE users DROP CONSTRAINT IF EXISTS valid_role;');
    console.log('ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;');
    console.log('ALTER TABLE users DROP CONSTRAINT IF EXISTS check_role;');
    
    console.log('\n-- 3단계: 데이터 업데이트');
    console.log("UPDATE users SET role = 'v' WHERE role = 'readonly';");
    
    console.log('\n-- 4단계: 새로운 제약 조건 추가');
    console.log("ALTER TABLE users ADD CONSTRAINT valid_role CHECK (role IN ('admin', 'rw', 'v'));");
    
    console.log('\n-- 5단계: 결과 확인');
    console.log('SELECT id, email, role FROM users ORDER BY email;');

  } catch (error) {
    console.error('확인 중 오류 발생:', error.message);
  }
}

checkConstraints();