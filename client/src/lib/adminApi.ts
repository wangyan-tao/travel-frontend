import axios from '@/lib/axios';

export interface User {
  id: number;
  username: string;
  phone?: string;
  email?: string;
  role: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

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
  username: string;
}

export interface ApproveRequest {
  approvedAmount?: number;
  approvedPeriod?: number;
  approvalOpinion?: string;
}

export interface RejectRequest {
  rejectReason: string;
}

export interface PageResult<T> {
  records: T[];
  total: number;
  current: number;
  size: number;
  pages: number;
}

export const adminApi = {
  /**
   * 用户管理
   */
  users: {
    /**
     * 获取用户列表（分页）
     */
    getUsers: async (keyword?: string, role?: string, page: number = 1, size: number = 10): Promise<PageResult<User>> => {
      const params = new URLSearchParams();
      if (keyword) params.append('keyword', keyword);
      if (role) params.append('role', role);
      params.append('page', page.toString());
      params.append('size', size.toString());
      const response: any = await axios.get(`/admin/users?${params.toString()}`);
      if (response.code === 200) {
        return response.data;
      }
      throw new Error(response.message || '获取用户列表失败');
    },
    
    /**
     * 获取用户ID列表（用于快速切换）
     */
    getUserIds: async (role?: string): Promise<number[]> => {
      const params = new URLSearchParams();
      if (role) params.append('role', role);
      const response: any = await axios.get(`/admin/users/ids?${params.toString()}`);
      if (response.code === 200) {
        return response.data || [];
      }
      throw new Error(response.message || '获取用户ID列表失败');
    },

    /**
     * 获取用户详情
     */
    getUserById: async (id: number): Promise<User> => {
      const response: any = await axios.get(`/admin/users/${id}`);
      if (response.code === 200) {
        return response.data;
      }
      throw new Error(response.message || '获取用户详情失败');
    },

    /**
     * 启用用户
     */
    enableUser: async (id: number): Promise<void> => {
      const response: any = await axios.put(`/admin/users/${id}/enable`);
      if (response.code !== 200) {
        throw new Error(response.message || '启用用户失败');
      }
    },

    /**
     * 禁用用户
     */
    disableUser: async (id: number): Promise<void> => {
      const response: any = await axios.put(`/admin/users/${id}/disable`);
      if (response.code !== 200) {
        throw new Error(response.message || '禁用用户失败');
      }
    },
  },

  /**
   * 申请管理
   */
  applications: {
    /**
     * 获取申请列表（分页）
     */
    getApplications: async (keyword?: string, status?: string, page: number = 1, size: number = 10): Promise<PageResult<LoanApplicationDTO>> => {
      const params = new URLSearchParams();
      if (keyword) params.append('keyword', keyword);
      if (status) params.append('status', status);
      params.append('page', page.toString());
      params.append('size', size.toString());
      const response: any = await axios.get(`/admin/applications?${params.toString()}`);
      if (response.code === 200) {
        return response.data;
      }
      throw new Error(response.message || '获取申请列表失败');
    },
    
    /**
     * 获取申请ID列表（用于快速切换）
     */
    getApplicationIds: async (status?: string): Promise<number[]> => {
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      const response: any = await axios.get(`/admin/applications/ids?${params.toString()}`);
      if (response.code === 200) {
        return response.data || [];
      }
      throw new Error(response.message || '获取申请ID列表失败');
    },

    /**
     * 获取申请详情
     */
    getApplicationById: async (id: number): Promise<LoanApplicationDTO> => {
      const response: any = await axios.get(`/admin/applications/${id}`);
      if (response.code === 200) {
        return response.data;
      }
      throw new Error(response.message || '获取申请详情失败');
    },

    /**
     * 审批申请
     */
    approveApplication: async (id: number, data: ApproveRequest): Promise<void> => {
      const response: any = await axios.post(`/admin/applications/${id}/approve`, data);
      if (response.code !== 200) {
        throw new Error(response.message || '审批申请失败');
      }
    },

    /**
     * 拒绝申请
     */
    rejectApplication: async (id: number, data: RejectRequest): Promise<void> => {
      const response: any = await axios.post(`/admin/applications/${id}/reject`, data);
      if (response.code !== 200) {
        throw new Error(response.message || '拒绝申请失败');
      }
    },
  },

  /**
   * 证书审批管理
   */
  certificates: {
    /**
     * 获取证书列表（分页）
     */
    getCertificates: async (keyword?: string, status?: string, page: number = 1, size: number = 10): Promise<PageResult<CertificateDTO>> => {
      const params = new URLSearchParams();
      if (keyword) params.append('keyword', keyword);
      if (status) params.append('status', status);
      params.append('page', page.toString());
      params.append('size', size.toString());
      const response: any = await axios.get(`/admin/certificates?${params.toString()}`);
      if (response.code === 200) {
        return response.data;
      }
      throw new Error(response.message || '获取证书列表失败');
    },

    /**
     * 获取证书详情
     */
    getCertificateById: async (id: number): Promise<CertificateDTO> => {
      const response: any = await axios.get(`/admin/certificates/${id}`);
      if (response.code === 200) {
        return response.data;
      }
      throw new Error(response.message || '获取证书详情失败');
    },

    /**
     * 审批通过
     */
    approveCertificate: async (id: number, data: { approvalOpinion?: string }): Promise<void> => {
      const response: any = await axios.post(`/admin/certificates/${id}/approve`, data);
      if (response.code !== 200) {
        throw new Error(response.message || '审批失败');
      }
    },

    /**
     * 审批拒绝
     */
    rejectCertificate: async (id: number, data: { approvalOpinion?: string }): Promise<void> => {
      const response: any = await axios.post(`/admin/certificates/${id}/reject`, data);
      if (response.code !== 200) {
        throw new Error(response.message || '拒绝失败');
      }
    },
  },
};

export interface CertificateDTO {
  id: number;
  userId: number;
  username?: string;
  certificateType: string;
  certificateTypeName: string;
  certificateName: string;
  certificateUrl: string;
  description: string;
  status: string;
  statusName: string;
  approverId?: number;
  approvalOpinion?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

