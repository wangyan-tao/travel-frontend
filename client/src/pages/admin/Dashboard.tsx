import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, FileText, TrendingUp, AlertCircle, Loader2, Filter, RotateCcw, ArrowRight, Package } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { statisticsApi, type FullStatistics, type StatisticsFilter } from '@/lib/statisticsApi';
import { MOCK_STATISTICS } from '@/lib/mockStatistics';
import { toast } from 'sonner';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState<FullStatistics | null>(null);
  
  // 筛选条件
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [userType, setUserType] = useState<'ALL' | 'STUDENT' | 'GRADUATE'>('ALL');

  // 加载统计数据
  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      setLoading(true);
      const filter: StatisticsFilter = {
        startDate: startDate ? format(startDate, 'yyyy-MM-dd') : undefined,
        endDate: endDate ? format(endDate, 'yyyy-MM-dd') : undefined,
        userType: userType,
      };
      const data = await statisticsApi.getFullStatistics(filter);
      setStatistics(data);
    } catch (error: any) {
      console.log('统计服务不可用', error);
      // 如果后端服务不可用，使用模拟数据降级
      setStatistics(MOCK_STATISTICS);
      toast.warning('连接统计服务失败，已切换至模拟数据');
    } finally {
      setLoading(false);
    }
  };

  // 应用筛选
  const handleApplyFilter = () => {
    loadStatistics();
  };

  // 重置筛选
  const handleResetFilter = () => {
    setStartDate(undefined);
    setEndDate(undefined);
    setUserType('ALL');
    setTimeout(() => loadStatistics(), 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">加载统计数据中...</p>
        </div>
      </div>
    );
  }

  if (!statistics) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-destructive" />
          <p className="text-muted-foreground mb-4">加载统计数据失败</p>
          <Button onClick={loadStatistics}>重试</Button>
        </div>
      </div>
    );
  }

  // 优化后的配色方案
  const COLORS = {
    primary: '#3b82f6',    // 蓝色
    success: '#10b981',    // 绿色
    warning: '#f59e0b',    // 橙色
    danger: '#ef4444',     // 红色
    purple: '#8b5cf6',     // 紫色
    teal: '#14b8a6',       // 青色
    pink: '#ec4899',       // 粉色
    indigo: '#6366f1',     // 靛蓝
  };

  const stats = [
    { 
      label: '总用户数', 
      value: statistics.overview.totalUsers.toLocaleString(), 
      icon: Users, 
      gradient: 'from-blue-500 to-blue-600',
      link: '/admin/users'
    },
    { 
      label: '贷款申请', 
      value: statistics.overview.totalApplications.toLocaleString(), 
      icon: FileText, 
      gradient: 'from-green-500 to-green-600',
      link: '/admin/applications'
    },
    { 
      label: '待审批', 
      value: statistics.overview.pendingApplications.toLocaleString(), 
      icon: AlertCircle, 
      gradient: 'from-orange-500 to-orange-600',
      link: '/admin/applications?status=pending'
    },
    { 
      label: '总贷款金额', 
      value: `¥${statistics.overview.totalLoanAmount.toLocaleString()}`, 
      icon: TrendingUp, 
      gradient: 'from-purple-500 to-purple-600',
      link: '/admin/loans'
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container mx-auto px-4 py-8">
        {/* 快速导航 - 放在最顶部 */}
        <Card className="p-6 mb-8 shadow-lg border-2">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <div className="h-1 w-8 bg-gradient-to-r from-primary to-primary/60 rounded-full" />
            快速导航
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="h-auto p-6 flex items-start gap-4 hover:bg-primary/5 hover:border-primary/50 transition-all group"
              onClick={() => setLocation('/admin/users')}
            >
              <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="text-left flex-1">
                <div className="font-semibold text-base mb-1">用户管理</div>
                <div className="text-sm text-muted-foreground">查看和管理用户信息</div>
              </div>
            </Button>
            <Button
              variant="outline"
              className="h-auto p-6 flex items-start gap-4 hover:bg-primary/5 hover:border-primary/50 transition-all group"
              onClick={() => setLocation('/admin/applications')}
            >
              <div className="h-12 w-12 rounded-lg bg-green-500/10 flex items-center justify-center group-hover:bg-green-500/20 transition-colors">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
              <div className="text-left flex-1">
                <div className="font-semibold text-base mb-1">申请管理</div>
                <div className="text-sm text-muted-foreground">审批和管理贷款申请</div>
              </div>
            </Button>
            <Button
              variant="outline"
              className="h-auto p-6 flex items-start gap-4 hover:bg-primary/5 hover:border-primary/50 transition-all group"
              onClick={() => setLocation('/admin/loan-products')}
            >
              <div className="h-12 w-12 rounded-lg bg-purple-500/10 flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">
                <Package className="h-6 w-6 text-purple-600" />
              </div>
              <div className="text-left flex-1">
                <div className="font-semibold text-base mb-1">产品管理</div>
                <div className="text-sm text-muted-foreground">上架、修改和下架贷款产品</div>
              </div>
            </Button>
            <Button
              variant="outline"
              className="h-auto p-6 flex items-start gap-4 hover:bg-primary/5 hover:border-primary/50 transition-all group"
              onClick={() => setLocation('/admin/certificates')}
            >
              <div className="h-12 w-12 rounded-lg bg-orange-500/10 flex items-center justify-center group-hover:bg-orange-500/20 transition-colors">
                <FileText className="h-6 w-6 text-orange-600" />
              </div>
              <div className="text-left flex-1">
                <div className="font-semibold text-base mb-1">审批管理</div>
                <div className="text-sm text-muted-foreground">审批用户上传的工作证明和学业荣誉</div>
              </div>
            </Button>
          </div>
        </Card>

        {/* 页面标题 */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">数据分析</h1>
          <p className="text-muted-foreground">实时监控平台运营数据</p>
        </div>

        {/* 筛选器 */}
        <Card className="p-6 mb-6 shadow-lg">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 mb-2">
              <Filter className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">数据筛选</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* 开始日期 */}
              <div className="space-y-2">
                <label className="text-sm font-medium">开始日期</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      {startDate ? format(startDate, 'PPP', { locale: zhCN }) : '选择日期'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      locale={zhCN}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* 结束日期 */}
              <div className="space-y-2">
                <label className="text-sm font-medium">结束日期</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      {endDate ? format(endDate, 'PPP', { locale: zhCN }) : '选择日期'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      locale={zhCN}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* 用户类型 */}
              <div className="space-y-2">
                <label className="text-sm font-medium">用户类型</label>
                <Select value={userType} onValueChange={(value: any) => setUserType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">全部</SelectItem>
                    <SelectItem value="STUDENT">在校学生</SelectItem>
                    <SelectItem value="GRADUATE">毕业生</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 操作按钮 */}
              <div className="space-y-2">
                <label className="text-sm font-medium invisible">操作</label>
                <div className="flex gap-2">
                  <Button onClick={handleApplyFilter} className="flex-1">
                    应用筛选
                  </Button>
                  <Button onClick={handleResetFilter} variant="outline" size="icon">
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* 汇总数据卡片 - 可点击跳转 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card 
              key={index} 
              className="relative overflow-hidden cursor-pointer group hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              onClick={() => setLocation(stat.link)}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-10 group-hover:opacity-20 transition-opacity`} />
              <div className="relative p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
                <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                <p className="text-3xl font-bold">{stat.value}</p>
              </div>
            </Card>
          ))}
        </div>

        {/* 图表区域 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* 用户增长趋势 */}
          <Card className="p-6 shadow-lg">
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <div className="h-1 w-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full" />
              用户增长趋势
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={statistics.userGrowth}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0}/>
                  </linearGradient>
                </defs>
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
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="users" 
                  stroke={COLORS.primary}
                  strokeWidth={3}
                  dot={{ fill: COLORS.primary, r: 4 }}
                  activeDot={{ r: 6 }}
                  fill="url(#colorUsers)"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* 贷款申请状态分布 */}
          <Card className="p-6 shadow-lg">
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <div className="h-1 w-8 bg-gradient-to-r from-green-500 to-green-600 rounded-full" />
              贷款申请状态分布
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statistics.loanStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statistics.loanStatus.map((entry: any, index: number) => {
                    const colors = [COLORS.warning, COLORS.success, COLORS.danger, COLORS.primary, COLORS.purple];
                    return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                  })}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </Card>

          {/* 贷款产品分布 */}
          <Card className="p-6 shadow-lg">
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <div className="h-1 w-8 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full" />
              贷款产品分布
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={statistics.loanProducts.map(item => ({ productName: item.product, count: item.count }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="productName" 
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
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                />
                <Bar 
                  dataKey="count" 
                  fill={COLORS.purple}
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* 还款情况统计 */}
          <Card className="p-6 shadow-lg">
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <div className="h-1 w-8 bg-gradient-to-r from-teal-500 to-teal-600 rounded-full" />
              还款情况统计
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={statistics.repaymentStatus}>
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
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                />
                <Legend />
                <Bar 
                  dataKey="onTime" 
                  name="按时还款" 
                  stackId="a" 
                  fill={COLORS.success}
                  radius={[8, 8, 0, 0]}
                />
                <Bar 
                  dataKey="late" 
                  name="逾期还款" 
                  stackId="a" 
                  fill={COLORS.danger}
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>
      </div>
    </div>
  );
}
