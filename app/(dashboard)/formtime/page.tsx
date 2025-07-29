'use client';

import { useState, useEffect } from 'react';
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Clock, Calendar, Users, Settings, Plus, Eye, Edit, LogIn } from "lucide-react";
import Link from "next/link";
import { toast } from 'sonner';
import { getSession } from '../actions';

export default function FormTimePage() {
  const [forms, setForms] = useState<any[]>([]);
  const [responses, setResponses] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    checkLoginStatus();
    loadData();
  }, []);

  const checkLoginStatus = async () => {
    const session = await getSession();
    if (session && session.authenticated) {
      setIsLoggedIn(true);
      setUser(session);
    } else {
      setIsLoggedIn(false);
      setUser(null);
    }
  };

  const loadData = () => {
    const savedForms = JSON.parse(localStorage.getItem('formtime_forms') || '[]');
    const savedResponses = JSON.parse(localStorage.getItem('formtime_responses') || '[]');
    const savedAppointments = JSON.parse(localStorage.getItem('formtime_appointments') || '[]');
    
    // 기본 데이터 (로그인하지 않은 상태에서 보여줄 데모 데이터)
    const defaultForms = [
      {
        id: '1',
        title: '고객 만족도 조사',
        description: '서비스 개선을 위한 고객 만족도 조사 폼입니다.',
        responses_count: 24,
        is_published: true,
        created_at: new Date('2024-01-15'),
      },
      {
        id: '2', 
        title: '이벤트 참가 신청',
        description: '월간 마케팅 이벤트 참가 신청을 받는 폼입니다.',
        responses_count: 156,
        is_published: true,
        created_at: new Date('2024-01-10'),
      },
      {
        id: '3',
        title: '피드백 수집',
        description: '제품 개선을 위한 사용자 피드백을 수집합니다.',
        responses_count: 0,
        is_published: false,
        created_at: new Date('2024-01-20'),
      },
    ];
    
    if (isLoggedIn && savedForms.length > 0) {
      // 실제 응답 수 계산
      const formsWithResponseCounts = savedForms.map((form: any) => ({
        ...form,
        responses_count: savedResponses.filter((r: any) => r.form_id === form.id).length
      }));
      setForms(formsWithResponseCounts);
      setResponses(savedResponses);
      setAppointments(savedAppointments);
    } else {
      setForms(defaultForms);
      setResponses([]);
      setAppointments([]);
    }
  };


  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-lg sm:text-xl font-semibold">FormTime</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            폼 관리 및 스케줄링 시스템 {isLoggedIn && user && `- ${user.email}`}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {isLoggedIn ? (
            <>
              <Link href="/formtime/form-builder">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  새 폼 만들기
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="outline">
                  <LogIn className="h-4 w-4 mr-2" />
                  로그인
                </Button>
              </Link>
              <Link href="/formtime/form-builder">
                <Button variant="ghost">
                  <Plus className="h-4 w-4 mr-2" />
                  폼 미리보기
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>


      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 폼</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{forms.length}</div>
            <p className="text-xs text-muted-foreground">
              {isLoggedIn ? '실제 데이터' : '데모 데이터'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 응답</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {forms.reduce((sum, form) => sum + (form.responses_count || 0), 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {isLoggedIn ? `총 ${responses.length}개 응답` : '데모 데이터'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">게시된 폼</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {forms.filter(form => form.is_published).length}
            </div>
            <p className="text-xs text-muted-foreground">
              활성 상태
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">예약 수</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{appointments.length}</div>
            <p className="text-xs text-muted-foreground">
              {isLoggedIn ? '스케줄링된 미팅' : '데모 데이터'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 폼 목록 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>내 폼</CardTitle>
              <CardDescription>
                {isLoggedIn ? '생성한 폼들을 관리하고 응답을 확인하세요' : '테스트 로그인하여 실제 폼 관리 기능을 체험해보세요'}
              </CardDescription>
            </div>
            {!isLoggedIn && (
              <Link href="/login">
                <Button variant="outline">
                  <LogIn className="h-4 w-4 mr-2" />
                  로그인
                </Button>
              </Link>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {forms.map((form) => (
              <div
                key={form.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold">{form.title}</h3>
                    <Badge variant={form.is_published ? "default" : "secondary"}>
                      {form.is_published ? "게시됨" : "비공개"}
                    </Badge>
                    {!isLoggedIn && (
                      <Badge variant="outline">
                        데모
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {form.description}
                  </p>
                  <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                    <span>응답 {form.responses_count || 0}개</span>
                    <span>
                      생성일: {form.created_at instanceof Date ? form.created_at.toLocaleDateString('ko-KR') : new Date(form.created_at).toLocaleDateString('ko-KR')}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {isLoggedIn ? (
                    <>
                      <Link href={`/formtime/responses?form=${form.id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          응답 보기
                        </Button>
                      </Link>
                      <Link href={`/formtime/form-builder?edit=${form.id}`}>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-1" />
                          편집
                        </Button>
                      </Link>
                      <Link href={`/formtime/appointments?form=${form.id}`}>
                        <Button variant="outline" size="sm">
                          <Calendar className="h-4 w-4" />
                        </Button>
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link href="/login">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          로그인 필요
                        </Button>
                      </Link>
                      <Link href="/login">
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-1" />
                          로그인 필요
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}