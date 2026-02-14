import api from '@/lib/api';

export interface DashboardStat {
  value: number;
  formatted: string;
  change: number;
}

export interface DashboardStats {
  totalUsers: DashboardStat;
  totalResellers: DashboardStat;
  totalOrders: DashboardStat;
  totalRevenue: DashboardStat;
  todayOrders: DashboardStat;
  pendingOrders: DashboardStat;
}

export interface SalesDataPoint {
  name: string;
  sales: number;
  orders: number;
}

export interface CategoryData {
  name: string;
  value: number;
  revenue: number;
  count: number;
}

export interface RecentOrder {
  id: string;
  customer: string;
  product: string;
  amount: number;
  status: 'completed' | 'pending' | 'cancelled';
  date: string;
  createdAt: string;
}

export interface RecentActivity {
  id: string;
  type: 'order' | 'user' | 'payout' | 'product';
  title: string;
  description: string;
  time: string;
  timestamp: string;
}

export interface DashboardStatsResponse {
  success: boolean;
  data: DashboardStats;
}

export interface SalesDataResponse {
  success: boolean;
  period: string;
  data: SalesDataPoint[];
}

export interface CategoryDataResponse {
  success: boolean;
  data: CategoryData[];
}

export interface RecentOrdersResponse {
  success: boolean;
  data: RecentOrder[];
}

export interface RecentActivityResponse {
  success: boolean;
  data: RecentActivity[];
}

// Get dashboard statistics
export const getDashboardStats = async (): Promise<DashboardStats> => {
  const response = await api.get<DashboardStatsResponse>('/dashboard/stats');
  return response.data.data;
};

// Get sales data (daily, weekly, monthly)
export const getSalesData = async (period: 'daily' | 'weekly' | 'monthly' = 'daily'): Promise<SalesDataPoint[]> => {
  const response = await api.get<SalesDataResponse>('/dashboard/sales', {
    params: { period }
  });
  return response.data.data;
};

// Get category distribution
export const getCategoryDistribution = async (): Promise<CategoryData[]> => {
  const response = await api.get<CategoryDataResponse>('/dashboard/categories');
  return response.data.data;
};

// Get recent orders
export const getRecentOrders = async (limit: number = 5): Promise<RecentOrder[]> => {
  const response = await api.get<RecentOrdersResponse>('/dashboard/recent-orders', {
    params: { limit }
  });
  return response.data.data;
};

// Get recent activity
export const getRecentActivity = async (limit: number = 5): Promise<RecentActivity[]> => {
  const response = await api.get<RecentActivityResponse>('/dashboard/recent-activity', {
    params: { limit }
  });
  return response.data.data;
};
