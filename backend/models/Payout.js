import mongoose from 'mongoose';

const payoutSchema = new mongoose.Schema({
  payoutId: {
    type: String,
    unique: true,
    sparse: true
  },
  reseller: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['completed', 'pending', 'processing', 'failed'],
    default: 'pending'
  },
  method: {
    type: String,
    enum: ['Bank Transfer', 'UPI', 'Wallet', 'Check'],
    default: 'Bank Transfer'
  },
  date: {
    type: Date,
    default: Date.now
  },
  transactionId: {
    type: String
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
});

// Virtual for formatted date
payoutSchema.virtual('formattedDate').get(function() {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const date = new Date(this.date);
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
});

// Ensure virtuals are included in JSON
payoutSchema.set('toJSON', { virtuals: true });
payoutSchema.set('toObject', { virtuals: true });

// Generate unique payout ID before saving
payoutSchema.pre('save', async function() {
  if (!this.payoutId) {
    const count = await mongoose.model('Payout').countDocuments();
    this.payoutId = `PAY${String(count + 1).padStart(3, '0')}`;
  }
});

const Payout = mongoose.model('Payout', payoutSchema);

export default Payout;
