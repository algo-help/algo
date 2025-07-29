const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCurrentRoles() {
  console.log('현재 데이터베이스의 사용자 롤을 확인합니다...\n');
  
  try {
    // 현재 사용자들의 롤 확인
    const { data: users, error } = await supabase
      .from('users')
      .select('id, email, role')
      .order('id');

    if (error) {
      console.error('사용자 조회 실패:', error);
      return;
    }

    console.log('📋 현재 사용자 롤 상태:');
    users.forEach((user, index) => {
      console.log(`${index + 1}. ID: ${user.id}, 이메일: ${user.email}, 롤: ${user.role}`);
    });

    // 롤별 카운트
    const roleCounts = {};
    users.forEach(user => {
      roleCounts[user.role] = (roleCounts[user.role] || 0) + 1;
    });

    console.log('\n📊 롤별 카운트:');
    Object.entries(roleCounts).forEach(([role, count]) => {
      console.log(`- ${role}: ${count}명`);
    });

    // 제약 조건에 맞지 않는 롤 찾기
    const validRoles = ['admin', 'rw', 'v'];
    const invalidUsers = users.filter(user => !validRoles.includes(user.role));
    
    if (invalidUsers.length > 0) {
      console.log('\n⚠️  새로운 제약 조건에 맞지 않는 사용자:');
      invalidUsers.forEach(user => {
        console.log(`- ID: ${user.id}, 이메일: ${user.email}, 현재 롤: ${user.role}`);
      });
      
      console.log('\n🔧 수정 방법:');
      console.log('다음 SQL을 Supabase에서 실행하세요:');
      console.log('');
      
      invalidUsers.forEach(user => {
        if (user.role === 'readonly') {
          console.log(`UPDATE users SET role = 'v' WHERE id = ${user.id}; -- ${user.email}`);
        } else {
          console.log(`UPDATE users SET role = 'rw' WHERE id = ${user.id}; -- ${user.email} (${user.role} → rw)`);
        }
      });
      
      console.log('');
      console.log('그 다음:');
      console.log('ALTER TABLE users DROP CONSTRAINT IF EXISTS valid_role;');
      console.log('ALTER TABLE users ADD CONSTRAINT valid_role CHECK (role IN (\'admin\', \'rw\', \'v\'));');
    } else {
      console.log('\n✅ 모든 사용자의 롤이 새로운 제약 조건에 맞습니다!');
      console.log('다음 SQL을 실행하여 제약 조건을 업데이트하세요:');
      console.log('ALTER TABLE users DROP CONSTRAINT IF EXISTS valid_role;');
      console.log('ALTER TABLE users ADD CONSTRAINT valid_role CHECK (role IN (\'admin\', \'rw\', \'v\'));');
    }

  } catch (error) {
    console.error('확인 중 오류 발생:', error.message);
  }
}

checkCurrentRoles();