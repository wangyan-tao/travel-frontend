import { useState } from 'react';
import { useRoute, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

export default function LoanApplication() {
  const [, params] = useRoute('/loan-application/:id');
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    applyAmount: '',
    applyPeriod: '12',
    loanPurpose: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.applyAmount || !formData.loanPurpose) {
      toast.error('请填写完整信息');
      return;
    }

    setLoading(true);
    
    try {
      // TODO: 调用后端API
      toast.success('贷款申请提交成功，请等待审批');
      setLocation('/repayment');
    } catch (error) {
      toast.error('提交失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-8">
      <div className="container max-w-2xl mx-auto px-4">
        <Card className="p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-2">贷款申请</h1>
            <p className="text-muted-foreground">请填写贷款申请信息</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="applyAmount">申请金额（元）*</Label>
              <Input
                id="applyAmount"
                type="number"
                value={formData.applyAmount}
                onChange={(e) => setFormData({ ...formData, applyAmount: e.target.value })}
                placeholder="请输入申请金额"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="applyPeriod">分期期限（月）*</Label>
              <Input
                id="applyPeriod"
                type="number"
                value={formData.applyPeriod}
                onChange={(e) => setFormData({ ...formData, applyPeriod: e.target.value })}
                placeholder="请输入分期期限"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="loanPurpose">贷款用途 *</Label>
              <Textarea
                id="loanPurpose"
                value={formData.loanPurpose}
                onChange={(e) => setFormData({ ...formData, loanPurpose: e.target.value })}
                placeholder="请简要说明贷款用途"
                rows={4}
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
