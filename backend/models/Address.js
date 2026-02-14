import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true
    },
    mobile: {
      type: String,
      required: [true, 'Mobile number is required'],
      trim: true
    },
    pincode: {
      type: String,
      required: [true, 'Pincode is required'],
      trim: true
    },
    locality: {
      type: String,
      required: [true, 'Locality is required'],
      trim: true
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true
    },
    landmark: {
      type: String,
      trim: true
    },
    alternatePhone: {
      type: String,
      trim: true
    },
    addressType: {
      type: String,
      enum: {
        values: ['home', 'work'],
        message: 'Address type must be home or work'
      },
      default: 'home'
    },
    isDefault: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// Index for faster queries
addressSchema.index({ user: 1 });

const Address = mongoose.model('Address', addressSchema);

export default Address;
