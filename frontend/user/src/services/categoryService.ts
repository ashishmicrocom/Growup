import api from '@/lib/utils';

export interface Category {
  _id: string;
  name: string;
  description?: string;
  icon?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CategoriesResponse {
  success: boolean;
  count: number;
  data: Category[];
}

// Get all active categories (Public)
export const getPublicCategories = async (): Promise<CategoriesResponse> => {
  const response = await api.get('/categories/public');
  return response.data;
};
