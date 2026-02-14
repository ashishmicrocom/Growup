import api from '../lib/api';

export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface ContactResponse {
  success: boolean;
  message: string;
}

// Send contact form
export const sendContactForm = async (formData: ContactFormData): Promise<ContactResponse> => {
  const response = await api.post('/contact', formData);
  return response.data;
};
