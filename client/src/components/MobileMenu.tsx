import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useIdentityGuard } from '@/hooks/useIdentityGuard';

interface MobileMenuProps {
  navItems: Array<{ path: string; label: string; requireAuth?: boolean }>;
}

export default function MobileMenu({ navItems }: MobileMenuProps) {
  const [open, setOpen] = useState(false);
  const [location] = useLocation();
  const { interceptNavigation } = useIdentityGuard();

  const handleNavClick = (e: React.MouseEvent, path: string, requireAuth?: boolean) => {
    // 如果路径需要实名认证，进行拦截检查
    if (requireAuth && !interceptNavigation(path)) {
      e.preventDefault();
      return;
    }
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[280px] sm:w-[350px]">
        <SheetHeader>
          <SheetTitle>导航菜单</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-4 mt-8">
          {navItems.map((item) => (
            <Link key={item.path} href={item.path}>
              <a
                onClick={(e) => handleNavClick(e, item.path, item.requireAuth)}
                className={`block px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                  location === item.path
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted text-foreground'
                }`}
              >
                {item.label}
              </a>
            </Link>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
