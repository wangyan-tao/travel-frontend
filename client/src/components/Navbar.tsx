import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import UserMenu from './UserMenu';
import NotificationBell from './NotificationBell';
import MobileMenu from './MobileMenu';
import { Plane } from 'lucide-react';
import { useIdentityGuard } from '@/hooks/useIdentityGuard';

export default function Navbar() {
  const [location] = useLocation();
  const { interceptNavigation } = useIdentityGuard();

  // 需要实名认证的路径
  const protectedPaths = ['/loan-products', '/my-applications', '/repayment', '/loan-application', '/profile', '/evaluation', '/repayment-capacity'];

  const navItems = [
    { path: '/', label: '首页', requireAuth: false },
    { path: '/loan-products', label: '贷款产品', requireAuth: true },
    { path: '/my-applications', label: '我的申请', requireAuth: true },
    { path: '/repayment', label: '还款管理', requireAuth: true },
  ];

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, path: string, requireAuth: boolean) => {
    // 如果路径需要实名认证，进行拦截检查
    if (requireAuth) {
      const isProtected = protectedPaths.some(p => path.startsWith(p));
      if (isProtected && !interceptNavigation(path)) {
        e.preventDefault();
        return false;
      }
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-semibold text-xl hover:opacity-80 transition-opacity">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground">
            <Plane className="h-5 w-5" />
          </div>
          <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            青春旅贷
          </span>
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              onClick={(e) => handleNavClick(e, item.path, item.requireAuth)}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                location === item.path
                  ? 'text-primary'
                  : 'text-muted-foreground'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* User Menu */}
        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-2">
            <NotificationBell />
            <UserMenu />
          </div>
          <div className="md:hidden flex items-center gap-2">
            <NotificationBell />
            <MobileMenu navItems={navItems} />
          </div>
        </div>
      </div>
    </nav>
  );
}
