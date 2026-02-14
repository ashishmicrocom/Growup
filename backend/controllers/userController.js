import User from '../models/User.js';
import Address from '../models/Address.js';
import Commission from '../models/Commission.js';
import Payout from '../models/Payout.js';
import mongoose from 'mongoose';

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
export const getAllUsers = async (req, res) => {
  try {
    const { role, status, search, page = 1, limit = 100 } = req.query;

    const query = {};

    if (role) query.role = role;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    return res.status(200).json({
      success: true,
      count: users.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: users
    });
  } catch (error) {
    console.error('getAllUsers error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error fetching users'
    });
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private/Admin
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('getUserById error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error fetching user'
    });
  }
};

// @desc    Create new user
// @route   POST /api/users
// @access  Private/Admin
export const createUser = async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    const user = await User.create({
      name,
      email,
      phone,
      password,
      role: role || 'user'
    });

    const createdUser = await User.findById(user._id).select('-password');

    return res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: createdUser
    });
  } catch (error) {
    console.error('createUser error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error creating user'
    });
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
export const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const { name, email, phone, role } = req.body;

    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: 'Email already in use'
        });
      }
    }

    user.name = name || user.name;
    user.email = email || user.email;
    user.phone = phone || user.phone;
    user.role = role || user.role;

    const updatedUser = await user.save();
    const returnUser = await User.findById(updatedUser._id).select('-password');

    return res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: returnUser
    });
  } catch (error) {
    console.error('updateUser error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error updating user'
    });
  }
};

// @desc    Toggle user status (active/blocked)
// @route   PATCH /api/users/:id/status
// @access  Private/Admin
export const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.status = user.status === 'active' ? 'blocked' : 'active';
    
    const updatedUser = await user.save();
    const returnUser = await User.findById(updatedUser._id).select('-password');

    return res.status(200).json({
      success: true,
      message: `User ${returnUser.status === 'active' ? 'activated' : 'blocked'} successfully`,
      data: returnUser
    });
  } catch (error) {
    console.error('toggleUserStatus error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error toggling user status'
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    await user.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'User deleted successfully',
      data: {}
    });
  } catch (error) {
    console.error('deleteUser error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error deleting user'
    });
  }
};

// @desc    Get user statistics
// @route   GET /api/users/stats
// @access  Private/Admin
export const getUserStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ status: 'active' });
    const blockedUsers = await User.countDocuments({ status: 'blocked' });
    const totalAdmins = await User.countDocuments({ role: 'admin', status: 'active' });
    const regularUsers = await User.countDocuments({ role: 'user', status: 'active' });

    return res.status(200).json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        blockedUsers,
        totalResellers: totalAdmins, // Keep the field name for backward compatibility
        regularUsers
      }
    });
  } catch (error) {
    console.error('getUserStats error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error fetching user statistics'
    });
  }
};

// @desc    Get user team hierarchy (referral tree)
// @route   GET /api/users/:id/team
// @access  Private
export const getUserTeam = async (req, res) => {
  try {
    const userId = req.params.id;

    // Build the team hierarchy recursively (Max 4 levels as per commission rules)
    // Level 0 = Parent, Level 1-4 = Downline levels (so maxLevel = 5 to include all 4 downline levels)
    const buildTeamTree = async (userId, level = 0, maxLevel = 5) => {
      if (level >= maxLevel) return null;

      const user = await User.findById(userId)
        .select('_id firstName lastName name email mobile role status createdAt myReferralCode profileImage totalEarnings')
        .lean();

      if (!user) return null;

      // Find all users referred by this user
      const referredUsers = await User.find({ referredBy: user.myReferralCode })
        .select('_id firstName lastName name email mobile role status createdAt myReferralCode profileImage totalEarnings')
        .sort({ createdAt: -1 })
        .lean();

      // Recursively build tree for each referred user
      const children = [];
      let totalTeamEarnings = 0;
      
      for (const refUser of referredUsers) {
        const childTree = await buildTeamTree(refUser._id, level + 1, maxLevel);
        if (childTree) {
          children.push(childTree);
          totalTeamEarnings += (childTree.totalEarnings || 0) + (childTree.totalTeamEarnings || 0);
        }
      }

      return {
        ...user,
        level,
        teamCount: referredUsers.length,
        totalTeamSize: children.reduce((sum, child) => sum + (child.totalTeamSize || 0), 0) + referredUsers.length,
        totalTeamEarnings, // Sum of all team member earnings (recursive)
        children
      };
    };

    const teamTree = await buildTeamTree(userId);

    if (!teamTree) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: teamTree
    });
  } catch (error) {
    console.error('getUserTeam error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error fetching user team'
    });
  }
};

// @desc    Get user team hierarchy earnings
// @route   GET /api/users/:id/team-earnings
// @access  Private/Admin
export const getUserTeamEarnings = async (req, res) => {
  try {
    const userId = req.params.id;

    // Calculate team earnings recursively
    const calculateTeamEarnings = async (userId, level = 0, maxLevel = 5) => {
      if (level >= maxLevel) return 0;

      const user = await User.findById(userId).select('myReferralCode totalEarnings').lean();
      if (!user) return 0;

      // Find all users referred by this user
      const referredUsers = await User.find({ referredBy: user.myReferralCode })
        .select('_id totalEarnings')
        .lean();

      let totalTeamEarnings = 0;

      // Add direct team member earnings
      for (const refUser of referredUsers) {
        totalTeamEarnings += refUser.totalEarnings || 0;
        
        // Recursively add their team earnings
        const downlineEarnings = await calculateTeamEarnings(refUser._id, level + 1, maxLevel);
        totalTeamEarnings += downlineEarnings;
      }

      return totalTeamEarnings;
    };

    const user = await User.findById(userId).select('totalEarnings firstName lastName email');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const teamEarnings = await calculateTeamEarnings(userId);

    return res.status(200).json({
      success: true,
      data: {
        userId: user._id,
        userName: user.firstName + ' ' + user.lastName,
        userEmail: user.email,
        personalEarnings: user.totalEarnings || 0,
        teamEarnings: teamEarnings,
        totalEarnings: (user.totalEarnings || 0) + teamEarnings
      }
    });
  } catch (error) {
    console.error('getUserTeamEarnings error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error calculating team earnings'
    });
  }
};

// @desc    Get user's commission earnings from team hierarchy (referral commissions only)
// @route   GET /api/users/:id/team-commission-earnings
// @access  Private/Admin
export const getUserTeamCommissionEarnings = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId).select('firstName lastName email directCommissionEarned referralCommissionEarned');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get all team member IDs (recursively)
    const getTeamMemberIds = async (userId, level = 0, maxLevel = 5) => {
      if (level >= maxLevel) return [];

      const user = await User.findById(userId).select('myReferralCode').lean();
      if (!user || !user.myReferralCode) return [];

      const referredUsers = await User.find({ referredBy: user.myReferralCode })
        .select('_id')
        .lean();

      let teamIds = referredUsers.map(u => u._id);

      // Recursively get team members from downline
      for (const refUser of referredUsers) {
        const downlineIds = await getTeamMemberIds(refUser._id, level + 1, maxLevel);
        teamIds = [...teamIds, ...downlineIds];
      }

      return teamIds;
    };

    const teamMemberIds = await getTeamMemberIds(userId);

    // Get all referral commissions earned by the user from team members' sales
    const commissionResults = await Commission.aggregate([
      {
        $match: {
          recipient: new mongoose.Types.ObjectId(userId),
          type: 'referral', // Only referral commissions (from team sales)
          seller: { $in: teamMemberIds.map(id => new mongoose.Types.ObjectId(id)) }
        }
      },
      {
        $group: {
          _id: '$status',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    // Calculate totals by status
    let creditedAmount = 0;
    let pendingAmount = 0;
    let cancelledAmount = 0;

    commissionResults.forEach(result => {
      if (result._id === 'credited') {
        creditedAmount = result.total;
      } else if (result._id === 'pending') {
        pendingAmount = result.total;
      } else if (result._id === 'cancelled') {
        cancelledAmount = result.total;
      }
    });

    const totalTeamCommissionEarned = creditedAmount + pendingAmount;

    return res.status(200).json({
      success: true,
      data: {
        userId: user._id,
        userName: user.firstName + ' ' + user.lastName,
        userEmail: user.email,
        directCommissionEarned: user.directCommissionEarned || 0, // From own sales
        referralCommissionEarned: user.referralCommissionEarned || 0, // Total from all referrals (stored in user)
        teamCommissionBreakdown: {
          credited: creditedAmount,
          pending: pendingAmount,
          cancelled: cancelledAmount,
          total: totalTeamCommissionEarned
        },
        totalCommissionEarned: (user.directCommissionEarned || 0) + (user.referralCommissionEarned || 0)
      }
    });
  } catch (error) {
    console.error('getUserTeamCommissionEarnings error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error calculating team commission earnings'
    });
  }
};

// @desc    Get current user profile
// @route   GET /api/users/profile
// @access  Private
export const getCurrentUserProfile = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const user = await User.findById(userId).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('getCurrentUserProfile error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error fetching user profile'
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const { firstName, lastName, gender, profileImage } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update fields if provided
    if (firstName) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (gender) user.gender = gender;
    if (profileImage !== undefined) user.profileImage = profileImage;

    await user.save();

    // Return user without password
    const updatedUser = await User.findById(userId).select('-password');

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedUser
    });
  } catch (error) {
    console.error('updateUserProfile error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error updating user profile'
    });
  }
};

// @desc    Update user email
// @route   PUT /api/users/profile/email
// @access  Private
export const updateUserEmail = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email, _id: { $ne: userId } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already in use'
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.email = email;
    await user.save();

    const updatedUser = await User.findById(userId).select('-password');

    return res.status(200).json({
      success: true,
      message: 'Email updated successfully',
      data: updatedUser
    });
  } catch (error) {
    console.error('updateUserEmail error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error updating email'
    });
  }
};

// @desc    Update user mobile
// @route   PUT /api/users/profile/mobile
// @access  Private
export const updateUserMobile = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const { mobile } = req.body;

    if (!mobile) {
      return res.status(400).json({
        success: false,
        message: 'Mobile number is required'
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.mobile = mobile;
    user.phone = mobile;
    await user.save();

    const updatedUser = await User.findById(userId).select('-password');

    return res.status(200).json({
      success: true,
      message: 'Mobile number updated successfully',
      data: updatedUser
    });
  } catch (error) {
    console.error('updateUserMobile error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error updating mobile number'
    });
  }
};

// @desc    Get user addresses
// @route   GET /api/users/profile/addresses
// @access  Private
export const getUserAddresses = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const addresses = await Address.find({ user: userId }).sort({ isDefault: -1, createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: addresses.length,
      data: addresses
    });
  } catch (error) {
    console.error('getUserAddresses error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error fetching addresses'
    });
  }
};

// @desc    Add new address
// @route   POST /api/users/profile/addresses
// @access  Private
export const addUserAddress = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const { name, mobile, pincode, locality, address, city, state, landmark, alternatePhone, addressType, isDefault } = req.body;

    // If this address is set as default, unset other defaults
    if (isDefault) {
      await Address.updateMany({ user: userId }, { isDefault: false });
    }

    const newAddress = await Address.create({
      user: userId,
      name,
      mobile,
      pincode,
      locality,
      address,
      city,
      state,
      landmark,
      alternatePhone,
      addressType: addressType || 'home',
      isDefault: isDefault || false
    });

    return res.status(201).json({
      success: true,
      message: 'Address added successfully',
      data: newAddress
    });
  } catch (error) {
    console.error('addUserAddress error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error adding address'
    });
  }
};

// @desc    Update address
// @route   PUT /api/users/profile/addresses/:id
// @access  Private
export const updateUserAddress = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const addressId = req.params.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const address = await Address.findOne({ _id: addressId, user: userId });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    const { name, mobile, pincode, locality, address: addressText, city, state, landmark, alternatePhone, addressType, isDefault } = req.body;

    // If this address is set as default, unset other defaults
    if (isDefault && !address.isDefault) {
      await Address.updateMany({ user: userId, _id: { $ne: addressId } }, { isDefault: false });
    }

    // Update fields
    if (name) address.name = name;
    if (mobile) address.mobile = mobile;
    if (pincode) address.pincode = pincode;
    if (locality) address.locality = locality;
    if (addressText) address.address = addressText;
    if (city) address.city = city;
    if (state) address.state = state;
    if (landmark !== undefined) address.landmark = landmark;
    if (alternatePhone !== undefined) address.alternatePhone = alternatePhone;
    if (addressType) address.addressType = addressType;
    if (isDefault !== undefined) address.isDefault = isDefault;

    await address.save();

    return res.status(200).json({
      success: true,
      message: 'Address updated successfully',
      data: address
    });
  } catch (error) {
    console.error('updateUserAddress error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error updating address'
    });
  }
};

// @desc    Delete address
// @route   DELETE /api/users/profile/addresses/:id
// @access  Private
export const deleteUserAddress = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const addressId = req.params.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const address = await Address.findOneAndDelete({ _id: addressId, user: userId });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Address deleted successfully'
    });
  } catch (error) {
    console.error('deleteUserAddress error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error deleting address'
    });
  }
};

// @desc    Get user payout status
// @route   GET /api/users/profile/payout-status
// @access  Private
export const getUserPayoutStatus = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const user = await User.findById(userId).select('firstName lastName email availableCommission pendingCommission directCommissionEarned referralCommissionEarned totalEarnings');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get recent payouts for this user (using email or name as identifier)
    const userIdentifier = user.email || `${user.firstName} ${user.lastName}`;
    const recentPayouts = await Payout.find({ 
      reseller: { $regex: new RegExp(userIdentifier, 'i') } 
    })
      .sort({ date: -1 })
      .limit(5)
      .lean();

    // Calculate total payout amounts by status
    const payoutStats = await Payout.aggregate([
      { 
        $match: { 
          reseller: { $regex: new RegExp(userIdentifier, 'i') } 
        } 
      },
      {
        $group: {
          _id: '$status',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    const payoutSummary = {
      completed: 0,
      pending: 0,
      processing: 0,
      failed: 0,
      totalPaidOut: 0
    };

    payoutStats.forEach(stat => {
      if (stat._id === 'completed') {
        payoutSummary.completed = stat.totalAmount;
        payoutSummary.totalPaidOut = stat.totalAmount;
      } else if (stat._id === 'pending') {
        payoutSummary.pending = stat.totalAmount;
      } else if (stat._id === 'processing') {
        payoutSummary.processing = stat.totalAmount;
      } else if (stat._id === 'failed') {
        payoutSummary.failed = stat.totalAmount;
      }
    });

    return res.status(200).json({
      success: true,
      data: {
        availableForWithdrawal: user.availableCommission || 0,
        pendingCommission: user.pendingCommission || 0,
        totalEarned: user.totalEarnings || 0,
        directCommission: user.directCommissionEarned || 0,
        referralCommission: user.referralCommissionEarned || 0,
        payoutSummary,
        recentPayouts,
        minimumWithdrawal: 500, // Minimum amount for withdrawal
        canWithdraw: (user.availableCommission || 0) >= 500
      }
    });
  } catch (error) {
    console.error('getUserPayoutStatus error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error fetching payout status'
    });
  }
};

// @desc    Get user payout status by ID (admin)
// @route   GET /api/users/:id/payout-status
// @access  Private/Admin
export const getUserPayoutStatusById = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId).select('firstName lastName email availableCommission pendingCommission directCommissionEarned referralCommissionEarned totalEarnings');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get recent payouts for this user (using email or name as identifier)
    const userIdentifier = user.email || `${user.firstName} ${user.lastName}`;
    const recentPayouts = await Payout.find({ 
      reseller: { $regex: new RegExp(userIdentifier, 'i') } 
    })
      .sort({ date: -1 })
      .limit(5)
      .lean();

    // Calculate total payout amounts by status
    const payoutStats = await Payout.aggregate([
      { 
        $match: { 
          reseller: { $regex: new RegExp(userIdentifier, 'i') } 
        } 
      },
      {
        $group: {
          _id: '$status',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    const payoutSummary = {
      completed: 0,
      pending: 0,
      processing: 0,
      failed: 0,
      totalPaidOut: 0
    };

    payoutStats.forEach(stat => {
      if (stat._id === 'completed') {
        payoutSummary.completed = stat.totalAmount;
        payoutSummary.totalPaidOut = stat.totalAmount;
      } else if (stat._id === 'pending') {
        payoutSummary.pending = stat.totalAmount;
      } else if (stat._id === 'processing') {
        payoutSummary.processing = stat.totalAmount;
      } else if (stat._id === 'failed') {
        payoutSummary.failed = stat.totalAmount;
      }
    });

    return res.status(200).json({
      success: true,
      data: {
        availableForWithdrawal: user.availableCommission || 0,
        pendingCommission: user.pendingCommission || 0,
        totalEarned: user.totalEarnings || 0,
        directCommission: user.directCommissionEarned || 0,
        referralCommission: user.referralCommissionEarned || 0,
        payoutSummary,
        recentPayouts,
        minimumWithdrawal: 500, // Minimum amount for withdrawal
        canWithdraw: (user.availableCommission || 0) >= 500
      }
    });
  } catch (error) {
    console.error('getUserPayoutStatusById error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error fetching payout status'
    });
  }
};

