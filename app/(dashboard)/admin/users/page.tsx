'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase';
import { getSession } from '@/app/(dashboard)/actions';
import { updateUserRole as updateUserRoleAction, updateUserStatus as updateUserStatusAction } from '../actions';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StatsCard } from '@/components/stats-card';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Users, 
  UserCheck, 
  UserX, 
  Shield, 
  Eye, 
  Edit,
  AlertCircle,
  ArrowLeft,
  RefreshCw,
  Trash2
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface User {
  id: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
  password_hash: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    checkAdminAccess();
    loadUsers();
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

  const loadUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('users')
        .select('id, email, role, is_active, created_at, password_hash')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setUsers(data || []);
    } catch (err) {
      // console.error('사용자 로딩 오류:', err);
      setError('사용자 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const updateUserStatus = async (userId: string, isActive: boolean) => {
    try {
      setUpdating(userId);
      
      // 서버 액션 사용
      const result = await updateUserStatusAction(userId, isActive);

      // 로컬 상태 업데이트
      setUsers(users.map(user => 
        user.id === userId 
          ? { ...user, is_active: isActive }
          : user
      ));

    } catch (err) {
      // console.error('사용자 상태 업데이트 오류:', err);
      const { toast } = await import('sonner');
      toast.error('사용자 상태 업데이트에 실패했습니다.', {
        description: err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.'
      });
      setError('사용자 상태 업데이트에 실패했습니다.');
    } finally {
      setUpdating(null);
    }
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      setUpdating(userId);
      
      // console.log('Updating user role:', { userId, newRole }); // 디버깅용
      
      // 서버 액션 사용
      const result = await updateUserRoleAction(userId, newRole);

      // console.log('Update result:', result); // 디버깅용

      // 로컬 상태 업데이트
      setUsers(users.map(user => 
        user.id === userId 
          ? { ...user, role: newRole }
          : user
      ));
      
      // 성공 알림
      const roleLabels: { [key: string]: string } = {
        'admin': '관리자',
        'rw': '사용자',
        'v': '보기전용'
      };
      
      // sonner 토스트 import 추가 필요
      const { toast } = await import('sonner');
      toast.success(`권한이 ${roleLabels[newRole]}로 변경되었습니다.`, {
        description: '변경된 권한은 해당 사용자가 새로고침하면 즉시 적용됩니다.'
      });

    } catch (err) {
      // console.error('사용자 롤 업데이트 오류:', err);
      const { toast } = await import('sonner');
      toast.error('사용자 롤 업데이트에 실패했습니다.', {
        description: err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.'
      });
      setError('사용자 롤 업데이트에 실패했습니다.');
    } finally {
      setUpdating(null);
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      setDeleting(userId);
      
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (error) {
        throw error;
      }

      // 로컬 상태 업데이트
      setUsers(users.filter(user => user.id !== userId));

    } catch (err) {
      // console.error('사용자 삭제 오류:', err);
      setError('사용자 삭제에 실패했습니다.');
    } finally {
      setDeleting(null);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge variant="destructive" className="text-xs">관리자</Badge>;
      case 'rw':
        return <Badge variant="default" className="text-xs">사용자</Badge>;
      case 'v':
        return <Badge variant="secondary" className="text-xs">보기전용</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">{role}</Badge>;
    }
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive
      ? <Badge variant="default" className="text-xs bg-green-100 text-green-800 hover:bg-green-100 border-0 shadow-none">활성</Badge>
      : <Badge variant="secondary" className="text-xs">비활성</Badge>;
  };

  const getAuthTypeBadge = (passwordHash: string) => {
    return passwordHash === 'oauth_user'
      ? <Badge variant="outline" className="text-xs">OAuth</Badge>
      : <Badge variant="outline" className="text-xs">이메일</Badge>;
  };

  // 시연용 계정 확인
  const isDemoAccount = userEmail === 'testviewtest@algocarelab.com';

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
              <h1 className="text-lg sm:text-xl font-semibold">사용자 관리</h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                시스템 사용자를 관리하고 권한을 설정합니다
              </p>
            </div>
            <Button
              onClick={loadUsers}
              disabled={loading}
              variant="outline"
              size="sm"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              새로고침
            </Button>
          </div>

        {/* 통계 카드 */}
        {!loading && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">전체 사용자</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{users.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">활성 사용자</CardTitle>
                <UserCheck className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {users.filter(u => u.is_active).length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">관리자</CardTitle>
                <Shield className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {users.filter(u => u.role === 'admin').length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">승인 대기</CardTitle>
                <UserX className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {users.filter(u => !u.is_active).length}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 오류 메시지 */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* 사용자 테이블 */}
        <Card>
          <CardHeader>
            <CardTitle>사용자 목록</CardTitle>
            <CardDescription>
              모든 등록된 사용자의 상태와 권한을 관리할 수 있습니다
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Skeleton key={index} className="h-16 w-full" />
                ))}
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-8">
                <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-sm font-semibold text-gray-900">사용자가 없습니다</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  등록된 사용자가 없습니다.
                </p>
              </div>
            ) : (
              <div className="w-full overflow-x-auto">
                <Table className="min-w-[800px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-center px-0.5 sm:px-3 w-auto">
                        <span className="text-xs sm:text-sm">이메일</span>
                      </TableHead>
                      <TableHead className="text-center px-0.5 sm:px-3 w-auto">
                        <span className="text-xs sm:text-sm">롤</span>
                      </TableHead>
                      <TableHead className="text-center px-0.5 sm:px-3 w-auto">
                        <span className="text-xs sm:text-sm">인증 방식</span>
                      </TableHead>
                      <TableHead className="text-center px-0.5 sm:px-3 w-auto">
                        <span className="text-xs sm:text-sm">가입일</span>
                      </TableHead>
                      <TableHead className="text-center px-0.5 sm:px-3 w-auto">
                        <span className="text-xs sm:text-sm">상태</span>
                      </TableHead>
                      <TableHead className="text-center px-0.5 sm:px-3 w-auto">
                        <span className="text-xs sm:text-sm">작업</span>
                      </TableHead>
                      <TableHead className="relative text-center w-auto">
                        <span className="sr-only">삭제</span>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="text-center px-0.5 sm:px-3 py-1.5 sm:py-4 text-xs sm:text-sm whitespace-nowrap font-medium">
                          {user.email}
                        </TableCell>
                        <TableCell className="text-center px-0.5 sm:px-3 py-1.5 sm:py-4 text-xs sm:text-sm whitespace-nowrap">
                          <Select
                            value={user.role}
                            onValueChange={(value) => updateUserRole(user.id, value)}
                            disabled={updating === user.id}
                          >
                            <SelectTrigger className="w-20 sm:w-24 h-7 sm:h-8 text-xs mx-auto">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">관리자</SelectItem>
                              <SelectItem value="rw">사용자</SelectItem>
                              <SelectItem value="v">보기전용</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-center px-0.5 sm:px-3 py-1.5 sm:py-4 text-xs sm:text-sm whitespace-nowrap">
                          {getAuthTypeBadge(user.password_hash)}
                        </TableCell>
                        <TableCell className="text-center px-0.5 sm:px-3 py-1.5 sm:py-4 text-xs sm:text-sm whitespace-nowrap text-muted-foreground">
                          {new Date(user.created_at).toLocaleDateString('ko-KR')}
                        </TableCell>
                        <TableCell className="text-center px-0.5 sm:px-3 py-1.5 sm:py-4 text-xs sm:text-sm whitespace-nowrap">
                          {getStatusBadge(user.is_active)}
                        </TableCell>
                        <TableCell className="text-center px-0.5 sm:px-3 py-1.5 sm:py-4 whitespace-nowrap">
                          <div className="flex items-center justify-center">
                            {user.is_active ? (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={updating === user.id || deleting === user.id}
                                    className="h-7 px-2 text-xs text-black hover:text-gray-700 hover:bg-gray-50"
                                  >
                                    <UserX className="h-3 w-3 mr-1" />
                                    <span className="hidden sm:inline">비활성화</span>
                                    <span className="sm:hidden">비활성</span>
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>사용자 비활성화</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      {user.email} 사용자를 비활성화하시겠습니까?
                                      비활성화된 사용자는 시스템에 접근할 수 없습니다.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>취소</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => updateUserStatus(user.id, false)}
                                    >
                                      비활성화
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            ) : (
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => updateUserStatus(user.id, true)}
                                disabled={updating === user.id || deleting === user.id}
                                className="bg-green-600 hover:bg-green-700 h-7 px-2 text-xs text-white"
                              >
                                <UserCheck className="h-3 w-3 mr-1" />
                                <span className="hidden sm:inline">승인</span>
                                <span className="sm:hidden">승인</span>
                              </Button>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-center px-0.5 sm:px-3 py-1.5 sm:py-4 whitespace-nowrap">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                disabled={updating === user.id || deleting === user.id}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 h-7 w-7 p-0"
                              >
                                <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                                <span className="sr-only">삭제</span>
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>정말로 삭제하시겠습니까?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  {user.email} 사용자를 완전히 삭제합니다.
                                  이 작업은 되돌릴 수 없으며, 사용자의 모든 데이터가 영구적으로 삭제됩니다.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>취소</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteUser(user.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  삭제
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
    </div>
  );
}