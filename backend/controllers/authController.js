import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import { generateOTP, getOTPExpiry, verifyOTP, hashOTP } from '../services/otpService.js';
import { sendOTPEmail } from '../services/emailService.js';
import {
  storePendingRegistration,
  getPendingRegistration,
  removePendingRegistration,
  hasPendingRegistration
} from '../services/registrationCache.js';

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// @desc    Register new user - Step 1: Send OTP
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    const { firstName, lastName, email, mobile, gender, password, profileImage, referralCode } = req.body;

    // Validate input
    if (!firstName || !email || !mobile || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields (firstName, email, mobile, password)'
      });
    }

    // Validate referral code is provided
    if (!referralCode) {
      return res.status(400).json({
        success: false,
        message: 'Referral code is required to register'
      });
    }

    // Check if user already exists in database
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered. Please login.'
      });
    }

    // Check if email has pending registration
    if (hasPendingRegistration(email)) {
      // Get the pending data to resend OTP
      const pendingData = getPendingRegistration(email);
      
      // Generate new OTP
      const otp = generateOTP();
      const otpExpiry = getOTPExpiry();
      const hashedOTP = hashOTP(otp);
      
      // Update pending registration with new OTP
      pendingData.otp = hashedOTP;
      pendingData.otpExpiry = otpExpiry;
      storePendingRegistration(email, pendingData, hashedOTP, otpExpiry);
      
      // Resend OTP
      try {
        await sendOTPEmail(email, otp, pendingData.firstName || firstName, 'registration');
      } catch (emailError) {
        console.warn('Email sending failed, but continuing with default OTP:', emailError.message);
      }
      
      return res.status(200).json({
        success: true,
        message: 'Registration already in progress. A new OTP has been sent to your email.',
        data: {
          email: email,
          requiresVerification: true
        }
      });
    }

    // Validate referral code exists
    const referrer = await User.findOne({ myReferralCode: referralCode.toUpperCase() });
    if (!referrer) {
      console.log(`Invalid referral code attempted: ${referralCode}`);
      return res.status(400).json({
        success: false,
        message: 'Invalid referral code. Please check and try again.'
      });
    }

    // Generate and hash OTP
    const otp = generateOTP();
    const otpExpiry = getOTPExpiry();
    const hashedOTP = hashOTP(otp);

    // Store registration data temporarily (NOT in database yet)
    storePendingRegistration(email, {
      firstName,
      lastName: lastName || '',
      email,
      mobile,
      gender: gender || 'male',
      password,
      profileImage: profileImage || '',
      referredBy: referralCode.toUpperCase(),
      role: 'user',
      referrerId: referrer._id.toString()
    }, hashedOTP, otpExpiry);

    // Send OTP email
    try {
      await sendOTPEmail(email, otp, firstName, 'registration');
    } catch (emailError) {
      console.warn('Email sending failed, but continuing with default OTP:', emailError.message);
    }

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please verify your email with the OTP sent.',
      data: {
        email: email,
        requiresVerification: true
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    console.error('Request body:', req.body);
    res.status(500).json({
      success: false,
      message: 'Error during registration',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// @desc    Verify Email with OTP - Step 2 of Registration
// @route   POST /api/auth/verify-email
// @access  Public
export const verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and OTP'
      });
    }

    // Get pending registration data
    const pendingData = getPendingRegistration(email);

    if (!pendingData) {
      return res.status(404).json({
        success: false,
        message: 'No pending registration found. Please register again.'
      });
    }

    // Verify OTP
    const hashedOTP = hashOTP(otp);
    const otpVerification = verifyOTP(pendingData.otp, pendingData.otpExpiry, hashedOTP);

    if (!otpVerification.valid) {
      return res.status(400).json({
        success: false,
        message: otpVerification.message
      });
    }

    // NOW create the user in database (only after OTP verification)
    const user = await User.create({
      firstName: pendingData.firstName,
      lastName: pendingData.lastName,
      email: pendingData.email,
      mobile: pendingData.mobile,
      gender: pendingData.gender,
      password: pendingData.password,
      profileImage: pendingData.profileImage,
      referredBy: pendingData.referredBy,
      role: pendingData.role,
      status: 'active',
      isEmailVerified: true
    });

    // Generate referral code with user ID
    const namePart = (user.firstName || 'USER').replace(/[^a-zA-Z]/g, '').slice(0, 4).toUpperCase();
    const idPart = user._id.toString().slice(-4);
    const finalReferralCode = `${namePart}${idPart}`;
    
    await User.findByIdAndUpdate(user._id, { myReferralCode: finalReferralCode });
    user.myReferralCode = finalReferralCode;

    // Add user to referrer's referredUsers array
    if (pendingData.referrerId) {
      await User.findByIdAndUpdate(
        pendingData.referrerId,
        { $push: { referredUsers: user._id } },
        { runValidators: false }
      );
    }

    // Remove from pending registrations
    removePendingRegistration(email);

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Email verified successfully',
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          name: user.name,
          email: user.email,
          mobile: user.mobile,
          gender: user.gender,
          profileImage: user.profileImage,
          myReferralCode: user.myReferralCode,
          referredBy: user.referredBy,
          role: user.role,
          isEmailVerified: true
        },
        token
      }
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying email',
      error: error.message
    });
  }
};

// @desc    Login user - Step 1: Verify credentials and send OTP
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Find user by email and include password field
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check password
    const isPasswordMatch = await user.comparePassword(password);

    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if account is blocked
    if (user.status === 'blocked') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been blocked. Please contact support.'
      });
    }

    // Prevent admin users from using user panel login
    if (user.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin accounts cannot login here. Please use the admin panel.'
      });
    }

    // Generate and save OTP
    const otp = generateOTP();
    const otpExpiry = getOTPExpiry();
    const hashedOTP = hashOTP(otp);

    await User.findByIdAndUpdate(user._id, {
      otp: hashedOTP,
      otpExpiry: otpExpiry
    });

    // Send OTP email
    try {
      await sendOTPEmail(email, otp, user.firstName, 'login');
    } catch (emailError) {
      console.warn('Email sending failed, but continuing with default OTP:', emailError.message);
    }

    res.json({
      success: true,
      message: 'OTP sent to your email. Please verify to login.',
      data: {
        userId: user._id,
        email: user.email,
        requiresVerification: true
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during login',
      error: error.message
    });
  }
};

// @desc    Verify Login OTP - Step 2 of Login
// @route   POST /api/auth/verify-login-otp
// @access  Public
export const verifyLoginOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and OTP'
      });
    }

    // Find user with OTP fields
    const user = await User.findOne({ email }).select('+otp +otpExpiry');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify OTP
    const hashedOTP = hashOTP(otp);
    const otpVerification = verifyOTP(user.otp, user.otpExpiry, hashedOTP);

    if (!otpVerification.valid) {
      return res.status(400).json({
        success: false,
        message: otpVerification.message
      });
    }

    // Prevent admin users from using user panel login (double-check)
    if (user.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin accounts cannot login here. Please use the admin panel.'
      });
    }

    // Clear OTP
    await User.findByIdAndUpdate(user._id, {
      otp: undefined,
      otpExpiry: undefined
    });

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          name: user.name,
          email: user.email,
          mobile: user.mobile,
          gender: user.gender,
          profileImage: user.profileImage,
          myReferralCode: user.myReferralCode,
          referredBy: user.referredBy,
          role: user.role,
          isEmailVerified: user.isEmailVerified
        },
        token
      }
    });
  } catch (error) {
    console.error('Login OTP verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying OTP',
      error: error.message
    });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
export const logout = async (req, res) => {
  try {
    // Clear both admin and user cookies
    res.cookie('admin_token', '', {
      httpOnly: true,
      expires: new Date(0)
    });
    res.cookie('user_token', '', {
      httpOnly: true,
      expires: new Date(0)
    });
    // Also clear old 'token' cookie for backward compatibility
    res.cookie('token', '', {
      httpOnly: true,
      expires: new Date(0)
    });

    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error during logout',
      error: error.message
    });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user data',
      error: error.message
    });
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide current password and new password'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters'
      });
    }

    // Find user
    const user = await User.findById(req.user._id);

    // Check current password
    const isPasswordMatch = await user.comparePassword(currentPassword);

    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error changing password',
      error: error.message
    });
  }
};

// @desc    Update profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, mobile, gender, profileImage } = req.body;

    const user = await User.findById(req.user._id);

    if (firstName) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (mobile) user.mobile = mobile;
    if (gender) user.gender = gender;
    if (profileImage !== undefined) user.profileImage = profileImage;

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          name: user.name,
          email: user.email,
          mobile: user.mobile,
          gender: user.gender,
          profileImage: user.profileImage,
          role: user.role
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message
    });
  }
};

// @desc    Check if email exists
// @route   POST /api/auth/check-email
// @access  Public
export const checkEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email'
      });
    }

    const user = await User.findOne({ email });

    res.json({
      success: true,
      data: {
        exists: !!user
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error checking email',
      error: error.message
    });
  }
};

// @desc    Validate referral code
// @route   POST /api/auth/validate-referral
// @access  Public
export const validateReferral = async (req, res) => {
  try {
    const { referralCode } = req.body;

    if (!referralCode) {
      return res.status(400).json({
        success: false,
        message: 'Please provide referral code'
      });
    }

    const referrer = await User.findOne({ myReferralCode: referralCode.toUpperCase() });

    if (!referrer) {
      return res.json({
        success: true,
        data: {
          valid: false,
          message: 'Invalid referral code'
        }
      });
    }

    res.json({
      success: true,
      data: {
        valid: true,
        referrerName: referrer.name,
        message: `Valid referral code from ${referrer.name}`
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error validating referral code',
      error: error.message
    });
  }
};

// @desc    Delete account
// @route   DELETE /api/auth/account
// @access  Private
export const deleteAccount = async (req, res) => {
  try {
    const { email } = req.body;

    // Verify the email matches the logged-in user
    if (email !== req.user.email) {
      return res.status(403).json({
        success: false,
        message: 'Email does not match your account'
      });
    }

    await User.findByIdAndDelete(req.user._id);

    // Clear cookies
    res.cookie('admin_token', '', {
      httpOnly: true,
      expires: new Date(0)
    });
    res.cookie('user_token', '', {
      httpOnly: true,
      expires: new Date(0)
    });
    res.cookie('token', '', {
      httpOnly: true,
      expires: new Date(0)
    });

    res.json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting account',
      error: error.message
    });
  }
};

// @desc    Resend OTP
// @route   POST /api/auth/resend-otp
// @access  Public
export const resendOTP = async (req, res) => {
  try {
    const { email, purpose } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email'
      });
    }

    // Check if this is for registration (pending user)
    if (purpose === 'registration') {
      const pendingData = getPendingRegistration(email);
      
      if (!pendingData) {
        return res.status(404).json({
          success: false,
          message: 'No pending registration found. Please register again.'
        });
      }

      // Generate new OTP
      const otp = generateOTP();
      const otpExpiry = getOTPExpiry();
      const hashedOTP = hashOTP(otp);

      // Update pending registration with new OTP
      pendingData.otp = hashedOTP;
      pendingData.otpExpiry = otpExpiry;
      storePendingRegistration(email, pendingData, hashedOTP, otpExpiry);

      // Send OTP email
      try {
        await sendOTPEmail(email, otp, pendingData.firstName, purpose);
      } catch (emailError) {
        console.warn('Email sending failed, but continuing with default OTP:', emailError.message);
      }
    } else {
      // For login or forgot password - user exists in database
      const user = await User.findOne({ email });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Generate and save new OTP
      const otp = generateOTP();
      const otpExpiry = getOTPExpiry();
      const hashedOTP = hashOTP(otp);

      await User.findByIdAndUpdate(user._id, {
        otp: hashedOTP,
        otpExpiry: otpExpiry
      });

      // Send OTP email
      try {
        await sendOTPEmail(email, otp, user.firstName, purpose || 'login');
      } catch (emailError) {
        console.warn('Email sending failed, but continuing with default OTP:', emailError.message);
      }
    }

    res.json({
      success: true,
      message: 'OTP sent successfully'
    });
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending OTP',
      error: error.message
    });
  }
};

// @desc    Forgot Password - Send OTP
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email'
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this email'
      });
    }

    // Generate and save OTP
    const otp = generateOTP();
    const otpExpiry = getOTPExpiry();
    const hashedOTP = hashOTP(otp);

    await User.findByIdAndUpdate(user._id, {
      otp: hashedOTP,
      otpExpiry: otpExpiry
    });

    // Send OTP email
    try {
      await sendOTPEmail(email, otp, user.firstName, 'forgot-password');
    } catch (emailError) {
      console.warn('Email sending failed, but continuing with default OTP:', emailError.message);
    }

    res.json({
      success: true,
      message: 'OTP sent to your email for password reset'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing request',
      error: error.message
    });
  }
};

// @desc    Reset Password with OTP
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email, OTP, and new password'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    // Find user with OTP fields
    const user = await User.findOne({ email }).select('+otp +otpExpiry');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify OTP
    const hashedOTP = hashOTP(otp);
    const otpVerification = verifyOTP(user.otp, user.otpExpiry, hashedOTP);

    if (!otpVerification.valid) {
      return res.status(400).json({
        success: false,
        message: otpVerification.message
      });
    }

    // Update password and clear OTP
    user.password = newPassword;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Password reset successfully. You can now login with your new password.'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Error resetting password',
      error: error.message
    });
  }
};

// @desc    Admin Login (Direct login without OTP)
// @route   POST /api/auth/admin-login
// @access  Public
export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Find user by email and include password field
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // IMPORTANT: Check if user is admin FIRST before anything else
    if (user.role !== 'admin') {
      console.log(`Non-admin user ${email} tried to login to admin panel`);
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only admin accounts can login here. Please use the user panel for regular accounts.'
      });
    }

    // Check password
    const isPasswordMatch = await user.comparePassword(password);

    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if account is blocked
    if (user.status === 'blocked') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been blocked. Please contact support.'
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          name: user.name,
          email: user.email,
          mobile: user.mobile,
          phone: user.phone,
          gender: user.gender,
          profileImage: user.profileImage,
          myReferralCode: user.myReferralCode,
          referredBy: user.referredBy,
          role: user.role,
          isEmailVerified: user.isEmailVerified
        },
        token
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during login',
      error: error.message
    });
  }
};
