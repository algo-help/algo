'use client';

import React, { useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface SupplementInfo {
  name: string;
  dosage: number;
  weight100pills: number;
  bottleWeight: number;
}

const supplementData: SupplementInfo[] = [
  { name: '비타민 B', dosage: 1448, weight100pills: 4.5, bottleWeight: 71 },
  { name: '비타민 C', dosage: 2000, weight100pills: 4.5, bottleWeight: 99 },
  { name: '비타민 D', dosage: 600, weight100pills: 4.0, bottleWeight: 26 },
  { name: '아연미네랄8', dosage: 1029, weight100pills: 4.5, bottleWeight: 51 },
  { name: '마그네슘', dosage: 1170, weight100pills: 5.5, bottleWeight: 70 },
  { name: '밀크씨슬', dosage: 900, weight100pills: 4.5, bottleWeight: 44 },
  { name: '홍경천테아닌', dosage: 1429, weight100pills: 4.2, bottleWeight: 66 },
  { name: '오메가3', dosage: 4145, weight100pills: 3.3, bottleWeight: 150 },
  { name: '종합비타민미네랄', dosage: 1080, weight100pills: 4.6, bottleWeight: 55 },
  { name: '유산균', dosage: 1200, weight100pills: 4.7, bottleWeight: 62 },
  { name: '바나바잎', dosage: 260, weight100pills: 4.7, bottleWeight: 13 },
  { name: '카테킨', dosage: 780, weight100pills: 4.4, bottleWeight: 38 },
  { name: '콜라겐', dosage: 1500, weight100pills: 4.7, bottleWeight: 78 },
  { name: '칼슘', dosage: 1200, weight100pills: 4.6, bottleWeight: 61 },
  { name: '멜라토닌', dosage: 600, weight100pills: 4.6, bottleWeight: 30 }
];

interface SupplementInfoDialogProps {
  isOpen: boolean;
  onClose: () => void;
  isDemoAccount?: boolean;
}

const SupplementInfoDialog = React.memo(({ isOpen, onClose, isDemoAccount = false }: SupplementInfoDialogProps) => {
  // 다이얼로그가 열릴 때 배경 스크롤 방지
  useEffect(() => {
    if (isOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isOpen]);

  // 마스킹 함수: 짝수 번째 글자를 *로 변경 - useCallback으로 메모이제이션
  const maskEvenChars = useCallback((text: string | number) => {
    if (!isDemoAccount) return text;
    const str = text.toString();
    return str.split('').map((char, index) => (index + 1) % 2 === 0 ? '*' : char).join('');
  }, [isDemoAccount]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-full sm:max-w-[90vw] h-full sm:h-auto p-0 sm:p-6 rounded-none sm:rounded-lg">
        <div className="flex flex-col h-full">
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
              <h1 style={{ fontSize: '14px' }} className="font-medium">영양제 정보</h1>
            </div>
          </div>
          
          {/* 데스크톱 헤더 */}
          <div className="hidden sm:block">
            <h2 className="text-lg font-semibold">영양제 정보</h2>
            <p className="text-sm text-muted-foreground">
              각 영양제의 충전량, 무게 등 상세 정보를 확인하세요.
            </p>
          </div>
          
          <div 
            className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-0 sm:mt-4"
            onWheel={(e) => {
              const element = e.currentTarget;
              const isAtTop = element.scrollTop === 0;
              const isAtBottom = element.scrollHeight - element.scrollTop === element.clientHeight;
              
              if ((isAtTop && e.deltaY < 0) || (isAtBottom && e.deltaY > 0)) {
                e.preventDefault();
              }
            }}
          >
            <div className="w-full overflow-x-auto">
              <Table className="w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs sm:text-sm px-1 sm:px-3 w-auto">영양제</TableHead>
                    <TableHead className="text-center text-xs sm:text-sm px-1 sm:px-3 whitespace-nowrap">충전량</TableHead>
                    <TableHead className="text-center text-xs sm:text-sm px-1 sm:px-3 whitespace-nowrap">100알<br className="sm:hidden" />(g)</TableHead>
                    <TableHead className="text-center text-xs sm:text-sm px-1 sm:px-3 whitespace-nowrap">보틀<br className="sm:hidden" />(g)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {supplementData.map((supplement) => (
                    <TableRow key={supplement.name}>
                      <TableCell className="font-medium text-xs sm:text-sm px-1 sm:px-3 py-1.5 sm:py-2">{maskEvenChars(supplement.name)}</TableCell>
                      <TableCell className="text-center text-xs sm:text-sm px-1 sm:px-3 py-1.5 sm:py-2 tabular-nums">
                        {maskEvenChars(supplement.dosage.toLocaleString())}
                      </TableCell>
                      <TableCell className="text-center text-xs sm:text-sm px-1 sm:px-3 py-1.5 sm:py-2 tabular-nums">
                        {maskEvenChars(supplement.weight100pills.toString())}
                      </TableCell>
                      <TableCell className="text-center text-xs sm:text-sm px-1 sm:px-3 py-1.5 sm:py-2 tabular-nums">
                        {maskEvenChars(supplement.bottleWeight.toString())}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="h-4" />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
});

SupplementInfoDialog.displayName = 'SupplementInfoDialog';

export default SupplementInfoDialog;