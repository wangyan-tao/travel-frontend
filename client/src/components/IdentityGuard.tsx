import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useIdentityGuard } from '@/hooks/useIdentityGuard';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface IdentityGuardProps {
  children: React.ReactNode;
  redirectTo?: string;
}

/**
 * 实名认证守卫组件
 * 如果用户未完成实名认证，则显示提示并引导去实名认证页面
 * 管理员用户跳过此检查
 */
export default function IdentityGuard({ children, redirectTo = '/identity-verification' }: IdentityGuardProps) {
  const [, setLocation] = useLocation();
  const { isVerified, isAdmin, loading } = useIdentityGuard();

  // 管理员可以访问所有页面，跳过实名认证检查和加载状态
  if (isAdmin) {
    return <>{children}</>;
  }

  // 如果正在加载，显示加载状态（非管理员用户）
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 rounded-full border-2 border-primary animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">正在验证实名认证状态...</p>
        </div>
      </div>
    );
  }

  // 如果未实名认证，显示提示页面
  if (isVerified === false) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 space-y-6 text-center">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">需要实名认证</h1>
            <p className="text-muted-foreground">
              您需要先完成实名认证才能访问此功能
            </p>
          </div>
          <div className="space-y-2">
            <Button onClick={() => setLocation(redirectTo)} className="w-full">
              前往实名认证
            </Button>
            <Button variant="outline" onClick={() => setLocation('/')} className="w-full">
              返回首页
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // 如果已认证，渲染子组件
  return <>{children}</>;
}
