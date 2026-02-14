const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:7777/api';

export interface HeroSlideButton {
  text: string;
  link: string;
  variant: 'primary' | 'secondary' | 'outline';
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

// Get all active hero slides (public)
export const getHeroSlides = async (): Promise<HeroSlidesResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/hero-slides`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch hero slides');
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to fetch hero slides. Please try again.');
  }
};
