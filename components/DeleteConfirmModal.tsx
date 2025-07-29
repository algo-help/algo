'use client';

import { useState } from 'react';
import { deleteDelivery } from '@/app/(dashboard)/actions';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  deliveryId: number | null;
  recipientName: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function DeleteConfirmModal({ 
  isOpen, 
  deliveryId, 
  recipientName, 
  onClose, 
  onSuccess 
}: DeleteConfirmModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!deliveryId) return;
    
    setIsDeleting(true);
    setError(null);

    try {
      await deleteDelivery(deliveryId);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : '삭제에 실패했습니다.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (!deliveryId) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>배송 삭제 확인</AlertDialogTitle>
          <AlertDialogDescription>
            <span className="font-medium">{recipientName}</span>님의 배송 정보를 삭제하시겠습니까?
            <br />
            이 작업은 되돌릴 수 없습니다.
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>
            취소
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? '삭제 중...' : '삭제'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}