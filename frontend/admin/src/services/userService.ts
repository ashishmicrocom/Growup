import api from '@/lib/api';

export interface User {
  profileImage: any;
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: 'user' | 'admin';
  status: 'active' | 'blocked';
  joinedDate: string;
  totalOrders: number;
  totalEarnings: number;
  totalCommissionEarned?: number;
  createdAt: string;
  updatedAt: string;
  myReferralCode?: string;
  referredBy?: string;
}

export interface TeamMember {
  _id: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  mobile: string;
  role: string;
  status: string;
  createdAt: string;
  myReferralCode: string;
  profileImage?: string;
  totalEarnings?: number;
  level: number;
  teamCount: number;
  totalTeamSize: number;
  totalTeamEarnings?: number;
  children: TeamMember[];
}

export interface TeamEarningsResponse {
  success: boolean;
  data: {
    userId: string;
    userName: string;
    userEmail: string;
    personalEarnings: number;
    teamEarnings: number;
    totalEarnings: number;
  };
}

export interface TeamCommissionEarningsResponse {
  success: boolean;
  data: {
    userId: string;
    userName: string;
    userEmail: string;
    directCommissionEarned: number;
    referralCommissionEarned: number;
    teamCommissionBreakdown: {
      credited: number;
      pending: number;
      cancelled: number;
      total: number;
    };
    totalCommissionEarned: number;
  };
}

export interface UsersResponse {
  success: boolean;
  count: number;
  total: number;
  page: number;
  pages: number;
  data: User[];
}

export interface UserResponse {
  success: boolean;
  data: User;
}

export interface UserStatsResponse {
  success: boolean;
  data: {
    totalUsers: number;
    activeUsers: number;
    blockedUsers: number;
    totalResellers: number;
    regularUsers: number;
  };
}

export interface CreateUserData {
  name: string;
  email: string;
  phone: string;
  password: string;
  role?: 'user' | 'admin';
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  phone?: string;
  role?: 'user' | 'admin';
}

// Get all users
export const getAllUsers = async (params?: {
  role?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<UsersResponse> => {
  const response = await api.get('/users', { params });
  return response.data;
};

// Get user by ID
export const getUserById = async (id: string): Promise<UserResponse> => {
  const response = await api.get(`/users/${id}`);
  return response.data;
};

// Create user
export const createUser = async (userData: CreateUserData): Promise<UserResponse> => {
  const response = await api.post('/users', userData);
  return response.data;
};

// Update user
export const updateUser = async (id: string, userData: UpdateUserData): Promise<UserResponse> => {
  const response = await api.put(`/users/${id}`, userData);
  return response.data;
};

// Toggle user status
export const toggleUserStatus = async (id: string): Promise<UserResponse> => {
  const response = await api.patch(`/users/${id}/status`);
  return response.data;
};

// Delete user
export const deleteUser = async (id: string): Promise<{ success: boolean; message: string }> => {
  const response = await api.delete(`/users/${id}`);
  return response.data;
};

// Get user statistics
export const getUserStats = async (): Promise<UserStatsResponse> => {
  const response = await api.get('/users/stats');
  return response.data;
};

// Get user team hierarchy
export const getUserTeam = async (id: string): Promise<{ success: boolean; data: TeamMember }> => {
  const response = await api.get(`/users/${id}/team`);
  return response.data;
};

// Get commissions for a specific user or from a specific seller
export const getUserCommissions = async (params: {
  userId?: string;
  sellerId?: string;
  status?: string;
  page?: number;
  limit?: number;
}) => {
  const queryParams = new URLSearchParams();
  if (params.userId) queryParams.append('recipientId', params.userId);
  if (params.sellerId) queryParams.append('sellerId', params.sellerId);
  if (params.status) queryParams.append('status', params.status);
  if (params.page) queryParams.append('page', params.page.toString());
  if (params.limit) queryParams.append('limit', params.limit.toString());
  
  const response = await api.get(`/commissions?${queryParams.toString()}`);
  return response.data;
};

// Get user team earnings
export const getUserTeamEarnings = async (id: string): Promise<TeamEarningsResponse> => {
  const response = await api.get(`/users/${id}/team-earnings`);
  return response.data;
};

// Get user team commission earnings (sum of commissions from team hierarchy)
export const getUserTeamCommissionEarnings = async (id: string): Promise<TeamCommissionEarningsResponse> => {
  const response = await api.get(`/users/${id}/team-commission-earnings`);
  return response.data;
};

// Get user payout status (admin access)
export const getUserPayoutStatus = async (id: string) => {
  const response = await api.get(`/users/${id}/payout-status`);
  return response.data;
};
