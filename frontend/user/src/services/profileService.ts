import api from '../lib/api';

export interface TeamMember {
  _id: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  mobile: string;
  role: string;
  status: string;
  createdAt: string;
  myReferralCode: string;
  profileImage?: string;
  level: number;
  teamCount: number;
  totalTeamSize: number;
  children: TeamMember[];
}

export interface TeamResponse {
  success: boolean;
  data: TeamMember;
}

export interface Address {
  _id: string;
  user: string;
  name: string;
  mobile: string;
  pincode: string;
  locality: string;
  address: string;
  city: string;
  state: string;
  landmark?: string;
  alternatePhone?: string;
  addressType: 'home' | 'work';
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AddressResponse {
  success: boolean;
  count?: number;
  data: Address | Address[];
  message?: string;
}

export interface UserProfile {
  _id: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  mobile: string;
  phone: string;
  gender: 'male' | 'female' | 'other';
  profileImage?: string;
  myReferralCode?: string;
  referredBy?: string;
  role: string;
  status: string;
  totalOrders: number;
  totalEarnings: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfileResponse {
  success: boolean;
  data: UserProfile;
  message?: string;
}

// Get current user profile
export const getCurrentUserProfile = async (): Promise<UserProfileResponse> => {
  const response = await api.get('/users/profile');
  return response.data;
};

// Update user profile
export const updateUserProfile = async (data: {
  firstName?: string;
  lastName?: string;
  gender?: string;
  profileImage?: string;
}): Promise<UserProfileResponse> => {
  const response = await api.put('/users/profile', data);
  return response.data;
};

// Update user email
export const updateUserEmail = async (email: string): Promise<UserProfileResponse> => {
  const response = await api.put('/users/profile/email', { email });
  return response.data;
};

// Update user mobile
export const updateUserMobile = async (mobile: string): Promise<UserProfileResponse> => {
  const response = await api.put('/users/profile/mobile', { mobile });
  return response.data;
};

// Get user addresses
export const getUserAddresses = async (): Promise<AddressResponse> => {
  const response = await api.get('/users/profile/addresses');
  return response.data;
};

// Add new address
export const addUserAddress = async (addressData: Omit<Address, '_id' | 'user' | 'createdAt' | 'updatedAt'>): Promise<AddressResponse> => {
  const response = await api.post('/users/profile/addresses', addressData);
  return response.data;
};

// Update address
export const updateUserAddress = async (addressId: string, addressData: Partial<Address>): Promise<AddressResponse> => {
  const response = await api.put(`/users/profile/addresses/${addressId}`, addressData);
  return response.data;
};

// Delete address
export const deleteUserAddress = async (addressId: string): Promise<{ success: boolean; message: string }> => {
  const response = await api.delete(`/users/profile/addresses/${addressId}`);
  return response.data;
};

// Get user team hierarchy
export const getUserTeam = async (userId: string): Promise<TeamResponse> => {
  const response = await api.get(`/users/${userId}/team`);
  return response.data;
};

// Get commissions from a specific team member
export const getCommissionsFromMember = async (memberId: string) => {
  const response = await api.get(`/commissions/my-commissions?sellerId=${memberId}`);
  return response.data;
};

// Get team commission earnings (sum of commissions from team hierarchy)
export const getTeamCommissionEarnings = async (userId: string) => {
  const response = await api.get(`/users/${userId}/team-commission-earnings`);
  return response.data;
};

// Get user payout status
export const getUserPayoutStatus = async () => {
  const response = await api.get('/users/profile/payout-status');
  return response.data;
};
