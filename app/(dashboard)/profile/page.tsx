'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSession } from '../actions';
import { updateProfile } from './actions';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RefreshCw, Save, Undo2, User } from "lucide-react";
import { toast } from 'sonner';
import { supabase } from '@/utils/supabase';

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userEmail, setUserEmail] = useState<string>('');
  const [userId, setUserId] = useState<string>('');
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState<string | null>(null);
  const [selectedGender, setSelectedGender] = useState<'male' | 'female'>('male');
  const [previewAvatarUrl, setPreviewAvatarUrl] = useState<string | null>(null);
  const [originalAvatarUrl, setOriginalAvatarUrl] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const session = await getSession();
      
      if (!session) {
        router.replace('/login');
        return;
      }
      
      setUserEmail(session.email);
      setUserId(session.id);
      
      // 현재 아바타 URL 가져오기
      // console.log('[Profile] Fetching avatar for userId:', session.id);
      const { data, error } = await supabase
        .from('users')
        .select('avatar_url')
        .eq('id', session.id)
        .single();
        
      // console.log('[Profile] Avatar query result:', { data, error });
        
      if (data?.avatar_url) {
        // console.log('[Profile] Found existing avatar:', data.avatar_url);
        setCurrentAvatarUrl(data.avatar_url);
        setOriginalAvatarUrl(data.avatar_url);
        setPreviewAvatarUrl(data.avatar_url);
        
        // URL에서 성별 추출
        if (data.avatar_url.includes('gender=female')) {
          setSelectedGender('female');
        }
      } else {
        // console.log('[Profile] No avatar found, generating default');
        // 기본 아바타 생성
        generateRandomAvatar('male');
      }
    } catch (err) {
      // console.error('Session check error:', err);
      router.replace('/login');
    } finally {
      setLoading(false);
    }
  };

  const generateRandomAvatar = (gender: 'male' | 'female') => {
    const seed = Math.random().toString(36).substring(2, 15);
    const avatarUrl = `https://api.dicebear.com/7.x/lorelei/svg?seed=${seed}&gender=${gender}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;
    setPreviewAvatarUrl(avatarUrl);
    setSelectedGender(gender);
  };

  const handleRandomize = () => {
    generateRandomAvatar(selectedGender);
  };

  const handleGenderChange = (gender: 'male' | 'female') => {
    setSelectedGender(gender);
    generateRandomAvatar(gender);
  };

  const handleRevert = () => {
    setPreviewAvatarUrl(originalAvatarUrl);
    if (originalAvatarUrl?.includes('gender=female')) {
      setSelectedGender('female');
    } else {
      setSelectedGender('male');
    }
  };

  const handleSave = async () => {
    if (!previewAvatarUrl) return;
    
    setSaving(true);
    try {
      // console.log('[Profile] Saving avatar for userId:', userId);
      // console.log('[Profile] New avatar URL:', previewAvatarUrl);
      
      await updateProfile(userId, previewAvatarUrl);
      
      // console.log('[Profile] Avatar saved successfully');
      
      setCurrentAvatarUrl(previewAvatarUrl);
      setOriginalAvatarUrl(previewAvatarUrl);
      
      toast.success('프로필이 성공적으로 업데이트되었습니다.');
      
      // 사이드바 업데이트를 위해 페이지 새로고침
      setTimeout(() => {
        // console.log('[Profile] Reloading page...');
        window.location.reload();
      }, 500);
    } catch (error) {
      // console.error('프로필 업데이트 오류:', error);
      toast.error('프로필 업데이트에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  // 사용자명 추출
  const extractUsername = (email: string) => {
    if (!email) return '';
    const username = email.split('@')[0];
    return username.charAt(0).toUpperCase() + username.slice(1);
  };

  const displayName = extractUsername(userEmail);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-lg sm:text-xl font-semibold">내 정보</h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                프로필 이미지를 설정하고 관리하세요
              </p>
            </div>
          </div>

        <Card>
          <CardHeader>
            <CardTitle>프로필 이미지</CardTitle>
            <CardDescription>
              DiceBear의 Lorelei 스타일로 프로필 이미지를 생성합니다
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-8 items-center">
              {/* 현재 프로필 */}
              <div className="flex flex-col items-center space-y-2">
                <Label className="text-sm text-muted-foreground">현재 프로필</Label>
                <Avatar className="h-24 w-24">
                  <AvatarImage src={currentAvatarUrl || undefined} />
                  <AvatarFallback>
                    <User className="h-12 w-12" />
                  </AvatarFallback>
                </Avatar>
              </div>

              {/* 화살표 */}
              <div className="hidden sm:block">
                <RefreshCw className="h-6 w-6 text-muted-foreground" />
              </div>

              {/* 미리보기 */}
              <div className="flex flex-col items-center space-y-2">
                <Label className="text-sm text-muted-foreground">미리보기</Label>
                <Avatar className="h-24 w-24 ring-2 ring-primary ring-offset-2">
                  <AvatarImage src={previewAvatarUrl || undefined} />
                  <AvatarFallback>
                    <User className="h-12 w-12" />
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>

            <Separator />

            {/* 성별 선택 */}
            <div className="space-y-3">
              <Label>성별 선택</Label>
              <RadioGroup
                value={selectedGender}
                onValueChange={handleGenderChange}
                className="flex flex-row gap-6"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="male" id="male" />
                  <Label htmlFor="male" className="cursor-pointer">남성</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="female" id="female" />
                  <Label htmlFor="female" className="cursor-pointer">여성</Label>
                </div>
              </RadioGroup>
            </div>

            {/* 버튼 그룹 */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handleRandomize}
                variant="outline"
                className="flex-1"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                랜덤 생성
              </Button>
              <Button
                onClick={handleRevert}
                variant="outline"
                disabled={!originalAvatarUrl || originalAvatarUrl === previewAvatarUrl}
                className="flex-1"
              >
                <Undo2 className="h-4 w-4 mr-2" />
                되돌리기
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving || previewAvatarUrl === currentAvatarUrl}
                className="flex-1"
              >
                {saving ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                설정하기
              </Button>
            </div>

            {/* 사용자 정보 */}
            <div className="pt-4 space-y-2">
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-muted-foreground">이메일</span>
                <span className="text-sm font-medium">{userEmail}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-muted-foreground">사용자명</span>
                <span className="text-sm font-medium">{displayName}</span>
              </div>
            </div>
          </CardContent>
        </Card>
    </div>
  );
}