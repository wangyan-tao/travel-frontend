import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Eye, Users } from 'lucide-react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { overdueApi, type OverdueUser, type RepaymentTimelineEvent } from '@/lib/overdueApi';
import UserRepaymentTimeline from './UserRepaymentTimeline';
import { toast } from 'sonner';

interface OverdueUserListDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function OverdueUserListDialog({ open, onOpenChange }: OverdueUserListDialogProps) {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<OverdueUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<OverdueUser | null>(null);
  const [timelineEvents, setTimelineEvents] = useState<RepaymentTimelineEvent[]>([]);
  const [loadingTimeline, setLoadingTimeline] = useState(false);
  const [activeTab, setActiveTab] = useState('list');

  useEffect(() => {
    if (open) {
      loadUsers();
    }
  }, [open]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const usersData = await overdueApi.getOverdueUsers();
      setUsers(usersData);
    } catch (error: any) {
      console.error('加载用户列表失败:', error);
      toast.error(error.message || '加载用户列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleViewTimeline = async (user: OverdueUser) => {
    setSelectedUser(user);
    setActiveTab('timeline');
    try {
      setLoadingTimeline(true);
      const events = await overdueApi.getUserRepaymentTimeline(user.userId);
      setTimelineEvents(events);
    } catch (error: any) {
      console.error('加载时间线失败:', error);
      toast.error(error.message || '加载时间线失败');
    } finally {
      setLoadingTimeline(false);
    }
  };

  const getRiskLevelBadge = (level: string) => {
    const colorMap: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      '低风险': 'default',
      '中风险': 'secondary',
      '高风险': 'destructive',
      '严重风险': 'destructive',
    };
    return (
      <Badge variant={colorMap[level] || 'outline'} className="font-semibold">
        {level}
      </Badge>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] w-full max-h-[95vh] h-[95vh] flex flex-col p-6">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Users className="h-6 w-6" />
            逾期用户列表
          </DialogTitle>
          <DialogDescription className="text-base">
            共 {users.length} 位风险用户，点击"查看流程"可查看用户的完整还款流程
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <TabsList className="mb-4">
            <TabsTrigger value="list" className="px-4 py-2">用户列表</TabsTrigger>
            {selectedUser && (
              <TabsTrigger value="timeline" className="px-4 py-2">
                还款流程 - {selectedUser.username}
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="list" className="flex-1 min-h-0 mt-0 overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-12 h-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="overflow-auto h-full border rounded-md">
                <Table>
                  <TableHeader className="sticky top-0 bg-background z-10">
                    <TableRow>
                      <TableHead className="min-w-[100px]">用户ID</TableHead>
                      <TableHead className="min-w-[120px]">用户名</TableHead>
                      <TableHead className="min-w-[130px]">手机号</TableHead>
                      <TableHead className="min-w-[100px]">风险等级</TableHead>
                      <TableHead className="min-w-[120px]">逾期金额</TableHead>
                      <TableHead className="min-w-[100px]">逾期天数</TableHead>
                      <TableHead className="min-w-[150px]">贷款产品</TableHead>
                      <TableHead className="min-w-[130px]">最后还款日</TableHead>
                      <TableHead className="sticky right-0 bg-background min-w-[120px]">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-12 text-muted-foreground">
                          暂无数据
                        </TableCell>
                      </TableRow>
                    ) : (
                      users.map((user) => (
                        <TableRow key={user.userId} className="hover:bg-muted/50">
                          <TableCell className="font-medium">{user.userId}</TableCell>
                          <TableCell>{user.username}</TableCell>
                          <TableCell>{user.phone}</TableCell>
                          <TableCell>{getRiskLevelBadge(user.riskLevel)}</TableCell>
                          <TableCell className="font-semibold text-red-600">
                            ¥{user.overdueAmount.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Badge variant={user.overdueDays > 90 ? 'destructive' : user.overdueDays > 30 ? 'secondary' : 'outline'}>
                              {user.overdueDays}天
                            </Badge>
                          </TableCell>
                          <TableCell>{user.productName}</TableCell>
                          <TableCell>
                            {user.lastRepaymentDate ? format(new Date(user.lastRepaymentDate), 'yyyy-MM-dd', { locale: zhCN }) : '-'}
                          </TableCell>
                          <TableCell className="sticky right-0 bg-background">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewTimeline(user)}
                              className="gap-2 whitespace-nowrap"
                            >
                              <Eye className="h-4 w-4" />
                              查看流程
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          {selectedUser && (
            <TabsContent value="timeline" className="flex-1 min-h-0 mt-0 overflow-hidden">
              <div className="overflow-auto h-full border rounded-md p-4">
                {loadingTimeline ? (
                  <div className="flex items-center justify-center py-12 h-full">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <UserRepaymentTimeline events={timelineEvents} username={selectedUser.username} />
                )}
              </div>
            </TabsContent>
          )}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

