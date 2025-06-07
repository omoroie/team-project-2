import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useLanguage } from '@/contexts/LanguageContext';
import { useApp } from '@/contexts/AppContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authAPI } from '@/lib/apiClient';
import { useToast } from '@/hooks/use-toast';
import { Link, useLocation } from 'wouter';
import { useState } from 'react';

export default function Login() {
  const { t } = useLanguage();
  const { dispatch } = useApp();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  const loginMutation = useMutation({
    mutationFn: (data: { username: string; password: string }) =>
      authAPI.login(data),
    onSuccess: (response: any) => {
      // 토큰을 localStorage에 저장
      if (response.data.token) {
        localStorage.setItem('authToken', response.data.token);
      }
      dispatch({ type: 'SET_USER', payload: response.data.user });
      queryClient.clear();
      toast({
        title: 'Success',
        description: 'Logged in successfully',
      });
      setLocation('/');
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Invalid credentials',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate(formData);
  };

  const handleKakaoLogin = () => {
    toast({
      title: '준비 중',
      description: '카카오 로그인 기능을 준비 중입니다.',
    });
  };

  const handleNaverLogin = () => {
    toast({
      title: '준비 중', 
      description: '네이버 로그인 기능을 준비 중입니다.',
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 recipe-gradient rounded-lg mb-4"></div>
          <CardTitle className="text-2xl font-bold text-foreground">{t('login')}</CardTitle>
          <p className="text-muted-foreground">만개의레시피에 오신 것을 환영합니다</p>
        </CardHeader>
        <CardContent>
          {/* 직접 입력 폼을 위쪽으로 이동 */}
          <form onSubmit={handleSubmit} className="space-y-4 mb-6">
            <div className="space-y-2">
              <Label htmlFor="username">{t('username')}</Label>
              <Input
                id="username"
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">{t('password')}</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>

            <Button 
              type="submit" 
              className="w-full recipe-gradient text-white"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? '로그인 중...' : t('login')}
            </Button>
          </form>

          <div className="relative mb-6">
            <Separator />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="bg-background px-2 text-sm text-muted-foreground">또는</span>
            </div>
          </div>

          {/* 소셜 로그인 버튼들을 아래쪽으로 이동 */}
          <div className="space-y-3">
            <Button 
              onClick={handleKakaoLogin}
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-medium"
              type="button"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 3c5.799 0 10.5 3.664 10.5 8.185 0 4.52-4.701 8.184-10.5 8.184a13.5 13.5 0 0 1-1.727-.11l-4.408 2.883c-.501.265-.678.236-.472-.413l.892-3.678c-2.88-1.46-4.785-3.99-4.785-6.866C1.5 6.665 6.201 3 12 3z"/>
              </svg>
              카카오로 시작하기
            </Button>
            
            <Button 
              onClick={handleNaverLogin}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-medium"
              type="button"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16.273 12.845 7.376 0H0v24h7.726V11.156L16.624 24H24V0h-7.727v12.845z"/>
              </svg>
              네이버로 시작하기
            </Button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              계정이 없으신가요?{' '}
              <Link href="/register">
                <span className="text-primary hover:underline">{t('register')}</span>
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
