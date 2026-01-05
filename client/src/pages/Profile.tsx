import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { profileApi, type ProfileData, type LoanApplication } from '@/lib/profileApi';

export default function Profile() {
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ProfileData | null>(null);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      setLoading(true);
      const res = await profileApi.getMe();
      setData(res);
      if (!res.identityVerified) {
        toast.warning('未完成实名信息，请尽快提交');
      }
      if (!res.guarantorCompleted) {
        toast.warning('未完善担保人信息，请尽快提交');
      }
    } catch (e: any) {
      toast.error(e.message || '加载个人信息失败');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 rounded-full border-2 border-primary animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">正在加载个人信息...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">加载失败</p>
          <Button onClick={load}>重试</Button>
        </div>
      </div>
    );
  }

  const renderStatus = (ok: boolean, okText: string, failText: string) => (
    <Badge variant={ok ? 'default' : 'destructive'}>{ok ? okText : failText}</Badge>
  );

  const normalizeUrl = (u?: string | null) => {
    if (!u) return '';
    return u.startsWith('http://') || u.startsWith('https://') ? u : `https://${u}`;
  };

  const loans = (data.loans ?? []).slice(0, 5);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">个人信息</h1>
          <p className="text-muted-foreground">查看与完善实名、担保人及贷款相关信息</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">账户信息</h2>
              <Badge>{data.user?.role === 'ADMIN' ? '管理员' : '普通用户'}</Badge>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">用户名</span>
                <span>{data.user?.username}</span>
              </div>
              {data.user?.email && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">邮箱</span>
                  <span>{data.user?.email}</span>
                </div>
              )}
              {data.user?.phone && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">手机号</span>
                  <span>{data.user?.phone}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">状态</span>
                {renderStatus(data.user?.status === 'ACTIVE', '正常', '禁用')}
              </div>
            </div>
          </Card>

          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">实名信息</h2>
              {renderStatus(data.identityVerified, '已认证', '未认证')}
            </div>
            {data.identity ? (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">姓名</span>
                  <span>{data.identity.realName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">身份证号</span>
                  <span>{data.identity.idCard}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">学号</span>
                  <span>{data.identity.studentId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">学校</span>
                  <span>{data.identity.university}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">专业</span>
                  <span>{data.identity.major}</span>
                </div>
                <div className="flex gap-2 pt-2">
                  {data.identity.idCardFrontUrl && (
                    <a href={normalizeUrl(data.identity.idCardFrontUrl)} target="_blank" rel="noopener noreferrer">
                      <img
                        src={normalizeUrl(data.identity.idCardFrontUrl)}
                        alt="身份证正面"
                        className="h-20 w-28 object-cover rounded border"
                        onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')}
                      />
                    </a>
                  )}
                  {data.identity.idCardBackUrl && (
                    <a href={normalizeUrl(data.identity.idCardBackUrl)} target="_blank" rel="noopener noreferrer">
                      <img
                        src={normalizeUrl(data.identity.idCardBackUrl)}
                        alt="身份证反面"
                        className="h-20 w-28 object-cover rounded border"
                        onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')}
                      />
                    </a>
                  )}
                  {data.identity.studentCardUrl && (
                    <a href={normalizeUrl(data.identity.studentCardUrl)} target="_blank" rel="noopener noreferrer">
                      <img
                        src={normalizeUrl(data.identity.studentCardUrl)}
                        alt="学生证"
                        className="h-20 w-28 object-cover rounded border"
                        onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')}
                      />
                    </a>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">未提交实名信息</p>
                <Button onClick={() => setLocation('/identity-verification')}>去提交实名信息</Button>
              </div>
            )}
          </Card>

          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">担保人信息</h2>
              {renderStatus(data.guarantorCompleted, '已完善', '未完善')}
            </div>
            {data.guarantor ? (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">姓名</span>
                  <span>{data.guarantor.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">身份证号</span>
                  <span>{data.guarantor.idCard}</span>
                </div>
                {data.guarantor.relationship && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">关系</span>
                    <span>{data.guarantor.relationship}</span>
                  </div>
                )}
                {data.guarantor.phone && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">电话</span>
                    <span>{data.guarantor.phone}</span>
                  </div>
                )}
                {data.guarantor.workUnit && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">工作单位</span>
                    <span>{data.guarantor.workUnit}</span>
                  </div>
                )}
                <div className="flex gap-2 pt-2">
                  {data.guarantor.idCardFrontUrl && (
                    <a href={normalizeUrl(data.guarantor.idCardFrontUrl)} target="_blank" rel="noopener noreferrer">
                      <img
                        src={normalizeUrl(data.guarantor.idCardFrontUrl)}
                        alt="身份证正面"
                        className="h-20 w-28 object-cover rounded border"
                        onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')}
                      />
                    </a>
                  )}
                  {data.guarantor.idCardBackUrl && (
                    <a href={normalizeUrl(data.guarantor.idCardBackUrl)} target="_blank" rel="noopener noreferrer">
                      <img
                        src={normalizeUrl(data.guarantor.idCardBackUrl)}
                        alt="身份证反面"
                        className="h-20 w-28 object-cover rounded border"
                        onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')}
                      />
                    </a>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">未提交担保人信息</p>
                <Button onClick={() => setLocation('/guarantor-info')}>去完善担保人信息</Button>
              </div>
            )}
          </Card>
        </div>

        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">贷款信息</h2>
            {loans.length === 0 && (
              <Button variant="outline" onClick={() => setLocation('/loan-products')}>去选择贷款产品</Button>
            )}
          </div>
          {loans.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {loans.map((loan: LoanApplication) => (
                <Card key={loan.id} className="p-4 space-y-2">
                  {loan.applyTime && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">申请时间</span>
                      <span className="text-sm">{loan.applyTime}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">申请金额</span>
                    <span className="text-sm">¥{Number(loan.applyAmount).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">期限</span>
                    <span className="text-sm">{loan.applyTerm}月</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">状态</span>
                    {renderStatus(
                      loan.status === 'APPROVED' || loan.status === 'DISBURSED' || loan.status === 'COMPLETED',
                      '进行中',
                      loan.status === 'REJECTED' ? '已拒绝' : '审批中'
                    )}
                  </div>
                  <div className="flex items-center justify-end">
                    <Button variant="outline" size="sm" onClick={() => setLocation(`/loan-application/${loan.id}`)}>
                      查看详情
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">暂无贷款记录</div>
          )}
        </Card>
      </div>
    </div>
  );
}
