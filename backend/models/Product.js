import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    productId: {
      type: String,
      required: true,
      unique: true,
      uppercase: true
    },
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      minlength: [2, 'Product name must be at least 2 characters'],
      maxlength: [100, 'Product name cannot exceed 100 characters']
    },
    image: {
      type: String,
      required: [true, 'Product image is required'],
      default: '📦'
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative']
    },
    originalPrice: {
      type: Number,
      min: [0, 'Original price cannot be negative']
    },
    commission: {
      type: Number,
      required: [true, 'Commission is required'],
      min: [0, 'Commission cannot be negative']
    },
    resellerEarning: {
      type: Number,
      default: 0,
      min: [0, 'Reseller earning cannot be negative']
    },
    images: [{
      type: String,
      trim: true
    }],
    sizes: [{
      size: {
        type: String,
        required: true,
        trim: true
      },
      measurement: {
        type: String,
        trim: true
      },
      inStock: {
        type: Boolean,
        default: true
      }
    }],
    colors: [{
      name: {
        type: String,
        required: true,
        trim: true
      },
      hexCode: {
        type: String,
        trim: true
      },
      inStock: {
        type: Boolean,
        default: true
      }
    }],
    features: [{
      type: String,
      trim: true
    }],
    brand: {
      type: String,
      trim: true,
      default: "Wooh's"
    },
    tags: [{
      type: String,
      trim: true
    }],
    weight: {
      type: String,
      trim: true,
      default: '1 kg'
    },
    dimensions: {
      type: String,
      trim: true,
      default: '25 × 15 × 10 cm'
    },
    type: {
      type: String,
      trim: true,
      default: 'Organic'
    },
    mfgDate: {
      type: String,
      trim: true,
      default: 'Jun 4, 2021'
    },
    lifespan: {
      type: String,
      trim: true,
      default: '30 days'
    },
    isNew: {
      type: Boolean,
      default: false
    },
    isPopular: {
      type: Boolean,
      default: false
    },
    stock: {
      type: String,
      enum: {
        values: ['in_stock', 'low_stock', 'out_of_stock'],
        message: 'Stock must be in_stock, low_stock, or out_of_stock'
      },
      default: 'in_stock'
    },
    active: {
      type: Boolean,
      default: true
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters']
    },
    stockQuantity: {
      type: Number,
      default: 0,
      min: [0, 'Stock quantity cannot be negative']
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    suppressReservedKeysWarning: true
  }
);

// Indexes for faster queries
productSchema.index({ category: 1 });
productSchema.index({ active: 1 });
productSchema.index({ stock: 1 });

const Product = mongoose.model('Product', productSchema);

export default Product;
