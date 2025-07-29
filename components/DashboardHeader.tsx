'use client';

import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, LogOut, Users } from "lucide-react";
import { logout } from '@/app/(dashboard)/actions';

interface DashboardHeaderProps {
  userEmail: string | null;
  userRole: string;
  isDemoAccount?: boolean;
}

export default function DashboardHeader({ userEmail, userRole, isDemoAccount = false }: DashboardHeaderProps) {
  const router = useRouter();

  // 이메일에서 사용자명 추출 함수 (@ 앞부분만, 첫 글자 대문자)
  const extractUsername = (email: string) => {
    if (!email) return '';
    const username = email.split('@')[0];
    return username.charAt(0).toUpperCase() + username.slice(1);
  };

  // 로그아웃 핸들러
  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = '/login';
    } catch (error) {
      // console.error('로그아웃 오류:', error);
      window.location.href = '/login';
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white backdrop-blur">
      <div className="container mx-auto flex h-14 items-center px-4 sm:px-6 lg:px-8">
        <div className="flex items-center">
          <a className="flex items-center space-x-2" href="/">
            <img 
              src="https://portal.algocare.me/favicon.ico" 
              alt="Algocare" 
              className="h-5 w-5 sm:h-6 sm:w-6" 
            />
            <span className="font-bold text-sm sm:text-base">관리 시스템</span>
          </a>
        </div>
        <div className="flex flex-1 items-center justify-end">
          {userEmail && (
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="flex items-center gap-2 text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2 h-8 sm:h-9 min-w-[80px] sm:min-w-[80px] data-[state=open]:bg-accent data-[state=open]:text-accent-foreground ml-auto"
                >
                  <User className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">
                    {isDemoAccount ? 'Testviewtest' : extractUsername(userEmail || '')}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" sideOffset={8}>
                <DropdownMenuLabel>내 계정</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem disabled>
                  <User className="mr-2 h-4 w-4" />
                  <span className="text-sm">{isDemoAccount ? 'testviewtest@algocarelab.com' : userEmail}</span>
                </DropdownMenuItem>
                {userRole === 'v' && (
                  <DropdownMenuItem disabled>
                    <Badge variant="outline" className="text-xs mr-2">
                      {isDemoAccount ? '시연용 보기 전용' : '보기 전용'}
                    </Badge>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                {userRole === 'admin' && (
                  <>
                    <DropdownMenuItem onClick={() => router.push('/admin/users')}>
                      <Users className="mr-2 h-4 w-4" />
                      <span>사용자 관리</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>로그아웃</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}