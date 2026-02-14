import api from '@/lib/api';

export interface Recognition {
  _id: string;
  name: string;
  logo: string;
  description?: string;
  order: number;
  externalLink?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RecognitionsResponse {
  success: boolean;
  count: number;
  data: Recognition[];
}

// Get all active recognitions (public)
export const getAllRecognitions = async (): Promise<RecognitionsResponse> => {
  const response = await api.get<RecognitionsResponse>('/recognitions');
  return response.data;
};
