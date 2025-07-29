const bcrypt = require('bcryptjs');

// 비밀번호를 해시하는 유틸리티 스크립트
async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  return hash;
}

// 사용자 계정의 비밀번호 해시 생성
async function main() {
  // 환경 변수에서 계정 정보 읽기
  const email = process.env.USER_EMAIL;
  const password = process.env.USER_PASSWORD;
  
  if (!email || !password) {
    console.error('환경 변수 USER_EMAIL과 USER_PASSWORD를 설정해주세요.');
    console.error('예: USER_EMAIL=user@example.com USER_PASSWORD=your_password npm run hash-password');
    return;
  }

  console.log('-- bcrypt로 해시된 비밀번호를 사용하는 seed SQL\n');
  
  const hash = await hashPassword(password);
  console.log(`-- ${email}`);
  console.log(`UPDATE public.users SET password_hash = '${hash}' WHERE email = '${email}';`);
  console.log('');

  console.log('\n-- 비밀번호 검증 테스트');
  const testHash = await hashPassword(password);
  const isValid = await bcrypt.compare(password, testHash);
  console.log(`-- 비밀번호 해시 검증: ${isValid}`);
}

main().catch(console.error);