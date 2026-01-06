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
};

