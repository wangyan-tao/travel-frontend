import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { FileText, Clock, CheckCircle, XCircle, DollarSign, Loader2, Calendar, Building2, X } from 'lucide-react';
import { applicationApi, type LoanApplicationDTO } from '@/lib/applicationApi';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

export default function MyApplications() {
  const [, setLocation] = useLocation();
  const [applications, setApplications] = useState<LoanApplicationDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedApplication, setSelectedApplication] = useState<LoanApplicationDTO | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const data = await applicationApi.getMyApplications();
      setApplications(data);
    } catch (error: any) {
      console.error('获取申请列表失败:', error);
      toast.error(error.message || '获取申请列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = async (id: number) => {
    try {
      const detail = await applicationApi.getApplicationById(id);
      setSelectedApplication(detail);
      setDetailDialogOpen(true);
    } catch (error: any) {
      toast.error(error.message || '获取申请详情失败');
    }
  };

  const handleCancelApplication = async (id: number) => {
    try {
      setCancellingId(id);
      await applicationApi.cancelApplication(id);
      toast.success('申请已取消');
      setCancelDialogOpen(false);
      setCancellingId(null);
      // 重新加载列表
      await fetchApplications();
    } catch (error: any) {
      toast.error(error.message || '取消申请失败');
      setCancellingId(null);
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

  const filteredApplications = applications.filter((dto) => {
    const app = dto.application;
    if (activeTab === 'all') return true;
    if (activeTab === 'pending') return app.status === 'PENDING';
    if (activeTab === 'approved') return ['APPROVED', 'DISBURSED', 'COMPLETED'].includes(app.status);
    if (activeTab === 'rejected') return app.status === 'REJECTED';
    if (activeTab === 'cancelled') return app.status === 'CANCELLED';
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container py-12">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
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
            {filteredApplications.map((dto) => {
              const app = dto.application;
              return (
                <Card key={app.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(app.status)}
                        <div>
                          <CardTitle className="text-xl">{dto.productName}</CardTitle>
                          <CardDescription>
                            申请时间：{app.applyTime ? format(new Date(app.applyTime), 'yyyy-MM-dd HH:mm:ss', { locale: zhCN }) : '-'}
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
                          <p className="font-semibold">¥{Number(app.applyAmount).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">申请期限</p>
                        <p className="font-semibold">{app.applyTerm}个月</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">贷款用途</p>
                        <p className="font-semibold truncate">{app.purpose || '未填写'}</p>
                      </div>
                    </div>

                    {app.status === 'APPROVED' && app.approveTime && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                        <p className="text-sm text-green-800">
                          ✓ 您的申请已通过审批，批准时间：{format(new Date(app.approveTime), 'yyyy-MM-dd HH:mm:ss', { locale: zhCN })}
                        </p>
                        {app.loanAmount && (
                          <p className="text-sm text-green-800 mt-1">
                            批准金额：¥{Number(app.loanAmount).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </p>
                        )}
                      </div>
                    )}

                    {app.status === 'REJECTED' && app.rejectReason && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                        <p className="text-sm text-red-800 font-medium mb-1">拒绝原因：</p>
                        <p className="text-sm text-red-700">{app.rejectReason}</p>
                      </div>
                    )}

                    {app.status === 'CANCELLED' && (
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                        <p className="text-sm text-gray-800">申请已取消</p>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewDetail(app.id)}
                      >
                        查看详情
                      </Button>
                      {app.status === 'PENDING' && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-red-600 hover:text-red-700"
                          onClick={() => {
                            setSelectedApplication(dto);
                            setCancelDialogOpen(true);
                          }}
                        >
                          取消申请
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* 详情对话框 */}
        <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>申请详情</DialogTitle>
              <DialogDescription>查看完整的申请信息</DialogDescription>
            </DialogHeader>
            {selectedApplication && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">产品名称</p>
                    <p className="font-semibold">{selectedApplication.productName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">申请状态</p>
                    <div className="mt-1">{getStatusBadge(selectedApplication.application.status)}</div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">申请金额</p>
                    <p className="font-semibold">¥{Number(selectedApplication.application.applyAmount).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">申请期限</p>
                    <p className="font-semibold">{selectedApplication.application.applyTerm}个月</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground">贷款用途</p>
                    <p className="font-semibold">{selectedApplication.application.purpose || '未填写'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">申请时间</p>
                    <p className="font-semibold">
                      {selectedApplication.application.applyTime 
                        ? format(new Date(selectedApplication.application.applyTime), 'yyyy-MM-dd HH:mm:ss', { locale: zhCN })
                        : '-'}
                    </p>
                  </div>
                  {selectedApplication.application.approveTime && (
                    <div>
                      <p className="text-sm text-muted-foreground">审批时间</p>
                      <p className="font-semibold">
                        {format(new Date(selectedApplication.application.approveTime), 'yyyy-MM-dd HH:mm:ss', { locale: zhCN })}
                      </p>
                    </div>
                  )}
                  {selectedApplication.application.loanAmount && (
                    <div>
                      <p className="text-sm text-muted-foreground">批准金额</p>
                      <p className="font-semibold text-green-600">
                        ¥{Number(selectedApplication.application.loanAmount).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                  )}
                  {selectedApplication.application.loanTime && (
                    <div>
                      <p className="text-sm text-muted-foreground">放款时间</p>
                      <p className="font-semibold">
                        {format(new Date(selectedApplication.application.loanTime), 'yyyy-MM-dd HH:mm:ss', { locale: zhCN })}
                      </p>
                    </div>
                  )}
                </div>
                {selectedApplication.application.rejectReason && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-sm text-red-800 font-medium mb-1">拒绝原因：</p>
                    <p className="text-sm text-red-700">{selectedApplication.application.rejectReason}</p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* 取消申请确认对话框 */}
        <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>确认取消申请</AlertDialogTitle>
              <AlertDialogDescription>
                您确定要取消该申请吗？取消后将无法恢复。
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>取消</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => selectedApplication && handleCancelApplication(selectedApplication.application.id)}
                disabled={cancellingId !== null}
                className="bg-red-600 hover:bg-red-700"
              >
                {cancellingId !== null ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    取消中...
                  </>
                ) : (
                  '确认取消'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
