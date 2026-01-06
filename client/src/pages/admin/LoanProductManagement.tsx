import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import axios from '@/lib/axios';
import { Plus, Edit, Trash2, Power, PowerOff, Loader2 } from 'lucide-react';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from '@/components/ui/pagination';

interface LoanProduct {
  id: number;
  productName: string;
  productCode: string;
  productType: string;
  minAmount: number;
  maxAmount: number;
  interestRate: number;
  interestType: string;
  minTerm: number;
  maxTerm: number;
  institutionName: string;
  applicationConditions?: string;
  approvalTime?: string;
  penaltyRate?: number;
  description?: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

interface PageResult<T> {
  records: T[];
  total: number;
  current: number;
  size: number;
  pages: number;
}

export default function LoanProductManagement() {
  const [pageResult, setPageResult] = useState<PageResult<LoanProduct> | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<LoanProduct | null>(null);
  const [deletingProductId, setDeletingProductId] = useState<number | null>(null);
  const [formData, setFormData] = useState<Partial<LoanProduct>>({
    status: 'ACTIVE',
  });

  useEffect(() => {
    loadProducts();
  }, [currentPage]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response: any = await axios.get(`/admin/loan-products?page=${currentPage}&size=${pageSize}`);
      if (response.code === 200) {
        setPageResult(response.data);
      }
    } catch (error: any) {
      toast.error(error.message || '加载产品列表失败');
    } finally {
      setLoading(false);
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

  const handleCreate = () => {
    setEditingProduct(null);
    setFormData({
      status: 'ACTIVE',
    });
    setDialogOpen(true);
  };

  const handleEdit = (product: LoanProduct) => {
    setEditingProduct(product);
    setFormData(product);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (!formData.productName || !formData.productCode || !formData.productType) {
        toast.error('请填写必填字段');
        return;
      }

      if (editingProduct) {
        const response: any = await axios.put(
          `/admin/loan-products/${editingProduct.id}`,
          formData
        );
        if (response.code === 200) {
          toast.success('产品更新成功');
          setDialogOpen(false);
          loadProducts();
        }
      } else {
        const response: any = await axios.post('/admin/loan-products', formData);
        if (response.code === 200) {
          toast.success('产品创建成功');
          setDialogOpen(false);
          loadProducts();
        }
      }
    } catch (error: any) {
      toast.error(error.message || '保存失败');
    }
  };

  const handleToggleStatus = async (product: LoanProduct) => {
    try {
      const endpoint =
        product.status === 'ACTIVE'
          ? `/admin/loan-products/${product.id}/deactivate`
          : `/admin/loan-products/${product.id}/activate`;
      const response: any = await axios.put(endpoint, {});
      if (response.code === 200) {
        toast.success(product.status === 'ACTIVE' ? '产品已下架' : '产品已上架');
        loadProducts();
      }
    } catch (error: any) {
      toast.error(error.message || '操作失败');
    }
  };

  const handleDelete = async () => {
    if (!deletingProductId) return;
    try {
      const response: any = await axios.delete(`/admin/loan-products/${deletingProductId}`);
      if (response.code === 200) {
        toast.success('产品已删除');
        setDeleteDialogOpen(false);
        setDeletingProductId(null);
        loadProducts();
      }
    } catch (error: any) {
      toast.error(error.message || '删除失败');
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === 'ACTIVE') {
      return <Badge className="bg-green-500">已上架</Badge>;
    }
    return <Badge variant="secondary">已下架</Badge>;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">贷款产品管理</h1>
          <p className="text-muted-foreground">管理贷款产品的上架、修改和下架</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          新增产品
        </Button>
      </div>

      <Card>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>产品名称</TableHead>
                <TableHead>产品编码</TableHead>
                <TableHead>产品类型</TableHead>
                <TableHead>额度范围</TableHead>
                <TableHead>年化利率</TableHead>
                <TableHead>期限</TableHead>
                <TableHead>持牌机构</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!pageResult || pageResult.records.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    暂无产品数据
                  </TableCell>
                </TableRow>
              ) : (
                pageResult.records.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.productName}</TableCell>
                    <TableCell>{product.productCode}</TableCell>
                    <TableCell>{product.productType}</TableCell>
                    <TableCell>
                      ¥{Number(product.minAmount).toFixed(2)} - ¥
                      {Number(product.maxAmount).toFixed(2)}
                    </TableCell>
                    <TableCell>{Number(product.interestRate).toFixed(2)}%</TableCell>
                    <TableCell>
                      {product.minTerm}-{product.maxTerm}个月
                    </TableCell>
                    <TableCell>{product.institutionName}</TableCell>
                    <TableCell>{getStatusBadge(product.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleStatus(product)}
                        >
                          {product.status === 'ACTIVE' ? (
                            <PowerOff className="h-4 w-4" />
                          ) : (
                            <Power className="h-4 w-4" />
                          )}
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(product)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setDeletingProductId(product.id);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
        {renderPagination()}
      </Card>

      {/* 新增/编辑对话框 */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProduct ? '编辑产品' : '新增产品'}</DialogTitle>
            <DialogDescription>
              {editingProduct ? '修改产品信息' : '填写产品信息以创建新产品'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="productName">
                  产品名称 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="productName"
                  value={formData.productName || ''}
                  onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                  placeholder="请输入产品名称"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="productCode">
                  产品编码 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="productCode"
                  value={formData.productCode || ''}
                  onChange={(e) => setFormData({ ...formData, productCode: e.target.value })}
                  placeholder="请输入产品编码"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="productType">
                  产品类型 <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.productType || ''}
                  onValueChange={(value) => setFormData({ ...formData, productType: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择产品类型" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="短期旅游">短期旅游</SelectItem>
                    <SelectItem value="中期旅游">中期旅游</SelectItem>
                    <SelectItem value="长期旅游">长期旅游</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">状态</Label>
                <Select
                  value={formData.status || 'ACTIVE'}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">已上架</SelectItem>
                    <SelectItem value="INACTIVE">已下架</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minAmount">
                  最低额度 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="minAmount"
                  type="number"
                  value={formData.minAmount || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, minAmount: parseFloat(e.target.value) })
                  }
                  placeholder="请输入最低额度"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxAmount">
                  最高额度 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="maxAmount"
                  type="number"
                  value={formData.maxAmount || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, maxAmount: parseFloat(e.target.value) })
                  }
                  placeholder="请输入最高额度"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="interestRate">
                  年化利率 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="interestRate"
                  type="number"
                  step="0.01"
                  value={formData.interestRate || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, interestRate: parseFloat(e.target.value) })
                  }
                  placeholder="请输入年化利率"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="interestType">利率类型</Label>
                <Input
                  id="interestType"
                  value={formData.interestType || ''}
                  onChange={(e) => setFormData({ ...formData, interestType: e.target.value })}
                  placeholder="如：低息免息/固定利率"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minTerm">
                  最短期限(月) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="minTerm"
                  type="number"
                  value={formData.minTerm || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, minTerm: parseInt(e.target.value) })
                  }
                  placeholder="请输入最短期限"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxTerm">
                  最长期限(月) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="maxTerm"
                  type="number"
                  value={formData.maxTerm || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, maxTerm: parseInt(e.target.value) })
                  }
                  placeholder="请输入最长期限"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="institutionName">
                持牌机构名称 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="institutionName"
                value={formData.institutionName || ''}
                onChange={(e) => setFormData({ ...formData, institutionName: e.target.value })}
                placeholder="请输入持牌机构名称"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="applicationConditions">申请条件</Label>
              <Textarea
                id="applicationConditions"
                value={formData.applicationConditions || ''}
                onChange={(e) =>
                  setFormData({ ...formData, applicationConditions: e.target.value })
                }
                placeholder="请输入申请条件"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="approvalTime">审批时效</Label>
                <Input
                  id="approvalTime"
                  value={formData.approvalTime || ''}
                  onChange={(e) => setFormData({ ...formData, approvalTime: e.target.value })}
                  placeholder="如：1-3个工作日"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="penaltyRate">违约金率</Label>
                <Input
                  id="penaltyRate"
                  type="number"
                  step="0.01"
                  value={formData.penaltyRate || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, penaltyRate: parseFloat(e.target.value) })
                  }
                  placeholder="请输入违约金率"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">产品描述</Label>
              <Textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="请输入产品描述"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSave}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 删除确认对话框 */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除这个产品吗？此操作不可恢复。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

