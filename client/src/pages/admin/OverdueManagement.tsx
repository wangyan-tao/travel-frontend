import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Search, Loader2, Bell, AlertTriangle, TrendingUp, Users, Send, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { overdueApi, type OverdueUser, type OverdueStatistics } from '@/lib/overdueApi';

const COLORS = {
  low: '#10b981',      // 绿色 - 低风险
  medium: '#f59e0b',   // 橙色 - 中风险
  high: '#ef4444',     // 红色 - 高风险
  critical: '#dc2626', // 深红 - 严重风险
  danger: '#ef4444',   // 红色
  warning: '#f59e0b',  // 橙色
};

const RISK_LEVEL_COLORS: Record<string, string> = {
  '低风险': COLORS.low,
  '中风险': COLORS.medium,
  '高风险': COLORS.high,
  '严重风险': COLORS.critical,
};

export default function OverdueManagement() {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<OverdueUser[]>([]);
  const [statistics, setStatistics] = useState<OverdueStatistics | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [riskLevelFilter, setRiskLevelFilter] = useState('ALL');
  const [notificationDialogOpen, setNotificationDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<OverdueUser | null>(null);
  const [notificationTitle, setNotificationTitle] = useState('');
  const [notificationContent, setNotificationContent] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    loadData();
  }, [riskLevelFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [usersData, statsData] = await Promise.all([
        overdueApi.getOverdueUsers(searchTerm || undefined, riskLevelFilter !== 'ALL' ? riskLevelFilter : undefined),
        overdueApi.getStatistics(),
      ]);
      setUsers(usersData);
      setStatistics(statsData);
    } catch (error: any) {
      console.error('加载数据失败:', error);
      toast.error(error.message || '加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    loadData();
  };

  const handleSendNotification = (user: OverdueUser) => {
    setSelectedUser(user);
    setNotificationTitle(`逾期提醒 - ${user.username}`);
    setNotificationContent(`尊敬的${user.username}，您的贷款账户存在逾期情况，请及时处理。逾期金额：¥${user.overdueAmount.toLocaleString()}，逾期天数：${user.overdueDays}天。`);
    setNotificationDialogOpen(true);
  };

  const handleConfirmSend = async () => {
    if (!selectedUser || !notificationTitle.trim() || !notificationContent.trim()) {
      toast.error('请填写完整的通知信息');
      return;
    }

    try {
      setSending(true);
      await overdueApi.sendNotification(selectedUser.userId, {
        title: notificationTitle,
        content: notificationContent,
        type: 'OVERDUE',
      });
      toast.success('通知发送成功');
      setNotificationDialogOpen(false);
      setSelectedUser(null);
      setNotificationTitle('');
      setNotificationContent('');
    } catch (error: any) {
      console.error('发送通知失败:', error);
      toast.error(error.message || '发送通知失败');
    } finally {
      setSending(false);
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

  if (loading && !statistics) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">加载数据中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container mx-auto px-4 py-8">
        {/* 页面标题 */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">逾期管理</h1>
          <p className="text-muted-foreground">贷后风险用户管理与数据分析</p>
        </div>

        {/* 统计卡片 */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">风险用户总数</p>
                  <p className="text-3xl font-bold">{statistics.totalRiskUsers}</p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-red-500/10 flex items-center justify-center">
                  <Users className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">总逾期金额</p>
                  <p className="text-3xl font-bold text-red-600">¥{statistics.totalOverdueAmount.toLocaleString()}</p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-orange-500/10 flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">平均逾期天数</p>
                  <p className="text-3xl font-bold">{statistics.averageOverdueDays}</p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">高风险用户</p>
                  <p className="text-3xl font-bold text-red-600">{statistics.highRiskUsers}</p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-red-500/10 flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* 数据分析图表 */}
        {statistics && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* 风险等级分布 */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                <div className="h-1 w-8 bg-gradient-to-r from-red-500 to-red-600 rounded-full" />
                风险等级分布
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statistics.riskLevelDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statistics.riskLevelDistribution.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={RISK_LEVEL_COLORS[entry.name] || COLORS.medium} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </Card>

            {/* 逾期趋势 */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                <div className="h-1 w-8 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full" />
                逾期趋势分析
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={statistics.overdueTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="month"
                    stroke="#6b7280"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis
                    stroke="#6b7280"
                    style={{ fontSize: '12px' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="overdueCount"
                    name="逾期用户数"
                    stroke={COLORS.danger}
                    strokeWidth={3}
                    dot={{ fill: COLORS.danger, r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="overdueAmount"
                    name="逾期金额(万元)"
                    stroke={COLORS.warning}
                    strokeWidth={3}
                    dot={{ fill: COLORS.warning, r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>

            {/* 风险等级逾期金额对比 */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                <div className="h-1 w-8 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full" />
                各风险等级逾期金额对比
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={statistics.riskLevelDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="name"
                    stroke="#6b7280"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis
                    stroke="#6b7280"
                    style={{ fontSize: '12px' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    }}
                  />
                  <Bar
                    dataKey="amount"
                    name="逾期金额(万元)"
                    fill={COLORS.danger}
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            {/* 逾期天数分布 */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                <div className="h-1 w-8 bg-gradient-to-r from-teal-500 to-teal-600 rounded-full" />
                逾期天数分布
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={statistics.overdueDaysDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="range"
                    stroke="#6b7280"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis
                    stroke="#6b7280"
                    style={{ fontSize: '12px' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    }}
                  />
                  <Bar
                    dataKey="count"
                    name="用户数"
                    fill={COLORS.warning}
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>
        )}

        {/* 搜索和筛选 */}
        <Card className="p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="搜索用户名、手机号..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={riskLevelFilter} onValueChange={setRiskLevelFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="风险等级" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">全部风险等级</SelectItem>
                <SelectItem value="低风险">低风险</SelectItem>
                <SelectItem value="中风险">中风险</SelectItem>
                <SelectItem value="高风险">高风险</SelectItem>
                <SelectItem value="严重风险">严重风险</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleSearch}>
              <Search className="h-4 w-4 mr-2" />
              搜索
            </Button>
          </div>
        </Card>

        {/* 用户列表 */}
        <Card className="p-6">
          <div className="mb-4">
            <h2 className="text-xl font-semibold">贷后风险用户明细</h2>
            <p className="text-sm text-muted-foreground mt-1">共 {users.length} 条记录</p>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>用户ID</TableHead>
                  <TableHead>用户名</TableHead>
                  <TableHead>手机号</TableHead>
                  <TableHead>风险等级</TableHead>
                  <TableHead>逾期金额</TableHead>
                  <TableHead>逾期天数</TableHead>
                  <TableHead>贷款产品</TableHead>
                  <TableHead>最后还款日</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      暂无数据
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.userId}>
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
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSendNotification(user)}
                          className="gap-2"
                        >
                          <Bell className="h-4 w-4" />
                          发送通知
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Card>

        {/* 发送通知对话框 */}
        <Dialog open={notificationDialogOpen} onOpenChange={setNotificationDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>发送通知消息</DialogTitle>
              <DialogDescription>
                向用户 {selectedUser?.username} ({selectedUser?.phone}) 发送通知消息
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">通知标题</Label>
                <Input
                  id="title"
                  value={notificationTitle}
                  onChange={(e) => setNotificationTitle(e.target.value)}
                  placeholder="请输入通知标题"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">通知内容</Label>
                <Textarea
                  id="content"
                  value={notificationContent}
                  onChange={(e) => setNotificationContent(e.target.value)}
                  placeholder="请输入通知内容"
                  rows={6}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setNotificationDialogOpen(false);
                  setSelectedUser(null);
                  setNotificationTitle('');
                  setNotificationContent('');
                }}
              >
                取消
              </Button>
              <Button onClick={handleConfirmSend} disabled={sending}>
                {sending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    发送中...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    发送通知
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

