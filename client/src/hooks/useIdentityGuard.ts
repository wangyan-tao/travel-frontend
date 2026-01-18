import { useEffect, useState, useCallback, useRef } from 'react';
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
  const [location, setLocation] = useLocation();
  const [isVerified, setIsVerified] = useState<boolean | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const prevLocationRef = useRef<string | null>(null);

  const checkIdentity = useCallback(async () => {
    try {
      setLoading(true);

      // 首先检查 token，如果没有 token（退出登录），直接返回
      const token = localStorage.getItem('token');
      if (!token) {
        setIsVerified(false);
        setIsAdmin(false);
        setLoading(false);
        profileApi.clearCache();
        return;
      }

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

      // 使用缓存机制，避免短时间内重复调用
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
  }, []);

  useEffect(() => {
    // 监听登录成功事件
    const handleAuthChanged = () => {
      // 延迟执行，让其他组件先处理
      setTimeout(() => {
        // 检查 token，如果没有 token（退出登录），直接设置状态，不调用 API
        const token = localStorage.getItem('token');
        if (!token) {
          setIsVerified(false);
          setIsAdmin(false);
          setLoading(false);
          // 清除 profile 缓存
          profileApi.clearCache();
          return;
        }
        checkIdentity();
      }, 200);
      // 清除标记，表示已经处理过登录事件
      sessionStorage.removeItem('just-logged-in');
    };

    window.addEventListener('auth-changed', handleAuthChanged);

    // 检查是否有 token 和是否刚刚登录
    const token = localStorage.getItem('token');
    const justLoggedIn = sessionStorage.getItem('just-logged-in');

    if (token && !justLoggedIn) {
      // 如果有 token 但不是刚刚登录（页面刷新），立即检查
      checkIdentity();
    } else if (!token) {
      // 如果没有 token，直接设置状态，不调用 API
      setIsVerified(false);
      setIsAdmin(false);
      setLoading(false);
    }
    // 如果是刚刚登录，等待 auth-changed 事件处理，不立即调用

    return () => {
      window.removeEventListener('auth-changed', handleAuthChanged);
    };
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