'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { login } from '../(dashboard)/actions';
import { createClient } from '@/utils/supabase/client';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle, Loader2, Chrome, ChevronDown, ChevronUp } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFormExpanded, setIsFormExpanded] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  
  useEffect(() => {
    console.log('🔹 LoginPage mounted');
    console.log('🔹 Environment check:', {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Present' : 'Missing'
    });
    
    // URL 파라미터에서 에러 메시지 확인
    const errorParam = searchParams?.get('error');
    if (errorParam) {
      console.log('🔹 Error parameter found:', errorParam);
      if (errorParam.includes('domains are allowed')) {
        setError('@algocarelab.com 또는 @algocare.me 도메인의 계정만 허용됩니다.');
      } else if (errorParam === 'Account is deactivated') {
        setError('계정이 비활성화되었습니다. 관리자에게 문의하세요.');
      } else {
        setError('로그인 중 오류가 발생했습니다.');
      }
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('email', email);
      formData.append('password', password);
      
      const result = await login(formData);
      
      if (result?.error) {
        setError(result.error);
      } else {
        router.push('/');
        router.refresh();
      }
    } catch (err) {
      setError('로그인 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    console.log('🔹 Button clicked - handleGoogleLogin called!');
    setError(null);
    setIsLoading(true);
    
    try {
      console.log('🔹 Creating Supabase client...');
      const supabase = createClient();
      console.log('🔹 Supabase client created:', !!supabase);
      
      console.log('🔹 Starting Google OAuth login...');
      console.log('🔹 Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
      console.log('🔹 Redirect URL:', `${window.location.origin}/api/auth/callback`);
      
      // 클라이언트 사이드에서 직접 OAuth 처리
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback`,
          scopes: 'email profile',
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });

      console.log('🔹 OAuth result:', { data, error });

      if (error) {
        console.error('🔹 OAuth error details:', error);
        setError(`Google 로그인 오류: ${error.message}`);
        setIsLoading(false);
      }
      // 성공 시 자동으로 리다이렉트됨
    } catch (err) {
      console.error('🔹 OAuth catch error:', err);
      setError(`Google 로그인 예외: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="py-9">
          <div className="flex flex-col items-center space-y-2">
            <Image
              src="https://portal.algocare.me/logo.svg"
              alt="algocare"
              width={130}
              height={39}
              className="h-auto"
            />
            <p className="text-sm text-muted-foreground">관리 시스템</p>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <Button
            type="button"
            variant="outline"
            className="w-full h-[54px]"
            onClick={(e) => {
              console.log('🔹 Button onClick triggered!', e);
              handleGoogleLogin();
            }}
            disabled={isLoading}
          >
            <svg className="mr-2 w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Sign in with Google
          </Button>
          
          <div className="relative w-full">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                또는
              </span>
            </div>
          </div>
          
          <Button
            type="button"
            variant="ghost"
            className="w-full text-sm text-muted-foreground hover:text-foreground"
            onClick={() => setIsFormExpanded(!isFormExpanded)}
            disabled={isLoading}
          >
            ID/PW로 로그인
            {isFormExpanded ? (
              <ChevronUp className="ml-2 h-4 w-4" />
            ) : (
              <ChevronDown className="ml-2 h-4 w-4" />
            )}
          </Button>
        </CardContent>
        
        <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isFormExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4 pt-0">
              <div className="space-y-2">
                <Label htmlFor="email" className="ml-1">ID</Label>
                <Input
                  id="email"
                  type="text"
                  placeholder="Enter your identification"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  disabled={isLoading}
                  className="placeholder:text-gray-400"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="ml-1">PW</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  disabled={isLoading}
                  className="placeholder:text-gray-400"
                />
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-4">
              <Button
                type="submit"
                className="w-full bg-black hover:bg-gray-800 text-white"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    로그인 중...
                  </>
                ) : (
                  '로그인'
                )}
              </Button>
              
              <p className="text-sm text-center text-muted-foreground">
                허용된 계정만 로그인할 수 있습니다.
              </p>
            </CardFooter>
          </form>
        </div>
        
      </Card>
    </div>
  );
}