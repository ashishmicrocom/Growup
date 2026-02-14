import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as authService from '@/services/authService';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  gender: string;
  profileImage?: string;
  myReferralCode?: string;
  referredBy?: string;
  role?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  register: (userData: Omit<User, 'id' | 'myReferralCode' | 'referredBy' | 'role'> & { password: string; referralCode?: string }) => Promise<void>;
  isUserRegistered: (email: string) => Promise<boolean>;
  updateUser: (userData: Partial<User>) => Promise<void>;
  deleteAccount: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const saved = localStorage.getItem('growup-auth');
    return saved ? JSON.parse(saved).isAuthenticated : false;
  });

  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('growup-auth');
    return saved ? JSON.parse(saved).user : null;
  });

  const [token, setToken] = useState<string | null>(() => {
    const saved = localStorage.getItem('growup-auth');
    return saved ? JSON.parse(saved).token : null;
  });

  useEffect(() => {
    localStorage.setItem('growup-auth', JSON.stringify({ isAuthenticated, user, token }));
  }, [isAuthenticated, user, token]);

  const register = async (userData: Omit<User, 'id' | 'myReferralCode' | 'referredBy' | 'role'> & { password: string; referralCode?: string }) => {
    try {
      const response = await authService.registerUser({
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        mobile: userData.mobile,
        gender: userData.gender,
        password: userData.password,
        profileImage: userData.profileImage,
        referralCode: userData.referralCode,
      });

      // Don't auto-login after registration, just store success
      // User needs to login manually after registration
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Registration failed');
    }
  };

  const isUserRegistered = async (email: string): Promise<boolean> => {
    try {
      const exists = await authService.checkEmailExists(email);
      return exists;
    } catch (error) {
      console.error('Error checking email:', error);
      return false;
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await authService.loginUser({ email, password });
      
      if (response.success && response.data.user) {
        // Check if user is admin - admins cannot login to user panel
        if (response.data.user.role === 'admin') {
          throw new Error('Admin accounts cannot access the user panel. Please use the admin panel at /admin');
        }
        
        const userData: User = {
          id: response.data.user.id,
          firstName: response.data.user.firstName,
          lastName: response.data.user.lastName,
          email: response.data.user.email,
          mobile: response.data.user.mobile,
          gender: response.data.user.gender,
          profileImage: response.data.user.profileImage,
          myReferralCode: response.data.user.myReferralCode,
          referredBy: response.data.user.referredBy,
          role: response.data.user.role,
        };
        
        setIsAuthenticated(true);
        setUser(userData);
        setToken(response.data.token);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      if (token) {
        await authService.logoutUser(token);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsAuthenticated(false);
      setUser(null);
      setToken(null);
      localStorage.removeItem('growup-auth');
      // Clear location data on logout
      localStorage.removeItem('selectedLocation');
      localStorage.removeItem('selectedLocationCoords');
      // Clear any other user-specific data
      sessionStorage.removeItem('sharedReferralCode');
    }
  };

  const updateUser = async (userData: Partial<User>) => {
    if (user && token) {
      try {
        const updatedUser = await authService.updateUserProfile(token, userData);
        
        const newUser: User = {
          id: updatedUser.id || user.id,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          email: updatedUser.email,
          mobile: updatedUser.mobile,
          gender: updatedUser.gender,
          profileImage: updatedUser.profileImage,
          myReferralCode: updatedUser.myReferralCode || user.myReferralCode,
          referredBy: updatedUser.referredBy || user.referredBy,
          role: updatedUser.role || user.role,
        };
        
        setUser(newUser);
      } catch (error) {
        console.error('Update user error:', error);
        throw error;
      }
    }
  };

  const deleteAccount = async (email: string) => {
    if (token) {
      try {
        await authService.deleteUserAccount(token, email);
        
        // Logout user
        setIsAuthenticated(false);
        setUser(null);
        setToken(null);
        localStorage.removeItem('growup-auth');
      } catch (error) {
        console.error('Delete account error:', error);
        throw error;
      }
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, token, login, logout, register, isUserRegistered, updateUser, deleteAccount }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
