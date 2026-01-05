import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Clock, CheckCircle, XCircle, DollarSign } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

interface LoanApplication {
  id: number;
  productName: string;
  applyAmount: number;
  applyTerm: number;
  purpose: string;
  status: string;
  applyTime: string;
  approveTime?: string;
  rejectReason?: string;
}

export default function MyApplications() {
  const [, setLocation] = useLocation();
  const [applications, setApplications] = useState<LoanApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('请先登录');
        setLocation('/login');
        return;
      }

      const response = await axios.get('http://localhost:8080/api/loan/my-applications', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.code === 200) {
        setApplications(response.data.data || []);
      }
    } catch (error: any) {
      console.error('获取申请列表失败:', error);
      if (error.response?.status === 401) {
        toast.error('登录已过期，请重新登录');
        setLocation('/login');
      } else {
        toast.error('获取申请列表失败');
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      PENDING: { label: '待审核', variant: 'secondary' },
      APPROVED: { label: '已批准', variant: 'default' },
      REJECTED: { label: '已拒绝', variant: 'destructive' },
      DISBURSED: { label: '已发放', variant: 'default' },
      COMPLETED: { label: '已完成', variant: 'outline' },
    };
    const config = statusMap[status] || { label: status, variant: 'outline' };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'APPROVED':
      case 'DISBURSED':
      case 'COMPLETED':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'REJECTED':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  const filteredApplications = applications.filter((app) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'pending') return app.status === 'PENDING';
    if (activeTab === 'approved') return ['APPROVED', 'DISBURSED', 'COMPLETED'].includes(app.status);
    if (activeTab === 'rejected') return app.status === 'REJECTED';
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container py-12">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">加载中...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">我的申请</h1>
          <p className="text-muted-foreground">查看您的贷款申请记录和审批进度</p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full max-w-md grid-cols-4">
            <TabsTrigger value="all">全部</TabsTrigger>
            <TabsTrigger value="pending">待审核</TabsTrigger>
            <TabsTrigger value="approved">已批准</TabsTrigger>
            <TabsTrigger value="rejected">已拒绝</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Applications List */}
        {filteredApplications.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium mb-2">暂无申请记录</p>
                <p className="text-muted-foreground mb-6">您还没有提交过贷款申请</p>
                <Button onClick={() => setLocation('/loan-products')}>
                  浏览贷款产品
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {filteredApplications.map((app) => (
              <Card key={app.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(app.status)}
                      <div>
                        <CardTitle className="text-xl">{app.productName}</CardTitle>
                        <CardDescription>
                          申请时间：{new Date(app.applyTime).toLocaleString('zh-CN')}
                        </CardDescription>
                      </div>
                    </div>
                    {getStatusBadge(app.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">申请金额</p>
                        <p className="font-semibold">¥{app.applyAmount.toLocaleString()}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">申请期限</p>
                      <p className="font-semibold">{app.applyTerm}个月</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">贷款用途</p>
                      <p className="font-semibold truncate">{app.purpose}</p>
                    </div>
                  </div>

                  {app.status === 'APPROVED' && app.approveTime && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                      <p className="text-sm text-green-800">
                        ✓ 您的申请已通过审批，批准时间：{new Date(app.approveTime).toLocaleString('zh-CN')}
                      </p>
                    </div>
                  )}

                  {app.status === 'REJECTED' && app.rejectReason && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                      <p className="text-sm text-red-800 font-medium mb-1">拒绝原因：</p>
                      <p className="text-sm text-red-700">{app.rejectReason}</p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      查看详情
                    </Button>
                    {app.status === 'PENDING' && (
                      <Button variant="ghost" size="sm" className="text-red-600">
                        取消申请
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
