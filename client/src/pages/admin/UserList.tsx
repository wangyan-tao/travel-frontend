import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Search, Loader2, User, Mail, Phone, Calendar, MoreVertical, CheckCircle, XCircle, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { adminApi, type User as UserType, type PageResult } from '@/lib/adminApi';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from '@/components/ui/pagination';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function UserList() {
  const [loading, setLoading] = useState(false);
  const [pageResult, setPageResult] = useState<PageResult<UserType> | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [actionType, setActionType] = useState<'enable' | 'disable' | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [viewingUser, setViewingUser] = useState<UserType | null>(null);
  const [userIds, setUserIds] = useState<number[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);

  useEffect(() => {
    loadUsers();
    loadUserIds();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleFilter, currentPage]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await adminApi.users.getUsers(
        searchTerm || undefined,
        roleFilter !== 'ALL' ? roleFilter : undefined,
        currentPage,
        pageSize
      );
      setPageResult(data);
    } catch (error: any) {
      console.error('加载用户列表失败:', error);
      toast.error(error.message || '加载用户列表失败');
    } finally {
      setLoading(false);
    }
  };

  const loadUserIds = async () => {
    try {
      const ids = await adminApi.users.getUserIds(roleFilter !== 'ALL' ? roleFilter : undefined);
      setUserIds(ids);
    } catch (error: any) {
      console.error('加载用户ID列表失败:', error);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    loadUsers();
    loadUserIds();
  };

  const handleViewDetail = async (user: UserType) => {
    setViewingUser(user);
    const index = userIds.indexOf(user.id);
    setCurrentIndex(index);
    setDetailDialogOpen(true);
  };

  const handlePrevious = async () => {
    if (currentIndex > 0) {
      const prevId = userIds[currentIndex - 1];
      try {
        const user = await adminApi.users.getUserById(prevId);
        setViewingUser(user);
        setCurrentIndex(currentIndex - 1);
      } catch (error: any) {
        toast.error(error.message || '加载用户失败');
      }
    }
  };

  const handleNext = async () => {
    if (currentIndex < userIds.length - 1) {
      const nextId = userIds[currentIndex + 1];
      try {
        const user = await adminApi.users.getUserById(nextId);
        setViewingUser(user);
        setCurrentIndex(currentIndex + 1);
      } catch (error: any) {
        toast.error(error.message || '加载用户失败');
      }
    }
  };

  const handleAction = (user: UserType, type: 'enable' | 'disable') => {
    setSelectedUser(user);
    setActionType(type);
    setActionDialogOpen(true);
  };

  const confirmAction = async () => {
    if (!selectedUser || !actionType) return;

    try {
      if (actionType === 'enable') {
        await adminApi.users.enableUser(selectedUser.id);
        toast.success('用户已启用');
      } else {
        await adminApi.users.disableUser(selectedUser.id);
        toast.success('用户已禁用');
      }
      setActionDialogOpen(false);
      setSelectedUser(null);
      setActionType(null);
      await loadUsers();
      await loadUserIds();
    } catch (error: any) {
      toast.error(error.message || '操作失败');
    }
  };

  const renderPagination = () => {
    if (!pageResult || pageResult.pages <= 1) return null;

    const pages = [];
    const totalPages = pageResult.pages;
    const current = pageResult.current;

    // 显示页码逻辑
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (current <= 3) {
        for (let i = 1; i <= 5; i++) pages.push(i);
        pages.push('ellipsis');
        pages.push(totalPages);
      } else if (current >= totalPages - 2) {
        pages.push(1);
        pages.push('ellipsis');
        for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('ellipsis');
        for (let i = current - 1; i <= current + 1; i++) pages.push(i);
        pages.push('ellipsis');
        pages.push(totalPages);
      }
    }

    return (
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={(e) => {
                e.preventDefault();
                if (current > 1) setCurrentPage(current - 1);
              }}
              className={current === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              href="#"
            />
          </PaginationItem>
          {pages.map((page, index) => (
            <PaginationItem key={index}>
              {page === 'ellipsis' ? (
                <PaginationEllipsis />
              ) : (
                <PaginationLink
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentPage(page as number);
                  }}
                  isActive={current === page}
                  className="cursor-pointer"
                  href="#"
                >
                  {page}
                </PaginationLink>
              )}
            </PaginationItem>
          ))}
          <PaginationItem>
            <PaginationNext
              onClick={(e) => {
                e.preventDefault();
                if (current < totalPages) setCurrentPage(current + 1);
              }}
              className={current === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              href="#"
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container mx-auto px-4 py-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">用户列表</h1>
          <p className="text-muted-foreground">查看和管理所有注册用户</p>
        </div>

        {/* 搜索栏 */}
        <Card className="p-4 mb-6 shadow-lg">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索用户名、邮箱或手机号..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">全部角色</SelectItem>
                <SelectItem value="USER">普通用户</SelectItem>
                <SelectItem value="ADMIN">管理员</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleSearch}>
              搜索
            </Button>
            <Button variant="outline" onClick={loadUsers}>
              刷新
            </Button>
          </div>
        </Card>

        {/* 用户列表 */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <div className="grid gap-4">
              {pageResult?.records.map((user) => (
              <Card key={user.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{user.username}</h3>
                      <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground flex-wrap">
                        {user.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {user.email}
                          </span>
                        )}
                        {user.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {user.phone}
                          </span>
                        )}
                        {user.createdAt && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(user.createdAt), 'yyyy-MM-dd', { locale: zhCN })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={user.status === 'ACTIVE' ? 'default' : 'secondary'}>
                      {user.status === 'ACTIVE' ? '活跃' : '已禁用'}
                    </Badge>
                    <Badge variant="outline">
                      {user.role === 'ADMIN' ? '管理员' : '用户'}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewDetail(user)}>
                          <Eye className="h-4 w-4 mr-2" />
                          查看详情
                        </DropdownMenuItem>
                        {user.status === 'ACTIVE' ? (
                          <DropdownMenuItem
                            onClick={() => handleAction(user, 'disable')}
                            className="text-red-600"
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            禁用用户
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            onClick={() => handleAction(user, 'enable')}
                            className="text-green-600"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            启用用户
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </Card>
              ))}
            </div>
            {renderPagination()}
          </>
        )}

        {!loading && (!pageResult || pageResult.records.length === 0) && (
          <div className="text-center py-12 text-muted-foreground">
            没有找到匹配的用户
          </div>
        )}

        {/* 操作确认对话框 */}
        <AlertDialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {actionType === 'enable' ? '启用用户' : '禁用用户'}
              </AlertDialogTitle>
              <AlertDialogDescription>
                您确定要{actionType === 'enable' ? '启用' : '禁用'}用户 "{selectedUser?.username}" 吗？
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>取消</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmAction}
                className={actionType === 'enable' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
              >
                确认
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* 用户详情对话框 */}
        <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>用户详情</DialogTitle>
              <DialogDescription>查看用户详细信息</DialogDescription>
            </DialogHeader>
            {viewingUser && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">用户名</label>
                    <p className="text-base">{viewingUser.username}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">角色</label>
                    <p className="text-base">
                      <Badge variant="outline">
                        {viewingUser.role === 'ADMIN' ? '管理员' : '用户'}
                      </Badge>
                    </p>
                  </div>
                  {viewingUser.email && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">邮箱</label>
                      <p className="text-base">{viewingUser.email}</p>
                    </div>
                  )}
                  {viewingUser.phone && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">手机号</label>
                      <p className="text-base">{viewingUser.phone}</p>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">状态</label>
                    <p className="text-base">
                      <Badge variant={viewingUser.status === 'ACTIVE' ? 'default' : 'secondary'}>
                        {viewingUser.status === 'ACTIVE' ? '活跃' : '已禁用'}
                      </Badge>
                    </p>
                  </div>
                  {viewingUser.createdAt && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">注册时间</label>
                      <p className="text-base">
                        {format(new Date(viewingUser.createdAt), 'yyyy-MM-dd HH:mm:ss', { locale: zhCN })}
                      </p>
                    </div>
                  )}
                </div>
                <div className="flex justify-between items-center pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentIndex <= 0}
                  >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    上一个
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    {currentIndex + 1} / {userIds.length}
                  </span>
                  <Button
                    variant="outline"
                    onClick={handleNext}
                    disabled={currentIndex >= userIds.length - 1}
                  >
                    下一个
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
