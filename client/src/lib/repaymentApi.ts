import axios from '@/lib/axios';

export interface RepaymentOverview {
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  totalPeriods: number;
  paidPeriods: number;
  nextPaymentDate?: string;
  nextPaymentAmount?: number;
}

export interface RepaymentPlan {
  id: number;
  applicationId: number;
  periodNumber: number;
  dueDate: string;
  principalAmount: number;
  interestAmount: number;
  totalAmount: number;
  status: 'PENDING' | 'PAID' | 'OVERDUE';
  createdAt: string;
  updatedAt: string;
}

export interface RepaymentPlanDTO {
  plan: RepaymentPlan;
  applicationId: number;
  loanAmount: number;
  productName: string;
}

export interface RepaymentRecord {
  id: number;
  planId: number;
  applicationId: number;
  userId: number;
  paymentAmount: number;
  paymentTime: string;
  paymentMethod?: string;
  transactionId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductRepaymentDetail {
  productId: number;
  productName: string;
  productType: string;
  totalLoanAmount: number;
  totalPeriods: number;
  paidPeriods: number;
  remainingPeriods: number;
  totalPrincipal: number;
  totalInterest: number;
  paidPrincipal: number;
  paidInterest: number;
  paidAmount: number;
  remainingAmount: number;
  startDate: string;
  endDate: string;
  plans: RepaymentPlan[];
}

export interface PrepayCalculation {
  prepayAmount: number;
  remainingPrincipal: number;
  remainingInterest: number;
  remainingAmount: number;
  remainingPeriods: number;
  savedInterest: number;
  newRemainingAmount: number;
  newRemainingPeriods: number;
  reducedPeriods: number;
}

export const repaymentApi = {
  /**
   * 获取还款概览
   */
  getOverview: async (): Promise<RepaymentOverview> => {
    const response: any = await axios.get('/repayment/overview');
    if (response.code === 200) {
      return response.data;
    }
    throw new Error(response.message || '获取还款概览失败');
  },

  /**
   * 获取用户所有还款计划
   */
  getPlans: async (): Promise<RepaymentPlanDTO[]> => {
    const response: any = await axios.get('/repayment/plans');
    if (response.code === 200) {
      return response.data;
    }
    throw new Error(response.message || '获取还款计划失败');
  },

  /**
   * 根据申请ID获取还款计划
   */
  getPlansByApplicationId: async (applicationId: number): Promise<RepaymentPlan[]> => {
    const response: any = await axios.get(`/repayment/plans/application/${applicationId}`);
    if (response.code === 200) {
      return response.data;
    }
    throw new Error(response.message || '获取还款计划失败');
  },

  /**
   * 获取还款记录
   */
  getRecords: async (): Promise<RepaymentRecord[]> => {
    const response: any = await axios.get('/repayment/records');
    if (response.code === 200) {
      return response.data;
    }
    throw new Error(response.message || '获取还款记录失败');
  },

  /**
   * 按时间维度查询还款记录
   * @param timeRange 时间范围：3M-近3个月, 6M-近6个月, ALL-全部
   */
  getRecordsByTimeRange: async (timeRange: '3M' | '6M' | 'ALL' = 'ALL'): Promise<RepaymentRecord[]> => {
    const response: any = await axios.get('/repayment/records/time-range', {
      params: { timeRange },
    });
    if (response.code === 200) {
      return response.data;
    }
    throw new Error(response.message || '获取还款记录失败');
  },

  /**
   * 按产品分组的还款详情
   */
  getProductRepaymentDetails: async (): Promise<ProductRepaymentDetail[]> => {
    const response: any = await axios.get('/repayment/product-details');
    if (response.code === 200) {
      return response.data;
    }
    throw new Error(response.message || '获取产品还款详情失败');
  },

  /**
   * 提前还款测算
   */
  calculatePrepayment: async (applicationId: number, prepayAmount: number): Promise<PrepayCalculation> => {
    const response: any = await axios.post('/repayment/prepay/calculate', null, {
      params: { applicationId, prepayAmount },
    });
    if (response.code === 200) {
      return response.data;
    }
    throw new Error(response.message || '提前还款测算失败');
  },

  /**
   * 执行还款
   * @param planId 还款计划ID
   * @param paymentMethod 支付方式：ALIPAY-支付宝, WECHAT-微信
   */
  executeRepayment: async (planId: number, paymentMethod: 'ALIPAY' | 'WECHAT'): Promise<RepaymentRecord> => {
    const response: any = await axios.post('/repayment/pay', null, {
      params: { planId, paymentMethod },
    });
    if (response.code === 200) {
      return response.data;
    }
    throw new Error(response.message || '还款失败');
  },
};

