import api from '@/lib/api';

export interface OrderItem {
  product: {
    _id: string;
    name: string;
    image: string;
    images?: string[];
    price: number;
    originalPrice: number;
    description: string;
  };
  productName: string;
  quantity: number;
  price: number;
  resellerEarning: number;
}

export interface ShippingAddress {
  name: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

export interface Order {
  _id: string;
  orderId: string;
  customer: string;
  product: string;
  amount: number;
  reseller: string;
  paymentStatus: 'paid' | 'pending' | 'failed';
  orderStatus: 'processing' | 'ready_to_ship' | 'shipped' | 'delivered' | 'cancelled';
  date: string;
  items?: OrderItem[];
  shippingAddress?: ShippingAddress;
  totalAmount?: number;
  totalEarnings?: number;
  user?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    mobile: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface OrdersResponse {
  success: boolean;
  count: number;
  total: number;
  page: number;
  pages: number;
  data: Order[];
}

export interface OrderResponse {
  success: boolean;
  data: Order;
}

export interface OrderStatsResponse {
  success: boolean;
  data: {
    totalOrders: number;
    processingOrders: number;
    shippedOrders: number;
    deliveredOrders: number;
    cancelledOrders: number;
    paidOrders: number;
    pendingPayments: number;
    failedPayments: number;
    totalRevenue: number;
  };
}

export interface CreateOrderData {
  customer: string;
  product: string;
  amount: number;
  reseller: string;
  paymentStatus?: 'paid' | 'pending' | 'failed';
  orderStatus?: 'processing' | 'ready_to_ship' | 'shipped' | 'delivered' | 'cancelled';
}

export interface UpdateOrderData {
  customer?: string;
  product?: string;
  amount?: number;
  reseller?: string;
  paymentStatus?: 'paid' | 'pending' | 'failed';
  orderStatus?: 'processing' | 'ready_to_ship' | 'shipped' | 'delivered' | 'cancelled';
}

// Get all orders
export const getAllOrders = async (params?: {
  orderStatus?: string;
  paymentStatus?: string;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<OrdersResponse> => {
  const response = await api.get('/orders', { params });
  return response.data;
};

// Get order by ID
export const getOrderById = async (id: string): Promise<OrderResponse> => {
  const response = await api.get(`/orders/${id}`);
  return response.data;
};

// Create order
export const createOrder = async (orderData: CreateOrderData): Promise<OrderResponse> => {
  const response = await api.post('/orders', orderData);
  return response.data;
};

// Update order
export const updateOrder = async (id: string, orderData: UpdateOrderData): Promise<OrderResponse> => {
  const response = await api.put(`/orders/${id}`, orderData);
  return response.data;
};

// Update order status
export const updateOrderStatus = async (id: string, orderStatus: string): Promise<OrderResponse> => {
  const response = await api.patch(`/orders/${id}/status`, { orderStatus });
  return response.data;
};

// Delete order
export const deleteOrder = async (id: string): Promise<{ success: boolean; message: string }> => {
  const response = await api.delete(`/orders/${id}`);
  return response.data;
};

// Get order statistics
export const getOrderStats = async (): Promise<OrderStatsResponse> => {
  const response = await api.get('/orders/stats');
  return response.data;
};
