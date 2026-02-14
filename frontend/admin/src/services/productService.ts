import api from '@/lib/api';

export interface Product {
  _id: string;
  productId: string;
  name: string;
  image: string;
  category: string;
  price: number;
  originalPrice?: number;
  commission: number;
  resellerEarning?: number;
  stock: 'in_stock' | 'low_stock' | 'out_of_stock';
  active: boolean;
  description?: string;
  stockQuantity: number;
  images?: string[];
  features?: string[];
  brand?: string;
  tags?: string[];
  weight?: string;
  dimensions?: string;
  type?: string;
  mfgDate?: string;
  lifespan?: string;
  sizes?: { size: string; measurement: string; inStock: boolean }[];
  colors?: { name: string; hexCode: string; inStock: boolean }[];
  isNew?: boolean;
  isPopular?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductsResponse {
  success: boolean;
  count: number;
  total: number;
  page: number;
  pages: number;
  data: Product[];
}

export interface ProductResponse {
  success: boolean;
  data: Product;
}

export interface ProductStatsResponse {
  success: boolean;
  data: {
    totalProducts: number;
    activeProducts: number;
    inactiveProducts: number;
    inStock: number;
    lowStock: number;
    outOfStock: number;
    categoryStats: Array<{ _id: string; count: number }>;
  };
}

export interface CreateProductData {
  name: string;
  image?: string;
  category: string;
  price: number;
  commission: number;
  stock?: 'in_stock' | 'low_stock' | 'out_of_stock';
  active?: boolean;
  description?: string;
  stockQuantity?: number;
  originalPrice?: number;
  images?: string[];
  features?: string[] | string;
  brand?: string;
  tags?: string[] | string;
  weight?: string;
  dimensions?: string;
  type?: string;
  mfgDate?: string;
  lifespan?: string;
  isNew?: boolean;
  isPopular?: boolean;
}

export interface UpdateProductData {
  name?: string;
  image?: string;
  category?: string;
  price?: number;
  commission?: number;
  stock?: 'in_stock' | 'low_stock' | 'out_of_stock';
  active?: boolean;
  description?: string;
  stockQuantity?: number;
}

// Get all products
export const getAllProducts = async (params?: {
  category?: string;
  stock?: string;
  active?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<ProductsResponse> => {
  const response = await api.get('/products', { params });
  return response.data;
};

// Get product by ID
export const getProductById = async (id: string): Promise<ProductResponse> => {
  const response = await api.get(`/products/${id}`);
  return response.data;
};

// Create product
export const createProduct = async (productData: CreateProductData): Promise<ProductResponse> => {
  const response = await api.post('/products', productData);
  return response.data;
};

// Update product
export const updateProduct = async (id: string, productData: UpdateProductData): Promise<ProductResponse> => {
  const response = await api.put(`/products/${id}`, productData);
  return response.data;
};

// Toggle product status
export const toggleProductStatus = async (id: string): Promise<ProductResponse> => {
  const response = await api.patch(`/products/${id}/toggle`);
  return response.data;
};

// Update product stock
export const updateProductStock = async (
  id: string, 
  stockData: { stock?: string; stockQuantity?: number }
): Promise<ProductResponse> => {
  const response = await api.patch(`/products/${id}/stock`, stockData);
  return response.data;
};

// Delete product
export const deleteProduct = async (id: string): Promise<{ success: boolean; message: string }> => {
  const response = await api.delete(`/products/${id}`);
  return response.data;
};

// Get product statistics
export const getProductStats = async (): Promise<ProductStatsResponse> => {
  const response = await api.get('/products/stats');
  return response.data;
};
