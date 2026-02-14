import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true
    },
    phone: {
      type: String,
      trim: true
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true
    },
    reply: {
      type: String,
      trim: true
    },
    repliedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    repliedAt: {
      type: Date
    },
    status: {
      type: String,
      enum: ['pending', 'replied', 'resolved'],
      default: 'pending'
    },
    type: {
      type: String,
      enum: ['general', 'referral_request', 'support', 'complaint'],
      default: 'general'
    },
    read: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// Indexes
contactSchema.index({ status: 1 });
contactSchema.index({ type: 1 });
contactSchema.index({ createdAt: -1 });
contactSchema.index({ read: 1 });

const Contact = mongoose.model('Contact', contactSchema);

export default Contact;
