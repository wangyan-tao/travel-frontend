import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Search, Loader2, FileText, User, DollarSign, Calendar, CheckCircle, XCircle, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { adminApi, type LoanApplicationDTO, type PageResult } from '@/lib/adminApi';
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

export default function DisbursementList() {
  const [location] = useLocation();
  const [loading, setLoading] = useState(false);
  const [pageResult, setPageResult] = useState<PageResult<LoanApplicationDTO> | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<LoanApplicationDTO | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [applicationIds, setApplicationIds] = useState<number[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);

  useEffect(() => {
    loadApplications();
    loadApplicationIds();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  const loadApplications = async () => {
    try {
      setLoading(true);
      const data = await adminApi.disbursements.getApprovedApplications(
        searchTerm || undefined,
        undefined,
        currentPage,
        pageSize
      );
      setPageResult(data);
    } catch (error: any) {
      console.error('加载申请列表失败:', error);
      toast.error(error.message || '加载申请列表失败');
    } finally {
      setLoading(false);
    }
  };

  const loadApplicationIds = async () => {
    try {
      const ids = await adminApi.disbursements.getApprovedApplicationIds();
      setApplicationIds(ids);
    } catch (error: any) {
      console.error('加载申请ID列表失败:', error);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    loadApplications();
    loadApplicationIds();
  };

  const handleViewDetail = async (id: number) => {
    try {
      const detail = await adminApi.disbursements.getApplicationById(id);
      setSelectedApplication(detail);
      const index = applicationIds.indexOf(id);
      setCurrentIndex(index);
      setDetailDialogOpen(true);
    } catch (error: any) {
      toast.error(error.message || '获取申请详情失败');
    }
  };

  const handlePrevious = async () => {
    if (currentIndex > 0) {
      const prevId = applicationIds[currentIndex - 1];
      try {
        const detail = await adminApi.disbursements.getApplicationById(prevId);
        setSelectedApplication(detail);
        setCurrentIndex(currentIndex - 1);
      } catch (error: any) {
        toast.error(error.message || '加载申请失败');
      }
    }
  };

  const handleNext = async () => {
    if (currentIndex < applicationIds.length - 1) {
      const nextId = applicationIds[currentIndex + 1];
      try {
        const detail = await adminApi.disbursements.getApplicationById(nextId);
        setSelectedApplication(detail);
        setCurrentIndex(currentIndex + 1);
      } catch (error: any) {
        toast.error(error.message || '加载申请失败');
      }
    }
  };

  const handleApprove = (dto: LoanApplicationDTO) => {
    setSelectedApplication(dto);
    setApproveDialogOpen(true);
  };

  const handleReject = (dto: LoanApplicationDTO) => {
    setSelectedApplication(dto);
    setRejectReason('');
    setRejectDialogOpen(true);
  };

  const confirmApprove = async () => {
    if (!selectedApplication) return;

    try {
      await adminApi.disbursements.approveDisbursement(selectedApplication.application.id);
      toast.success('放款成功，还款计划已生成');
      setApproveDialogOpen(false);
      setSelectedApplication(null);
      await loadApplications();
      await loadApplicationIds();
    } catch (error: any) {
      toast.error(error.message || '放款失败');
    }
  };

  const confirmReject = async () => {
    if (!selectedApplication || !rejectReason.trim()) {
      toast.error('请输入拒绝原因');
      return;
    }

    try {
      await adminApi.disbursements.rejectDisbursement(selectedApplication.application.id, {
        rejectReason: rejectReason,
      });
      toast.success('放款已驳回');
      setRejectDialogOpen(false);
      setSelectedApplication(null);
      setRejectReason('');
      await loadApplications();
      await loadApplicationIds();
    } catch (error: any) {
      toast.error(error.message || '驳回放款失败');
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container mx-auto px-4 py-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">放款管理</h1>
          <p className="text-muted-foreground">管理已批准申请的放款操作</p>
        </div>

        {/* 搜索栏 */}
        <Card className="p-4 mb-6 shadow-lg">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索用户名或产品名..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10"
              />
            </div>
            <Button onClick={handleSearch}>
              搜索
            </Button>
            <Button variant="outline" onClick={loadApplications}>
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
          <>
            <div className="grid gap-4">
              {pageResult?.records.map((dto) => {
                const app = dto.application;
                return (
                  <Card key={app.id} className="p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold">申请ID: {app.id}</h3>
                          <p className="text-sm text-muted-foreground">{dto.productName}</p>
                        </div>
                      </div>
                      {getStatusBadge(app.status)}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>{dto.username}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span>¥{Number(app.loanAmount || app.applyAmount).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{app.applyTerm}个月</span>
                      </div>
                      <div className="text-muted-foreground">
                        {app.approveTime ? format(new Date(app.approveTime), 'yyyy-MM-dd HH:mm', { locale: zhCN }) : '-'}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetail(app.id)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        查看详情
                      </Button>
                      {app.status === 'APPROVED' && (
                        <>
                          <Button
                            variant="default"
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleApprove(dto)}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            同意放款
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleReject(dto)}
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            驳回放款
                          </Button>
                        </>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
            {renderPagination()}
          </>
        )}

        {!loading && (!pageResult || pageResult.records.length === 0) && (
          <div className="text-center py-12 text-muted-foreground">
            没有找到匹配的申请记录
          </div>
        )}

        {/* 详情对话框 */}
        <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>申请详情</DialogTitle>
              <DialogDescription>查看完整的申请信息</DialogDescription>
            </DialogHeader>
            {selectedApplication && (
              <div className="space-y-4 overflow-y-auto" style={{ maxHeight: 'calc(80vh - 120px)' }}>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">申请ID</p>
                    <p className="font-semibold">{selectedApplication.application.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">申请状态</p>
                    <div className="mt-1">{getStatusBadge(selectedApplication.application.status)}</div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">用户名</p>
                    <p className="font-semibold">{selectedApplication.username}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">产品名称</p>
                    <p className="font-semibold">{selectedApplication.productName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">申请金额</p>
                    <p className="font-semibold">¥{Number(selectedApplication.application.applyAmount).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">批准金额</p>
                    <p className="font-semibold text-green-600">
                      ¥{Number(selectedApplication.application.loanAmount || selectedApplication.application.applyAmount).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
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
                </div>
                {selectedApplication.application.rejectReason && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-sm text-red-800 font-medium mb-1">拒绝原因：</p>
                    <p className="text-sm text-red-700">{selectedApplication.application.rejectReason}</p>
                  </div>
                )}
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
                    {currentIndex + 1} / {applicationIds.length}
                  </span>
                  <Button
                    variant="outline"
                    onClick={handleNext}
                    disabled={currentIndex >= applicationIds.length - 1}
                  >
                    下一个
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* 同意放款对话框 */}
        <AlertDialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>确认放款</AlertDialogTitle>
              <AlertDialogDescription>
                确认同意放款吗？放款后将自动生成还款计划，申请状态将变为"已发放"。
              </AlertDialogDescription>
            </AlertDialogHeader>
            {selectedApplication && (
              <div className="space-y-2 py-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">批准金额</p>
                    <p className="font-semibold">
                      ¥{Number(selectedApplication.application.loanAmount || selectedApplication.application.applyAmount).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">贷款期限</p>
                    <p className="font-semibold">{selectedApplication.application.applyTerm}个月</p>
                  </div>
                </div>
              </div>
            )}
            <AlertDialogFooter>
              <AlertDialogCancel>取消</AlertDialogCancel>
              <AlertDialogAction onClick={confirmApprove} className="bg-green-600 hover:bg-green-700">
                确认放款
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* 驳回放款对话框 */}
        <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>驳回放款</DialogTitle>
              <DialogDescription>请填写驳回原因</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="rejectReason">驳回原因 *</Label>
                <Textarea
                  id="rejectReason"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="请输入驳回原因..."
                  rows={4}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
                取消
              </Button>
              <Button
                onClick={confirmReject}
                variant="destructive"
                disabled={!rejectReason.trim()}
              >
                确认驳回
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

