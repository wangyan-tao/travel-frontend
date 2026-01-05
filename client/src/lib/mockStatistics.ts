import { FullStatistics } from './statisticsApi';

export const MOCK_STATISTICS: FullStatistics = {
  overview: {
    totalUsers: 1250,
    totalApplications: 85,
    pendingApplications: 12,
    totalLoanAmount: "5,200,000"
  },
  userGrowth: [
    { month: '2023-01', users: 100 },
    { month: '2023-02', users: 150 },
    { month: '2023-03', users: 280 },
    { month: '2023-04', users: 390 },
    { month: '2023-05', users: 520 },
    { month: '2023-06', users: 680 },
  ],
  loanStatus: [
    { name: '待审核', value: 12, color: '#f59e0b' },
    { name: '已批准', value: 65, color: '#10b981' },
    { name: '已拒绝', value: 8, color: '#ef4444' },
  ],
  loanProducts: [
    { product: '毕业旅行贷', count: 40 },
    { product: '短期出游贷', count: 25 },
    { product: '特惠学生贷', count: 20 },
  ],
  repaymentStatus: [
    { month: '2023-01', onTime: 80, late: 5 },
    { month: '2023-02', onTime: 85, late: 3 },
    { month: '2023-03', onTime: 90, late: 2 },
  ]
};
