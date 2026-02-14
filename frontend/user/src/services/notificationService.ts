import api from '@/lib/api';

export interface Notification {
  _id: string;
  userId: string;
  type: 'contact_reply' | 'order_update' | 'commission' | 'payout' | 'general';
  title: string;
  message: string;
  relatedId?: string;
  relatedModel?: string;
  read: boolean;
  link?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationsResponse {
  success: boolean;
  count: number;
  total: number;
  unreadCount: number;
  page: number;
  pages: number;
  data: Notification[];
}

// Get notifications
export const getNotifications = async (params?: {
  page?: number;
  limit?: number;
  read?: boolean;
}): Promise<NotificationsResponse> => {
  const response = await api.get('/notifications', { params });
  return response.data;
};

// Mark notification as read
export const markNotificationAsRead = async (id: string): Promise<void> => {
  await api.patch(`/notifications/${id}/read`);
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async (): Promise<void> => {
  await api.patch('/notifications/read-all');
};

// Delete notification
export const deleteNotification = async (id: string): Promise<void> => {
  await api.delete(`/notifications/${id}`);
};
