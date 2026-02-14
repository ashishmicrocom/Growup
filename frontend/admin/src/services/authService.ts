import api from '@/lib/api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  phone: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: User;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export interface UpdateProfileData {
  name?: string;
  phone?: string;
}

// Login
export const login = async (credentials: LoginCredentials): Promise<LoginResponse['data']> => {
  const response = await api.post<LoginResponse>('/auth/admin-login', credentials);
  if (response.data.data.token) {
    localStorage.setItem('admin_token', response.data.data.token);
    localStorage.setItem('admin_user', JSON.stringify(response.data.data.user));
  }
  return response.data.data;
};

// Logout
export const logout = async (): Promise<void> => {
  await api.post('/auth/logout');
  localStorage.removeItem('admin_token');
  localStorage.removeItem('admin_user');
};

// Get current user
export const getMe = async (): Promise<User> => {
  const response = await api.get<AuthResponse>('/auth/me');
  return response.data.data!;
};

// Change password
export const changePassword = async (data: ChangePasswordData): Promise<void> => {
  await api.put('/auth/change-password', data);
};

// Update profile
export const updateProfile = async (data: UpdateProfileData): Promise<User> => {
  const response = await api.put<AuthResponse>('/auth/profile', data);
  if (response.data.data) {
    localStorage.setItem('admin_user', JSON.stringify(response.data.data));
  }
  return response.data.data!;
};

// Get stored token
export const getToken = (): string | null => {
  return localStorage.getItem('admin_token');
};

// Get stored user
export const getStoredUser = (): User | null => {
  const user = localStorage.getItem('admin_user');
  return user ? JSON.parse(user) : null;
};
