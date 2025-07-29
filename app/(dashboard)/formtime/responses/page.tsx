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
  BarChart3, 
  Download, 
  Filter, 
  Search, 
  Eye, 
  Calendar,
  Mail,
  Phone,
  User,
  MessageSquare,
  Star,
  LogIn
} from "lucide-react";
import Link from "next/link";
import { toast } from 'sonner';
import { getSession } from '../../actions';
import { useSearchParams } from 'next/navigation';

export default function ResponsesPage() {
  const [forms, setForms] = useState<any[]>([]);
  const [responses, setResponses] = useState<any[]>([]);
  const [selectedForm, setSelectedForm] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [filteredResponses, setFilteredResponses] = useState<any[]>([]);
  
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
    filterResponses();
  }, [responses, selectedForm, searchQuery]);

  const checkLoginStatus = async () => {
    const session = await getSession();
    if (session && session.authenticated) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  };

  const loadData = () => {
    const savedForms = JSON.parse(localStorage.getItem('formtime_forms') || '[]');
    const savedResponses = JSON.parse(localStorage.getItem('formtime_responses') || '[]');
    
    setForms(savedForms);
    setResponses(savedResponses);
  };

  const filterResponses = () => {
    let filtered = responses;
    
    if (selectedForm) {
      filtered = filtered.filter(response => response.form_id === selectedForm);
    }
    
    if (searchQuery) {
      filtered = filtered.filter(response => 
        response.respondent_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        response.respondent_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        JSON.stringify(response.responses).toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    setFilteredResponses(filtered);
  };

  const getFormTitle = (formId: string) => {
    const form = forms.find(f => f.id === formId);
    return form?.title || '알 수 없는 폼';
  };

  const getFormQuestions = (formId: string) => {
    const form = forms.find(f => f.id === formId);
    return form?.questions || [];
  };

  const renderResponseValue = (questionId: string, value: any, formId: string) => {
    const questions = getFormQuestions(formId);
    const question = questions.find((q: any) => q.id === questionId);
    
    if (!question) return value;
    
    switch (question.type) {
      case 'rating':
        return (
          <div className="flex items-center space-x-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${i < value ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
              />
            ))}
            <span className="ml-2 text-sm">({value}/5)</span>
          </div>
        );
      case 'select':
        const option = question.config?.options?.find((opt: any) => opt.value === value);
        return option?.label || value;
      case 'email':
        return (
          <div className="flex items-center space-x-2">
            <Mail className="w-4 h-4 text-muted-foreground" />
            <span>{value}</span>
          </div>
        );
      case 'phone':
        return (
          <div className="flex items-center space-x-2">
            <Phone className="w-4 h-4 text-muted-foreground" />
            <span>{value}</span>
          </div>
        );
      case 'textarea':
        return (
          <div className="max-w-xs">
            <p className="text-sm truncate">{value}</p>
          </div>
        );
      default:
        return value;
    }
  };

  const exportResponses = () => {
    if (!isLoggedIn) {
      toast.error('로그인이 필요합니다.');
      return;
    }

    const exportData = filteredResponses.map(response => ({
      폼제목: getFormTitle(response.form_id),
      응답자명: response.respondent_name || '',
      이메일: response.respondent_email || '',
      전화번호: response.respondent_phone || '',
      제출일시: new Date(response.submitted_at).toLocaleString('ko-KR'),
      ...response.responses
    }));

    const csvContent = "data:text/csv;charset=utf-8," + 
      Object.keys(exportData[0] || {}).join(",") + "\n" +
      exportData.map(row => Object.values(row).join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `responses_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('응답 데이터가 다운로드되었습니다.');
  };

  if (!isLoggedIn) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="text-center py-12">
          <LogIn className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">로그인이 필요합니다</h3>
          <p className="text-muted-foreground mb-6">
            응답 관리 기능을 사용하려면 로그인이 필요합니다.
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
          <h1 className="text-lg sm:text-xl font-semibold">응답 관리</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            폼 응답을 확인하고 분석하세요
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={exportResponses}>
            <Download className="h-4 w-4 mr-2" />
            내보내기
          </Button>
          <Link href="/formtime">
            <Button variant="outline">
              <BarChart3 className="h-4 w-4 mr-2" />
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
              placeholder="응답자명, 이메일 또는 응답 내용으로 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="w-full sm:w-64">
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
      </div>

      {/* 응답 목록 */}
      <div className="grid gap-4">
        {filteredResponses.length > 0 ? (
          filteredResponses.map((response, index) => (
            <Card key={response.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CardTitle className="text-lg">{getFormTitle(response.form_id)}</CardTitle>
                    <Badge variant="outline">#{index + 1}</Badge>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(response.submitted_at).toLocaleString('ko-KR')}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-4 text-sm">
                  {response.respondent_name && (
                    <div className="flex items-center space-x-1">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span>{response.respondent_name}</span>
                    </div>
                  )}
                  {response.respondent_email && (
                    <div className="flex items-center space-x-1">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span>{response.respondent_email}</span>
                    </div>
                  )}
                  {response.respondent_phone && (
                    <div className="flex items-center space-x-1">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span>{response.respondent_phone}</span>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(response.responses).map(([questionId, value]) => {
                    const questions = getFormQuestions(response.form_id);
                    const question = questions.find((q: any) => q.id === questionId);
                    
                    return (
                      <div key={questionId} className="border-l-2 border-muted pl-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-medium text-sm mb-1">
                              {question?.title || questionId}
                            </p>
                            <div className="text-sm">
                              {renderResponseValue(questionId, value, response.form_id)}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-12">
            <MessageSquare className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {selectedForm ? '해당 폼의 응답이 없습니다' : '응답이 없습니다'}
            </h3>
            <p className="text-muted-foreground">
              {selectedForm ? '다른 폼을 선택하거나 검색어를 변경해보세요' : '폼을 공유하여 응답을 받아보세요'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}