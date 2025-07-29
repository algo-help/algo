'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, LogOut, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { checkUserStatus } from '../(dashboard)/actions';

export default function PendingApprovalPage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string>('');
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    // 쿠키에서 사용자 정보 가져오기
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(';').shift();
    };

    const sessionCookie = getCookie('auth-session');
    if (sessionCookie) {
      try {
        const session = JSON.parse(decodeURIComponent(sessionCookie));
        setUserEmail(session.email || '');
      } catch (error) {
        // console.error('세션 파싱 오류:', error);
      }
    }
  }, []);

  const handleCheckStatus = async () => {
    setIsChecking(true);
    try {
      const result = await checkUserStatus();
      
      if (result.success && result.user?.is_active) {
        // 사용자가 활성화되었으면 홈으로 리다이렉트
        router.push('/');
        router.refresh();
      } else if (result.error) {
        // console.error('상태 확인 오류:', result.error);
        // 오류가 발생하면 페이지 새로고침으로 폴백
        window.location.reload();
      } else {
        // 아직 활성화되지 않았으면 현재 페이지 유지
        // console.log('아직 승인 대기 중입니다.');
      }
    } catch (error) {
      // console.error('상태 확인 오류:', error);
      // 오류가 발생하면 페이지 새로고침으로 폴백
      window.location.reload();
    } finally {
      setIsChecking(false);
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });
      
      if (response.ok) {
        router.push('/login');
      }
    } catch (error) {
      // console.error('로그아웃 오류:', error);
      // 오류가 발생해도 로그인 페이지로 이동
      router.push('/login');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">승인 대기 중</CardTitle>
          <CardDescription className="mt-2">
            계정이 승인 대기 중입니다
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              회원가입이 완료되었습니다.<br />
              관리자의 승인 후 이용하실 수 있습니다.
            </AlertDescription>
          </Alert>

          {userEmail && (
            <div className="text-center">
              <p className="text-sm text-gray-600">등록된 이메일</p>
              <p className="font-medium">{userEmail}</p>
            </div>
          )}

          <div className="space-y-3">
            <Button 
              onClick={handleCheckStatus} 
              className="w-full bg-black hover:bg-gray-800"
              disabled={isChecking}
            >
              {isChecking ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  확인 중...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  승인 상태 확인
                </>
              )}
            </Button>
            
            <Button 
              onClick={handleLogout} 
              variant="outline" 
              className="w-full"
            >
              <LogOut className="mr-2 h-4 w-4" />
              로그아웃
            </Button>
          </div>

          <div className="text-center text-sm text-gray-500 pt-4 border-t">
            <p>문의사항이 있으신가요?</p>
            <p className="mt-1">
              관리자에게 문의해 주세요: <a href="https://algocare.slack.com/archives/D07C1DBS20G" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">Jeff</a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}