import Payout from '../models/Payout.js';
import Order from '../models/Order.js';
import User from '../models/User.js';

// Get earnings statistics
export const getEarningsStats = async (req, res) => {
  try {
    // Calculate total commissions from all orders (using totalEarnings field)
    const totalCommissionsResult = await Order.aggregate([
      { $match: { paymentStatus: { $in: ['paid', 'pending'] } } },
      { $group: { _id: null, total: { $sum: '$totalEarnings' } } }
    ]);
    const totalCommissions = totalCommissionsResult[0]?.total || 0;

    // Calculate pending payouts
    const pendingPayoutsResult = await Payout.aggregate([
      { $match: { status: { $in: ['pending', 'processing'] } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const pendingPayouts = pendingPayoutsResult[0]?.total || 0;

    // Calculate paid payouts
    const paidPayoutsResult = await Payout.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const paidPayouts = paidPayoutsResult[0]?.total || 0;

    // Calculate growth rate (comparing last 30 days to previous 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    const currentPeriodResult = await Order.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo }, paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$totalEarnings' } } }
    ]);
    const currentPeriod = currentPeriodResult[0]?.total || 0;

    const previousPeriodResult = await Order.aggregate([
      { $match: { createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo }, paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$totalEarnings' } } }
    ]);
    const previousPeriod = previousPeriodResult[0]?.total || 1;

    const growthRate = previousPeriod > 0 ? ((currentPeriod - previousPeriod) / previousPeriod) * 100 : 0;

    res.json({
      success: true,
      data: {
        totalCommissions,
        totalCommissionsFormatted: `₹${totalCommissions.toLocaleString()}`,
        totalCommissionsChange: 18.2,
        pendingPayouts,
        pendingPayoutsFormatted: `₹${pendingPayouts.toLocaleString()}`,
        pendingPayoutsChange: -5.4,
        paidPayouts,
        paidPayoutsFormatted: `₹${paidPayouts.toLocaleString()}`,
        paidPayoutsChange: 22.8,
        growthRate: parseFloat(growthRate.toFixed(1)),
        growthRateFormatted: `${growthRate.toFixed(1)}%`,
        growthRateChange: 8.2
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching earnings stats',
      error: error.message
    });
  }
};

// Get earnings trend (monthly data)
export const getEarningsTrend = async (req, res) => {
  try {
    const { months = 6 } = req.query;
    
    // Get last N months of earnings and payouts
    const monthsData = [];
    const currentDate = new Date();
    
    for (let i = parseInt(months) - 1; i >= 0; i--) {
      const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() - i + 1, 0);
      
      // Get total earnings for the month (using totalEarnings field)
      const earningsResult = await Order.aggregate([
        { 
          $match: { 
            createdAt: { $gte: monthStart, $lte: monthEnd },
            paymentStatus: 'paid'
          } 
        },
        { $group: { _id: null, total: { $sum: '$totalEarnings' } } }
      ]);
      const earnings = earningsResult[0]?.total || 0;
      
      // Get total payouts for the month
      const payoutsResult = await Payout.aggregate([
        { 
          $match: { 
            date: { $gte: monthStart, $lte: monthEnd },
            status: 'completed'
          } 
        },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);
      const payouts = payoutsResult[0]?.total || 0;
      
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      
      monthsData.push({
        month: monthNames[monthStart.getMonth()],
        earnings,
        payouts
      });
    }
    
    res.json({
      success: true,
      data: monthsData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching earnings trend',
      error: error.message
    });
  }
};

// Get top resellers by earnings
export const getTopResellers = async (req, res) => {
  try {
    const { limit = 5 } = req.query;
    
    // Aggregate orders by reseller (using totalEarnings field)
    const topResellers = await Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      {
        $group: {
          _id: '$reseller',
          earnings: { $sum: '$totalEarnings' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { earnings: -1 } },
      { $limit: parseInt(limit) }
    ]);
    
    // For each reseller, check if they have pending payouts
    const resellersWithPayoutStatus = await Promise.all(
      topResellers.map(async (reseller) => {
        const pendingPayout = await Payout.findOne({
          reseller: reseller._id,
          status: { $in: ['pending', 'processing'] }
        });
        
        return {
          name: reseller._id,
          earnings: reseller.earnings,
          orders: reseller.orders,
          payout: pendingPayout ? 'pending' : 'paid'
        };
      })
    );
    
    res.json({
      success: true,
      data: resellersWithPayoutStatus
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching top resellers',
      error: error.message
    });
  }
};

// Get all payouts with pagination and filtering
export const getAllPayouts = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      method,
      search 
    } = req.query;
    
    // Build filter
    const filter = {};
    if (status) filter.status = status;
    if (method) filter.method = method;
    if (search) {
      filter.$or = [
        { reseller: { $regex: search, $options: 'i' } },
        { payoutId: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Execute query with pagination
    const payouts = await Payout.find(filter)
      .sort({ date: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
    
    const total = await Payout.countDocuments(filter);
    
    res.json({
      success: true,
      count: payouts.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: payouts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching payouts',
      error: error.message
    });
  }
};

// Get single payout by ID
export const getPayoutById = async (req, res) => {
  try {
    const payout = await Payout.findById(req.params.id);
    
    if (!payout) {
      return res.status(404).json({
        success: false,
        message: 'Payout not found'
      });
    }
    
    res.json({
      success: true,
      data: payout
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching payout',
      error: error.message
    });
  }
};

// Create new payout
export const createPayout = async (req, res) => {
  try {
    const payout = new Payout(req.body);
    await payout.save();
    
    // If payout is created with 'completed' status, deduct from user's available commission
    if (payout.status === 'completed') {
      // Extract email from reseller field (format: "Name (email@example.com)")
      const emailMatch = payout.reseller.match(/\(([^)]+)\)/);
      if (emailMatch && emailMatch[1]) {
        const userEmail = emailMatch[1];
        const user = await User.findOne({ email: userEmail });
        
        if (user) {
          user.availableCommission = Math.max(0, user.availableCommission - payout.amount);
          await user.save();
          console.log(`Payout created as completed: Deducted ₹${payout.amount} from ${user.email}'s available commission`);
        } else {
          console.warn(`User not found for email: ${userEmail}`);
        }
      }
    }
    
    res.status(201).json({
      success: true,
      message: 'Payout created successfully',
      data: payout
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating payout',
      error: error.message
    });
  }
};

// Update payout
export const updatePayout = async (req, res) => {
  try {
    // Get the old payout data first
    const oldPayout = await Payout.findById(req.params.id);
    
    if (!oldPayout) {
      return res.status(404).json({
        success: false,
        message: 'Payout not found'
      });
    }
    
    const oldStatus = oldPayout.status;
    const oldAmount = oldPayout.amount;
    
    // Update the payout
    const payout = await Payout.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    const newStatus = payout.status;
    const newAmount = payout.amount;
    
    // Handle commission updates if status or amount changed
    if (oldStatus !== newStatus || oldAmount !== newAmount) {
      // Extract email from reseller field (format: "Name (email@example.com)")
      const emailMatch = payout.reseller.match(/\(([^)]+)\)/);
      if (emailMatch && emailMatch[1]) {
        const userEmail = emailMatch[1];
        const user = await User.findOne({ email: userEmail });
        
        if (user) {
          // Calculate the adjustment needed
          let adjustment = 0;
          
          // If status changed TO completed or was already completed and amount changed
          if (newStatus === 'completed') {
            if (oldStatus !== 'completed') {
              // Status changed to completed: deduct new amount
              adjustment = -newAmount;
            } else if (oldAmount !== newAmount) {
              // Amount changed while status is completed: adjust by difference
              adjustment = oldAmount - newAmount;
            }
          }
          // If status changed FROM completed to something else
          else if (oldStatus === 'completed') {
            // Status changed from completed: add back old amount
            adjustment = oldAmount;
          }
          
          if (adjustment !== 0) {
            user.availableCommission = Math.max(0, user.availableCommission + adjustment);
            await user.save();
            console.log(`Payout updated: Adjusted ${user.email}'s available commission by ₹${adjustment}`);
          }
        } else {
          console.warn(`User not found for email: ${userEmail}`);
        }
      }
    }
    
    res.json({
      success: true,
      message: 'Payout updated successfully',
      data: payout
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating payout',
      error: error.message
    });
  }
};

// Update payout status
export const updatePayoutStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['completed', 'pending', 'processing', 'failed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }
    
    // Get the payout with old status
    const oldPayout = await Payout.findById(req.params.id);
    
    if (!oldPayout) {
      return res.status(404).json({
        success: false,
        message: 'Payout not found'
      });
    }
    
    const oldStatus = oldPayout.status;
    const newStatus = status;
    
    // Update payout status
    const payout = await Payout.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );
    
    // Handle commission updates when status changes
    if (oldStatus !== newStatus) {
      // Extract email from reseller field (format: "Name (email@example.com)")
      const emailMatch = payout.reseller.match(/\(([^)]+)\)/);
      if (emailMatch && emailMatch[1]) {
        const userEmail = emailMatch[1];
        const user = await User.findOne({ email: userEmail });
        
        if (user) {
          // If status changed TO completed: Deduct from availableCommission
          if (newStatus === 'completed' && oldStatus !== 'completed') {
            user.availableCommission = Math.max(0, user.availableCommission - payout.amount);
            await user.save();
            console.log(`Payout completed: Deducted ₹${payout.amount} from ${user.email}'s available commission`);
          }
          // If status changed FROM completed: Add back to availableCommission
          else if (oldStatus === 'completed' && newStatus !== 'completed') {
            user.availableCommission += payout.amount;
            await user.save();
            console.log(`Payout reverted: Added back ₹${payout.amount} to ${user.email}'s available commission`);
          }
        } else {
          console.warn(`User not found for email: ${userEmail}`);
        }
      }
    }
    
    res.json({
      success: true,
      message: 'Payout status updated successfully',
      data: payout
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating payout status',
      error: error.message
    });
  }
};

// Delete payout
export const deletePayout = async (req, res) => {
  try {
    const payout = await Payout.findById(req.params.id);
    
    if (!payout) {
      return res.status(404).json({
        success: false,
        message: 'Payout not found'
      });
    }
    
    // If deleting a completed payout, add amount back to user's available commission
    if (payout.status === 'completed') {
      // Extract email from reseller field (format: "Name (email@example.com)")
      const emailMatch = payout.reseller.match(/\(([^)]+)\)/);
      if (emailMatch && emailMatch[1]) {
        const userEmail = emailMatch[1];
        const user = await User.findOne({ email: userEmail });
        
        if (user) {
          user.availableCommission += payout.amount;
          await user.save();
          console.log(`Completed payout deleted: Added back ₹${payout.amount} to ${user.email}'s available commission`);
        } else {
          console.warn(`User not found for email: ${userEmail}`);
        }
      }
    }
    
    // Delete the payout
    await Payout.findByIdAndDelete(req.params.id);
    
    res.json({
      success: true,
      message: 'Payout deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting payout',
      error: error.message
    });
  }
};
