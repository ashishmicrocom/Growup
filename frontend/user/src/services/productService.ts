import api from '../lib/api';

export interface Product {
  _id: string;
  id: string;
  productId: string;
  name: string;
  category: string;
  price: number;
  originalPrice: number;
  commission: number;
  resellerEarning: number;
  image: string;
  images: string[];
  description: string;
  features: string[];
  brand?: string;
  tags?: string[];
  weight?: string;
  dimensions?: string;
  type?: string;
  mfgDate?: string;
  lifespan?: string;
  stock: 'in_stock' | 'low_stock' | 'out_of_stock';
  active: boolean;
  stockQuantity: number;
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

export interface GetProductsParams {
  category?: string;
  search?: string;
  sortBy?: 'popular' | 'new' | 'price-low' | 'price-high';
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
}

// Get all public products
export const getPublicProducts = async (params?: GetProductsParams): Promise<ProductsResponse> => {
  const response = await api.get('/products/public', { params });
  return response.data;
};

// Get public product by ID
export const getPublicProductById = async (id: string): Promise<ProductResponse> => {
  const response = await api.get(`/products/public/${id}`);
  return response.data;
};
