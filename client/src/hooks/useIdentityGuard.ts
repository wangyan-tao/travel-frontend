import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { toast } from 'sonner';
import { profileApi } from '@/lib/profileApi';
import axios from '@/lib/axios';

/**
 * 实名认证守卫Hook
 * 检查用户是否已完成实名认证，如果未认证则拦截导航并提示
 * 管理员用户跳过实名认证检查
 */
export function useIdentityGuard() {
  const [, setLocation] = useLocation();
  const [isVerified, setIsVerified] = useState<boolean | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkIdentity();
  }, []);

  const checkIdentity = async () => {
    try {
      setLoading(true);
      
      // 先快速检查localStorage中的用户角色（避免不必要的API调用）
      try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          if (user?.role === 'ADMIN') {
            // 如果是管理员，立即设置并跳过后续检查
            setIsAdmin(true);
            setIsVerified(true); // 管理员视为已认证
            setLoading(false);
            return;
          }
        }
      } catch (e) {
        // 如果解析失败，继续使用API检查
      }
      
      // 如果localStorage中没有，尝试从auth/me接口快速获取角色
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const authResponse: any = await axios.get('/auth/me');
          if (authResponse.code === 200 && authResponse.data?.role === 'ADMIN') {
            // 如果是管理员，立即设置并跳过后续检查
            setIsAdmin(true);
            setIsVerified(true); // 管理员视为已认证
            setLoading(false);
            return;
          }
        }
      } catch (e) {
        // 如果快速检查失败，继续使用profileApi
      }
      
      const profile = await profileApi.getMe();
      setIsVerified(profile.identityVerified);
      // 检查是否为管理员
      setIsAdmin(profile.user?.role === 'ADMIN');
    } catch (error: any) {
      // 如果获取失败，可能是未登录，允许访问
      setIsVerified(false);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 检查是否可以访问受保护的页面
   * @returns true 如果已实名认证或是管理员，false 如果未认证
   */
  const canAccess = (): boolean => {
    // 管理员可以访问所有页面
    if (isAdmin) {
      return true;
    }
    return isVerified === true;
  };

  /**
   * 拦截导航，如果未实名认证则提示并跳转到实名认证页面
   * 管理员用户跳过此检查
   * @param targetPath 目标路径
   * @returns true 如果允许导航，false 如果被拦截
   */
  const interceptNavigation = (targetPath: string): boolean => {
    // 如果正在加载，允许导航（避免闪烁）
    if (loading) {
      return true;
    }

    // 管理员可以访问所有页面，跳过实名认证检查
    if (isAdmin) {
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
    isAdmin,
    loading,
    canAccess,
    interceptNavigation,
    refresh: checkIdentity,
  };
}
