const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:7777/api';

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  gender: string;
  password: string;
  profileImage?: string;
  referralCode?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  mobile: string;
  gender: string;
  profileImage?: string;
  myReferralCode?: string;
  referredBy?: string;
  role: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

export interface OTPResponse {
  success: boolean;
  message: string;
  data: {
    userId?: string;
    email: string;
    requiresVerification: boolean;
  };
}

export interface CheckEmailResponse {
  success: boolean;
  data: {
    exists: boolean;
  };
}

// Register a new user (sends OTP)
export const registerUser = async (userData: RegisterData): Promise<OTPResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Registration failed');
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Registration failed. Please try again.');
  }
};

// Verify email with OTP
export const verifyEmail = async (email: string, otp: string): Promise<AuthResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/verify-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ email, otp }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Email verification failed');
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Email verification failed. Please try again.');
  }
};

// Login user (sends OTP)
export const loginUser = async (credentials: LoginData): Promise<OTPResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(credentials),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Login failed. Please try again.');
  }
};

// Verify login OTP
export const verifyLoginOTP = async (email: string, otp: string): Promise<AuthResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/verify-login-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ email, otp }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'OTP verification failed');
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('OTP verification failed. Please try again.');
  }
};

// Logout user
export const logoutUser = async (token: string): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || 'Logout failed');
    }
  } catch (error) {
    console.error('Logout error:', error);
    // Don't throw error on logout, just log it
  }
};

// Check if email exists
export const checkEmailExists = async (email: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/check-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const data: CheckEmailResponse = await response.json();

    if (!response.ok) {
      return false;
    }

    return data.data.exists;
  } catch (error) {
    console.error('Check email error:', error);
    return false;
  }
};

// Get current user
export const getCurrentUser = async (token: string): Promise<User> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch user data');
    }

    return data.data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to fetch user data');
  }
};

// Update user profile
export const updateUserProfile = async (
  token: string,
  profileData: Partial<User>
): Promise<User> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      credentials: 'include',
      body: JSON.stringify(profileData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to update profile');
    }

    return data.data.user;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to update profile');
  }
};

// Delete user account
export const deleteUserAccount = async (token: string, email: string): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/account`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      credentials: 'include',
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to delete account');
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to delete account');
  }
};

// Validate referral code
export const validateReferralCode = async (referralCode: string): Promise<{
  valid: boolean;
  referrerName?: string;
  message: string;
}> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/validate-referral`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ referralCode }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { valid: false, message: 'Error validating referral code' };
    }

    return data.data;
  } catch (error) {
    console.error('Validate referral error:', error);
    return { valid: false, message: 'Error validating referral code' };
  }
};

// Resend OTP
export const resendOTP = async (email: string, purpose: string = 'registration'): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/resend-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, purpose }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to resend OTP');
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to resend OTP. Please try again.');
  }
};

// Forgot password - Send OTP
export const forgotPassword = async (email: string): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to send OTP');
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to send OTP. Please try again.');
  }
};

// Reset password with OTP
export const resetPassword = async (email: string, otp: string, newPassword: string): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, otp, newPassword }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to reset password');
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to reset password. Please try again.');
  }
};
