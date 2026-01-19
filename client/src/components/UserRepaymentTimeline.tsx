import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, AlertTriangle, XCircle, Circle } from 'lucide-react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { type RepaymentTimelineEvent } from '@/lib/overdueApi';

interface UserRepaymentTimelineProps {
  events: RepaymentTimelineEvent[];
  username: string;
}

const STATUS_CONFIG: Record<string, { color: string; icon: React.ReactNode; bgColor: string }> = {
  NORMAL: {
    color: 'text-green-600',
    icon: <CheckCircle2 className="h-5 w-5" />,
    bgColor: 'bg-green-100',
  },
  LOW_RISK: {
    color: 'text-blue-600',
    icon: <Circle className="h-5 w-5" />,
    bgColor: 'bg-blue-100',
  },
  MEDIUM_RISK: {
    color: 'text-yellow-600',
    icon: <Clock className="h-5 w-5" />,
    bgColor: 'bg-yellow-100',
  },
  HIGH_RISK: {
    color: 'text-orange-600',
    icon: <AlertTriangle className="h-5 w-5" />,
    bgColor: 'bg-orange-100',
  },
  CRITICAL_RISK: {
    color: 'text-red-600',
    icon: <XCircle className="h-5 w-5" />,
    bgColor: 'bg-red-100',
  },
  PAID_OFF: {
    color: 'text-green-600',
    icon: <CheckCircle2 className="h-5 w-5" />,
    bgColor: 'bg-green-100',
  },
};

export default function UserRepaymentTimeline({ events, username }: UserRepaymentTimelineProps) {
  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">用户还款流程时间线</h3>
        <p className="text-sm text-muted-foreground">用户：{username}</p>
      </div>
      <div className="relative">
        {/* 时间线连接线 */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />
        
        {/* 时间线事件 */}
        <div className="space-y-6">
          {events.map((event, index) => {
            const config = STATUS_CONFIG[event.status] || STATUS_CONFIG.NORMAL;
            const isLast = index === events.length - 1;
            
            return (
              <div key={event.id} className="relative flex items-start gap-4">
                {/* 时间线节点 */}
                <div className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full ${config.bgColor} ${config.color} border-2 border-background shadow-sm`}>
                  {config.icon}
                </div>
                
                {/* 内容卡片 */}
                <Card className="flex-1 p-4 shadow-sm">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge 
                          variant={
                            event.status === 'PAID_OFF' ? 'default' :
                            event.status === 'CRITICAL_RISK' || event.status === 'HIGH_RISK' ? 'destructive' :
                            event.status === 'MEDIUM_RISK' ? 'secondary' : 'outline'
                          }
                          className="font-semibold"
                        >
                          {event.statusLabel}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(event.date), 'yyyy年MM月dd日', { locale: zhCN })}
                        </span>
                      </div>
                      <p className="text-sm text-foreground mb-2">{event.description}</p>
                      {(event.overdueAmount !== undefined || event.overdueDays !== undefined) && (
                        <div className="flex gap-4 text-xs text-muted-foreground">
                          {event.overdueAmount !== undefined && (
                            <span>逾期金额：<span className="font-semibold text-red-600">¥{event.overdueAmount.toLocaleString()}</span></span>
                          )}
                          {event.overdueDays !== undefined && (
                            <span>逾期天数：<span className="font-semibold">{event.overdueDays}天</span></span>
                          )}
                        </div>
                      )}
                      {event.action && (
                        <div className="mt-2 text-xs text-muted-foreground">
                          操作：{event.action}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

