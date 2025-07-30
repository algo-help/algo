'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  
  useEffect(() => {
    // 로그인 페이지 접근 시 즉시 홈으로 리다이렉트
    router.push('/');
  }, [router]);
  
  return null;
}