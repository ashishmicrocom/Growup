import mongoose from 'mongoose';

const recognitionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Recognition name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    logo: {
      type: String,
      required: [true, 'Logo is required'],
      trim: true
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    isActive: {
      type: Boolean,
      default: true
    },
    order: {
      type: Number,
      default: 0
    },
    externalLink: {
      type: String,
      trim: true,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model('Recognition', recognitionSchema);
