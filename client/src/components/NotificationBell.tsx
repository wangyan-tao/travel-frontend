import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import axios from '@/lib/axios';
import { toast } from 'sonner';

interface Notification {
  id: number;
  title: string;
  content: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetchNotifications();
    // 每1分钟自动刷新通知
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response: any = await axios.get('/notifications');

      if (response.code === 200) {
        const data = response.data || [];
        setNotifications(data);
        setUnreadCount(data.filter((n: Notification) => !n.isRead).length);
      }
    } catch (error) {
      // 静默失败，不显示错误提示（后端未启动时）
      console.log('通知服务不可用');
    }
  };

  const markAsRead = async (id: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      await axios.put(`/notifications/${id}/read`, {});

      // 更新本地状态
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('标记已读失败:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      setLoading(true);
      await axios.put('/notifications/read-all', {});

      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success('已全部标记为已读');
    } catch (error) {
      console.error('标记全部已读失败:', error);
      toast.error('操作失败');
    } finally {
      setLoading(false);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'APPROVAL':
        return '📋';
      case 'REPAYMENT':
        return '💰';
      case 'OVERDUE':
        return '⚠️';
      case 'SYSTEM':
        return '🔔';
      default:
        return '📬';
    }
  };

  const getNotificationTypeLabel = (type: string) => {
    const typeMap: Record<string, string> = {
      APPROVAL: '审批通知',
      REPAYMENT: '还款提醒',
      OVERDUE: '逾期提醒',
      SYSTEM: '系统通知',
    };
    return typeMap[type] || '通知';
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days < 7) return `${days}天前`;
    return date.toLocaleDateString('zh-CN');
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">通知消息</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              disabled={loading}
              className="text-xs"
            >
              全部已读
            </Button>
          )}
        </div>
        <ScrollArea className="h-[400px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Bell className="h-12 w-12 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">暂无通知消息</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-muted/50 cursor-pointer transition-colors ${
                    !notification.isRead ? 'bg-blue-50/50' : ''
                  }`}
                  onClick={() => {
                    if (!notification.isRead) {
                      markAsRead(notification.id);
                    }
                  }}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl flex-shrink-0">
                      {getNotificationIcon(notification.type)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-muted-foreground">
                          {getNotificationTypeLabel(notification.type)}
                        </span>
                        {!notification.isRead && (
                          <span className="h-2 w-2 rounded-full bg-blue-500 flex-shrink-0" />
                        )}
                      </div>
                      <p className="font-medium text-sm mb-1 line-clamp-1">
                        {notification.title}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                        {notification.content}
                      </p>
                      <span className="text-xs text-muted-foreground">
                        {formatTime(notification.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
