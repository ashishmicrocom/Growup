import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  productName: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  resellerEarning: {
    type: Number,
    required: true,
    min: 0
  }
});

const shippingAddressSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    required: true,
    trim: true
  },
  city: {
    type: String,
    required: true,
    trim: true
  },
  state: {
    type: String,
    required: true,
    trim: true
  },
  pincode: {
    type: String,
    required: true,
    trim: true
  }
});

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
      uppercase: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    items: [orderItemSchema],
    shippingAddress: {
      type: shippingAddressSchema,
      required: true
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0
    },
    totalEarnings: {
      type: Number,
      required: true,
      min: 0
    },
    // Legacy fields for backward compatibility
    customer: {
      type: String,
      trim: true
    },
    product: {
      type: String,
      trim: true
    },
    amount: {
      type: Number,
      min: 0
    },
    reseller: {
      type: String,
      trim: true
    },
    paymentStatus: {
      type: String,
      enum: {
        values: ['paid', 'pending', 'failed'],
        message: 'Payment status must be paid, pending, or failed'
      },
      default: 'pending'
    },
    orderStatus: {
      type: String,
      enum: {
        values: ['processing', 'ready_to_ship', 'shipped', 'delivered', 'cancelled'],
        message: 'Order status must be processing, ready_to_ship, shipped, delivered, or cancelled'
      },
      default: 'processing'
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual field for formatted date
orderSchema.virtual('date').get(function () {
  if (!this.createdAt) return '';
  
  const options = { day: '2-digit', month: 'short', year: 'numeric' };
  return this.createdAt.toLocaleDateString('en-GB', options);
});

// Indexes for faster queries (orderId unique creates its own index)
orderSchema.index({ orderStatus: 1, paymentStatus: 1 });
orderSchema.index({ createdAt: -1 });

const Order = mongoose.model('Order', orderSchema);

export default Order;
