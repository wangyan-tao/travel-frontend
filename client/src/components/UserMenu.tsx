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
import axios from '@/lib/axios';
import { profileApi } from '@/lib/profileApi';

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
    const handleAuthChange = () => {
      setLoading(true);
      fetchUserInfo();
      // 清除标记，表示已经处理过登录事件
      sessionStorage.removeItem('just-logged-in');
    };
    
    window.addEventListener('auth-changed', handleAuthChange);
    
    // 检查是否有 token 和是否刚刚登录
    const token = localStorage.getItem('token');
    const justLoggedIn = sessionStorage.getItem('just-logged-in');
    
    if (token && !justLoggedIn) {
      // 如果有 token 但不是刚刚登录（页面刷新），立即获取用户信息
      fetchUserInfo();
    }
    // 如果是刚刚登录，等待 auth-changed 事件处理，不立即调用
    
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

      const response: any = await axios.get('/auth/me');

      if (response.code === 200) {
        setUser(response.data);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('获取用户信息失败:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          await axios.post('/auth/logout', {});
        } catch (error: any) {
          // 忽略退出登录接口的错误，继续清除本地数据
          console.error('退出登录接口调用失败:', error);
        }
      }
    } catch (error) {
      console.error('退出登录失败:', error);
    } finally {
      // 无论接口调用是否成功，都清除本地数据
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // 清除 profile 缓存
      profileApi.clearCache();
      toast.success('退出登录成功');
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
        {user.role !== 'ADMIN' && (
          <>
            <DropdownMenuItem onClick={handleMyApplications}>
              <FileText className="mr-2 h-4 w-4" />
              <span>我的申请</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleRepaymentCapacity}>
              <TrendingUp className="mr-2 h-4 w-4" />
              <span>还款能力辅助</span>
            </DropdownMenuItem>
          </>
        )}
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
