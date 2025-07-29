const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyRoleUpdate() {
  console.log('업데이트된 사용자 롤 시스템을 확인합니다...\n');
  
  try {
    // 사용자 롤 확인
    const { data: users, error } = await supabase
      .from('users')
      .select('id, email, role, is_active')
      .order('id');

    if (error) {
      console.error('사용자 조회 실패:', error);
      return;
    }

    console.log('📊 현재 사용자 롤 현황:');
    console.log('┌─────┬─────────────────────────────────┬────────┬────────┐');
    console.log('│ ID  │ 이메일                          │ 롤     │ 활성   │');
    console.log('├─────┼─────────────────────────────────┼────────┼────────┤');
    
    const roleCounts = { admin: 0, rw: 0, v: 0 };
    users.forEach(user => {
      const roleKor = user.role === 'admin' ? '관리자' : 
                     user.role === 'rw' ? '사용자' : 
                     user.role === 'v' ? '보기전용' : user.role;
      
      console.log(`│ ${String(user.id).padEnd(3)} │ ${user.email.padEnd(31)} │ ${roleKor.padEnd(6)} │ ${user.is_active ? '활성' : '비활성'.padEnd(4)} │`);
      roleCounts[user.role] = (roleCounts[user.role] || 0) + 1;
    });
    
    console.log('└─────┴─────────────────────────────────┴────────┴────────┘');

    console.log('\n📈 롤별 통계:');
    console.log(`- admin (관리자): ${roleCounts.admin}명`);
    console.log(`- rw (사용자): ${roleCounts.rw}명`);
    console.log(`- v (보기 전용): ${roleCounts.v}명`);

    console.log('\n🔧 롤별 권한 설명:');
    console.log('- admin: 모든 기능 사용 가능 (추가, 편집, 삭제, 상태 변경)');
    console.log('- rw: 일반 사용자 기능 (추가, 편집, 삭제, 상태 변경)'); 
    console.log('- v: 보기 전용 (조회만 가능, 데이터 변경 불가)');

  } catch (error) {
    console.error('확인 중 오류 발생:', error.message);
  }
}

verifyRoleUpdate();