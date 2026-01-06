import { useState, useEffect } from 'react';
import { useRoute, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import axios from '@/lib/axios';
import { applicationApi } from '@/lib/applicationApi';

interface LoanProduct {
  id: number;
  productName: string;
  productType: string;
  minAmount: number;
  maxAmount: number;
  interestRate: number;
  minTerm: number;
  maxTerm: number;
  institutionName: string;
}

export default function LoanApplication() {
  const [, params] = useRoute('/loan-application/:id');
  const [, setLocation] = useLocation();
  const productId = params?.id ? parseInt(params.id) : null;
  const [loading, setLoading] = useState(false);
  const [productLoading, setProductLoading] = useState(true);
  const [product, setProduct] = useState<LoanProduct | null>(null);
  const [formData, setFormData] = useState({
    applyAmount: '',
    applyTerm: '',
    purpose: ''
  });

  useEffect(() => {
    if (productId) {
      loadProduct();
    }
  }, [productId]);

  const loadProduct = async () => {
    if (!productId) return;
    try {
      setProductLoading(true);
      const response: any = await axios.get(`/loan-products/${productId}`);
      if (response.code === 200) {
        const productData = response.data;
        setProduct(productData);
        // 设置默认期限为最小期限
        if (productData.minTerm) {
          setFormData(prev => ({ ...prev, applyTerm: productData.minTerm.toString() }));
        }
      } else {
        toast.error(response.message || '获取产品信息失败');
        setLocation('/loan-products');
      }
    } catch (error: any) {
      toast.error(error.message || '获取产品信息失败');
      setLocation('/loan-products');
    } finally {
      setProductLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.applyAmount || !formData.applyTerm || !formData.purpose) {
      toast.error('请填写完整信息');
      return;
    }

    if (!productId || !product) {
      toast.error('产品信息缺失');
      return;
    }

    const applyAmount = parseFloat(formData.applyAmount);
    const applyTerm = parseInt(formData.applyTerm);

    // 验证金额范围
    if (isNaN(applyAmount) || applyAmount < product.minAmount || applyAmount > product.maxAmount) {
      toast.error(`申请金额必须在 ¥${product.minAmount.toFixed(2)} 到 ¥${product.maxAmount.toFixed(2)} 之间`);
      return;
    }

    // 验证期限范围
    if (isNaN(applyTerm) || applyTerm < product.minTerm || applyTerm > product.maxTerm) {
      toast.error(`申请期限必须在 ${product.minTerm} 到 ${product.maxTerm} 个月之间`);
      return;
    }

    setLoading(true);
    
    try {
      await applicationApi.createApplication({
        productId: productId,
        applyAmount: applyAmount,
        applyTerm: applyTerm,
        purpose: formData.purpose
      });
      toast.success('贷款申请提交成功，请等待审批');
      setLocation('/my-applications');
    } catch (error: any) {
      toast.error(error.message || '提交失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  if (productLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-8">
        <div className="container max-w-2xl mx-auto px-4">
          <Card className="p-8">
            <div className="text-center py-8">
              <p className="text-muted-foreground">加载产品信息中...</p>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-8">
      <div className="container max-w-2xl mx-auto px-4">
        <Card className="p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-2">贷款申请</h1>
            <p className="text-muted-foreground">请填写贷款申请信息</p>
          </div>

          {/* 产品信息展示 */}
          <div className="mb-6 p-4 bg-muted rounded-lg">
            <h3 className="font-semibold mb-2">{product.productName}</h3>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>额度范围：¥{Number(product.minAmount).toFixed(2)} - ¥{Number(product.maxAmount).toFixed(2)}</p>
              <p>年化利率：{Number(product.interestRate).toFixed(2)}%</p>
              <p>分期期限：{product.minTerm} - {product.maxTerm}个月</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="applyAmount">
                申请金额（元）*
                <span className="text-muted-foreground text-sm ml-2">
                  (范围：¥{Number(product.minAmount).toFixed(2)} - ¥{Number(product.maxAmount).toFixed(2)})
                </span>
              </Label>
              <Input
                id="applyAmount"
                type="number"
                step="0.01"
                min={product.minAmount}
                max={product.maxAmount}
                value={formData.applyAmount}
                onChange={(e) => setFormData({ ...formData, applyAmount: e.target.value })}
                placeholder={`请输入申请金额（¥${Number(product.minAmount).toFixed(2)} - ¥${Number(product.maxAmount).toFixed(2)}）`}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="applyTerm">
                分期期限（月）*
                <span className="text-muted-foreground text-sm ml-2">
                  (范围：{product.minTerm} - {product.maxTerm}个月)
                </span>
              </Label>
              <Input
                id="applyTerm"
                type="number"
                min={product.minTerm}
                max={product.maxTerm}
                value={formData.applyTerm}
                onChange={(e) => setFormData({ ...formData, applyTerm: e.target.value })}
                placeholder={`请输入分期期限（${product.minTerm} - ${product.maxTerm}个月）`}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="purpose">贷款用途 *</Label>
              <Textarea
                id="purpose"
                value={formData.purpose}
                onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                placeholder="请简要说明贷款用途"
                rows={4}
                required
              />
            </div>

            <div className="flex gap-4">
              <Button type="button" variant="outline" onClick={() => setLocation('/loan-products')}>
                返回
              </Button>
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? '提交中...' : '提交申请'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
