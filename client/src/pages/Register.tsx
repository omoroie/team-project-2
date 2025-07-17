import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useLanguage } from '@/contexts/LanguageContext';
import { useApp } from '@/contexts/AppContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authAPI } from '@/lib/apiClient';
import { useToast } from '@/hooks/use-toast';
import { Link, useLocation } from 'wouter';
import { useState } from 'react';
import { RegisterRequest } from '@shared/schema';

export default function Register() {
  const { t } = useLanguage();
  const { dispatch } = useApp();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState<RegisterRequest>({
    username: '',
    email: '',
    password: '',
    isCorporate: false,
  });

  const registerMutation = useMutation({
    mutationFn: (data: RegisterRequest) =>
      authAPI.register(data),
    onSuccess: (response) => {
      const user = response.data?.user || response.data?.data?.user;
      if (user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
      }
      dispatch({ type: 'SET_USER', payload: user || null });
      queryClient.clear();
      toast({
        title: 'Success',
        description: 'Account created successfully',
      });
      setLocation('/');
    },
    onError: (error: unknown) => {
      let message = 'Registration failed';
      if ((error as { response?: { data?: { message?: string } } })?.response?.data?.message) {
        message = (error as { response: { data: { message: string } } }).response.data.message;
      }
      
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    registerMutation.mutate(formData);
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 recipe-gradient rounded-lg mb-4"></div>
          <CardTitle className="text-2xl font-bold text-foreground">{t('register')}</CardTitle>
          <p className="text-muted-foreground">우리들의 레시피 계정을 만들어보세요</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
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
              <Label htmlFor="email">{t('email')}</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                className={formData.password.length > 0 && formData.password.length < 6 ? 'border-red-500' : ''}
              />
              {formData.password.length > 0 && formData.password.length < 6 && (
                <p className="text-sm text-red-500">비밀번호는 6자리 이상이어야 합니다</p>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="corporate"
                checked={formData.isCorporate}
                onCheckedChange={(checked) => 
                  setFormData({ ...formData, isCorporate: checked as boolean })
                }
              />
              <Label htmlFor="corporate" className="text-sm">
                {t('corporateAccount')}
              </Label>
            </div>

            <Button 
              type="submit" 
              className="w-full recipe-gradient text-white"
              disabled={registerMutation.isPending}
            >
              {registerMutation.isPending ? '계정 생성 중...' : t('register')}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              이미 계정이 있으신가요?{' '}
              <Link href="/login">
                <span className="text-primary hover:underline">{t('login')}</span>
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
