import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import UserMenu from './UserMenu';
import NotificationBell from './NotificationBell';
import MobileMenu from './MobileMenu';
import { Plane } from 'lucide-react';

export default function Navbar() {
  const [location] = useLocation();

  const navItems = [
    { path: '/', label: '首页' },
    { path: '/loan-products', label: '贷款产品' },
    { path: '/my-applications', label: '我的申请' },
    { path: '/repayment', label: '还款管理' },
  ];

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
