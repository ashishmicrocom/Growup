import api from '@/lib/api';

export interface Category {
  _id: string;
  name: string;
  description?: string;
  icon?: string;
  parentCategory?: Category | null;
  subcategories?: Category[];
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CategoriesResponse {
  success: boolean;
  count: number;
  total: number;
  data: Category[];
}

export interface CategoryResponse {
  success: boolean;
  data: Category;
}

export interface CreateCategoryData {
  name: string;
  parentCategory?: string | null;
  description?: string;
  icon?: string;
  active?: boolean;
}

export interface UpdateCategoryData {
  name?: string;
  description?: string;
  parentCategory?: string | null;
  icon?: string;
  active?: boolean;
}

// Get all categories (Public)
export const getPublicCategories = async (): Promise<CategoriesResponse> => {
  const response = await api.get('/categories/public');
  return response.data;
};

// Get all categories (Admin)
export const getAllCategories = async (params?: {
  parentOnly?: boolean;
  search?: string;
  active?: boolean;
}): Promise<CategoriesResponse> => {
  const response = await api.get('/categories', { params });
  return response.data;
};

// Get category by ID
export const getCategoryById = async (id: string): Promise<CategoryResponse> => {
  const response = await api.get(`/categories/${id}`);
  return response.data;
};

// Create category
export const createCategory = async (categoryData: CreateCategoryData): Promise<CategoryResponse> => {
  const response = await api.post('/categories', categoryData);
  return response.data;
};

// Update category
export const updateCategory = async (id: string, categoryData: UpdateCategoryData): Promise<CategoryResponse> => {
  const response = await api.put(`/categories/${id}`, categoryData);
  return response.data;
};

// Delete category
export const deleteCategory = async (id: string): Promise<{ success: boolean; message: string }> => {
  const response = await api.delete(`/categories/${id}`);
  return response.data;
};

// Toggle category status
export const toggleCategoryStatus = async (id: string): Promise<CategoryResponse> => {
  const response = await api.patch(`/categories/${id}/toggle-status`);
  return response.data;
};
