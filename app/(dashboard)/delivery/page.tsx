'use client';

import React, { useEffect, useState, useRef, useMemo, useCallback, lazy, Suspense } from 'react';
import { supabase, SupplementDelivery } from '@/utils/supabase';
// Lazy load heavy modal components
const AddDeliveryModal = lazy(() => import('@/components/AddDeliveryModal'));
const EditDeliveryModal = lazy(() => import('@/components/EditDeliveryModal'));
const SupplementInfoDialog = lazy(() => import('@/components/SupplementInfoDialog'));
import { updateDeliveryStatus, updateDelivery, logout, getSession, checkUserStatus } from '../actions';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StatsCard } from '@/components/stats-card';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Package, 
  CheckCircle2, 
  Clock, 
  Search,
  Edit,
  Info,
  AlertCircle,
  Filter,
  RefreshCw,
  Plus,
  ChevronDown,
  ChevronUp,
  X,
  CalendarIcon
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Check, ChevronsUpDown, User, LogOut, Users } from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Memoized table row component
const DeliveryTableRow = React.memo(({
  delivery,
  dateStatus,
  maskEvenChars,
  maskDate,
  userRole,
  handleStatusToggle,
  handleEditClick
}: {
  delivery: SupplementDelivery;
  dateStatus: string;
  maskEvenChars: (text: string) => string;
  maskDate: (date?: string) => string;
  userRole: string;
  handleStatusToggle: (id: number, status: boolean, event?: React.MouseEvent) => void;
  handleEditClick: (delivery: SupplementDelivery) => void;
}) => {
  return (
    <TableRow>
      <TableCell className="font-medium text-center px-1.5 sm:px-3 py-1.5 sm:py-4 text-xs sm:text-sm whitespace-nowrap">{delivery.id}</TableCell>
      <TableCell className="font-medium text-center px-0.5 sm:px-3 py-1.5 sm:py-4 text-xs sm:text-sm whitespace-nowrap">
        {maskEvenChars(delivery.recipient_name)}
      </TableCell>
      <TableCell className="text-center px-0.5 sm:px-3 py-1.5 sm:py-4 whitespace-nowrap">
        <span className={`relative inline-block text-xs sm:text-sm ${
          dateStatus === 'future' ? 'text-blue-600 font-medium' : ''
        } ${dateStatus === 'today' ? 'text-green-600 font-medium' : ''
        } ${dateStatus === 'past' ? 'text-gray-500' : ''
        }`}>
          {maskDate(delivery.delivery_date)}
          {dateStatus === 'future' && (
            <Badge variant="outline" className="absolute top-1/2 -translate-y-1/2 left-full text-xs whitespace-nowrap" style={{ marginLeft: '2px' }}>
              예정
            </Badge>
          )}
          {dateStatus === 'today' && (
            <Badge className="absolute top-1/2 -translate-y-1/2 left-full text-xs whitespace-nowrap" style={{ marginLeft: '2px' }}>
              오늘
            </Badge>
          )}
        </span>
      </TableCell>
      <TableCell className="text-center px-1 sm:px-3 py-1.5 sm:py-4 text-xs sm:text-sm whitespace-nowrap">
        {maskEvenChars(delivery.supplement_type)}
      </TableCell>
      <TableCell className="text-center px-1 sm:px-3 py-1.5 sm:py-4 text-xs sm:text-sm whitespace-nowrap">{delivery.quantity}</TableCell>
      <TableCell className="text-center px-0.5 sm:px-3 py-1.5 sm:py-4 whitespace-nowrap">
        {userRole === 'v' ? (
          <Badge 
            variant={delivery.is_send ? "default" : "secondary"}
            className={`text-xs ${delivery.is_send ? "bg-green-100 text-green-800 hover:bg-green-100 border-0 shadow-none" : ""}`}
          >
            {delivery.is_send ? '배송 완료' : '배송 대기'}
          </Badge>
        ) : (
          <Button
            onClick={(e) => handleStatusToggle(delivery.id, delivery.is_send, e)}
            variant="ghost"
            size="sm"
            tabIndex={-1}
            className="h-auto py-0.5 px-1 hover:bg-transparent touch-none"
            style={{ 
              WebkitTapHighlightColor: 'transparent',
              touchAction: 'manipulation',
              background: 'transparent'
            }}
          >
            <Badge 
              variant={delivery.is_send ? "default" : "secondary"}
              className={`cursor-pointer text-xs ${delivery.is_send ? "bg-green-100 text-green-800 hover:bg-green-100" : ""}`}
              key={`${delivery.id}-${delivery.is_send}`}
            >
              {delivery.is_send ? '배송 완료' : '배송 대기'}
            </Badge>
          </Button>
        )}
      </TableCell>
      <TableCell className="text-center px-1 sm:px-3 py-1.5 sm:py-4 text-xs sm:text-sm whitespace-nowrap">
        {delivery.invoice_number || '-'}
      </TableCell>
      <TableCell className="text-center px-1 sm:px-3 py-1.5 sm:py-4 text-xs sm:text-sm whitespace-nowrap">
        {delivery.customer_request ? 'O' : '-'}
      </TableCell>
      {userRole !== 'v' && (
        <TableCell className="text-center px-0.5 sm:px-3 py-1.5 sm:py-4 whitespace-nowrap">
          <Button
            onClick={() => handleEditClick(delivery)}
            variant="ghost"
            size="sm"
            className="text-black hover:text-gray-700 hover:bg-gray-50 h-7 w-7 p-0"
          >
            <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="sr-only">편집</span>
          </Button>
        </TableCell>
      )}
    </TableRow>
  );
});

DeliveryTableRow.displayName = 'DeliveryTableRow';

export default function Home() {
  const [deliveries, setDeliveries] = useState<SupplementDelivery[]>([]);
  const [filteredDeliveries, setFilteredDeliveries] = useState<SupplementDelivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string>('admin'); // 사용자 역할 상태 추가
  const router = useRouter();
  
  
  // 토스트 타이머 관리 및 변경 내역 추적
  const toastTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pendingChangesRef = useRef<Array<{
    id: number;
    from: string;
    to: string;
    recipientName: string;
  }>>([]);
  const initialStatesRef = useRef<Map<number, boolean>>(new Map()); // 초기 상태 추적
  
  // 페이지 가로 스크롤 방지 및 토스트 타이머 클린업
  useEffect(() => {
    document.documentElement.style.overflowX = 'hidden';
    document.body.style.overflowX = 'hidden';
    
    return () => {
      document.documentElement.style.overflowX = '';
      document.body.style.overflowX = '';
      // 컴포넌트 언마운트 시 토스트 타이머 클리어
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);
  
  const [stats, setStats] = useState({
    total: 0,
    delivered: 0,
    pending: 0
  });

  // 시연용 계정 확인
  const isDemoAccount = userEmail === 'testviewtest@algocarelab.com';

  // 통계 계산 함수 - useCallback으로 메모이제이션
  const calculateStats = useCallback((deliveryList: SupplementDelivery[]) => {
    const total = deliveryList.length;
    const delivered = deliveryList.filter(item => item.is_send).length;
    const pending = total - delivered;
    return { total, delivered, pending };
  }, []);

  // 토스트 표시 함수
  const showPendingChangesToast = useCallback(() => {
    const currentChanges = pendingChangesRef.current;
    if (currentChanges.length === 0) return;
    
    const changesCount = currentChanges.length;
    const title = changesCount === 1 
      ? '배송 상태가 변경되었습니다'
      : `${changesCount}개 항목의 배송 상태가 변경되었습니다`;
    
    // JSX로 설명 컴포넌트 생성 (CSS 원형 인디케이터 사용)
    const descriptionContent = (
      <div>
        {currentChanges.map((change, index) => {
          const isCompleted = change.to === '발송 완료';
          const indicatorColor = isCompleted ? '#22c55e' : '#f97316'; // 초록색: 완료, 주황색: 대기
          
          return (
            <div key={index} style={{ marginBottom: index < currentChanges.length - 1 ? '12px' : '0' }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
                <div 
                  style={{ 
                    width: '8px', 
                    height: '8px', 
                    borderRadius: '50%', 
                    backgroundColor: indicatorColor,
                    marginRight: '10px',
                    flexShrink: 0
                  }} 
                />
                <span style={{ fontWeight: '500' }}>{change.recipientName}</span>
              </div>
              <div style={{ marginLeft: '18px', fontSize: '13px', color: '#6b7280' }}>
                {change.from} → {change.to}
              </div>
            </div>
          );
        })}
      </div>
    );
    
    toast(title, {
      description: descriptionContent,
    });
    
    // 변경 내역 및 초기 상태 초기화
    pendingChangesRef.current = [];
    initialStatesRef.current.clear();
    toastTimerRef.current = null;
  }, []);

  // 이메일에서 사용자명 추출 함수 - useCallback으로 메모이제이션
  const extractUsername = useCallback((email: string) => {
    if (!email) return '';
    const username = email.split('@')[0];
    return username.charAt(0).toUpperCase() + username.slice(1);
  }, []);

  // 마스킹 함수 - useCallback으로 메모이제이션
  const maskEvenChars = useCallback((text: string) => {
    if (!isDemoAccount || !text) return text;
    return text.split('').map((char, index) => (index + 1) % 2 === 0 ? '*' : char).join('');
  }, [isDemoAccount]);

  // 날짜 포맷팅 - useCallback으로 메모이제이션
  const formatDate = useCallback((dateString?: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return isNaN(date.getTime()) 
      ? dateString 
      : date.toLocaleDateString('ko-KR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
  }, []);

  // 날짜 마스킹 함수 - useCallback으로 메모이제이션
  const maskDate = useCallback((dateString?: string) => {
    if (!isDemoAccount || !dateString) return formatDate(dateString);
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    const year = date.getFullYear();
    return `${year}년 **월 **일`;
  }, [isDemoAccount, formatDate]);

  // 모달 상태
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSupplementInfoDialog, setShowSupplementInfoDialog] = useState(false);
  const [editTarget, setEditTarget] = useState<SupplementDelivery | null>(null);

  // 필터 상태
  const [filters, setFilters] = useState({
    searchTerm: '',
    status: 'all', // 'all', 'delivered', 'pending'
    supplementType: 'all',
    dateFrom: '',
    dateTo: ''
  });

  // 날짜 선택기 상태
  const [dateFromObj, setDateFromObj] = useState<Date | undefined>(undefined);
  const [dateToObj, setDateToObj] = useState<Date | undefined>(undefined);

  // 날짜 변환 함수들
  const formatDateForFilter = (date: Date) => {
    return format(date, 'yyyy-MM-dd');
  };

  const formatDateForDisplay = (date: Date | undefined) => {
    if (!date) return '날짜 선택';
    return format(date, 'yyyy년 M월 d일', { locale: ko });
  };

  // 날짜 선택 핸들러
  const handleDateFromSelect = useCallback((date: Date | undefined) => {
    setDateFromObj(date);
    setFilters(prev => ({
      ...prev,
      dateFrom: date ? formatDateForFilter(date) : ''
    }));
  }, []);

  const handleDateToSelect = useCallback((date: Date | undefined) => {
    setDateToObj(date);
    setFilters(prev => ({
      ...prev,
      dateTo: date ? formatDateForFilter(date) : ''
    }));
  }, []);

  // 정렬 상태 - 기본값을 ID 내림차순으로 변경 (최신 순)
  const [sortConfig, setSortConfig] = useState({
    key: 'id',
    direction: 'desc' // desc: 큰 ID가 위로 (최신 순)
  });

  // 모바일 필터 패널 표시 여부
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Combobox 상태 (데스크톱)
  const [statusComboOpen, setStatusComboOpen] = useState(false);
  const [supplementComboOpen, setSupplementComboOpen] = useState(false);
  
  // Combobox 상태 (모바일)
  const [statusComboOpenMobile, setStatusComboOpenMobile] = useState(false);
  const [supplementComboOpenMobile, setSupplementComboOpenMobile] = useState(false);

  // 고유한 영양제 타입 목록
  const [supplementTypes, setSupplementTypes] = useState<string[]>([]);

  // 상태 옵션
  const statusOptions = [
    { value: 'all', label: '모든 상태' },
    { value: 'delivered', label: '배송 완료' },
    { value: 'pending', label: '배송 대기' },
  ];

  // 영양제 옵션 (동적으로 생성) - useMemo로 최적화
  const supplementOptions = useMemo(() => [
    { value: 'all', label: '모든 영양제' },
    ...supplementTypes.map(type => ({ value: type, label: type })),
  ], [supplementTypes]);

  // 세션 확인 및 권한 업데이트
  const refreshSession = async () => {
    // 먼저 checkUserStatus로 최신 권한 확인
    const statusResult = await checkUserStatus();
    
    if (statusResult.success && statusResult.user) {
      // 업데이트된 세션 가져오기
      const session = await getSession();
      if (session) {
        setUserEmail(session.email);
        setUserRole(statusResult.user.role); // DB에서 가져온 role 사용
      }
    } else {
      // checkUserStatus 실패 시 기존 세션 사용
      const session = await getSession();
      if (session) {
        setUserEmail(session.email);
        setUserRole(session.role || 'v'); // 역할 설정 (기본값: 보기전용)
      }
    }
  };
  
  // 페이지 로드 시 권한 확인
  useEffect(() => {
    refreshSession();
  }, []);

  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      
      // 데이터 가져오기 전에 권한 재확인
      await refreshSession();
      
      // 3가지 방법으로 데이터 가져오기 시도
      const { data: tableData, error: tableError } = await supabase
        .from('supplement_delivery')
        .select('*');

      const { data: rpcData, error: rpcError } = await supabase
        .rpc('get_supplement_deliveries');
      
      const { data: sqlData, error: sqlError } = await supabase
        .from('supplement_delivery')
        .select('id, recipient_name, delivery_date, supplement_type, quantity, is_send, invoice_number');

      let data;
      if (tableData && tableData.length > 0) {
        data = tableData;
      } else if (rpcData && rpcData.length > 0) {
        data = rpcData;
      } else if (sqlData && sqlData.length > 0) {
        data = sqlData;
      } else {
        if (tableError) throw tableError;
        if (rpcError) throw rpcError;
        if (sqlError) throw sqlError;
        throw new Error('데이터를 찾을 수 없습니다');
      }

      // 기본 정렬: ID 내림차순 (최신 순)
      const sortedData = sortDeliveries(data, 'id', 'desc');
      
      setDeliveries(sortedData);
      setFilteredDeliveries(sortedData);
      
      // 통계 계산
      setStats(calculateStats(sortedData));

      // 고유한 영양제 타입 추출
      const types: string[] = Array.from(new Set(data.map((item: SupplementDelivery) => item.supplement_type)));
      setSupplementTypes(types);
    } catch (error: any) {
      // console.error('Error details:', error);
      setError('배송 데이터를 가져오는데 실패했습니다. Supabase 연결을 확인하세요.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveries();
  }, []);

  // 로그아웃 핸들러 개선
  const handleLogout = useCallback(async () => {
    try {
      // 로그아웃 처리
      await logout();
      
      // 강제로 페이지 새로고침하여 완전한 로그아웃 보장
      window.location.href = '/login';
    } catch (error) {
      // console.error('로그아웃 오류:', error);
      // 에러가 발생해도 로그인 페이지로 리다이렉트
      window.location.href = '/login';
    }
  }, []);

  // 정렬 함수 - useCallback으로 메모이제이션
  const sortDeliveries = useCallback((data: SupplementDelivery[], key: string, direction: string) => {
    return [...data].sort((a: any, b: any) => {
      // ID 필드에 대한 특별 처리 (숫자 정렬)
      if (key === 'id') {
        const idA = Number(a[key]) || 0;
        const idB = Number(b[key]) || 0;
        return direction === 'asc' ? idA - idB : idB - idA;
      }
      
      // 날짜 필드에 대한 특별 처리
      if (key === 'delivery_date') {
        // null 또는 undefined 값을 처리
        if (!a[key] && !b[key]) return 0;
        if (!a[key]) return 1; // null 값은 항상 아래로
        if (!b[key]) return -1; // null 값은 항상 아래로
        
        const dateA = new Date(a[key]);
        const dateB = new Date(b[key]);
        
        // 유효하지 않은 날짜 처리
        if (isNaN(dateA.getTime()) && isNaN(dateB.getTime())) return 0;
        if (isNaN(dateA.getTime())) return 1; // 유효하지 않은 날짜는 아래로
        if (isNaN(dateB.getTime())) return -1; // 유효하지 않은 날짜는 아래로
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const diffA = dateA.getTime() - today.getTime();
        const diffB = dateB.getTime() - today.getTime();
        
        // 미래 날짜와 과거 날짜 구분
        if (diffA >= 0 && diffB < 0) return direction === 'asc' ? -1 : 1; // 미래 vs 과거
        if (diffA < 0 && diffB >= 0) return direction === 'asc' ? 1 : -1; // 과거 vs 미래
        
        // 둘 다 미래면, 가까운 날짜가 위로
        if (diffA >= 0 && diffB >= 0) {
          return direction === 'asc' ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime();
        }
        
        // 둘 다 과거면, 최근 날짜가 위로
        return direction === 'asc' ? dateB.getTime() - dateA.getTime() : dateA.getTime() - dateB.getTime();
      }
      
      // 수량 필드에 대한 특별 처리 (숫자 정렬)
      if (key === 'quantity') {
        const qtyA = Number(a[key]) || 0;
        const qtyB = Number(b[key]) || 0;
        return direction === 'asc' ? qtyA - qtyB : qtyB - qtyA;
      }
      
      // 불린 필드에 대한 특별 처리 (is_send)
      if (key === 'is_send') {
        const boolA = a[key] ? 1 : 0;
        const boolB = b[key] ? 1 : 0;
        return direction === 'asc' ? boolA - boolB : boolB - boolA;
      }
      
      // 일반 문자열 필드 정렬
      const valueA = (a[key] || '').toString().toLowerCase();
      const valueB = (b[key] || '').toString().toLowerCase();
      
      if (valueA < valueB) {
        return direction === 'asc' ? -1 : 1;
      }
      if (valueA > valueB) {
        return direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, []);

  // 정렬 핸들러 - useCallback으로 메모이제이션
  const handleSort = useCallback((key: string) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    
    setSortConfig({ key, direction });
    setFilteredDeliveries(prev => sortDeliveries(prev, key, direction));
  }, [sortConfig, sortDeliveries]);

  // 상태 토글 핸들러 - useCallback으로 메모이제이션
  const handleStatusToggle = useCallback(async (id: number, currentStatus: boolean, event?: React.MouseEvent) => {
    // 최신 권한 확인
    try {
      const result = await checkUserStatus();
      
      if (result.success && result.user) {
        // 권한이 변경된 경우 세션 업데이트됨
        if (result.user.role === 'v') {
          toast.error('권한이 변경되었습니다.', {
            description: '보기 전용 사용자는 데이터를 수정할 수 없습니다. 새로고침하여 최신 권한을 확인하세요.'
          });
          return;
        }
      }
    } catch (error) {
      toast.error('권한 확인 중 오류가 발생했습니다.', {
        description: '잠시 후 다시 시도해주세요.'
      });
      return;
    }
    
    // 클릭 후 즉시 focus 제거하여 active 상태 해제
    if (event?.currentTarget) {
      (event.currentTarget as HTMLElement).blur();
    }
    
    const newStatus = !currentStatus;
    
    // 현재 배송 정보 찾기
    const currentDelivery = deliveries.find(d => d.id === id);
    if (!currentDelivery) return;
    
    const fromStatus = currentStatus ? '발송 완료' : '발송 대기';
    const toStatus = newStatus ? '발송 완료' : '발송 대기';
    
    // 1. 즉시 로컬 상태 업데이트 (UI 즉각 반영)
    const updateLocalStatus = (deliveryList: SupplementDelivery[]) =>
      deliveryList.map(delivery => 
        delivery.id === id 
          ? { ...delivery, is_send: newStatus }
          : delivery
      );
    
    // 배송 목록 업데이트
    setDeliveries(prev => {
      const updated = updateLocalStatus(prev);
      // 통계도 즉시 업데이트
      setStats(calculateStats(updated));
      return updated;
    });
    
    setFilteredDeliveries(prev => updateLocalStatus(prev));
    
    // 2. 초기 상태 기록 (처음 변경하는 경우에만)
    if (!initialStatesRef.current.has(id)) {
      initialStatesRef.current.set(id, currentStatus);
    }
    
    // 3. 변경 내역 추가/업데이트
    const initialState = initialStatesRef.current.get(id);
    const existingIndex = pendingChangesRef.current.findIndex(change => change.id === id);
    
    // 초기 상태와 동일하면 변경 내역에서 제거
    if (initialState === newStatus) {
      if (existingIndex >= 0) {
        pendingChangesRef.current.splice(existingIndex, 1);
      }
      initialStatesRef.current.delete(id);
    } else {
      // 초기 상태와 다르면 변경 내역 추가/업데이트
      if (existingIndex >= 0) {
        // 기존 변경 내역 업데이트 (초기 상태 → 현재 상태)
        pendingChangesRef.current[existingIndex] = {
          id,
          from: initialState ? '배송 완료' : '배송 대기',
          to: toStatus,
          recipientName: currentDelivery.recipient_name
        };
      } else {
        // 새 변경 내역 추가
        pendingChangesRef.current.push({
          id,
          from: initialState ? '배송 완료' : '배송 대기',
          to: toStatus,
          recipientName: currentDelivery.recipient_name
        });
      }
    }
    
    try {
      // 3. 서버 업데이트
      await updateDeliveryStatus(id, newStatus);
      
      // 4. 기존 토스트 타이머 클리어 및 새 타이머 설정
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
      
      // 5. 1.5초 후 모든 변경 내역을 토스트로 표시
      toastTimerRef.current = setTimeout(() => {
        showPendingChangesToast();
      }, 1500);
      
    } catch (error) {
      // 6. 실패 시 로컬 상태 롤백 및 변경 내역에서 제거
      const rollbackStatus = (deliveryList: SupplementDelivery[]) =>
        deliveryList.map(delivery => 
          delivery.id === id 
            ? { ...delivery, is_send: currentStatus }
            : delivery
        );
      
      // 배송 목록 롤백 및 통계 재계산
      setDeliveries(prev => {
        const rolledBack = rollbackStatus(prev);
        setStats(calculateStats(rolledBack));
        return rolledBack;
      });
      
      setFilteredDeliveries(prev => rollbackStatus(prev));
      
      // pendingChanges에서 해당 항목 제거
      const changeIndex = pendingChangesRef.current.findIndex(change => change.id === id);
      if (changeIndex >= 0) {
        pendingChangesRef.current.splice(changeIndex, 1);
      }
      
      // console.error('Failed to update status:', error);
      toast.error('상태 업데이트에 실패했습니다.', {
        description: '잠시 후 다시 시도해주세요.',
      });
    }
  }, [deliveries, calculateStats, router, showPendingChangesToast]);

  // 편집 핸들러 - useCallback으로 메모이제이션
  const handleEditClick = useCallback(async (delivery: SupplementDelivery) => {
    // 최신 권한 확인
    try {
      const result = await checkUserStatus();
      
      if (result.success && result.user) {
        // 권한이 변경된 경우 세션 업데이트됨
        if (result.user.role === 'v') {
          toast.error('권한이 변경되었습니다.', {
            description: '보기 전용 사용자는 데이터를 편집할 수 없습니다. 새로고침하여 최신 권한을 확인하세요.'
          });
          return;
        }
      }
      
      setEditTarget(delivery);
      setShowEditModal(true);
    } catch (error) {
      toast.error('권한 확인 중 오류가 발생했습니다.', {
        description: '잠시 후 다시 시도해주세요.'
      });
    }
  }, [router]);

  // 새 배송 추가 버튼 핸들러 - useCallback으로 메모이제이션
  const handleAddDeliveryClick = useCallback(async () => {
    // 최신 권한 확인
    try {
      const result = await checkUserStatus();
      
      if (result.success && result.user) {
        // 권한이 변경된 경우 세션 업데이트됨
        if (result.user.role === 'v') {
          toast.error('권한이 변경되었습니다.', {
            description: '보기 전용 사용자는 데이터를 추가할 수 없습니다. 새로고침하여 최신 권한을 확인하세요.'
          });
          return;
        }
      }
      
      setShowAddModal(true);
    } catch (error) {
      toast.error('권한 확인 중 오류가 발생했습니다.', {
        description: '잠시 후 다시 시도해주세요.'
      });
    }
  }, [router]);

  // 필터 초기화 함수 - useCallback으로 메모이제이션
  const resetFilters = useCallback(() => {
    setFilters({
      searchTerm: '',
      status: 'all',
      supplementType: 'all',
      dateFrom: '',
      dateTo: ''
    });
    setDateFromObj(undefined);
    setDateToObj(undefined);
    // Combobox 상태 닫기
    setStatusComboOpen(false);
    setSupplementComboOpen(false);
    setStatusComboOpenMobile(false);
    setSupplementComboOpenMobile(false);
  }, []);

  // 모바일 필터 토글 - useCallback으로 메모이제이션
  const toggleMobileFilters = useCallback(() => {
    setShowMobileFilters(prev => !prev);
  }, []);

  // 필터링된 배송 목록 - useMemo로 최적화
  const filteredAndSortedDeliveries = useMemo(() => {
    let result = deliveries;
    
    // 검색어 필터
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      result = result.filter(item => 
        (item.recipient_name && item.recipient_name.toLowerCase().includes(searchLower)) ||
        (item.supplement_type && item.supplement_type.toLowerCase().includes(searchLower)) ||
        (item.invoice_number && item.invoice_number.toLowerCase().includes(searchLower))
      );
    }
    
    // 상태 필터
    if (filters.status !== 'all') {
      const isDelivered = filters.status === 'delivered';
      result = result.filter(item => item.is_send === isDelivered);
    }
    
    // 영양제 타입 필터
    if (filters.supplementType !== 'all') {
      result = result.filter(item => item.supplement_type === filters.supplementType);
    }
    
    // 날짜 범위 필터 (시작일)
    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom);
      fromDate.setHours(0, 0, 0, 0);
      result = result.filter(item => {
        if (!item.delivery_date) return false;
        const itemDate = new Date(item.delivery_date);
        return itemDate >= fromDate;
      });
    }
    
    // 날짜 범위 필터 (종료일)
    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      toDate.setHours(23, 59, 59, 999);
      result = result.filter(item => {
        if (!item.delivery_date) return false;
        const itemDate = new Date(item.delivery_date);
        return itemDate <= toDate;
      });
    }
    
    // 정렬 적용
    return sortDeliveries(result, sortConfig.key, sortConfig.direction);
  }, [filters, deliveries, sortConfig, sortDeliveries]);

  // 필터 적용
  useEffect(() => {
    setFilteredDeliveries(filteredAndSortedDeliveries);
  }, [filteredAndSortedDeliveries]);

  // 날짜 상태 계산 - useCallback으로 메모이제이션
  const getDateStatus = useCallback((dateString?: string) => {
    if (!dateString) return 'none';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'none';
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.getTime() >= tomorrow.getTime()) return 'future';
    if (date.getTime() === today.getTime()) return 'today';
    return 'past';
  }, []);

  // 필터 칩 제거 - useCallback으로 메모이제이션
  const removeFilter = useCallback((filterType: string) => {
    switch (filterType) {
      case 'searchTerm':
        setFilters(prev => ({...prev, searchTerm: ''}));
        break;
      case 'status':
        setFilters(prev => ({...prev, status: 'all'}));
        break;
      case 'supplementType':
        setFilters(prev => ({...prev, supplementType: 'all'}));
        break;
      case 'dateFrom':
        setFilters(prev => ({...prev, dateFrom: ''}));
        setDateFromObj(undefined);
        break;
      case 'dateTo':
        setFilters(prev => ({...prev, dateTo: ''}));
        setDateToObj(undefined);
        break;
      default:
        break;
    }
  }, []);

  // 활성 필터 수 계산 - useMemo로 메모이제이션
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.searchTerm) count++;
    if (filters.status !== 'all') count++;
    if (filters.supplementType !== 'all') count++;
    if (filters.dateFrom) count++;
    if (filters.dateTo) count++;
    return count;
  }, [filters]);

  return (
    <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
          {/* 헤더 */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-lg sm:text-xl font-semibold">영양제 배송</h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                영양제 배송 현황을 관리하고 추적합니다
              </p>
            </div>
          </div>
          
          {/* 통계 카드 */}
          <div className="grid gap-4 md:gap-8 grid-cols-3">
            <StatsCard
              title="총 배송"
              value={stats.total}
              description="전체 배송 건수"
              icon={Package}
              loading={loading}
            />
            <StatsCard
              title="배송 완료"
              value={stats.delivered}
              description="완료된 배송"
              icon={CheckCircle2}
              loading={loading}
            />
            <StatsCard
              title="배송 대기"
              value={stats.pending}
              description="대기 중인 배송"
              icon={Clock}
              loading={loading}
            />
          </div>

          {/* 메인 콘텐츠 */}
          <Card>
            <CardHeader className="px-4 sm:px-6">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="space-y-1">
                    <CardTitle className="text-lg sm:text-xl">영양제 배송 목록</CardTitle>
                    <CardDescription className="text-xs sm:text-sm">
                      배송 상태를 관리하고 추적하세요
                    </CardDescription>
                  </div>
                  <div className="flex flex-row gap-2">
                    <Button
                      onClick={() => setShowSupplementInfoDialog(true)}
                      variant="outline"
                      size="sm"
                      className="flex-1 h-9 sm:h-10 text-sm"
                    >
                      <Info className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
                      영양제 정보
                    </Button>
                    <Button
                      onClick={handleAddDeliveryClick}
                      disabled={userRole === 'v' || loading}
                      size="sm"
                      className="flex-1 h-9 sm:h-10 text-sm bg-black hover:bg-gray-800 text-white"
                    >
                      <Plus className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
                      새 배송 추가
                    </Button>
                  </div>
                </div>
              
                {/* 검색 및 필터 */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex flex-1 items-center space-x-2">
                    <div className="relative flex-1 md:max-w-sm">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="이름, 영양제, 송장번호 검색..."
                        value={filters.searchTerm}
                        onChange={(e) => setFilters({...filters, searchTerm: e.target.value})}
                        className="pl-8 h-9 sm:h-10 text-sm"
                      />
                    </div>
                    <div className="flex md:hidden">
                      <Button
                        onClick={toggleMobileFilters}
                        variant={showMobileFilters ? "default" : "outline"}
                        size="sm"
                        className="h-9 w-9 sm:h-10 sm:w-10 p-0 relative"
                      >
                        <Filter className="h-4 w-4" />
                        {activeFilterCount > 0 && (
                          <span className="absolute -top-1 -right-1 inline-flex items-center justify-center h-5 min-w-[20px] px-1 text-xs font-medium bg-primary text-primary-foreground rounded-full">
                            {activeFilterCount}
                          </span>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            
              {/* 필터 바 - 데스크톱 */}
              <div className="hidden md:flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  {/* 상태 필터 Combobox */}
                  <Popover open={statusComboOpen} onOpenChange={setStatusComboOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={statusComboOpen}
                        className="w-[140px] h-10 justify-between text-sm"
                      >
                        {statusOptions.find((option) => option.value === filters.status)?.label}
                        <ChevronsUpDown className="opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[140px] p-0">
                      <Command>
                        <CommandInput placeholder="상태 검색..." className="h-9" />
                        <CommandList>
                          <CommandEmpty>상태를 찾을 수 없습니다.</CommandEmpty>
                          <CommandGroup>
                            {statusOptions.map((option) => (
                              <CommandItem
                                key={option.value}
                                value={option.value}
                                onSelect={(currentValue) => {
                                  setFilters({...filters, status: currentValue});
                                  setStatusComboOpen(false);
                                }}
                              >
                                {option.label}
                                <Check
                                  className={cn(
                                    "ml-auto h-4 w-4",
                                    filters.status === option.value ? "opacity-100" : "opacity-0"
                                  )}
                                />
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>

                  {/* 영양제 필터 Combobox */}
                  <Popover open={supplementComboOpen} onOpenChange={setSupplementComboOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={supplementComboOpen}
                        className="w-[140px] h-10 justify-between text-sm"
                      >
                        {supplementOptions.find((option) => option.value === filters.supplementType)?.label}
                        <ChevronsUpDown className="opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[140px] p-0">
                      <Command>
                        <CommandInput placeholder="영양제 검색..." className="h-9" />
                        <CommandList>
                          <CommandEmpty>영양제를 찾을 수 없습니다.</CommandEmpty>
                          <CommandGroup>
                            {supplementOptions.map((option) => (
                              <CommandItem
                                key={option.value}
                                value={option.value}
                                onSelect={(currentValue) => {
                                  setFilters({...filters, supplementType: currentValue});
                                  setSupplementComboOpen(false);
                                }}
                              >
                                {option.label}
                                <Check
                                  className={cn(
                                    "ml-auto h-4 w-4",
                                    filters.supplementType === option.value ? "opacity-100" : "opacity-0"
                                  )}
                                />
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <div className="h-10 w-px bg-border mx-1" />
                  <div className="flex items-center gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-[140px] h-10 justify-start text-left font-normal text-sm"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formatDateForDisplay(dateFromObj)}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={dateFromObj}
                          onSelect={handleDateFromSelect}
                          initialFocus
                          captionLayout="dropdown"
                        />
                      </PopoverContent>
                    </Popover>
                    <div className="flex items-center justify-center px-2">
                      <span className="text-sm text-muted-foreground">~</span>
                    </div>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-[140px] h-10 justify-start text-left font-normal text-sm"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formatDateForDisplay(dateToObj)}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={dateToObj}
                          onSelect={handleDateToSelect}
                          initialFocus
                          captionLayout="dropdown"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  {activeFilterCount > 0 && (
                    <>
                      <div className="h-10 w-px bg-border mx-1" />
                      <Button
                        onClick={resetFilters}
                        variant="ghost"
                        size="sm"
                        className="h-10 text-sm"
                      >
                        <RefreshCw className="mr-1 h-4 w-4" />
                        필터 초기화
                      </Button>
                    </>
                  )}
                </div>
              </div>
            
            {/* 모바일용 필터 패널 */}
            {showMobileFilters && (
              <div className="md:hidden mt-4 bg-gray-50/50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-800 overflow-x-hidden">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs text-muted-foreground mb-1.5 block">상태</Label>
                      <Popover open={statusComboOpenMobile} onOpenChange={setStatusComboOpenMobile}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={statusComboOpenMobile}
                            className="w-full h-10 justify-between text-sm"
                          >
                            {statusOptions.find((option) => option.value === filters.status)?.label}
                            <ChevronsUpDown className="opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0">
                          <Command>
                            <CommandInput placeholder="상태 검색..." className="h-9" />
                            <CommandList>
                              <CommandEmpty>상태를 찾을 수 없습니다.</CommandEmpty>
                              <CommandGroup>
                                {statusOptions.map((option) => (
                                  <CommandItem
                                    key={option.value}
                                    value={option.value}
                                    onSelect={(currentValue) => {
                                      setFilters({...filters, status: currentValue});
                                      setStatusComboOpenMobile(false);
                                    }}
                                  >
                                    {option.label}
                                    <Check
                                      className={cn(
                                        "ml-auto h-4 w-4",
                                        filters.status === option.value ? "opacity-100" : "opacity-0"
                                      )}
                                    />
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>
                    
                    <div>
                      <Label className="text-xs text-muted-foreground mb-1.5 block">영양제 종류</Label>
                      <Popover open={supplementComboOpenMobile} onOpenChange={setSupplementComboOpenMobile}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={supplementComboOpenMobile}
                            className="w-full h-10 justify-between text-sm"
                          >
                            {supplementOptions.find((option) => option.value === filters.supplementType)?.label}
                            <ChevronsUpDown className="opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0">
                          <Command>
                            <CommandInput placeholder="영양제 검색..." className="h-9" />
                            <CommandList>
                              <CommandEmpty>영양제를 찾을 수 없습니다.</CommandEmpty>
                              <CommandGroup>
                                {supplementOptions.map((option) => (
                                  <CommandItem
                                    key={option.value}
                                    value={option.value}
                                    onSelect={(currentValue) => {
                                      setFilters({...filters, supplementType: currentValue});
                                      setSupplementComboOpenMobile(false);
                                    }}
                                  >
                                    {option.label}
                                    <Check
                                      className={cn(
                                        "ml-auto h-4 w-4",
                                        filters.supplementType === option.value ? "opacity-100" : "opacity-0"
                                      )}
                                    />
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1.5 block">기간</Label>
                    <div className="flex items-center gap-2">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="flex-1 min-w-0 h-10 justify-start text-left font-normal text-sm"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            <span className="truncate">
                              {dateFromObj ? format(dateFromObj, 'M/d', { locale: ko }) : '시작일'}
                            </span>
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={dateFromObj}
                            onSelect={handleDateFromSelect}
                            initialFocus
                            captionLayout="dropdown"
                          />
                        </PopoverContent>
                      </Popover>
                      <span className="text-sm text-muted-foreground">~</span>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="flex-1 min-w-0 h-10 justify-start text-left font-normal text-sm"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            <span className="truncate">
                              {dateToObj ? format(dateToObj, 'M/d', { locale: ko }) : '종료일'}
                            </span>
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={dateToObj}
                            onSelect={handleDateToSelect}
                            initialFocus
                            captionLayout="dropdown"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 pt-2">
                    <Button
                      onClick={resetFilters}
                      variant="ghost"
                      className="flex-1 h-10"
                      disabled={activeFilterCount === 0}
                    >
                      <RefreshCw className="mr-1.5 h-4 w-4" />
                      초기화
                    </Button>
                    <Button
                      onClick={toggleMobileFilters}
                      variant="default"
                      className="flex-1 h-10"
                    >
                      적용
                    </Button>
                  </div>
                </div>
              </div>
            )}
            
              {/* 활성 필터 */}
              {activeFilterCount > 0 && (
                <div className="flex flex-wrap gap-2">
                  {filters.searchTerm && (
                    <Badge variant="secondary" className="gap-1 text-xs">
                      검색: {filters.searchTerm}
                      <button
                        onClick={() => removeFilter('searchTerm')}
                        className="ml-1 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                
                  {filters.status !== 'all' && (
                    <Badge variant="secondary" className="gap-1 text-xs">
                      {filters.status === 'delivered' ? '배송 완료' : '배송 대기'}
                      <button
                        onClick={() => removeFilter('status')}
                        className="ml-1 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  
                  {filters.supplementType !== 'all' && (
                    <Badge variant="secondary" className="gap-1 text-xs">
                      {filters.supplementType}
                      <button
                        onClick={() => removeFilter('supplementType')}
                        className="ml-1 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  
                  {filters.dateFrom && (
                    <Badge variant="secondary" className="gap-1 text-xs">
                      시작: {new Date(filters.dateFrom).toLocaleDateString()}
                      <button
                        onClick={() => removeFilter('dateFrom')}
                        className="ml-1 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  
                  {filters.dateTo && (
                    <Badge variant="secondary" className="gap-1 text-xs">
                      종료: {new Date(filters.dateTo).toLocaleDateString()}
                      <button
                        onClick={() => removeFilter('dateTo')}
                        className="ml-1 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
              </div>
            )}
          </CardHeader>
          
          <CardContent className="p-0">
          {loading && (
            <div className="w-full overflow-x-auto">
              <Table className="min-w-[800px]">
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-center px-1.5 sm:px-3 w-auto">ID</TableHead>
                    <TableHead className="text-center px-0.5 sm:px-3 w-auto">수령인</TableHead>
                    <TableHead className="text-center px-0.5 sm:px-3 w-auto">배송일</TableHead>
                    <TableHead className="text-center px-1 sm:px-3 w-auto">영양제</TableHead>
                    <TableHead className="text-center px-1 sm:px-3 w-auto">수량</TableHead>
                    <TableHead className="text-center px-1.5 sm:px-3 w-auto">상태</TableHead>
                    <TableHead className="text-center px-1 sm:px-3 w-auto">송장번호</TableHead>
                    <TableHead className="text-center px-1 sm:px-3 w-auto">고객요청</TableHead>
                    {userRole !== 'v' && (
                      <TableHead className="relative text-center w-auto"></TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...Array(5)].map((_, index) => (
                    <TableRow key={index}>
                      <TableCell className="text-center px-1.5 sm:px-3 py-1.5 sm:py-4">
                        <Skeleton className="h-4 w-8 mx-auto" />
                      </TableCell>
                      <TableCell className="text-center px-0.5 sm:px-3 py-1.5 sm:py-4">
                        <Skeleton className="h-4 w-16 mx-auto" />
                      </TableCell>
                      <TableCell className="text-center px-0.5 sm:px-3 py-1.5 sm:py-4">
                        <Skeleton className="h-4 w-20 mx-auto" />
                      </TableCell>
                      <TableCell className="text-center px-1 sm:px-3 py-1.5 sm:py-4">
                        <Skeleton className="h-4 w-24 mx-auto" />
                      </TableCell>
                      <TableCell className="text-center px-1 sm:px-3 py-1.5 sm:py-4">
                        <Skeleton className="h-4 w-8 mx-auto" />
                      </TableCell>
                      <TableCell className="text-center px-1.5 sm:px-3 py-1.5 sm:py-4">
                        <Skeleton className="h-6 w-16 mx-auto rounded-full" />
                      </TableCell>
                      <TableCell className="text-center px-1.5 sm:px-3 py-1.5 sm:py-4">
                        <Skeleton className="h-4 w-28 mx-auto" />
                      </TableCell>
                      <TableCell className="text-center px-1 sm:px-3 py-1.5 sm:py-4">
                        <Skeleton className="h-4 w-20 mx-auto" />
                      </TableCell>
                      {userRole !== 'v' && (
                        <TableCell className="text-center px-1.5 sm:px-3 py-1.5 sm:py-4">
                          <Skeleton className="h-8 w-8 mx-auto rounded" />
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          
          {error && (
            <div className="p-4 sm:p-6">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {error}
                  <br />
                  <span className="text-xs">Supabase 환경 변수 설정을 확인하세요.</span>
                </AlertDescription>
              </Alert>
            </div>
          )}

          {!loading && !error && filteredDeliveries.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12">
              <Package className="h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">배송 데이터가 없습니다</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                검색 조건에 맞는 배송 데이터가 없습니다
              </p>
              {userRole !== 'v' && (
                <Button onClick={handleAddDeliveryClick} className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  새 배송 추가
                </Button>
              )}
            </div>
          )}

          {!loading && !error && filteredDeliveries.length > 0 && (
            <div className="w-full overflow-x-auto">
              <Table className="min-w-[800px]">
                <TableHeader>
                  <TableRow>
                    <TableHead onClick={() => handleSort('id')} className="cursor-pointer text-center px-1.5 sm:px-3 w-auto">
                      <div className="relative flex items-center justify-center">
                        <span className="text-xs sm:text-sm">ID</span>
                        {sortConfig.key === 'id' && (
                          <ChevronDown className={`absolute left-1/2 translate-x-4 h-3 w-3 sm:h-4 sm:w-4 ${sortConfig.direction === 'asc' ? 'rotate-180' : ''}`} />
                        )}
                      </div>
                    </TableHead>
                    <TableHead onClick={() => handleSort('recipient_name')} className="cursor-pointer text-center px-0.5 sm:px-3 w-auto">
                      <div className="relative flex items-center justify-center">
                        <span className="text-xs sm:text-sm">수령인</span>
                        {sortConfig.key === 'recipient_name' && (
                          <ChevronDown className={`absolute left-1/2 translate-x-6 h-3 w-3 sm:h-4 sm:w-4 ${sortConfig.direction === 'asc' ? 'rotate-180' : ''}`} />
                        )}
                      </div>
                    </TableHead>
                    <TableHead onClick={() => handleSort('delivery_date')} className="cursor-pointer text-center px-0.5 sm:px-3 w-auto">
                      <div className="relative flex items-center justify-center">
                        <span className="text-xs sm:text-sm">배송일</span>
                        {sortConfig.key === 'delivery_date' && (
                          <ChevronDown className={`absolute left-1/2 translate-x-6 h-3 w-3 sm:h-4 sm:w-4 ${sortConfig.direction === 'asc' ? 'rotate-180' : ''}`} />
                        )}
                      </div>
                    </TableHead>
                    <TableHead onClick={() => handleSort('supplement_type')} className="cursor-pointer text-center px-1 sm:px-3 w-auto">
                      <div className="relative flex items-center justify-center">
                        <span className="text-xs sm:text-sm">영양제</span>
                        {sortConfig.key === 'supplement_type' && (
                          <ChevronDown className={`absolute left-1/2 translate-x-6 h-3 w-3 sm:h-4 sm:w-4 ${sortConfig.direction === 'asc' ? 'rotate-180' : ''}`} />
                        )}
                      </div>
                    </TableHead>
                    <TableHead onClick={() => handleSort('quantity')} className="cursor-pointer text-center px-1 sm:px-3 w-auto">
                      <div className="relative flex items-center justify-center">
                        <span className="text-xs sm:text-sm">수량</span>
                        {sortConfig.key === 'quantity' && (
                          <ChevronDown className={`absolute left-1/2 translate-x-4 h-3 w-3 sm:h-4 sm:w-4 ${sortConfig.direction === 'asc' ? 'rotate-180' : ''}`} />
                        )}
                      </div>
                    </TableHead>
                    <TableHead onClick={() => handleSort('is_send')} className="cursor-pointer text-center px-1.5 sm:px-3 w-auto">
                      <div className="relative flex items-center justify-center">
                        <span className="text-xs sm:text-sm">상태</span>
                        {sortConfig.key === 'is_send' && (
                          <ChevronDown className={`absolute left-1/2 translate-x-4 h-3 w-3 sm:h-4 sm:w-4 ${sortConfig.direction === 'asc' ? 'rotate-180' : ''}`} />
                        )}
                      </div>
                    </TableHead>
                    <TableHead onClick={() => handleSort('invoice_number')} className="cursor-pointer text-center px-1 sm:px-3 w-auto">
                      <div className="relative flex items-center justify-center">
                        <span className="text-xs sm:text-sm">송장번호</span>
                        {sortConfig.key === 'invoice_number' && (
                          <ChevronDown className={`absolute left-1/2 translate-x-8 h-3 w-3 sm:h-4 sm:w-4 ${sortConfig.direction === 'asc' ? 'rotate-180' : ''}`} />
                        )}
                      </div>
                    </TableHead>
                    <TableHead onClick={() => handleSort('customer_request')} className="cursor-pointer text-center px-1 sm:px-3 w-auto">
                      <div className="relative flex items-center justify-center">
                        <span className="text-xs sm:text-sm">고객요청</span>
                        {sortConfig.key === 'customer_request' && (
                          <ChevronDown className={`absolute left-1/2 translate-x-8 h-3 w-3 sm:h-4 sm:w-4 ${sortConfig.direction === 'asc' ? 'rotate-180' : ''}`} />
                        )}
                      </div>
                    </TableHead>
                    {userRole !== 'v' && (
                      <TableHead className="relative text-center w-auto">
                        <span className="sr-only">작업</span>
                      </TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDeliveries.map((delivery) => (
                    <DeliveryTableRow
                      key={delivery.id}
                      delivery={delivery}
                      dateStatus={getDateStatus(delivery.delivery_date)}
                      maskEvenChars={maskEvenChars}
                      maskDate={maskDate}
                      userRole={userRole}
                      handleStatusToggle={handleStatusToggle}
                      handleEditClick={handleEditClick}
                    />
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          </CardContent>
        </Card>

      {/* 모달 - 보기 전용 사용자에게는 표시하지 않음 */}
      {userRole !== 'v' && (
        <Suspense fallback={<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div></div>}>
          <AddDeliveryModal
            isOpen={showAddModal}
            onClose={() => setShowAddModal(false)}
            onSuccess={fetchDeliveries}
          />
          
          <EditDeliveryModal
            isOpen={showEditModal}
            delivery={editTarget}
            onClose={() => {
              setShowEditModal(false);
              setEditTarget(null);
            }}
            onSuccess={fetchDeliveries}
          />
        </Suspense>
      )}
      
      {/* 영양제 정보 다이얼로그 */}
      <Suspense fallback={null}>
        <SupplementInfoDialog
          isOpen={showSupplementInfoDialog}
          onClose={() => setShowSupplementInfoDialog(false)}
          isDemoAccount={isDemoAccount}
        />
      </Suspense>
    </div>
  );
}