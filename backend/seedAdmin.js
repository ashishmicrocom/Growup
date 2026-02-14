import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './models/User.js';

dotenv.config();

const MONGODB_URI = process.env.MONGO_URI;

const adminUser = {
  firstName: 'GrowUp',
  lastName: 'Admin',
  name: 'GrowUp Admin',
  email: 'admin@growup.com',
  password: 'admin123',
  mobile: '+919876543210',
  phone: '+919876543210',
  gender: 'male',
  myReferralCode: 'GROWUP2026',
  role: 'admin',
  status: 'active'
};

const seedAdmin = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminUser.email });
    
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists');
      console.log(`📧 Email: ${adminUser.email}`);
      console.log(`🔑 Password: admin123`);
      console.log(`🎫 Referral Code: ${existingAdmin.myReferralCode || 'GROWUP2026'}`);
      
      // Update to admin role and add missing fields if needed
      let updated = false;
      
      if (existingAdmin.role !== 'admin') {
        existingAdmin.role = 'admin';
        updated = true;
      }
      
      if (!existingAdmin.myReferralCode || existingAdmin.myReferralCode !== 'GROWUP2026') {
        existingAdmin.myReferralCode = 'GROWUP2026';
        updated = true;
      }
      
      if (!existingAdmin.firstName) {
        existingAdmin.firstName = 'GrowUp';
        existingAdmin.lastName = 'Admin';
        updated = true;
      }
      
      if (!existingAdmin.mobile) {
        existingAdmin.mobile = '+919876543210';
        updated = true;
      }
      
      if (!existingAdmin.gender) {
        existingAdmin.gender = 'male';
        updated = true;
      }
      
      if (updated) {
        // Use findOneAndUpdate to bypass pre-save hooks
        await User.findOneAndUpdate(
          { email: adminUser.email },
          {
            $set: {
              role: existingAdmin.role,
              myReferralCode: existingAdmin.myReferralCode,
              firstName: existingAdmin.firstName,
              lastName: existingAdmin.lastName,
              mobile: existingAdmin.mobile,
              gender: existingAdmin.gender
            }
          },
          { new: true }
        );
        console.log('✅ Admin user updated with referral code');
      }
    } else {
      // Create admin user
      const admin = new User(adminUser);
      await admin.save();
      
      console.log('✅ Admin user created successfully');
      console.log('\n📋 Admin Credentials:');
      console.log(`📧 Email: ${adminUser.email}`);
      console.log(`🔑 Password: admin123`);
      console.log(`👤 Name: ${adminUser.name}`);
      console.log(`📞 Phone: ${adminUser.mobile}`);
      console.log(`🎫 Referral Code: ${adminUser.myReferralCode}`);
      console.log(`👑 Role: ADMIN`);
      console.log('\n💡 Users can register using referral code: GROWUP2026');
    }
    
    mongoose.connection.close();
    console.log('\n✅ Database connection closed');
  } catch (error) {
    console.error('❌ Error seeding admin:', error);
    process.exit(1);
  }
};

seedAdmin();
