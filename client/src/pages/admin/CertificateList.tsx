import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
import { Search, Loader2, FileText, User, CheckCircle, XCircle, Eye, Award, Briefcase } from 'lucide-react';
import { adminApi, type CertificateDTO, type PageResult } from '@/lib/adminApi';
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

export default function CertificateList() {
  const [location] = useLocation();
  const [loading, setLoading] = useState(false);
  const [pageResult, setPageResult] = useState<PageResult<CertificateDTO> | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState<CertificateDTO | null>(null);
  const [approvalOpinion, setApprovalOpinion] = useState('');
  const [rejectOpinion, setRejectOpinion] = useState('');

  // 从URL参数获取初始状态筛选
  useEffect(() => {
    const params = new URLSearchParams(location.split('?')[1]);
    const status = params.get('status');
    if (status) {
      setStatusFilter(status.toUpperCase());
    }
  }, [location]);

  useEffect(() => {
    loadCertificates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, currentPage]);

  const loadCertificates = async () => {
    try {
      setLoading(true);
      const data = await adminApi.certificates.getCertificates(
        searchTerm || undefined,
        statusFilter !== 'ALL' ? statusFilter : undefined,
        currentPage,
        pageSize
      );
      setPageResult(data);
    } catch (error: any) {
      console.error('加载证书列表失败:', error);
      toast.error(error.message || '加载证书列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    loadCertificates();
  };

  const handleViewDetail = async (id: number) => {
    try {
      const detail = await adminApi.certificates.getCertificateById(id);
      setSelectedCertificate(detail);
      setDetailDialogOpen(true);
    } catch (error: any) {
      toast.error(error.message || '获取证书详情失败');
    }
  };

  const handleApprove = (cert: CertificateDTO) => {
    setSelectedCertificate(cert);
    setApprovalOpinion('');
    setApproveDialogOpen(true);
  };

  const handleReject = (cert: CertificateDTO) => {
    setSelectedCertificate(cert);
    setRejectOpinion('');
    setRejectDialogOpen(true);
  };

  const confirmApprove = async () => {
    if (!selectedCertificate) return;

    try {
      await adminApi.certificates.approveCertificate(selectedCertificate.id, {
        approvalOpinion: approvalOpinion || undefined,
      });
      toast.success('证书已通过审批');
      setApproveDialogOpen(false);
      setSelectedCertificate(null);
      await loadCertificates();
    } catch (error: any) {
      toast.error(error.message || '审批失败');
    }
  };

  const confirmReject = async () => {
    if (!selectedCertificate) return;

    try {
      await adminApi.certificates.rejectCertificate(selectedCertificate.id, {
        approvalOpinion: rejectOpinion || undefined,
      });
      toast.success('证书已拒绝');
      setRejectDialogOpen(false);
      setSelectedCertificate(null);
      setRejectOpinion('');
      await loadCertificates();
    } catch (error: any) {
      toast.error(error.message || '拒绝失败');
    }
  };

  const renderPagination = () => {
    if (!pageResult || pageResult.pages <= 1) return null;

    const pages = [];
    const totalPages = pageResult.pages;
    const current = pageResult.current;

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
      APPROVED: { label: '已通过', variant: 'default' },
      REJECTED: { label: '已拒绝', variant: 'destructive' },
    };
    const config = statusMap[status] || { label: status, variant: 'outline' };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getTypeIcon = (type: string) => {
    return type === 'JOB_PROOF' ? Briefcase : Award;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">证书审批管理</h1>
          <p className="text-muted-foreground">审批用户上传的工作证明和学业荣誉</p>
        </div>

        {/* 搜索和筛选栏 */}
        <Card className="p-4 mb-6 shadow-lg">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索证书名称..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
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
                <SelectItem value="APPROVED">已通过</SelectItem>
                <SelectItem value="REJECTED">已拒绝</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleSearch}>搜索</Button>
            <Button variant="outline" onClick={loadCertificates}>刷新</Button>
          </div>
        </Card>

        {/* 证书列表 */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <div className="grid gap-4">
              {pageResult?.records.map((cert) => {
                const Icon = getTypeIcon(cert.certificateType);
                return (
                  <Card key={cert.id} className="p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{cert.certificateName}</h3>
                          <p className="text-sm text-muted-foreground">{cert.certificateTypeName}</p>
                        </div>
                      </div>
                      {getStatusBadge(cert.status)}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm mb-4">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>用户ID: {cert.userId}</span>
                      </div>
                      <div className="text-muted-foreground">
                        {cert.createdAt ? format(new Date(cert.createdAt), 'yyyy-MM-dd HH:mm', { locale: zhCN }) : '-'}
                      </div>
                      {cert.approvedAt && (
                        <div className="text-muted-foreground">
                          审批时间: {format(new Date(cert.approvedAt), 'yyyy-MM-dd HH:mm', { locale: zhCN })}
                        </div>
                      )}
                    </div>
                    {cert.description && (
                      <div className="mb-4 text-sm text-muted-foreground">
                        {cert.description}
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetail(cert.id)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        查看详情
                      </Button>
                      {cert.status === 'PENDING' && (
                        <>
                          <Button
                            variant="default"
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleApprove(cert)}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            通过
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleReject(cert)}
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            拒绝
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
            没有找到匹配的证书记录
          </div>
        )}

        {/* 详情对话框 */}
        <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>证书详情</DialogTitle>
              <DialogDescription>查看完整的证书信息</DialogDescription>
            </DialogHeader>
            {selectedCertificate && (
              <div className="space-y-4 overflow-y-auto" style={{ maxHeight: 'calc(80vh - 120px)' }}>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">证书ID</p>
                    <p className="font-semibold">{selectedCertificate.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">审批状态</p>
                    <div className="mt-1">{getStatusBadge(selectedCertificate.status)}</div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">用户ID</p>
                    <p className="font-semibold">{selectedCertificate.userId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">证书类型</p>
                    <p className="font-semibold">{selectedCertificate.certificateTypeName}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground">证书名称</p>
                    <p className="font-semibold">{selectedCertificate.certificateName}</p>
                  </div>
                  {selectedCertificate.description && (
                    <div className="col-span-2">
                      <p className="text-sm text-muted-foreground">证书描述</p>
                      <p className="font-semibold">{selectedCertificate.description}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-muted-foreground">创建时间</p>
                    <p className="font-semibold">
                      {selectedCertificate.createdAt
                        ? format(new Date(selectedCertificate.createdAt), 'yyyy-MM-dd HH:mm:ss', { locale: zhCN })
                        : '-'}
                    </p>
                  </div>
                  {selectedCertificate.approvedAt && (
                    <div>
                      <p className="text-sm text-muted-foreground">审批时间</p>
                      <p className="font-semibold">
                        {format(new Date(selectedCertificate.approvedAt), 'yyyy-MM-dd HH:mm:ss', { locale: zhCN })}
                      </p>
                    </div>
                  )}
                  {selectedCertificate.approvalOpinion && (
                    <div className="col-span-2">
                      <p className="text-sm text-muted-foreground">审批意见</p>
                      <p className="font-semibold">{selectedCertificate.approvalOpinion}</p>
                    </div>
                  )}
                </div>
                {selectedCertificate.certificateUrl && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">证书文件</p>
                    <a
                      href={selectedCertificate.certificateUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline flex items-center gap-2"
                    >
                      <FileText className="h-4 w-4" />
                      查看证书文件
                    </a>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* 审批通过对话框 */}
        <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>审批通过</DialogTitle>
              <DialogDescription>确认通过此证书</DialogDescription>
            </DialogHeader>
            {selectedCertificate && (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">证书名称</p>
                  <p className="font-semibold">{selectedCertificate.certificateName}</p>
                </div>
                <div>
                  <Label htmlFor="approvalOpinion">审批意见（可选）</Label>
                  <Textarea
                    id="approvalOpinion"
                    value={approvalOpinion}
                    onChange={(e) => setApprovalOpinion(e.target.value)}
                    placeholder="请输入审批意见..."
                    rows={3}
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setApproveDialogOpen(false)}>
                取消
              </Button>
              <Button onClick={confirmApprove} className="bg-green-600 hover:bg-green-700">
                确认通过
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* 拒绝对话框 */}
        <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>拒绝证书</DialogTitle>
              <DialogDescription>请填写拒绝原因</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="rejectOpinion">拒绝原因（可选）</Label>
                <Textarea
                  id="rejectOpinion"
                  value={rejectOpinion}
                  onChange={(e) => setRejectOpinion(e.target.value)}
                  placeholder="请输入拒绝原因..."
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
                取消
              </Button>
              <Button onClick={confirmReject} variant="destructive">
                确认拒绝
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

