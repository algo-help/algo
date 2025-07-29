'use client';

import React, { useState, useRef, useEffect } from 'react';
import { updateDelivery } from '@/app/(dashboard)/actions';
import { SupplementDelivery } from '@/utils/supabase';
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, X, Edit3, CalendarDays, Hash, Truck, UserCheck } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface EditDeliveryModalProps {
  isOpen: boolean;
  delivery: SupplementDelivery | null;
  onClose: () => void;
  onSuccess: () => void;
}

const SUPPLEMENT_OPTIONS = [
  '오메가3',
  '비타민 B',
  '비타민 C',
  '비타민 D',
  '마그네슘',
  '밀크씨슬',
  '홍경천테아닌',
  '아연미네랄8',
  '종합비타민미네랄',
  '유산균',
  '바나바잎추출물',
  '카테킨',
  '콜라겐',
  '칼슘',
  '멜라토닌'
];

const EditDeliveryModal = React.memo(({ isOpen, delivery, onClose, onSuccess }: EditDeliveryModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSupplement, setSelectedSupplement] = useState<string>('');
  const [isDelivered, setIsDelivered] = useState(false);
  const [deliveryDate, setDeliveryDate] = useState<Date | undefined>(undefined);
  const [customerRequest, setCustomerRequest] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  // 날짜를 YYYY-MM-DD 형식으로 변환하는 함수
  const formatDateForInput = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return date.toISOString().split('T')[0];
  };

  // 완전 실시간 키보드 동기화
  useEffect(() => {
    if (!isOpen) return;

    let rafId: number | null = null;
    let isAnimating = false;
    let animationTimeout: NodeJS.Timeout | null = null;
    
    const updateKeyboardState = () => {
      const viewport = window.visualViewport;
      if (!viewport) return;
      
      const windowHeight = window.innerHeight;
      const keyboardHeight = Math.max(0, windowHeight - viewport.height);
      
      // CSS 변수로 실시간 키보드 높이 전달
      document.documentElement.style.setProperty('--keyboard-height', `${keyboardHeight}px`);
      document.documentElement.style.setProperty('--viewport-height', `${viewport.height}px`);
      
      // 키보드 상태 클래스 관리
      if (keyboardHeight > 50) {
        document.body.classList.add('keyboard-open');
      } else {
        document.body.classList.remove('keyboard-open');
      }
    };
    
    const startRealTimeUpdate = () => {
      const animate = () => {
        updateKeyboardState();
        
        if (isAnimating) {
          rafId = requestAnimationFrame(animate);
        }
      };
      animate();
    };
    
    const stopRealTimeUpdate = () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    };
    
    const handleKeyboardResize = () => {
      // 모바일에서만 처리
      if (window.innerWidth < 640) {
        if (!isAnimating) {
          isAnimating = true;
          startRealTimeUpdate();
        }
        
        // 키보드 애니메이션 완료 감지 (iOS 키보드 애니메이션 시간)
        if (animationTimeout) {
          clearTimeout(animationTimeout);
        }
        animationTimeout = setTimeout(() => {
          isAnimating = false;
          stopRealTimeUpdate();
          updateKeyboardState(); // 마지막 상태 업데이트
        }, 250);
      }
    };
    
    const handleKeyboardScroll = () => {
      // 스크롤 중에도 실시간 업데이트
      if (window.innerWidth < 640) {
        updateKeyboardState();
      }
    };

    // Visual Viewport API 사용 (iOS Safari 최적화)
    const visualViewport = window.visualViewport;
    if (visualViewport) {
      visualViewport.addEventListener('resize', handleKeyboardResize);
      visualViewport.addEventListener('scroll', handleKeyboardScroll);
      
      // 초기 상태 설정
      updateKeyboardState();
      
      return () => {
        visualViewport.removeEventListener('resize', handleKeyboardResize);
        visualViewport.removeEventListener('scroll', handleKeyboardScroll);
        stopRealTimeUpdate();
        if (animationTimeout) {
          clearTimeout(animationTimeout);
        }
        document.body.classList.remove('keyboard-open');
        document.documentElement.style.setProperty('--keyboard-height', '0px');
        document.documentElement.style.setProperty('--viewport-height', '100vh');
      };
    } else {
      // 폴백: 일반 resize 이벤트
      const handleResize = () => {
        if (window.innerWidth < 640) {
          updateKeyboardState();
        }
      };
      
      window.addEventListener('resize', handleResize);
      
      return () => {
        window.removeEventListener('resize', handleResize);
        stopRealTimeUpdate();
        if (animationTimeout) {
          clearTimeout(animationTimeout);
        }
        document.body.classList.remove('keyboard-open');
        document.documentElement.style.setProperty('--keyboard-height', '0px');
        document.documentElement.style.setProperty('--viewport-height', '100vh');
      };
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && delivery) {
      // 배송 정보가 있을 때 폼에 기존 데이터 설정
      const supplement = delivery.supplement_type || '';
      setSelectedSupplement(supplement);
      setIsDelivered(delivery.is_send || false);
      setCustomerRequest(delivery.customer_request || false);
      const date = delivery.delivery_date ? new Date(delivery.delivery_date) : undefined;
      setDeliveryDate(date);
      setError(null);
    } else if (!isOpen) {
      // 모달이 닫힐 때 상태 초기화
      setError(null);
      setSelectedSupplement('');
      setIsDelivered(false);
      setCustomerRequest(false);
      setDeliveryDate(undefined);
      // 키보드 클래스 제거
      document.body.classList.remove('keyboard-open');
      document.documentElement.style.setProperty('--keyboard-height', '0px');
    }
  }, [isOpen, delivery]);

  const handleSupplementChange = (supplement: string) => {
    setSelectedSupplement(supplement);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!delivery) return;

    setIsSubmitting(true);
    setError(null);

    if (!selectedSupplement) {
      setError('영양제 종류를 선택해주세요.');
      setIsSubmitting(false);
      return;
    }

    try {
      const formData = new FormData(e.currentTarget);
      formData.set('supplement_type', selectedSupplement);
      formData.set('is_send', isDelivered.toString());
      formData.set('customer_request', customerRequest.toString());
      formData.set('id', delivery.id.toString());
      if (deliveryDate) {
        formData.set('delivery_date', deliveryDate.toISOString().split('T')[0]);
      }

      await updateDelivery(formData);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : '배송 정보 수정에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!delivery) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="w-full h-full max-w-none max-h-none rounded-none sm:w-auto sm:h-auto sm:max-h-[90vh] sm:rounded-lg overflow-hidden flex flex-col gap-0 p-0"
        style={{ 
          width: typeof window !== 'undefined' && window.innerWidth >= 640 ? '500px' : '100%' 
        }}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        {/* 모바일 헤더 - 영양제 배송 페이지와 동일한 스타일 */}
        <div className="sm:hidden sticky top-0 z-40 flex h-16 shrink-0 items-center border-b px-4 bg-background relative">
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="absolute left-4 -ml-1"
          >
            <X className="h-4 w-4" />
          </Button>
          <div className="flex-1 flex justify-center">
            <h1 style={{ fontSize: '14px' }} className="font-medium">배송 정보 편집</h1>
          </div>
        </div>
        
        {/* 데스크톱 헤더 */}
        <div className="hidden sm:block px-6 py-6">
          <h2 className="text-xl font-semibold">배송 정보 편집</h2>
          <p className="text-sm text-muted-foreground mt-1">
            배송 정보를 수정해 주세요 (ID: {delivery?.id})
          </p>
        </div>
        
        <Separator className="hidden sm:block" />
        
        {error && (
          <div className="px-6 pt-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        )}
        
        <form ref={formRef} onSubmit={handleSubmit} className="flex-1 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <div className="space-y-4 sm:space-y-6">
              {/* 기본 정보 섹션 */}
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                  기본 정보
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="recipient_name" className="text-sm font-medium flex items-center gap-1">
                      수령인 이름 <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      type="text"
                      name="recipient_name"
                      id="recipient_name"
                      required
                      defaultValue={delivery.recipient_name || ''}
                      placeholder="수령인 이름을 입력하세요"
                      className="h-10"
                      autoFocus={false}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="quantity" className="text-sm font-medium flex items-center gap-1">
                      <Hash className="h-3 w-3" />
                      수량 <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      type="number"
                      name="quantity"
                      id="quantity"
                      required
                      min="1"
                      defaultValue={delivery.quantity || 1}
                      placeholder="수량"
                      className="h-10"
                    />
                  </div>
                </div>
              </div>
            
              {/* 영양제 선택 섹션 */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                  영양제 종류 선택 <span className="text-destructive">*</span>
                </div>
                
                <Card className="border-dashed">
                  <CardContent className="p-4">
                    <RadioGroup value={selectedSupplement} onValueChange={handleSupplementChange}>
                      <div className="grid grid-cols-2 gap-3">
                        {SUPPLEMENT_OPTIONS.map((supplement) => (
                          <div
                            key={supplement}
                            className="flex items-center space-x-2 group"
                          >
                            <RadioGroupItem
                              value={supplement}
                              id={supplement}
                              className="h-4 w-4"
                            />
                            <label
                              htmlFor={supplement}
                              className="text-sm leading-none cursor-pointer group-hover:text-blue-600 transition-colors"
                            >
                              {supplement}
                            </label>
                          </div>
                        ))}
                      </div>
                    </RadioGroup>
                  </CardContent>
                </Card>
                
                {selectedSupplement && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-xs sm:text-sm font-medium">선택된 영양제</p>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      <Badge
                        variant="secondary"
                        className="px-2 py-0.5 rounded-full text-xs font-medium hover:bg-secondary/80 transition-colors"
                      >
                        {selectedSupplement}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-auto p-0 px-1 ml-1 hover:bg-transparent"
                          onClick={() => setSelectedSupplement('')}
                        >
                          <X className="h-3 w-3 hover:text-destructive transition-colors" />
                        </Button>
                      </Badge>
                    </div>
                  </div>
                )}
              </div>
            
              {/* 배솨 정보 섹션 */}
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                  배송 정보
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="delivery_date" className="text-sm font-medium flex items-center gap-1">
                      <CalendarDays className="h-3 w-3" />
                      배송 예정일 <span className="text-destructive">*</span>
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "h-10 w-full justify-start text-left font-normal",
                            !deliveryDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarDays className="mr-2 h-4 w-4" />
                          {deliveryDate ? format(deliveryDate, 'yyyy년 MM월 dd일', { locale: ko }) : '날짜를 선택하세요'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={deliveryDate}
                          onSelect={setDeliveryDate}
                          initialFocus
                          captionLayout="dropdown"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="invoice_number" className="text-sm font-medium flex items-center gap-1">
                      송장번호 <span className="text-xs text-muted-foreground">(선택사항)</span>
                    </Label>
                    <Input
                      type="text"
                      name="invoice_number"
                      id="invoice_number"
                      defaultValue={delivery.invoice_number || ''}
                      placeholder="송장번호를 입력하세요"
                      className="h-10"
                    />
                  </div>
                </div>
                
                <div className="space-y-3">
                  <Card className="p-3 sm:p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/30 dark:to-blue-950/30">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Truck className={`h-5 w-5 transition-colors ${isDelivered ? 'text-green-600' : 'text-orange-500'}`} />
                        <div>
                          <Label htmlFor="is_send" className="text-sm font-medium cursor-pointer">
                            배송 상태
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            {isDelivered ? '배송이 완료되었습니다' : '배송 대기 중입니다'}
                          </p>
                        </div>
                      </div>
                      <Switch
                        id="is_send"
                        checked={isDelivered}
                        onCheckedChange={setIsDelivered}
                      />
                    </div>
                  </Card>
                  
                  <Card className="p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <UserCheck className={`h-5 w-5 transition-colors ${customerRequest ? 'text-blue-600' : 'text-gray-400'}`} />
                        <div>
                          <Label htmlFor="customer_request" className="text-sm font-medium cursor-pointer">
                            고객 요청 발송
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            {customerRequest ? '고객이 직접 요청한 발송입니다' : '일반 발송입니다'}
                          </p>
                        </div>
                      </div>
                      <Switch
                        id="customer_request"
                        checked={customerRequest}
                        onCheckedChange={setCustomerRequest}
                      />
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          </div>
          
          <Separator />
          
          <div className="flex justify-end items-center px-6 py-4 modal-footer">
            <div className="flex space-x-2 sm:space-x-3 w-full sm:w-auto">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 sm:flex-none min-w-[80px]"
              >
                취소
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !selectedSupplement}
                className="flex-1 sm:flex-none min-w-[100px] relative bg-blue-600 hover:bg-blue-700"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    수정 중...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Edit3 className="h-4 w-4" />
                    수정 완료
                  </div>
                )}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
});

EditDeliveryModal.displayName = 'EditDeliveryModal';

export default EditDeliveryModal;