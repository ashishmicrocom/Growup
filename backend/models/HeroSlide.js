import mongoose from 'mongoose';

const heroSlideSchema = new mongoose.Schema(
  {
    subtitle: {
      type: String,
      trim: true,
      default: ''
    },
    text: {
      type: String,
      required: [true, 'Slide text is required'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true
    },
    image: {
      type: String,
      required: [true, 'Image is required'],
      trim: true
    },
    ctaButtons: [{
      text: {
        type: String,
        required: true,
        trim: true
      },
      link: {
        type: String,
        required: true,
        trim: true
      },
      variant: {
        type: String,
        enum: ['primary', 'secondary', 'outline'],
        default: 'primary'
      }
    }],
    features: [{
      text: {
        type: String,
        required: true,
        trim: true
      },
      icon: {
        type: String,
        required: true,
        trim: true
      }
    }],
    order: {
      type: Number,
      default: 0
    },
    contentAlignment: {
      type: String,
      enum: ['left', 'right'],
      default: 'right'
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// Index for faster queries
heroSlideSchema.index({ order: 1, isActive: 1 });

const HeroSlide = mongoose.model('HeroSlide', heroSlideSchema);

export default HeroSlide;
