import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import axios from '@/lib/axios';
import { profileApi } from '@/lib/profileApi';

export default function Register() {
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    phone: '',
    email: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 表单验证
    if (!formData.username || !formData.password || !formData.phone) {
      toast.error('请填写必填信息');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('两次密码输入不一致');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('密码长度至少6位');
      return;
    }

    if (!/^1[3-9]\d{9}$/.test(formData.phone)) {
      toast.error('请输入正确的手机号');
      return;
    }

    setLoading(true);
    
    try {
      const { confirmPassword, ...registerData } = formData;
      const response: any = await axios.post('/auth/register', registerData);
      
      if (response.code === 200) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        // 清除 profile 缓存，确保获取最新数据
        profileApi.clearCache();
        // 设置标记，表示刚刚注册/登录成功，避免组件初始化时重复调用
        sessionStorage.setItem('just-logged-in', 'true');
        window.dispatchEvent(new Event('auth-changed'));
        
        toast.success('注册成功');
        
        // 跳转到实名认证页面
        setLocation('/identity-verification');
      } else {
        toast.error(response.message || '注册失败');
      }
    } catch (error: any) {
      toast.error(error.message || '注册失败，请稍后重试');
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
          <h1 className="text-2xl font-bold">创建账号</h1>
          <p className="text-muted-foreground">注册青春旅贷账号</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">用户名 *</Label>
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
            <Label htmlFor="phone">手机号 *</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="请输入手机号"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">邮箱</Label>
            <Input
              id="email"
              type="email"
              placeholder="请输入邮箱（可选）"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">密码 *</Label>
            <Input
              id="password"
              type="password"
              placeholder="至少6位密码"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">确认密码 *</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="再次输入密码"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              disabled={loading}
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? '注册中...' : '注册'}
          </Button>
        </form>

        <div className="text-center text-sm">
          <span className="text-muted-foreground">已有账号？</span>
          <Link href="/login" className="text-primary hover:underline ml-1">
            立即登录
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
