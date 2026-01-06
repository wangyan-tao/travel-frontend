import axios from '@/lib/axios';

export interface LoanApplication {
  id: number;
  userId: number;
  productId: number;
  applyAmount: number;
  applyTerm: number;
  purpose?: string;
  status: string;
  applyTime?: string;
  approveTime?: string;
  rejectReason?: string;
  approverId?: number;
  loanAmount?: number;
  loanTime?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoanApplicationDTO {
  application: LoanApplication;
  productName: string;
}

export const applicationApi = {
  /**
   * 获取我的申请列表
   */
  getMyApplications: async (): Promise<LoanApplicationDTO[]> => {
    const response: any = await axios.get('/loan/my-applications');
    if (response.code === 200) {
      return response.data || [];
    }
    throw new Error(response.message || '获取申请列表失败');
  },

  /**
   * 获取申请详情
   */
  getApplicationById: async (id: number): Promise<LoanApplicationDTO> => {
    const response: any = await axios.get(`/loan/applications/${id}`);
    if (response.code === 200) {
      return response.data;
    }
    throw new Error(response.message || '获取申请详情失败');
  },

  /**
   * 取消申请
   */
  cancelApplication: async (id: number): Promise<void> => {
    const response: any = await axios.put(`/loan/applications/${id}/cancel`);
    if (response.code !== 200) {
      throw new Error(response.message || '取消申请失败');
    }
  },
};

