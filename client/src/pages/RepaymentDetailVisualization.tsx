import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar, 
  TrendingUp, 
  DollarSign, 
  Loader2, 
  AlertCircle, 
  Clock, 
  CheckCircle2, 
  XCircle,
  PieChart,
  LineChart,
  Calculator,
  CalendarDays
} from 'lucide-react';
import { 
  repaymentApi, 
  type ProductRepaymentDetail, 
  type RepaymentRecord,
  type PrepayCalculation,
  type RepaymentPlan
} from '@/lib/repaymentApi';
import { toast } from 'sonner';
import { format, addDays, isBefore, isAfter, parseISO } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function RepaymentDetailVisualization() {
  const [loading, setLoading] = useState(true);
  const [productDetails, setProductDetails] = useState<ProductRepaymentDetail[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [records, setRecords] = useState<RepaymentRecord[]>([]);
  const [timeRange, setTimeRange] = useState<'3M' | '6M' | 'ALL'>('ALL');
  const [prepayDialogOpen, setPrepayDialogOpen] = useState(false);
  const [prepayAmount, setPrepayAmount] = useState('');
  const [prepayCalculation, setPrepayCalculation] = useState<PrepayCalculation | null>(null);
  const [calculating, setCalculating] = useState(false);

  useEffect(() => {
    loadData();
  }, [timeRange]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [detailsData, recordsData] = await Promise.all([
        repaymentApi.getProductRepaymentDetails(),
        repaymentApi.getRecordsByTimeRange(timeRange),
      ]);
      setProductDetails(detailsData);
      setRecords(recordsData);
      if (detailsData.length > 0 && selectedProductId === null) {
        setSelectedProductId(detailsData[0].productId);
      }
    } catch (error: any) {
      console.error('加载还款数据失败:', error);
      toast.error(error.message || '加载还款数据失败');
    } finally {
      setLoading(false);
    }
  };

  const selectedProduct = productDetails.find(p => p.productId === selectedProductId);

  const handlePrepayCalculate = async () => {
    if (!selectedProduct || !prepayAmount || parseFloat(prepayAmount) <= 0) {
      toast.error('请输入有效的提前还款金额');
      return;
    }

    try {
      setCalculating(true);
      // 获取第一个还款计划的申请ID
      const firstPlan = selectedProduct.plans[0];
      if (!firstPlan || !firstPlan.applicationId) {
        toast.error('该产品暂无还款计划');
        return;
      }

      const calculation = await repaymentApi.calculatePrepayment(
        firstPlan.applicationId,
        parseFloat(prepayAmount)
      );
      setPrepayCalculation(calculation);
    } catch (error: any) {
      console.error('提前还款测算失败:', error);
      toast.error(error.message || '提前还款测算失败');
    } finally {
      setCalculating(false);
    }
  };


  // 准备饼图数据
  const pieChartData = selectedProduct ? [
    { name: '总本金', value: Number(selectedProduct.totalPrincipal) },
    { name: '总利息', value: Number(selectedProduct.totalInterest) },
  ] : [];

  // 准备折线图数据（每期利息变化）
  const lineChartData = selectedProduct
    ? selectedProduct.plans.map((plan, index) => ({
        period: `第${plan.periodNumber}期`,
        interest: Number(plan.interestAmount),
        principal: Number(plan.principalAmount),
        total: Number(plan.totalAmount),
      }))
    : [];

  // 准备还款日历数据
  const calendarData = selectedProduct
    ? selectedProduct.plans.map(plan => ({
        date: plan.dueDate,
        amount: Number(plan.totalAmount),
        status: plan.status,
        periodNumber: plan.periodNumber,
      }))
    : [];

  // 获取即将到期的还款（提前3天提醒）
  const upcomingPayments = calendarData.filter(item => {
    const dueDate = parseISO(item.date);
    const today = new Date();
    const threeDaysLater = addDays(today, 3);
    return isBefore(dueDate, threeDaysLater) && isAfter(dueDate, today) && item.status === 'PENDING';
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">加载还款数据中...</p>
        </div>
      </div>
    );
  }

  if (productDetails.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-destructive" />
          <p className="text-muted-foreground mb-4">暂无还款数据</p>
          <Button onClick={loadData}>重新加载</Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">还款明细可视化</h2>
        <p className="text-muted-foreground">透明化还款管理，清晰直观，避免逾期</p>
      </div>

        {/* 产品选择 */}
        <Card className="p-6 mb-6 shadow-lg">
          <Label className="text-sm font-semibold mb-2 block">选择贷款产品</Label>
          <Select
            value={selectedProductId?.toString() || ''}
            onValueChange={(value) => setSelectedProductId(parseInt(value))}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="选择产品" />
            </SelectTrigger>
            <SelectContent>
              {productDetails.map((product) => (
                <SelectItem key={product.productId} value={product.productId.toString()}>
                  {product.productName} ({product.productType})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Card>

        {selectedProduct && (
          <div>
            {/* 产品还款信息绑定 */}
            <Card className="p-6 mb-6 shadow-lg">
              <h2 className="text-xl font-semibold mb-4">产品还款信息</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">总授信金额</div>
                  <div className="text-2xl font-bold">
                    ¥{Number(selectedProduct.totalLoanAmount).toLocaleString('zh-CN', { 
                      minimumFractionDigits: 2, 
                      maximumFractionDigits: 2 
                    })}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">分期总期限</div>
                  <div className="text-2xl font-bold">{selectedProduct.totalPeriods} 期</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">每期应还金额</div>
                  <div className="text-2xl font-bold">
                    ¥{selectedProduct.totalPeriods > 0 
                      ? (Number(selectedProduct.totalLoanAmount + selectedProduct.totalInterest) / selectedProduct.totalPeriods).toLocaleString('zh-CN', { 
                          minimumFractionDigits: 2, 
                          maximumFractionDigits: 2 
                        })
                      : '0.00'}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">总利息</div>
                  <div className="text-2xl font-bold text-orange-600">
                    ¥{Number(selectedProduct.totalInterest).toLocaleString('zh-CN', { 
                      minimumFractionDigits: 2, 
                      maximumFractionDigits: 2 
                    })}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">还款起始日期</div>
                  <div className="text-lg font-semibold">
                    {selectedProduct.startDate 
                      ? format(parseISO(selectedProduct.startDate), 'yyyy年MM月dd日', { locale: zhCN })
                      : '-'}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">还款结束日期</div>
                  <div className="text-lg font-semibold">
                    {selectedProduct.endDate 
                      ? format(parseISO(selectedProduct.endDate), 'yyyy年MM月dd日', { locale: zhCN })
                      : '-'}
                  </div>
                </div>
              </div>
            </Card>

            {/* 还款进度条 */}
            <Card className="p-6 mb-6 shadow-lg">
              <h2 className="text-xl font-semibold mb-4">还款进度</h2>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-muted-foreground">
                      已还 {selectedProduct.paidPeriods} / {selectedProduct.totalPeriods} 期
                    </span>
                    <span className="text-sm font-semibold">
                      {selectedProduct.totalPeriods > 0
                        ? ((selectedProduct.paidPeriods / selectedProduct.totalPeriods) * 100).toFixed(1)
                        : 0}%
                    </span>
                  </div>
                  <Progress 
                    value={selectedProduct.totalPeriods > 0 
                      ? (selectedProduct.paidPeriods / selectedProduct.totalPeriods) * 100 
                      : 0} 
                    className="h-3" 
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">已还金额</div>
                    <div className="text-xl font-bold text-green-600">
                      ¥{Number(selectedProduct.paidAmount).toLocaleString('zh-CN', { 
                        minimumFractionDigits: 2, 
                        maximumFractionDigits: 2 
                      })}
                    </div>
                  </div>
                  <div className="p-4 bg-orange-50 rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">待还总金额</div>
                    <div className="text-xl font-bold text-orange-600">
                      ¥{Number(selectedProduct.remainingAmount).toLocaleString('zh-CN', { 
                        minimumFractionDigits: 2, 
                        maximumFractionDigits: 2 
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* 多维度可视化 */}
            <Tabs defaultValue="pie" className="mb-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="pie">
                  <PieChart className="h-4 w-4 mr-2" />
                  利息明细
                </TabsTrigger>
                <TabsTrigger value="line">
                  <LineChart className="h-4 w-4 mr-2" />
                  利息变化
                </TabsTrigger>
                <TabsTrigger value="calendar">
                  <CalendarDays className="h-4 w-4 mr-2" />
                  还款日历
                </TabsTrigger>
              </TabsList>

              <TabsContent value="pie" className="mt-4">
                <Card className="p-6 shadow-lg">
                  <h3 className="text-lg font-semibold mb-4">本金与利息占比</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => `¥${value.toLocaleString('zh-CN')}`} />
                      <Legend />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </Card>
              </TabsContent>

              <TabsContent value="line" className="mt-4">
                <Card className="p-6 shadow-lg">
                  <h3 className="text-lg font-semibold mb-4">每期利息变化趋势</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsLineChart data={lineChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="period" />
                      <YAxis />
                      <Tooltip formatter={(value: number) => `¥${value.toLocaleString('zh-CN')}`} />
                      <Legend />
                      <Line type="monotone" dataKey="interest" stroke="#8884d8" name="利息" />
                      <Line type="monotone" dataKey="principal" stroke="#82ca9d" name="本金" />
                      <Line type="monotone" dataKey="total" stroke="#ffc658" name="总额" />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                </Card>
              </TabsContent>

              <TabsContent value="calendar" className="mt-4">
                <Card className="p-6 shadow-lg">
                  <h3 className="text-lg font-semibold mb-4">还款日历</h3>
                  {upcomingPayments.length > 0 && (
                    <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="h-5 w-5 text-yellow-600" />
                        <span className="font-semibold text-yellow-800">还款提醒</span>
                      </div>
                      <div className="text-sm text-yellow-700">
                        您有 {upcomingPayments.length} 笔还款即将到期（3天内）：
                      </div>
                      <ul className="mt-2 space-y-1">
                        {upcomingPayments.map((item, index) => (
                          <li key={index} className="text-sm text-yellow-700">
                            {format(parseISO(item.date), 'yyyy-MM-dd', { locale: zhCN })} - 
                            第{item.periodNumber}期 - 
                            ¥{item.amount.toLocaleString('zh-CN')}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
                    {calendarData.map((item, index) => {
                      const dueDate = parseISO(item.date);
                      const today = new Date();
                      const isOverdue = isBefore(dueDate, today) && item.status === 'PENDING';
                      const isUpcoming = isBefore(dueDate, addDays(today, 3)) && isAfter(dueDate, today) && item.status === 'PENDING';
                      
                      return (
                        <div
                          key={index}
                          className={`p-3 border rounded-lg text-center ${
                            item.status === 'PAID'
                              ? 'bg-green-50 border-green-200'
                              : isOverdue
                              ? 'bg-red-50 border-red-200'
                              : isUpcoming
                              ? 'bg-yellow-50 border-yellow-200'
                              : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <div className="text-xs text-muted-foreground mb-1">
                            {format(dueDate, 'MM/dd', { locale: zhCN })}
                          </div>
                          <div className="text-sm font-semibold mb-1">
                            ¥{item.amount.toLocaleString('zh-CN')}
                          </div>
                          <div className="text-xs">
                            {item.status === 'PAID' ? (
                              <Badge className="bg-green-500 text-xs">已还</Badge>
                            ) : isOverdue ? (
                              <Badge variant="destructive" className="text-xs">逾期</Badge>
                            ) : (
                              <Badge variant="secondary" className="text-xs">待还</Badge>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              </TabsContent>
            </Tabs>

            {/* 提前还款测算 */}
            <Card className="p-6 mb-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">提前还款测算</h2>
                <Dialog open={prepayDialogOpen} onOpenChange={setPrepayDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Calculator className="h-4 w-4 mr-2" />
                      提前还款测算
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>提前还款测算</DialogTitle>
                      <DialogDescription>
                        输入提前还款金额，系统将自动计算可减免的利息和剩余还款金额
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                      <div>
                        <Label htmlFor="prepayAmount">提前还款金额（元）</Label>
                        <Input
                          id="prepayAmount"
                          type="number"
                          value={prepayAmount}
                          onChange={(e) => setPrepayAmount(e.target.value)}
                          placeholder="请输入提前还款金额"
                          className="mt-2"
                        />
                      </div>
                      <Button onClick={handlePrepayCalculate} disabled={calculating} className="w-full">
                        {calculating ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            计算中...
                          </>
                        ) : (
                          <>
                            <Calculator className="h-4 w-4 mr-2" />
                            开始测算
                          </>
                        )}
                      </Button>
                      {prepayCalculation && (
                        <div className="mt-4 p-4 bg-muted rounded-lg space-y-2">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <div className="text-sm text-muted-foreground">剩余本金</div>
                              <div className="text-lg font-semibold">
                                ¥{Number(prepayCalculation.remainingPrincipal).toLocaleString('zh-CN', { 
                                  minimumFractionDigits: 2, 
                                  maximumFractionDigits: 2 
                                })}
                              </div>
                            </div>
                            <div>
                              <div className="text-sm text-muted-foreground">剩余利息</div>
                              <div className="text-lg font-semibold">
                                ¥{Number(prepayCalculation.remainingInterest).toLocaleString('zh-CN', { 
                                  minimumFractionDigits: 2, 
                                  maximumFractionDigits: 2 
                                })}
                              </div>
                            </div>
                            <div>
                              <div className="text-sm text-muted-foreground">可减免利息</div>
                              <div className="text-lg font-semibold text-green-600">
                                ¥{Number(prepayCalculation.savedInterest).toLocaleString('zh-CN', { 
                                  minimumFractionDigits: 2, 
                                  maximumFractionDigits: 2 
                                })}
                              </div>
                            </div>
                            <div>
                              <div className="text-sm text-muted-foreground">提前还款后剩余金额</div>
                              <div className="text-lg font-semibold">
                                ¥{Number(prepayCalculation.newRemainingAmount).toLocaleString('zh-CN', { 
                                  minimumFractionDigits: 2, 
                                  maximumFractionDigits: 2 
                                })}
                              </div>
                            </div>
                            <div>
                              <div className="text-sm text-muted-foreground">减少期数</div>
                              <div className="text-lg font-semibold">
                                {prepayCalculation.reducedPeriods} 期
                              </div>
                            </div>
                            <div>
                              <div className="text-sm text-muted-foreground">提前还款后剩余期数</div>
                              <div className="text-lg font-semibold">
                                {prepayCalculation.newRemainingPeriods} 期
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </Card>

            {/* 还款记录查询 */}
            <Card className="p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">还款记录查询</h2>
                <Select value={timeRange} onValueChange={(value: '3M' | '6M' | 'ALL') => setTimeRange(value)}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3M">近3个月</SelectItem>
                    <SelectItem value="6M">近6个月</SelectItem>
                    <SelectItem value="ALL">全部</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {records.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  暂无还款记录
                </div>
              ) : (
                <div className="space-y-3">
                  {records.map((record) => (
                    <div key={record.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex-1">
                        <div className="font-semibold mb-1">
                          还款金额: ¥{Number(record.paymentAmount).toLocaleString('zh-CN', { 
                            minimumFractionDigits: 2, 
                            maximumFractionDigits: 2 
                          })}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          还款时间: {format(new Date(record.paymentTime), 'yyyy-MM-dd HH:mm:ss', { locale: zhCN })}
                        </div>
                        {record.paymentMethod && (
                          <div className="text-xs text-muted-foreground mt-1">
                            支付渠道: {record.paymentMethod}
                            {record.transactionId && ` | 交易流水: ${record.transactionId}`}
                          </div>
                        )}
                      </div>
                      <Badge className="bg-green-500">已还款</Badge>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        )}
    </div>
  );
}

