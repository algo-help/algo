'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSession } from '@/app/(dashboard)/actions';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { 
  Shield, 
  Key, 
  Users, 
  Settings,
  RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminAuthPage() {
  const [userRole, setUserRole] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const session = await getSession();
      
      if (!session) {
        router.replace('/login');
        return;
      }
      
      if (session.role !== 'admin') {
        router.replace('/');
        return;
      }
      
      setUserRole(session.role);
      setUserEmail(session.email);
    } catch (err) {
      // console.error('Session check error:', err);
      router.replace('/login');
    }
  };

  // 권한이 없는 사용자는 checkAdminAccess에서 자동 리다이렉트
  if (userRole !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">잠시만 기다려주세요...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-lg sm:text-xl font-semibold">인증 및 권한</h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                시스템 인증 방식과 사용자 권한을 관리합니다
              </p>
            </div>
          </div>

          {/* 기능 카드들 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 인증 설정 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  인증 설정
                </CardTitle>
                <CardDescription>
                  로그인 방식과 인증 옵션을 설정합니다
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    • OAuth 설정 관리
                  </div>
                  <div className="text-sm text-muted-foreground">
                    • 이메일 인증 설정
                  </div>
                  <div className="text-sm text-muted-foreground">
                    • 비밀번호 정책 설정
                  </div>
                  <Button variant="outline" disabled>
                    설정 (준비 중)
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* 권한 관리 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  권한 관리
                </CardTitle>
                <CardDescription>
                  사용자 역할과 권한을 관리합니다
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    • 역할 기반 접근 제어
                  </div>
                  <div className="text-sm text-muted-foreground">
                    • 메뉴 접근 권한 설정
                  </div>
                  <div className="text-sm text-muted-foreground">
                    • 기능별 권한 설정
                  </div>
                  <Button variant="outline" disabled>
                    설정 (준비 중)
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* 사용자 세션 관리 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  세션 관리
                </CardTitle>
                <CardDescription>
                  활성 세션과 접속 로그를 관리합니다
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    • 활성 세션 모니터링
                  </div>
                  <div className="text-sm text-muted-foreground">
                    • 접속 로그 조회
                  </div>
                  <div className="text-sm text-muted-foreground">
                    • 세션 강제 종료
                  </div>
                  <Button variant="outline" disabled>
                    관리 (준비 중)
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* 보안 설정 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  보안 설정
                </CardTitle>
                <CardDescription>
                  시스템 보안과 관련된 설정을 관리합니다
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    • IP 주소 제한
                  </div>
                  <div className="text-sm text-muted-foreground">
                    • 접속 시도 제한
                  </div>
                  <div className="text-sm text-muted-foreground">
                    • 보안 로그 관리
                  </div>
                  <Button variant="outline" disabled>
                    설정 (준비 중)
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
    </div>
  );
}