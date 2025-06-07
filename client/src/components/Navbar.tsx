import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { useApp } from '@/contexts/AppContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { LanguageToggle } from './LanguageToggle';
import { Search, ShoppingCart, User } from 'lucide-react';
import { authAPI } from '@/lib/queryClient';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

export function Navbar() {
  const [location] = useLocation();
  const { state, dispatch } = useApp();
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const logoutMutation = useMutation({
    mutationFn: () => authAPI.logout(),
    onSuccess: () => {
      dispatch({ type: 'LOGOUT' });
      queryClient.clear();
      toast({
        title: 'Success',
        description: 'Logged out successfully',
      });
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const navItems = [
    { href: '/', label: t('home') },
    { href: '/recipes', label: t('recipes') },
    { href: '/ingredients', label: t('ingredients') },
    ...(state.user?.isCorporate ? [{ href: '/board', label: t('board') }] : []),
  ];

  return (
    <nav className="recipe-nav sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 recipe-gradient rounded-lg"></div>
              <span className="text-xl font-bold text-foreground">우리들의 레시피</span>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <span
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    location === item.href
                      ? 'text-primary border-b-2 border-primary pb-1'
                      : 'text-foreground/70'
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            ))}
          </div>

          {/* Search Bar */}
          <div className="hidden lg:flex items-center flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <input
                type="text"
                placeholder={t('searchRecipes')}
                className="w-full pl-10 pr-4 py-2 border border-input rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    const query = e.currentTarget.value.trim();
                    if (query) {
                      window.location.href = `/recipes?search=${encodeURIComponent(query)}`;
                    }
                  }
                }}
              />
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="lg:hidden">
              <Search className="h-4 w-4" />
            </Button>
            
            <Button variant="ghost" size="icon">
              <ShoppingCart className="h-4 w-4" />
            </Button>

            <LanguageToggle />

            {state.isAuthenticated ? (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="icon">
                  <User className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleLogout}
                  disabled={logoutMutation.isPending}
                >
                  {t('logout')}
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    {t('login')}
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">
                    {t('register')}
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
