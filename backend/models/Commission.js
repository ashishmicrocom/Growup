import mongoose from 'mongoose';

const commissionSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Recipient is required'],
      index: true
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Seller is required'],
      index: true
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: [true, 'Order is required'],
      index: true
    },
    type: {
      type: String,
      enum: {
        values: ['direct', 'referral'],
        message: 'Type must be either direct or referral'
      },
      required: [true, 'Commission type is required']
    },
    level: {
      type: Number,
      required: [true, 'Level is required'],
      min: [0, 'Level cannot be negative'],
      max: [4, 'Level cannot exceed 4']
    },
    productPrice: {
      type: Number,
      required: [true, 'Product price is required'],
      min: [0, 'Product price cannot be negative']
    },
    sellerSlabPercentage: {
      type: Number,
      required: [true, 'Seller slab percentage is required'],
      min: [0, 'Percentage cannot be negative'],
      max: [100, 'Percentage cannot exceed 100']
    },
    sellerTotalSalesAtTime: {
      type: Number,
      required: [true, 'Seller total sales at time is required'],
      min: [0, 'Total sales cannot be negative']
    },
    baseCommissionAmount: {
      type: Number,
      required: [true, 'Base commission amount is required'],
      min: [0, 'Base commission amount cannot be negative']
    },
    commissionPercentage: {
      type: Number,
      required: [true, 'Commission percentage is required'],
      min: [0, 'Percentage cannot be negative'],
      max: [100, 'Percentage cannot exceed 100']
    },
    amount: {
      type: Number,
      required: [true, 'Commission amount is required'],
      min: [0, 'Commission amount cannot be negative']
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'credited', 'cancelled'],
        message: 'Status must be pending, credited, or cancelled'
      },
      default: 'pending',
      index: true
    },
    orderStatus: {
      type: String,
      required: [true, 'Order status is required']
    },
    description: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes for efficient queries
commissionSchema.index({ recipient: 1, status: 1 });
commissionSchema.index({ seller: 1, status: 1 });
commissionSchema.index({ order: 1 });
commissionSchema.index({ createdAt: -1 });

// Virtual for formatted amount
commissionSchema.virtual('formattedAmount').get(function() {
  return `₹${this.amount.toFixed(2)}`;
});

const Commission = mongoose.model('Commission', commissionSchema);

export default Commission;
