import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, CreditCard, Smartphone } from 'lucide-react';
import { repaymentApi } from '@/lib/repaymentApi';
import { toast } from 'sonner';

interface RepaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  planId: number;
  amount: number;
  periodNumber: number;
  onSuccess?: () => void;
}

export default function RepaymentDialog({
  open,
  onOpenChange,
  planId,
  amount,
  periodNumber,
  onSuccess,
}: RepaymentDialogProps) {
  const [selectedMethod, setSelectedMethod] = useState<'ALIPAY' | 'WECHAT' | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRepayment = async () => {
    if (!selectedMethod) {
      toast.error('请选择支付方式');
      return;
    }

    try {
      setLoading(true);
      await repaymentApi.executeRepayment(planId, selectedMethod);
      toast.success('还款成功！');
      onOpenChange(false);
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error('还款失败:', error);
      toast.error(error.message || '还款失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>还款</DialogTitle>
          <DialogDescription>
            请选择支付方式完成第 {periodNumber} 期还款
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="text-center">
            <div className="text-sm text-muted-foreground mb-2">还款金额</div>
            <div className="text-3xl font-bold text-primary">
              ¥{Number(amount).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>

          <div className="space-y-3">
            <div className="text-sm font-medium mb-2">选择支付方式</div>
            
            <button
              type="button"
              onClick={() => setSelectedMethod('ALIPAY')}
              className={`w-full p-4 border-2 rounded-lg transition-all ${
                selectedMethod === 'ALIPAY'
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${
                  selectedMethod === 'ALIPAY' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                }`}>
                  <CreditCard className="h-5 w-5" />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-semibold">支付宝</div>
                  <div className="text-sm text-muted-foreground">使用支付宝账户支付</div>
                </div>
                {selectedMethod === 'ALIPAY' && (
                  <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                    <div className="h-2 w-2 rounded-full bg-primary-foreground" />
                  </div>
                )}
              </div>
            </button>

            <button
              type="button"
              onClick={() => setSelectedMethod('WECHAT')}
              className={`w-full p-4 border-2 rounded-lg transition-all ${
                selectedMethod === 'WECHAT'
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${
                  selectedMethod === 'WECHAT' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                }`}>
                  <Smartphone className="h-5 w-5" />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-semibold">微信支付</div>
                  <div className="text-sm text-muted-foreground">使用微信账户支付</div>
                </div>
                {selectedMethod === 'WECHAT' && (
                  <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                    <div className="h-2 w-2 rounded-full bg-primary-foreground" />
                  </div>
                )}
              </div>
            </button>
          </div>

          <div className="text-xs text-muted-foreground text-center pt-2">
            * 此为模拟支付，不会产生真实扣款
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            取消
          </Button>
          <Button
            onClick={handleRepayment}
            disabled={!selectedMethod || loading}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            确认还款
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

