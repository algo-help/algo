const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateUserRoles() {
  console.log('사용자 롤을 새로운 체계로 업데이트합니다...\n');
  console.log('롤 매핑:');
  console.log('- admin → admin (관리자)');
  console.log('- readonly → v (보기 전용)');
  console.log('- 기타 → rw (사용자)\n');
  
  try {
    // 현재 사용자들의 롤 확인
    const { data: users, error: fetchError } = await supabase
      .from('users')
      .select('id, email, role')
      .order('id');

    if (fetchError) {
      console.error('사용자 조회 실패:', fetchError);
      return;
    }

    console.log('📋 현재 사용자 롤 상태:');
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email}: ${user.role}`);
    });

    console.log('\n🔄 롤 업데이트 시작...');

    // admin 롤 유지 (이미 admin인 경우)
    const adminUsers = users.filter(user => user.role === 'admin');
    console.log(`✅ Admin 사용자 ${adminUsers.length}명은 그대로 유지`);

    // readonly → v 변경
    const readonlyUsers = users.filter(user => user.role === 'readonly');
    if (readonlyUsers.length > 0) {
      const { error: readonlyError } = await supabase
        .from('users')
        .update({ role: 'v' })
        .eq('role', 'readonly');

      if (readonlyError) {
        console.error('readonly → v 변경 실패:', readonlyError);
      } else {
        console.log(`✅ ${readonlyUsers.length}명의 readonly 사용자를 v로 변경`);
      }
    }

    // 기타 롤 → rw 변경
    const otherUsers = users.filter(user => user.role !== 'admin' && user.role !== 'readonly');
    if (otherUsers.length > 0) {
      const otherUserIds = otherUsers.map(user => user.id);
      const { error: otherError } = await supabase
        .from('users')
        .update({ role: 'rw' })
        .in('id', otherUserIds);

      if (otherError) {
        console.error('기타 → rw 변경 실패:', otherError);
      } else {
        console.log(`✅ ${otherUsers.length}명의 기타 사용자를 rw로 변경`);
      }
    }

    // 업데이트 후 결과 확인
    const { data: updatedUsers, error: verifyError } = await supabase
      .from('users')
      .select('id, email, role')
      .order('id');

    if (verifyError) {
      console.error('업데이트 확인 실패:', verifyError);
      return;
    }

    console.log('\n📊 업데이트 후 사용자 롤:');
    const roleCounts = { admin: 0, rw: 0, v: 0 };
    updatedUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email}: ${user.role}`);
      roleCounts[user.role] = (roleCounts[user.role] || 0) + 1;
    });

    console.log('\n📈 롤별 통계:');
    console.log(`- admin (관리자): ${roleCounts.admin}명`);
    console.log(`- rw (사용자): ${roleCounts.rw}명`);
    console.log(`- v (보기 전용): ${roleCounts.v}명`);

    console.log('\n✅ 사용자 롤 업데이트가 완료되었습니다!');

  } catch (error) {
    console.error('업데이트 중 오류 발생:', error.message);
  }
}

updateUserRoles();