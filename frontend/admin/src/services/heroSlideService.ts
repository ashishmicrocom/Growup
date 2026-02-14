import api from '@/lib/api';

export interface HeroSlideButton {
  text: string;
  link: string;
  variant: string;
}

export interface HeroSlideFeature {
  text: string;
  icon: string;
}

export interface HeroSlide {
  _id: string;
  subtitle: string;
  text: string;
  description: string;
  image: string;
  ctaButtons: HeroSlideButton[];
  features: HeroSlideFeature[];
  order: number;
  contentAlignment: 'left' | 'right';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface HeroSlidesResponse {
  success: boolean;
  count: number;
  data: HeroSlide[];
}

export interface HeroSlideResponse {
  success: boolean;
  data: HeroSlide;
}

export interface CreateHeroSlideData {
  subtitle: string;
  text: string;
  description: string;
  image: string;
  ctaButtons: HeroSlideButton[];
  features: HeroSlideFeature[];
  order?: number;
  contentAlignment?: 'left' | 'right';
  isActive?: boolean;
}

export interface UpdateHeroSlideData {
  subtitle?: string;
  text?: string;
  description?: string;
  image?: string;
  ctaButtons?: HeroSlideButton[];
  features?: HeroSlideFeature[];
  contentAlignment?: 'left' | 'right';
  order?: number;
  isActive?: boolean;
}

// Get all hero slides (admin)
export const getAllHeroSlides = async (): Promise<HeroSlidesResponse> => {
  const response = await api.get('/hero-slides/admin');
  return response.data;
};

// Get hero slide by ID
export const getHeroSlideById = async (id: string): Promise<HeroSlideResponse> => {
  const response = await api.get(`/hero-slides/${id}`);
  return response.data;
};

// Create hero slide
export const createHeroSlide = async (slideData: CreateHeroSlideData): Promise<HeroSlideResponse> => {
  const response = await api.post('/hero-slides', slideData);
  return response.data;
};

// Update hero slide
export const updateHeroSlide = async (id: string, slideData: UpdateHeroSlideData): Promise<HeroSlideResponse> => {
  const response = await api.put(`/hero-slides/${id}`, slideData);
  return response.data;
};

// Delete hero slide
export const deleteHeroSlide = async (id: string): Promise<{ success: boolean; message: string }> => {
  const response = await api.delete(`/hero-slides/${id}`);
  return response.data;
};

// Toggle hero slide status
export const toggleHeroSlideStatus = async (id: string): Promise<HeroSlideResponse> => {
  const response = await api.patch(`/hero-slides/${id}/toggle`);
  return response.data;
};
