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

export interface RecognitionResponse {
  success: boolean;
  data: Recognition;
  message?: string;
}

export interface CreateRecognitionData {
  name: string;
  logo: string;
  description?: string;
  order?: number;
  externalLink?: string;
  isActive?: boolean;
}

// Get all active recognitions (public)
export const getAllRecognitions = async (): Promise<RecognitionsResponse> => {
  const response = await api.get<RecognitionsResponse>('/recognitions');
  return response.data;
};

// Get all recognitions (admin)
export const getAllRecognitionsAdmin = async (): Promise<RecognitionsResponse> => {
  const response = await api.get<RecognitionsResponse>('/recognitions/admin/all');
  return response.data;
};

// Get single recognition
export const getRecognitionById = async (id: string): Promise<RecognitionResponse> => {
  const response = await api.get<RecognitionResponse>(`/recognitions/${id}`);
  return response.data;
};

// Create recognition
export const createRecognition = async (
  data: CreateRecognitionData | FormData
): Promise<RecognitionResponse> => {
  const response = await api.post<RecognitionResponse>('/recognitions', data, {
    headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {}
  });
  return response.data;
};

// Update recognition
export const updateRecognition = async (
  id: string,
  data: Partial<CreateRecognitionData> | FormData
): Promise<RecognitionResponse> => {
  const response = await api.put<RecognitionResponse>(`/recognitions/${id}`, data, {
    headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {}
  });
  return response.data;
};

// Delete recognition
export const deleteRecognition = async (id: string): Promise<RecognitionResponse> => {
  const response = await api.delete<RecognitionResponse>(`/recognitions/${id}`);
  return response.data;
};

// Toggle recognition status
export const toggleRecognitionStatus = async (
  id: string,
  isActive: boolean
): Promise<RecognitionResponse> => {
  const response = await api.put<RecognitionResponse>(`/recognitions/${id}`, {
    isActive: !isActive,
  });
  return response.data;
};

// Bulk update recognitions
export const bulkUpdateRecognitions = async (
  recognitions: Partial<Recognition>[]
): Promise<RecognitionsResponse> => {
  const response = await api.put<RecognitionsResponse>('/recognitions/bulk/update', {
    recognitions,
  });
  return response.data;
};
