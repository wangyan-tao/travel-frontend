import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Calendar, TrendingUp, DollarSign } from 'lucide-react';

export default function RepaymentManagement() {
  // 模拟数据
  const repaymentData = {
    totalAmount: 10000,
    paidAmount: 3000,
    remainingAmount: 7000,
    totalPeriods: 12,
    paidPeriods: 3,
    nextPaymentDate: '2024-02-01',
    nextPaymentAmount: 900
  };

  const progress = (repaymentData.paidAmount / repaymentData.totalAmount) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      {/* 导航栏 */}
      <nav className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <div className="flex items-center space-x-2 cursor-pointer">
                <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground font-bold">青</span>
                </div>
                <span className="text-xl font-bold">青春旅贷</span>
              </div>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/loan-products">
                <Button variant="ghost">贷款产品</Button>
              </Link>
              <Button variant="outline" onClick={() => {
                localStorage.clear();
                window.location.href = '/login';
              }}>
                退出登录
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">还款管理</h1>
          <p className="text-muted-foreground">查看您的还款计划和记录</p>
        </div>

        {/* 还款概览 */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-muted-foreground">总贷款金额</span>
              <DollarSign className="h-5 w-5 text-primary" />
            </div>
            <div className="text-3xl font-bold">¥{repaymentData.totalAmount.toLocaleString()}</div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-muted-foreground">已还金额</span>
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <div className="text-3xl font-bold text-green-600">
              ¥{repaymentData.paidAmount.toLocaleString()}
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-muted-foreground">待还金额</span>
              <Calendar className="h-5 w-5 text-orange-600" />
            </div>
            <div className="text-3xl font-bold text-orange-600">
              ¥{repaymentData.remainingAmount.toLocaleString()}
            </div>
          </Card>
        </div>

        {/* 还款进度 */}
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">还款进度</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-muted-foreground">
                  已还 {repaymentData.paidPeriods} / {repaymentData.totalPeriods} 期
                </span>
                <span className="text-sm font-semibold">{progress.toFixed(1)}%</span>
              </div>
              <Progress value={progress} className="h-3" />
            </div>
            
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div>
                <div className="text-sm text-muted-foreground mb-1">下次还款日期</div>
                <div className="text-lg font-semibold">{repaymentData.nextPaymentDate}</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-muted-foreground mb-1">应还金额</div>
                <div className="text-lg font-semibold text-primary">
                  ¥{repaymentData.nextPaymentAmount}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* 还款记录 */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">还款记录</h2>
          <div className="space-y-4">
            {[1, 2, 3].map((period) => (
              <div key={period} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="font-semibold mb-1">第 {period} 期</div>
                  <div className="text-sm text-muted-foreground">2024-{period.toString().padStart(2, '0')}-01</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold mb-1">¥900</div>
                  <Badge variant="secondary">已还款</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
