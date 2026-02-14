import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      minlength: [2, 'First name must be at least 2 characters'],
      maxlength: [50, 'First name cannot exceed 50 characters']
    },
    lastName: {
      type: String,
      trim: true,
      maxlength: [50, 'Last name cannot exceed 50 characters'],
      default: ''
    },
    name: {
      type: String,
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
    },
    mobile: {
      type: String,
      required: [true, 'Mobile number is required'],
      trim: true,
      match: [/^[\+]?[0-9\s-()]+$/, 'Please provide a valid mobile number']
    },
    phone: {
      type: String,
      trim: true
    },
    gender: {
      type: String,
      enum: {
        values: ['male', 'female', 'other'],
        message: 'Gender must be male, female, or other'
      },
      default: 'male'
    },
    profileImage: {
      type: String,
      trim: true
    },
    myReferralCode: {
      type: String,
      unique: true,
      sparse: true, // Only enforce uniqueness for non-null values
      trim: true,
      uppercase: true
    },
    referredBy: {
      type: String,
      trim: true,
      uppercase: true
    },
    referredUsers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false // Don't include password in queries by default
    },
    isEmailVerified: {
      type: Boolean,
      default: false
    },
    otp: {
      type: String,
      select: false // Don't include OTP in queries by default
    },
    otpExpiry: {
      type: Date,
      select: false // Don't include OTP expiry in queries by default
    },
    role: {
      type: String,
      enum: {
        values: ['user', 'admin'],
        message: 'Role must be either user or admin'
      },
      default: 'user'
    },
    status: {
      type: String,
      enum: {
        values: ['active', 'blocked'],
        message: 'Status must be active or blocked'
      },
      default: 'active'
    },
    totalOrders: {
      type: Number,
      default: 0,
      min: [0, 'Total orders cannot be negative']
    },
    totalEarnings: {
      type: Number,
      default: 0,
      min: [0, 'Total earnings cannot be negative']
    },
    // Commission related fields
    totalSales: {
      type: Number,
      default: 0,
      min: [0, 'Total sales cannot be negative'],
      comment: 'Cumulative total of all product sales by this user'
    },
    commissionSlab: {
      type: Number,
      default: 6,
      enum: [6, 10, 12, 13],
      comment: 'Current commission percentage based on total sales'
    },
    directCommissionEarned: {
      type: Number,
      default: 0,
      min: [0, 'Direct commission earned cannot be negative'],
      comment: 'Total commission earned from own sales'
    },
    referralCommissionEarned: {
      type: Number,
      default: 0,
      min: [0, 'Referral commission earned cannot be negative'],
      comment: 'Total commission earned from referrals'
    },
    pendingCommission: {
      type: Number,
      default: 0,
      min: [0, 'Pending commission cannot be negative'],
      comment: 'Commission from orders that are not yet delivered'
    },
    availableCommission: {
      type: Number,
      default: 0,
      min: [0, 'Available commission cannot be negative'],
      comment: 'Commission available for withdrawal'
    }
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual field for formatted joined date
userSchema.virtual('joinedDate').get(function () {
  if (!this.createdAt) return '';
  
  const options = { day: '2-digit', month: 'short', year: 'numeric' };
  return this.createdAt.toLocaleDateString('en-GB', options);
});

// Virtual field for total commission earned
userSchema.virtual('totalCommissionEarned').get(function () {
  return (this.directCommissionEarned || 0) + (this.referralCommissionEarned || 0);
});

// Generate unique referral code
const generateReferralCode = (name, id) => {
  const namePart = name.replace(/[^a-zA-Z]/g, '').slice(0, 4).toUpperCase();
  const idPart = id.toString().slice(-4);
  return `${namePart}${idPart}`;
};

// Set name field from firstName and lastName before saving
userSchema.pre('save', async function () {
  // Set combined name field
  if (this.firstName) {
    this.name = this.lastName ? `${this.firstName} ${this.lastName}` : this.firstName;
  }
  
  // Set phone from mobile if not provided
  if (this.mobile && !this.phone) {
    this.phone = this.mobile;
  }
  
  // Generate myReferralCode if not set (will be set after first save)
  if (!this.myReferralCode && this._id) {
    this.myReferralCode = generateReferralCode(this.name || this.firstName, this._id);
  }
});

// Hash password before saving
userSchema.pre('save', async function () {
  // Only hash if password is modified
  if (!this.isModified('password')) {
    return;
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// Index for faster queries (email already has unique index)
userSchema.index({ role: 1, status: 1 });

const User = mongoose.model('User', userSchema);

export default User;
