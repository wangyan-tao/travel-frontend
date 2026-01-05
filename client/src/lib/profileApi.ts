import axios from './axios';

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

export interface UserIdentity {
  id: number;
  userId: number;
  realName: string;
  idCard: string;
  studentId: string;
  university: string;
  major: string;
  grade?: string;
  idCardFrontUrl?: string;
  idCardBackUrl?: string;
  studentCardUrl?: string;
  verificationStatus?: string;
  verifiedAt?: string;
}

export interface Guarantor {
  id: number;
  userId: number;
  name: string;
  idCard: string;
  relationship?: string;
  phone?: string;
  workUnit?: string;
  idCardFrontUrl?: string;
  idCardBackUrl?: string;
  agreementSigned?: boolean;
  agreementSignedAt?: string;
}

export interface LoanApplication {
  id: number;
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

export interface ProfileData {
  user: User | null;
  identity: UserIdentity | null;
  guarantor: Guarantor | null;
  loans: LoanApplication[];
  identityVerified: boolean;
  guarantorCompleted: boolean;
}

export const profileApi = {
  getMe: async (): Promise<ProfileData> => {
    const res: any = await axios.get('/profile/me');
    // axios 拦截器已经返回了 response.data，所以 res 就是 Result 对象
    if (res.code === 200 && res.data) {
      return res.data;
    }
    throw new Error(res.message || '获取个人信息失败');
  },
};
