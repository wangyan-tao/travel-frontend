import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Loader2, FileText, User, DollarSign, Calendar } from 'lucide-react';

interface ApplicationData {
  id: number;
  applicationNo: string;
  username: string;
  productName: string;
  amount: number;
  term: number;
  status: string;
  applyTime: string;
}

export default function ApplicationList() {
  const [location] = useLocation();
  const [loading, setLoading] = useState(false);
  const [applications, setApplications] = useState<ApplicationData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // 从URL参数获取初始状态筛选
  useEffect(() => {
    const params = new URLSearchParams(location.split('?')[1]);
    const status = params.get('status');
    if (status) {
      setStatusFilter(status.toUpperCase());
    }
    loadApplications();
  }, []);

  const loadApplications = async () => {
    setLoading(true);
    // 模拟API调用
    setTimeout(() => {
      const mockApplications: ApplicationData[] = [
        {
          id: 1,
          applicationNo: 'APP20240115001',
          username: 'student001',
          productName: '青春旅行贷',
          amount: 5000,
          term: 12,
          status: 'PENDING',
          applyTime: '2024-01-15 10:30:00'
        },
        {
          id: 2,
          applicationNo: 'APP20240115002',
          username: 'student002',
          productName: '毕业旅行贷',
          amount: 8000,
          term: 18,
          status: 'APPROVED',
          applyTime: '2024-01-15 14:20:00'
        },
        {
          id: 3,
          applicationNo: 'APP20240116001',
          username: 'student003',
          productName: '短期旅游贷',
          amount: 3000,
          term: 6,
          status: 'REJECTED',
          applyTime: '2024-01-16 09:15:00'
        },
      ];
      setApplications(mockApplications);
      setLoading(false);
    }, 500);
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      PENDING: { label: '待审批', variant: 'secondary' },
      APPROVED: { label: '已批准', variant: 'default' },
      REJECTED: { label: '已拒绝', variant: 'destructive' },
      DISBURSED: { label: '已发放', variant: 'default' },
      COMPLETED: { label: '已完成', variant: 'outline' },
    };
    const config = statusMap[status] || { label: status, variant: 'outline' };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch = 
      app.applicationNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.productName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'ALL' || app.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container mx-auto px-4 py-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">贷款申请列表</h1>
          <p className="text-muted-foreground">查看和管理所有贷款申请</p>
        </div>

        {/* 搜索和筛选栏 */}
        <Card className="p-4 mb-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索申请编号、用户名或产品名..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">全部状态</SelectItem>
                <SelectItem value="PENDING">待审批</SelectItem>
                <SelectItem value="APPROVED">已批准</SelectItem>
                <SelectItem value="REJECTED">已拒绝</SelectItem>
                <SelectItem value="DISBURSED">已发放</SelectItem>
                <SelectItem value="COMPLETED">已完成</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={loadApplications}>
              刷新
            </Button>
          </div>
        </Card>

        {/* 申请列表 */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredApplications.map((app) => (
              <Card key={app.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{app.applicationNo}</h3>
                      <p className="text-sm text-muted-foreground">{app.productName}</p>
                    </div>
                  </div>
                  {getStatusBadge(app.status)}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{app.username}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span>¥{app.amount.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{app.term}个月</span>
                  </div>
                  <div className="text-muted-foreground">
                    {app.applyTime}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {!loading && filteredApplications.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            没有找到匹配的申请记录
          </div>
        )}
      </div>
    </div>
  );
}
