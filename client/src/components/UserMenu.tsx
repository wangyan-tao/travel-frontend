import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { LogOut, User, Settings, FileText, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

interface UserInfo {
  id: number;
  username: string;
  email?: string;
  role: string;
}

export default function UserMenu() {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserInfo();
    const handleAuthChange = () => {
      setLoading(true);
      fetchUserInfo();
    };
    window.addEventListener('auth-changed', handleAuthChange);
    return () => {
      window.removeEventListener('auth-changed', handleAuthChange);
    };
  }, []);

  const fetchUserInfo = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      const response = await axios.get('http://localhost:8080/api/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.code === 200) {
        setUser(response.data.data);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('获取用户信息失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await axios.post(
          'http://localhost:8080/api/auth/logout',
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }

      localStorage.removeItem('token');
      localStorage.removeItem('user');
      toast.success('退出登录成功');
      window.dispatchEvent(new Event('auth-changed'));
      setLocation('/login');
    } catch (error) {
      console.error('退出登录失败:', error);
      // 即使请求失败也清除本地token
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.dispatchEvent(new Event('auth-changed'));
      setLocation('/login');
    }
  };

  const handleProfile = () => {
    setLocation('/profile');
  };

  const handleMyApplications = () => {
    setLocation('/my-applications');
  };

  const handleRepaymentCapacity = () => {
    setLocation('/repayment-capacity');
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => setLocation('/login')}>
          登录
        </Button>
        <Button size="sm" onClick={() => setLocation('/register')}>
          注册
        </Button>
      </div>
    );
  }

  // 获取用户名首字母作为头像
  const getInitials = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-primary text-primary-foreground">
              {getInitials(user.username)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.username}</p>
            {user.email && (
              <p className="text-xs leading-none text-muted-foreground">
                {user.email}
              </p>
            )}
            <p className="text-xs leading-none text-muted-foreground">
              {user.role === 'ADMIN' ? '管理员' : '普通用户'}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleProfile}>
          <User className="mr-2 h-4 w-4" />
          <span>个人信息</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleMyApplications}>
          <FileText className="mr-2 h-4 w-4" />
          <span>我的申请</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleRepaymentCapacity}>
          <TrendingUp className="mr-2 h-4 w-4" />
          <span>还款能力辅助</span>
        </DropdownMenuItem>
        {user.role === 'ADMIN' && (
          <DropdownMenuItem onClick={() => setLocation('/admin/dashboard')}>
            <Settings className="mr-2 h-4 w-4" />
            <span>管理后台</span>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="text-red-600">
          <LogOut className="mr-2 h-4 w-4" />
          <span>退出登录</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
