import api from '@/lib/api';

export interface Payout {
  _id: string;
  payoutId: string;
  reseller: string;
  amount: number;
  status: 'completed' | 'pending' | 'processing' | 'failed';
  method: 'Bank Transfer' | 'UPI' | 'Wallet' | 'Check';
  date: string;
  formattedDate: string;
  transactionId?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EarningsStats {
  totalCommissions: number;
  totalCommissionsFormatted: string;
  totalCommissionsChange: number;
  pendingPayouts: number;
  pendingPayoutsFormatted: string;
  pendingPayoutsChange: number;
  paidPayouts: number;
  paidPayoutsFormatted: string;
  paidPayoutsChange: number;
  growthRate: number;
  growthRateFormatted: string;
  growthRateChange: number;
}

export interface EarningsTrend {
  month: string;
  earnings: number;
  payouts: number;
}

export interface TopReseller {
  name: string;
  earnings: number;
  orders: number;
  payout: 'paid' | 'pending';
}

export interface PayoutsResponse {
  success: boolean;
  count: number;
  total: number;
  page: number;
  pages: number;
  data: Payout[];
}

export interface PayoutResponse {
  success: boolean;
  data: Payout;
}

export interface EarningsStatsResponse {
  success: boolean;
  data: EarningsStats;
}

export interface EarningsTrendResponse {
  success: boolean;
  data: EarningsTrend[];
}

export interface TopResellersResponse {
  success: boolean;
  data: TopReseller[];
}

// Get earnings statistics
export const getEarningsStats = async (): Promise<EarningsStats> => {
  const response = await api.get<EarningsStatsResponse>('/earnings/stats');
  return response.data.data;
};

// Get earnings trend (monthly data)
export const getEarningsTrend = async (months: number = 6): Promise<EarningsTrend[]> => {
  const response = await api.get<EarningsTrendResponse>('/earnings/trend', {
    params: { months }
  });
  return response.data.data;
};

// Get top resellers
export const getTopResellers = async (limit: number = 5): Promise<TopReseller[]> => {
  const response = await api.get<TopResellersResponse>('/earnings/top-resellers', {
    params: { limit }
  });
  return response.data.data;
};

// Get all payouts with filters
export const getAllPayouts = async (params?: {
  page?: number;
  limit?: number;
  status?: string;
  method?: string;
  search?: string;
}): Promise<PayoutsResponse> => {
  const response = await api.get<PayoutsResponse>('/earnings/payouts', { params });
  return response.data;
};

// Get single payout by ID
export const getPayoutById = async (id: string): Promise<Payout> => {
  const response = await api.get<PayoutResponse>(`/earnings/payouts/${id}`);
  return response.data.data;
};

// Create new payout
export const createPayout = async (data: Partial<Payout>): Promise<Payout> => {
  const response = await api.post<PayoutResponse>('/earnings/payouts', data);
  return response.data.data;
};

// Update payout
export const updatePayout = async (id: string, data: Partial<Payout>): Promise<Payout> => {
  const response = await api.put<PayoutResponse>(`/earnings/payouts/${id}`, data);
  return response.data.data;
};

// Update payout status
export const updatePayoutStatus = async (id: string, status: Payout['status']): Promise<Payout> => {
  const response = await api.patch<PayoutResponse>(`/earnings/payouts/${id}/status`, { status });
  return response.data.data;
};

// Delete payout
export const deletePayout = async (id: string): Promise<void> => {
  await api.delete(`/earnings/payouts/${id}`);
};
