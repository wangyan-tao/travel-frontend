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
};

