import { useEffect, useState, useCallback, useRef } from 'react';
import { useLocation } from 'wouter';
import { toast } from 'sonner';
import { profileApi } from '@/lib/profileApi';

/**
 * 实名认证守卫Hook
 * 检查用户是否已完成实名认证，如果未认证则拦截导航并提示
 */
export function useIdentityGuard() {
  const [location, setLocation] = useLocation();
  const [isVerified, setIsVerified] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const prevLocationRef = useRef<string | null>(null);

  const checkIdentity = useCallback(async () => {
    try {
      setLoading(true);
      const profile = await profileApi.getMe();
      setIsVerified(profile.identityVerified);
    } catch (error: any) {
      // 如果获取失败，可能是未登录，允许访问
      setIsVerified(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // 初始检查
    checkIdentity();
  }, [checkIdentity]);

  useEffect(() => {
    // 监听路由变化，当从实名认证页面离开时重新检查
    // 这样可以确保完成认证后立即更新状态
    const prevLocation = prevLocationRef.current;
    prevLocationRef.current = location;
    
    // 只在从实名认证页面离开时检查，避免不必要的请求
    if (prevLocation === '/identity-verification' && location !== '/identity-verification') {
      checkIdentity();
    }
  }, [location, checkIdentity]);

  useEffect(() => {
    // 监听全局事件，当完成实名认证时刷新状态
    const handleIdentityVerified = () => {
      checkIdentity();
    };

    window.addEventListener('identity-verified', handleIdentityVerified);
    
    return () => {
      window.removeEventListener('identity-verified', handleIdentityVerified);
    };
  }, [checkIdentity]);

  /**
   * 检查是否可以访问受保护的页面
   * @returns true 如果已实名认证，false 如果未认证
   */
  const canAccess = (): boolean => {
    return isVerified === true;
  };

  /**
   * 拦截导航，如果未实名认证则提示并跳转到实名认证页面
   * @param targetPath 目标路径
   * @returns true 如果允许导航，false 如果被拦截
   */
  const interceptNavigation = (targetPath: string): boolean => {
    // 如果正在加载，允许导航（避免闪烁）
    if (loading) {
      return true;
    }

    // 如果已认证，允许导航
    if (isVerified === true) {
      return true;
    }

    // 如果目标路径是实名认证页面，允许导航
    if (targetPath === '/identity-verification') {
      return true;
    }

    // 如果未认证，拦截导航并提示
    if (isVerified === false) {
      toast.error('请先完成实名认证', {
        description: '您需要先完成实名认证才能访问此功能',
        action: {
          label: '去认证',
          onClick: () => setLocation('/identity-verification'),
        },
      });
      return false;
    }

    // 默认允许导航
    return true;
  };

  return {
    isVerified,
    loading,
    canAccess,
    interceptNavigation,
    refresh: checkIdentity,
  };
}
