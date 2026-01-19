import axios from '@/lib/axios';

export interface OverdueUser {
  userId: number;
  username: string;
  phone: string;
  riskLevel: string;
  overdueAmount: number;
  overdueDays: number;
  productName: string;
  lastRepaymentDate?: string;
}

export interface OverdueStatistics {
  totalRiskUsers: number;
  totalOverdueAmount: number;
  averageOverdueDays: number;
  highRiskUsers: number;
  riskLevelDistribution: Array<{
    name: string;
    value: number;
    amount: number;
  }>;
  overdueTrend: Array<{
    month: string;
    overdueCount: number;
    overdueAmount: number;
  }>;
  overdueDaysDistribution: Array<{
    range: string;
    count: number;
  }>;
}

export interface SendNotificationRequest {
  title: string;
  content: string;
  type: string;
}

export interface RepaymentTimelineEvent {
  id: number;
  date: string;
  status: 'NORMAL' | 'LOW_RISK' | 'MEDIUM_RISK' | 'HIGH_RISK' | 'CRITICAL_RISK' | 'PAID_OFF';
  statusLabel: string;
  overdueAmount?: number;
  overdueDays?: number;
  description: string;
  action?: string;
}

// Mock数据
const MOCK_OVERDUE_USERS: OverdueUser[] = [
  {
    userId: 1001,
    username: '张三',
    phone: '13800138001',
    riskLevel: '高风险',
    overdueAmount: 50000,
    overdueDays: 45,
    productName: '旅游贷款产品A',
    lastRepaymentDate: '2024-01-15',
  },
  {
    userId: 1002,
    username: '李四',
    phone: '13800138002',
    riskLevel: '严重风险',
    overdueAmount: 120000,
    overdueDays: 120,
    productName: '旅游贷款产品B',
    lastRepaymentDate: '2023-11-20',
  },
  {
    userId: 1003,
    username: '王五',
    phone: '13800138003',
    riskLevel: '中风险',
    overdueAmount: 30000,
    overdueDays: 25,
    productName: '旅游贷款产品A',
    lastRepaymentDate: '2024-02-01',
  },
  {
    userId: 1004,
    username: '赵六',
    phone: '13800138004',
    riskLevel: '低风险',
    overdueAmount: 15000,
    overdueDays: 10,
    productName: '旅游贷款产品C',
    lastRepaymentDate: '2024-02-15',
  },
  {
    userId: 1005,
    username: '钱七',
    phone: '13800138005',
    riskLevel: '高风险',
    overdueAmount: 80000,
    overdueDays: 60,
    productName: '旅游贷款产品B',
    lastRepaymentDate: '2024-01-10',
  },
  {
    userId: 1006,
    username: '孙八',
    phone: '13800138006',
    riskLevel: '严重风险',
    overdueAmount: 150000,
    overdueDays: 150,
    productName: '旅游贷款产品A',
    lastRepaymentDate: '2023-10-05',
  },
  {
    userId: 1007,
    username: '周九',
    phone: '13800138007',
    riskLevel: '中风险',
    overdueAmount: 40000,
    overdueDays: 30,
    productName: '旅游贷款产品C',
    lastRepaymentDate: '2024-01-25',
  },
  {
    userId: 1008,
    username: '吴十',
    phone: '13800138008',
    riskLevel: '低风险',
    overdueAmount: 20000,
    overdueDays: 8,
    productName: '旅游贷款产品A',
    lastRepaymentDate: '2024-02-18',
  },
  {
    userId: 1009,
    username: '郑十一',
    phone: '13800138009',
    riskLevel: '高风险',
    overdueAmount: 90000,
    overdueDays: 75,
    productName: '旅游贷款产品B',
    lastRepaymentDate: '2023-12-20',
  },
  {
    userId: 1010,
    username: '王十二',
    phone: '13800138010',
    riskLevel: '中风险',
    overdueAmount: 35000,
    overdueDays: 28,
    productName: '旅游贷款产品C',
    lastRepaymentDate: '2024-01-28',
  },
];

const MOCK_STATISTICS: OverdueStatistics = {
  totalRiskUsers: 10,
  totalOverdueAmount: 610000,
  averageOverdueDays: 55,
  highRiskUsers: 4,
  riskLevelDistribution: [
    { name: '低风险', value: 2, amount: 35 },
    { name: '中风险', value: 3, amount: 105 },
    { name: '高风险', value: 3, amount: 220 },
    { name: '严重风险', value: 2, amount: 270 },
  ],
  overdueTrend: [
    { month: '2023-09', overdueCount: 5, overdueAmount: 250 },
    { month: '2023-10', overdueCount: 6, overdueAmount: 280 },
    { month: '2023-11', overdueCount: 7, overdueAmount: 320 },
    { month: '2023-12', overdueCount: 8, overdueAmount: 380 },
    { month: '2024-01', overdueCount: 9, overdueAmount: 450 },
    { month: '2024-02', overdueCount: 10, overdueAmount: 610 },
  ],
  overdueDaysDistribution: [
    { range: '1-30天', count: 3 },
    { range: '31-60天', count: 2 },
    { range: '61-90天', count: 2 },
    { range: '91-120天', count: 1 },
    { range: '120天以上', count: 2 },
  ],
};

export const overdueApi = {
  /**
   * 获取逾期用户列表
   */
  getOverdueUsers: async (keyword?: string, riskLevel?: string): Promise<OverdueUser[]> => {
    const params = new URLSearchParams();
    if (keyword) params.append('keyword', keyword);
    if (riskLevel) params.append('riskLevel', riskLevel);
    
    const response: any = await axios.get(`/admin/overdue/users?${params.toString()}`);
    if (response.code === 200) {
      // 转换后端数据格式到前端格式
      return (response.data || []).map((item: any) => ({
        userId: item.userId,
        username: item.username,
        phone: item.phone,
        riskLevel: item.riskLevel,
        overdueAmount: typeof item.overdueAmount === 'number' 
          ? item.overdueAmount 
          : parseFloat(item.overdueAmount || '0'),
        overdueDays: item.overdueDays,
        productName: item.productName,
        lastRepaymentDate: item.lastRepaymentDate,
      }));
    }
    throw new Error(response.message || '获取逾期用户列表失败');
  },

  /**
   * 获取统计数据
   */
  getStatistics: async (): Promise<OverdueStatistics> => {
    const response: any = await axios.get('/admin/overdue/statistics');
    if (response.code === 200) {
      const data = response.data;
      // 转换后端数据格式到前端格式
      return {
        totalRiskUsers: data.totalRiskUsers || 0,
        totalOverdueAmount: typeof data.totalOverdueAmount === 'number' 
          ? data.totalOverdueAmount 
          : parseFloat(data.totalOverdueAmount || '0'),
        averageOverdueDays: data.averageOverdueDays || 0,
        highRiskUsers: data.highRiskUsers || 0,
        riskLevelDistribution: (data.riskLevelDistribution || []).map((item: any) => ({
          name: item.name,
          value: item.value,
          amount: typeof item.amount === 'number' ? item.amount : parseFloat(item.amount || '0') / 10000,
        })),
        overdueTrend: (data.overdueTrend || []).map((item: any) => ({
          month: item.month,
          overdueCount: item.overdueCount,
          overdueAmount: typeof item.overdueAmount === 'number' 
            ? item.overdueAmount / 10000 
            : parseFloat(item.overdueAmount || '0') / 10000,
        })),
        overdueDaysDistribution: data.overdueDaysDistribution || [],
      };
    }
    throw new Error(response.message || '获取统计数据失败');
  },

  /**
   * 发送通知
   */
  sendNotification: async (userId: number, data: SendNotificationRequest): Promise<void> => {
    const response: any = await axios.post(`/admin/notifications/send`, {
      userId,
      ...data,
    });
    if (response.code !== 200) {
      throw new Error(response.message || '发送通知失败');
    }
  },

  /**
   * 获取用户还款流程时间线
   */
  getUserRepaymentTimeline: async (userId: number): Promise<RepaymentTimelineEvent[]> => {
    try {
      const response: any = await axios.get(`/admin/overdue/users/${userId}/timeline`);
      if (response.code === 200) {
        return response.data || [];
      }
      throw new Error(response.message || '获取时间线失败');
    } catch (error: any) {
      // 如果API调用失败，返回模拟数据
      console.warn('API调用失败，使用模拟数据:', error);
      return generateMockTimeline(userId);
    }
  },
};

/**
 * 生成模拟的用户还款流程时间线数据
 */
function generateMockTimeline(userId: number): RepaymentTimelineEvent[] {
  // 根据不同的用户ID生成不同的时间线数据
  const baseDate = new Date('2023-08-01');
  const timelines: Record<number, RepaymentTimelineEvent[]> = {
    1001: [
      {
        id: 1,
        date: '2023-08-01',
        status: 'NORMAL',
        statusLabel: '正常状态',
        description: '用户成功申请贷款，贷款金额 ¥50,000，开始正常还款',
        action: '贷款申请通过，放款成功',
      },
      {
        id: 2,
        date: '2023-09-15',
        status: 'NORMAL',
        statusLabel: '正常状态',
        description: '按时完成第1期还款，还款金额 ¥5,000',
        action: '正常还款',
      },
      {
        id: 3,
        date: '2023-10-15',
        status: 'NORMAL',
        statusLabel: '正常状态',
        description: '按时完成第2期还款，还款金额 ¥5,000',
        action: '正常还款',
      },
      {
        id: 4,
        date: '2023-11-20',
        status: 'LOW_RISK',
        statusLabel: '低风险',
        overdueAmount: 5000,
        overdueDays: 3,
        description: '第3期还款逾期3天，逾期金额 ¥5,000',
        action: '系统自动发送提醒通知',
      },
      {
        id: 5,
        date: '2023-11-25',
        status: 'NORMAL',
        statusLabel: '正常状态',
        description: '用户补缴逾期款项，恢复正常状态',
        action: '补缴还款',
      },
      {
        id: 6,
        date: '2023-12-15',
        status: 'NORMAL',
        statusLabel: '正常状态',
        description: '按时完成第4期还款，还款金额 ¥5,000',
        action: '正常还款',
      },
      {
        id: 7,
        date: '2024-01-15',
        status: 'MEDIUM_RISK',
        statusLabel: '中风险',
        overdueAmount: 10000,
        overdueDays: 8,
        description: '第5期还款逾期8天，累计逾期金额 ¥10,000',
        action: '人工客服介入，电话催收',
      },
      {
        id: 8,
        date: '2024-01-25',
        status: 'HIGH_RISK',
        statusLabel: '高风险',
        overdueAmount: 25000,
        overdueDays: 18,
        description: '逾期情况持续恶化，累计逾期金额 ¥25,000，逾期天数达到18天',
        action: '升级风险等级，发送正式催收函',
      },
      {
        id: 9,
        date: '2024-02-15',
        status: 'HIGH_RISK',
        statusLabel: '高风险',
        overdueAmount: 50000,
        overdueDays: 39,
        description: '逾期金额持续增长至 ¥50,000，逾期天数39天',
        action: '启动法律程序准备',
      },
    ],
    1002: [
      {
        id: 1,
        date: '2023-07-01',
        status: 'NORMAL',
        statusLabel: '正常状态',
        description: '用户成功申请贷款，贷款金额 ¥120,000，开始正常还款',
        action: '贷款申请通过，放款成功',
      },
      {
        id: 2,
        date: '2023-08-01',
        status: 'NORMAL',
        statusLabel: '正常状态',
        description: '按时完成第1期还款，还款金额 ¥10,000',
        action: '正常还款',
      },
      {
        id: 3,
        date: '2023-09-01',
        status: 'LOW_RISK',
        statusLabel: '低风险',
        overdueAmount: 10000,
        overdueDays: 4,
        description: '第2期还款逾期4天，逾期金额 ¥10,000',
        action: '系统自动发送提醒通知',
      },
      {
        id: 4,
        date: '2023-09-11',
        status: 'MEDIUM_RISK',
        statusLabel: '中风险',
        overdueAmount: 20000,
        overdueDays: 9,
        description: '逾期情况恶化，累计逾期金额 ¥20,000，逾期天数9天',
        action: '人工客服介入',
      },
      {
        id: 5,
        date: '2023-09-21',
        status: 'HIGH_RISK',
        statusLabel: '高风险',
        overdueAmount: 40000,
        overdueDays: 19,
        description: '逾期金额增长至 ¥40,000，逾期天数19天',
        action: '发送正式催收函',
      },
      {
        id: 6,
        date: '2023-10-11',
        status: 'HIGH_RISK',
        statusLabel: '高风险',
        overdueAmount: 80000,
        overdueDays: 49,
        description: '逾期情况严重，累计逾期金额 ¥80,000，逾期天数49天',
        action: '启动法律程序',
      },
      {
        id: 7,
        date: '2023-11-20',
        status: 'HIGH_RISK',
        statusLabel: '高风险',
        overdueAmount: 120000,
        overdueDays: 89,
        description: '逾期金额达到 ¥120,000，逾期天数89天',
        action: '委托第三方催收机构',
      },
    ],
    1003: [
      {
        id: 1,
        date: '2023-09-01',
        status: 'NORMAL',
        statusLabel: '正常状态',
        description: '用户成功申请贷款，贷款金额 ¥30,000，开始正常还款',
        action: '贷款申请通过，放款成功',
      },
      {
        id: 2,
        date: '2023-10-01',
        status: 'NORMAL',
        statusLabel: '正常状态',
        description: '按时完成第1期还款，还款金额 ¥3,000',
        action: '正常还款',
      },
      {
        id: 3,
        date: '2023-11-01',
        status: 'LOW_RISK',
        statusLabel: '低风险',
        overdueAmount: 3000,
        overdueDays: 2,
        description: '第2期还款逾期2天，逾期金额 ¥3,000',
        action: '系统自动发送提醒通知',
      },
      {
        id: 4,
        date: '2023-11-08',
        status: 'MEDIUM_RISK',
        statusLabel: '中风险',
        overdueAmount: 6000,
        overdueDays: 7,
        description: '逾期情况持续，累计逾期金额 ¥6,000，逾期天数7天',
        action: '人工客服介入，电话催收',
      },
      {
        id: 5,
        date: '2023-11-18',
        status: 'HIGH_RISK',
        statusLabel: '高风险',
        overdueAmount: 15000,
        overdueDays: 17,
        description: '逾期金额增长至 ¥15,000，逾期天数17天',
        action: '发送正式催收函',
      },
      {
        id: 6,
        date: '2024-02-01',
        status: 'HIGH_RISK',
        statusLabel: '高风险',
        overdueAmount: 30000,
        overdueDays: 92,
        description: '逾期金额达到 ¥30,000，逾期天数92天',
        action: '启动法律程序准备',
      },
    ],
    1004: [
      {
        id: 1,
        date: '2023-10-01',
        status: 'NORMAL',
        statusLabel: '正常状态',
        description: '用户成功申请贷款，贷款金额 ¥15,000，开始正常还款',
        action: '贷款申请通过，放款成功',
      },
      {
        id: 2,
        date: '2023-11-01',
        status: 'NORMAL',
        statusLabel: '正常状态',
        description: '按时完成第1期还款，还款金额 ¥1,500',
        action: '正常还款',
      },
      {
        id: 3,
        date: '2024-02-05',
        status: 'LOW_RISK',
        statusLabel: '低风险',
        overdueAmount: 1500,
        overdueDays: 4,
        description: '第2期还款逾期4天，逾期金额 ¥1,500',
        action: '系统自动发送提醒通知',
      },
      {
        id: 4,
        date: '2024-02-11',
        status: 'MEDIUM_RISK',
        statusLabel: '中风险',
        overdueAmount: 3000,
        overdueDays: 10,
        description: '逾期天数达到10天，累计逾期金额 ¥3,000',
        action: '人工客服介入',
      },
    ],
    1005: [
      {
        id: 1,
        date: '2023-08-15',
        status: 'NORMAL',
        statusLabel: '正常状态',
        description: '用户成功申请贷款，贷款金额 ¥80,000，开始正常还款',
        action: '贷款申请通过，放款成功',
      },
      {
        id: 2,
        date: '2023-09-15',
        status: 'NORMAL',
        statusLabel: '正常状态',
        description: '按时完成第1期还款，还款金额 ¥8,000',
        action: '正常还款',
      },
      {
        id: 3,
        date: '2023-10-15',
        status: 'LOW_RISK',
        statusLabel: '低风险',
        overdueAmount: 8000,
        overdueDays: 1,
        description: '第2期还款逾期1天，逾期金额 ¥8,000',
        action: '系统自动发送提醒通知',
      },
      {
        id: 4,
        date: '2023-10-22',
        status: 'MEDIUM_RISK',
        statusLabel: '中风险',
        overdueAmount: 16000,
        overdueDays: 6,
        description: '逾期天数达到6天，累计逾期金额 ¥16,000',
        action: '人工客服介入',
      },
      {
        id: 5,
        date: '2023-11-01',
        status: 'HIGH_RISK',
        statusLabel: '高风险',
        overdueAmount: 32000,
        overdueDays: 15,
        description: '逾期金额增长至 ¥32,000，逾期天数15天',
        action: '发送正式催收函',
      },
      {
        id: 6,
        date: '2024-01-10',
        status: 'HIGH_RISK',
        statusLabel: '高风险',
        overdueAmount: 80000,
        overdueDays: 85,
        description: '逾期金额达到 ¥80,000，逾期天数85天',
        action: '启动法律程序准备',
      },
    ],
  };

  // 如果没有特定用户的时间线，生成一个通用的时间线
  if (!timelines[userId]) {
    return [
      {
        id: 1,
        date: '2023-08-01',
        status: 'NORMAL',
        statusLabel: '正常状态',
        description: '用户成功申请贷款，开始正常还款',
        action: '贷款申请通过，放款成功',
      },
      {
        id: 2,
        date: '2023-09-15',
        status: 'LOW_RISK',
        statusLabel: '低风险',
        overdueAmount: 5000,
        overdueDays: 3,
        description: '首次出现逾期，逾期金额 ¥5,000，逾期天数3天',
        action: '系统自动发送提醒通知',
      },
      {
        id: 3,
        date: '2023-09-25',
        status: 'MEDIUM_RISK',
        statusLabel: '中风险',
        overdueAmount: 15000,
        overdueDays: 8,
        description: '逾期情况恶化，累计逾期金额 ¥15,000，逾期天数8天',
        action: '人工客服介入',
      },
      {
        id: 4,
        date: '2023-10-10',
        status: 'HIGH_RISK',
        statusLabel: '高风险',
        overdueAmount: 30000,
        overdueDays: 23,
        description: '逾期金额增长至 ¥30,000，逾期天数23天',
        action: '发送正式催收函',
      },
      {
        id: 5,
        date: '2024-01-15',
        status: 'HIGH_RISK',
        statusLabel: '高风险',
        overdueAmount: 50000,
        overdueDays: 117,
        description: '逾期金额达到 ¥50,000，逾期天数117天',
        action: '启动法律程序准备',
      },
    ];
  }

  return timelines[userId];
}

