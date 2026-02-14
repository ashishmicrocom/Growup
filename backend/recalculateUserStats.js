import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Order from './models/Order.js';

dotenv.config();

const recalculateUserStats = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected');

    // Get all users
    const users = await User.find({});
    console.log(`📊 Found ${users.length} users to update`);

    let updatedCount = 0;

    for (const user of users) {
      // Find all orders for this user (by user ID, email, or phone)
      const orders = await Order.find({
        $or: [
          { user: user._id },
          { 'shippingAddress.email': user.email },
          { 'shippingAddress.phone': user.phone },
          { 'shippingAddress.phone': user.mobile }
        ]
      });

      // Calculate totals
      const totalOrders = orders.length;
      const totalEarnings = orders.reduce((sum, order) => sum + (order.totalEarnings || 0), 0);

      // Update user
      await User.findByIdAndUpdate(user._id, {
        totalOrders,
        totalEarnings
      });

      console.log(`✅ Updated ${user.name}: ${totalOrders} orders, ₹${totalEarnings} earnings`);
      updatedCount++;
    }

    console.log(`\n✅ Successfully updated ${updatedCount} users`);
    
    // Display summary
    const totalOrders = await Order.countDocuments();
    const totalEarnings = (await Order.aggregate([
      { $group: { _id: null, total: { $sum: '$totalEarnings' } } }
    ]))[0]?.total || 0;

    console.log('\n📊 Overall Statistics:');
    console.log(`   Total Orders: ${totalOrders}`);
    console.log(`   Total Earnings: ₹${totalEarnings}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

recalculateUserStats();
