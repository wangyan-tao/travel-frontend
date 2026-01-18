import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import axios from '@/lib/axios';
import { sm4 } from 'sm-crypto';
import { profileApi } from '@/lib/profileApi';

export default function Login() {
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.username || !formData.password) {
      toast.error('请填写完整信息');
      return;
    }

    setLoading(true);
    
    try {
      const encoder = typeof TextEncoder !== 'undefined' ? new TextEncoder() : undefined;
      const rawBytes = encoder
        ? encoder.encode(formData.username)
        : new Uint8Array(Array.from(formData.username).map((c) => c.charCodeAt(0)));
      const keyBytes = new Uint8Array(16);
      keyBytes.set(rawBytes.slice(0, 16));
      const keyHex = Array.from(keyBytes)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
      const cipherHex = sm4.encrypt(formData.password, keyHex);
      const payload = { username: formData.username, password: cipherHex };
      const response: any = await axios.post('/auth/login', payload);
      
      if (response.code === 200) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        // 清除 profile 缓存，确保获取最新数据
        profileApi.clearCache();
        // 设置标记，表示刚刚登录成功，避免组件初始化时重复调用
        sessionStorage.setItem('just-logged-in', 'true');
        window.dispatchEvent(new Event('auth-changed'));
        
        toast.success('登录成功');
        
        // 根据角色跳转
        if (response.data.user.role === 'ADMIN') {
          setLocation('/admin/dashboard');
        } else {
          setLocation('/loan-products');
        }
      } else {
        toast.error(response.message || '登录失败');
      }
    } catch (error: any) {
      toast.error(error.message || '登录失败，请检查用户名和密码');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
      <Card className="w-full max-w-md p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="h-12 w-12 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xl">青</span>
            </div>
          </div>
          <h1 className="text-2xl font-bold">欢迎回来</h1>
          <p className="text-muted-foreground">登录青春旅贷账号</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">用户名</Label>
            <Input
              id="username"
              type="text"
              placeholder="请输入用户名"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">密码</Label>
            <Input
              id="password"
              type="password"
              placeholder="请输入密码"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              disabled={loading}
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? '登录中...' : '登录'}
          </Button>
        </form>

        <div className="text-center text-sm">
          <span className="text-muted-foreground">还没有账号？</span>
          <Link href="/register" className="text-primary hover:underline ml-1">
            立即注册
          </Link>
        </div>

        <div className="text-center">
          <Link href="/">
            <span className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
              返回首页
            </span>
          </Link>
        </div>
      </Card>
    </div>
  );
}
