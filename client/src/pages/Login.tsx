import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/contexts/LanguageContext';
import { useApp } from '@/contexts/AppContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
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
      apiRequest('POST', '/api/auth/login', data),
    onSuccess: async (response) => {
      const data = await response.json();
      dispatch({ type: 'SET_USER', payload: data.user });
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

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 samsung-gradient rounded-lg mb-4"></div>
          <CardTitle className="text-2xl font-bold">{t('login')}</CardTitle>
          <p className="text-gray-600">Welcome back to Samsung Recipe</p>
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
              className="w-full samsung-gradient text-white"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? 'Signing in...' : t('login')}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link href="/register">
                <span className="text-blue-600 hover:underline">{t('register')}</span>
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
