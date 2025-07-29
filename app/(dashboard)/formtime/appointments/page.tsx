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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Video, 
  Phone, 
  Mail, 
  User,
  Filter,
  Search,
  Plus,
  Edit,
  Trash2,
  LogIn,
  CheckCircle,
  AlertCircle,
  XCircle
} from "lucide-react";
import Link from "next/link";
import { toast } from 'sonner';
import { getSession } from '../../actions';
import { useSearchParams } from 'next/navigation';

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [forms, setForms] = useState<any[]>([]);
  const [selectedForm, setSelectedForm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [filteredAppointments, setFilteredAppointments] = useState<any[]>([]);
  
  const searchParams = useSearchParams();
  const formParam = searchParams.get('form');

  useEffect(() => {
    checkLoginStatus();
    loadData();
  }, []);

  useEffect(() => {
    if (formParam) {
      setSelectedForm(formParam);
    }
  }, [formParam]);

  useEffect(() => {
    filterAppointments();
  }, [appointments, selectedForm, statusFilter, searchQuery]);

  const checkLoginStatus = async () => {
    const session = await getSession();
    if (session && session.authenticated) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  };

  const loadData = () => {
    const savedAppointments = JSON.parse(localStorage.getItem('formtime_appointments') || '[]');
    const savedForms = JSON.parse(localStorage.getItem('formtime_forms') || '[]');
    
    setAppointments(savedAppointments);
    setForms(savedForms);
  };

  const filterAppointments = () => {
    let filtered = appointments;
    
    if (selectedForm) {
      filtered = filtered.filter(appointment => appointment.form_id === selectedForm);
    }
    
    if (statusFilter) {
      filtered = filtered.filter(appointment => appointment.status === statusFilter);
    }
    
    if (searchQuery) {
      filtered = filtered.filter(appointment => 
        appointment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        appointment.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    setFilteredAppointments(filtered);
  };

  const getFormTitle = (formId: string) => {
    const form = forms.find(f => f.id === formId);
    return form?.title || '알 수 없는 폼';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-100 text-green-800">확정</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">대기중</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">취소됨</Badge>;
      default:
        return <Badge variant="secondary">알 수 없음</Badge>;
    }
  };

  const updateAppointmentStatus = (appointmentId: string, newStatus: string) => {
    const updatedAppointments = appointments.map(appointment =>
      appointment.id === appointmentId
        ? { ...appointment, status: newStatus }
        : appointment
    );
    
    setAppointments(updatedAppointments);
    localStorage.setItem('formtime_appointments', JSON.stringify(updatedAppointments));
    
    const statusText = newStatus === 'confirmed' ? '확정' : newStatus === 'cancelled' ? '취소' : '대기중';
    toast.success(`예약이 ${statusText}되었습니다.`);
  };

  const deleteAppointment = (appointmentId: string) => {
    if (!confirm('정말로 이 예약을 삭제하시겠습니까?')) return;
    
    const updatedAppointments = appointments.filter(appointment => appointment.id !== appointmentId);
    setAppointments(updatedAppointments);
    localStorage.setItem('formtime_appointments', JSON.stringify(updatedAppointments));
    
    toast.success('예약이 삭제되었습니다.');
  };

  if (!isLoggedIn) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="text-center py-12">
          <LogIn className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">로그인이 필요합니다</h3>
          <p className="text-muted-foreground mb-6">
            예약 관리 기능을 사용하려면 로그인이 필요합니다.
          </p>
          <Link href="/formtime">
            <Button>
              <LogIn className="w-4 h-4 mr-2" />
              FormTime으로 돌아가기
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-lg sm:text-xl font-semibold">예약 관리</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            스케줄링된 미팅을 관리하세요
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Link href="/formtime">
            <Button variant="outline">
              <Calendar className="h-4 w-4 mr-2" />
              대시보드
            </Button>
          </Link>
        </div>
      </div>

      {/* 필터 */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="예약 제목 또는 설명으로 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="w-full sm:w-48">
          <Select value={selectedForm} onValueChange={setSelectedForm}>
            <SelectTrigger>
              <SelectValue placeholder="폼 선택" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">모든 폼</SelectItem>
              {forms.map((form) => (
                <SelectItem key={form.id} value={form.id}>
                  {form.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="w-full sm:w-32">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="상태" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">모든 상태</SelectItem>
              <SelectItem value="confirmed">확정</SelectItem>
              <SelectItem value="pending">대기중</SelectItem>
              <SelectItem value="cancelled">취소됨</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 예약</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{appointments.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">확정</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {appointments.filter(a => a.status === 'confirmed').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">대기중</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {appointments.filter(a => a.status === 'pending').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">취소됨</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {appointments.filter(a => a.status === 'cancelled').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 예약 목록 */}
      <div className="grid gap-4">
        {filteredAppointments.length > 0 ? (
          filteredAppointments.map((appointment) => (
            <Card key={appointment.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(appointment.status)}
                    <div>
                      <CardTitle className="text-lg">{appointment.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">{appointment.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(appointment.status)}
                    {appointment.form_id && (
                      <Badge variant="outline">
                        {getFormTitle(appointment.form_id)}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span>{new Date(appointment.start_time).toLocaleDateString('ko-KR')}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span>
                        {new Date(appointment.start_time).toLocaleTimeString('ko-KR', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })} - {new Date(appointment.end_time).toLocaleTimeString('ko-KR', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {appointment.meeting_type === 'online' ? (
                      <div className="flex items-center space-x-2 text-sm">
                        <Video className="w-4 h-4 text-muted-foreground" />
                        <span>온라인 미팅</span>
                        {appointment.meeting_url && (
                          <a 
                            href={appointment.meeting_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            링크
                          </a>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2 text-sm">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span>{appointment.location || '오프라인 미팅'}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="text-xs text-muted-foreground">
                    생성일: {new Date(appointment.created_at).toLocaleDateString('ko-KR')}
                  </div>
                  <div className="flex items-center space-x-2">
                    {appointment.status === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => updateAppointmentStatus(appointment.id, 'confirmed')}
                        >
                          확정
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => updateAppointmentStatus(appointment.id, 'cancelled')}
                        >
                          취소
                        </Button>
                      </>
                    )}
                    {appointment.status === 'confirmed' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateAppointmentStatus(appointment.id, 'cancelled')}
                      >
                        취소
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteAppointment(appointment.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">예약이 없습니다</h3>
            <p className="text-muted-foreground mb-6">
              스케줄링이 활성화된 폼을 통해 예약을 받아보세요.
            </p>
            <Link href="/formtime">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                폼 관리하기
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}