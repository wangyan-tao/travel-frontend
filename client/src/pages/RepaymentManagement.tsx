import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, TrendingUp, DollarSign, Loader2, AlertCircle, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { repaymentApi, type RepaymentOverview, type RepaymentPlanDTO, type RepaymentRecord } from '@/lib/repaymentApi';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

export default function RepaymentManagement() {
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<RepaymentOverview | null>(null);
  const [plans, setPlans] = useState<RepaymentPlanDTO[]>([]);
  const [records, setRecords] = useState<RepaymentRecord[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [overviewData, plansData, recordsData] = await Promise.all([
        repaymentApi.getOverview(),
        repaymentApi.getPlans(),
        repaymentApi.getRecords(),
      ]);
      setOverview(overviewData);
      setPlans(plansData);
      setRecords(recordsData);
    } catch (error: any) {
      console.error('加载还款数据失败:', error);
      toast.error(error.message || '加载还款数据失败');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return <Badge className="bg-green-500">已还款</Badge>;
      case 'OVERDUE':
        return <Badge variant="destructive">已逾期</Badge>;
      case 'PENDING':
        return <Badge variant="secondary">待还款</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PAID':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'OVERDUE':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'PENDING':
        return <Clock className="h-4 w-4 text-orange-600" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">加载还款数据中...</p>
        </div>
      </div>
    );
  }

  if (!overview) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-destructive" />
          <p className="text-muted-foreground mb-4">暂无还款数据</p>
          <Button onClick={loadData}>重新加载</Button>
        </div>
      </div>
    );
  }

  const progress = overview.totalAmount > 0 
    ? (Number(overview.paidAmount) / Number(overview.totalAmount)) * 100 
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">还款管理</h1>
          <p className="text-muted-foreground">查看您的还款计划和记录</p>
        </div>

        {/* 还款概览 */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <span className="text-muted-foreground">总贷款金额</span>
              <DollarSign className="h-5 w-5 text-primary" />
            </div>
            <div className="text-3xl font-bold">
              ¥{Number(overview.totalAmount).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </Card>

          <Card className="p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <span className="text-muted-foreground">已还金额</span>
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <div className="text-3xl font-bold text-green-600">
              ¥{Number(overview.paidAmount).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </Card>

          <Card className="p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <span className="text-muted-foreground">待还金额</span>
              <Calendar className="h-5 w-5 text-orange-600" />
            </div>
            <div className="text-3xl font-bold text-orange-600">
              ¥{Number(overview.remainingAmount).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </Card>
        </div>

        {/* 还款进度 */}
        <Card className="p-6 mb-8 shadow-lg">
          <h2 className="text-xl font-semibold mb-4">还款进度</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-muted-foreground">
                  已还 {overview.paidPeriods} / {overview.totalPeriods} 期
                </span>
                <span className="text-sm font-semibold">{progress.toFixed(1)}%</span>
              </div>
              <Progress value={progress} className="h-3" />
            </div>
            
            {overview.nextPaymentDate && (
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">下次还款日期</div>
                  <div className="text-lg font-semibold">
                    {format(new Date(overview.nextPaymentDate), 'yyyy年MM月dd日', { locale: zhCN })}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground mb-1">应还金额</div>
                  <div className="text-lg font-semibold text-primary">
                    ¥{Number(overview.nextPaymentAmount).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* 还款计划 */}
        <Card className="p-6 mb-8 shadow-lg">
          <h2 className="text-xl font-semibold mb-4">还款计划</h2>
          {plans.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              暂无还款计划
            </div>
          ) : (
            <div className="space-y-6">
              {(() => {
                // 按申请ID分组
                const groupedPlans = plans.reduce((acc, planDTO) => {
                  const applicationId = planDTO.applicationId;
                  if (!acc[applicationId]) {
                    acc[applicationId] = [];
                  }
                  acc[applicationId].push(planDTO);
                  return acc;
                }, {} as Record<number, typeof plans>);

                // 按申请ID降序排序（最新的申请在前）
                const sortedGroups = Object.entries(groupedPlans).sort((a, b) => {
                  return Number(b[0]) - Number(a[0]);
                });

                return sortedGroups.map(([applicationId, applicationPlans]) => {
                  // 获取该申请的产品名称（所有计划的产品名称应该相同）
                  const productName = applicationPlans[0]?.productName || '未知产品';
                  // 按期数排序
                  const sortedPlans = [...applicationPlans].sort((a, b) => {
                    return a.plan.periodNumber - b.plan.periodNumber;
                  });

                  return (
                    <div key={applicationId} className="space-y-3">
                      <div className="flex items-center gap-3 mb-3 pb-2 border-b">
                        <h3 className="text-lg font-semibold text-primary">
                          申请ID: {applicationId}
                        </h3>
                        <span className="text-sm text-muted-foreground">
                          {productName}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          ({sortedPlans.length} 期)
                        </span>
                      </div>
                      {sortedPlans.map((planDTO) => {
                        const plan = planDTO.plan;
                        return (
                          <div key={plan.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors ml-4">
                            <div className="flex items-center gap-4 flex-1">
                              {getStatusIcon(plan.status)}
                              <div>
                                <div className="font-semibold mb-1">
                                  第 {plan.periodNumber} 期
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  应还日期: {format(new Date(plan.dueDate), 'yyyy-MM-dd', { locale: zhCN })}
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">
                                  本金: ¥{Number(plan.principalAmount).toLocaleString()} | 
                                  利息: ¥{Number(plan.interestAmount).toLocaleString()}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold mb-2">
                                ¥{Number(plan.totalAmount).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </div>
                              {getStatusBadge(plan.status)}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                });
              })()}
            </div>
          )}
        </Card>

        {/* 还款记录 */}
        <Card className="p-6 shadow-lg">
          <h2 className="text-xl font-semibold mb-4">还款记录</h2>
          {records.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              暂无还款记录
            </div>
          ) : (
            <div className="space-y-6">
              {(() => {
                // 创建申请ID到产品名称的映射
                const applicationProductMap = new Map<number, string>();
                plans.forEach(planDTO => {
                  if (!applicationProductMap.has(planDTO.applicationId)) {
                    applicationProductMap.set(planDTO.applicationId, planDTO.productName || '未知产品');
                  }
                });

                // 按申请ID分组
                const groupedRecords = records.reduce((acc, record) => {
                  const applicationId = record.applicationId;
                  if (!acc[applicationId]) {
                    acc[applicationId] = [];
                  }
                  acc[applicationId].push(record);
                  return acc;
                }, {} as Record<number, typeof records>);

                // 按申请ID降序排序（最新的申请在前）
                const sortedGroups = Object.entries(groupedRecords).sort((a, b) => {
                  return Number(b[0]) - Number(a[0]);
                });

                return sortedGroups.map(([applicationId, applicationRecords]) => {
                  const productName = applicationProductMap.get(Number(applicationId)) || '未知产品';
                  // 按还款时间降序排序（最新的在前）
                  const sortedRecords = [...applicationRecords].sort((a, b) => {
                    return new Date(b.paymentTime).getTime() - new Date(a.paymentTime).getTime();
                  });

                  // 计算该申请的总还款金额
                  const totalAmount = sortedRecords.reduce((sum, record) => sum + record.paymentAmount, 0);

                  return (
                    <div key={applicationId} className="space-y-3">
                      <div className="flex items-center gap-3 mb-3 pb-2 border-b">
                        <h3 className="text-lg font-semibold text-primary">
                          申请ID: {applicationId}
                        </h3>
                        <span className="text-sm text-muted-foreground">
                          {productName}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          ({sortedRecords.length} 笔)
                        </span>
                        <span className="text-sm font-medium text-green-600 ml-auto">
                          累计还款: ¥{totalAmount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                      {sortedRecords.map((record) => (
                        <div key={record.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors ml-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="font-semibold text-lg">
                                ¥{Number(record.paymentAmount).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </div>
                              <Badge className="bg-green-500">已还款</Badge>
                            </div>
                            <div className="text-sm text-muted-foreground mb-1">
                              还款时间: {format(new Date(record.paymentTime), 'yyyy-MM-dd HH:mm:ss', { locale: zhCN })}
                            </div>
                            {record.paymentMethod && (
                              <div className="text-xs text-muted-foreground">
                                支付方式: {record.paymentMethod}
                                {record.transactionId && ` | 交易流水: ${record.transactionId}`}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                });
              })()}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
