import axios from './axios';

// 统计数据类型定义
export interface Overview {
  totalUsers: number;
  totalApplications: number;
  pendingApplications: number;
  totalLoanAmount: string;
}

export interface UserGrowth {
  month: string;
  users: number;
}

export interface LoanStatus {
  name: string;
  value: number;
  color: string;
}

export interface LoanProduct {
  product: string;
  count: number;
}

export interface RepaymentStatus {
  month: string;
  onTime: number;
  late: number;
}

export interface FullStatistics {
  overview: Overview;
  userGrowth: UserGrowth[];
  loanStatus: LoanStatus[];
  loanProducts: LoanProduct[];
  repaymentStatus: RepaymentStatus[];
}

// 筛选参数类型
export interface StatisticsFilter {
  startDate?: string;  // 格式: YYYY-MM-DD
  endDate?: string;    // 格式: YYYY-MM-DD
  userType?: 'ALL' | 'STUDENT' | 'GRADUATE';
}

// 统计API服务
export const statisticsApi = {
  // 获取完整统计数据
  getFullStatistics: async (filter?: StatisticsFilter): Promise<FullStatistics> => {
    const response: any = await axios.get('/statistics/full', { params: filter });
    return response.data;
  },

  // 获取概览统计
  getOverview: async (filter?: StatisticsFilter): Promise<Overview> => {
    const response: any = await axios.get('/statistics/overview', { params: filter });
    return response.data;
  },

  // 获取用户增长数据
  getUserGrowth: async (filter?: StatisticsFilter): Promise<UserGrowth[]> => {
    const response: any = await axios.get('/statistics/user-growth', { params: filter });
    return response.data;
  },

  // 获取贷款状态分布
  getLoanStatus: async (filter?: StatisticsFilter): Promise<LoanStatus[]> => {
    const response: any = await axios.get('/statistics/loan-status', { params: filter });
    return response.data;
  },

  // 获取贷款产品分布
  getLoanProducts: async (filter?: StatisticsFilter): Promise<LoanProduct[]> => {
    const response: any = await axios.get('/statistics/loan-products', { params: filter });
    return response.data;
  },

  // 获取还款情况
  getRepaymentStatus: async (filter?: StatisticsFilter): Promise<RepaymentStatus[]> => {
    const response: any = await axios.get('/statistics/repayment-status', { params: filter });
    return response.data;
  },
};
