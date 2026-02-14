import User from '../models/User.js';
import Commission from '../models/Commission.js';
import Order from '../models/Order.js';

/**
 * 4-LEVEL REFERRAL COMMISSION SYSTEM
 * 
 * Rules:
 * - Commission calculated on product price (sale amount)
 * - Each user can earn commission only up to Level 4
 * - Level 5+ users: Not visible, No commission paid
 * 
 * Direct Referral (Level 1):
 * - First Sale: 10% (6% + 4% bonus)
 * - Second Sale onward: 6%
 * 
 * Indirect Referrals:
 * - Level 2: L1=6%, Parent=4%
 * - Level 3: L2=6%, L1=4%, Parent=2%
 * - Level 4: L3=6%, L2=4%, L1=2%, Parent=1%
 * - Level 5+: Chain stops, no commission
 */

const MAX_COMMISSION_LEVELS = 4;
const BASE_COMMISSION_PERCENTAGE = 6;

/**
 * Referral commission distribution
 * Key: Seller's level in hierarchy
 * Value: Array of {uplineLevel, percentage} for each ancestor
 * Note: uplineLevel 0 = direct parent, 1 = grandparent, 2 = great-grandparent, 3 = root
 */
const REFERRAL_DISTRIBUTION = {
  // Level 1 user makes sale
  1: [
    { uplineLevel: 0, percentage: 6, isFirstSaleBonus: true } // Direct parent gets 6% + 4% bonus on first sale
  ],
  // Level 2 user makes sale
  2: [
    { uplineLevel: 0, percentage: 6, isFirstSaleBonus: true },  // Direct parent (Level 1) gets 6% + 4% bonus on first sale
    { uplineLevel: 1, percentage: 4 }   // Root parent gets 4%
  ],
  // Level 3 user makes sale
  3: [
    { uplineLevel: 0, percentage: 6, isFirstSaleBonus: true },  // Direct parent (Level 2) gets 6% + 4% bonus on first sale
    { uplineLevel: 1, percentage: 4 },  // Level 1 gets 4%
    { uplineLevel: 2, percentage: 2 }   // Root parent gets 2%
  ],
  // Level 4 user makes sale
  4: [
    { uplineLevel: 0, percentage: 6, isFirstSaleBonus: true },  // Direct parent (Level 3) gets 6% + 4% bonus on first sale
    { uplineLevel: 1, percentage: 4 },  // Level 2 gets 4%
    { uplineLevel: 2, percentage: 2 },  // Level 1 gets 2%
    { uplineLevel: 3, percentage: 1 }   // Root parent gets 1%
  ]
  // Level 5+: Not included, commission chain stops
};


/**
 * Get user's referral chain (upline hierarchy) up to MAX levels
 * @param {String} userId - User ID to get referral chain for
 * @returns {Array} Array of user IDs in referral chain [parent, level1, level2, level3]
 */
export const getReferralChain = async (userId) => {
  const chain = [];
  let currentUserId = userId;
  
  // Build referral chain up to MAX_COMMISSION_LEVELS
  for (let i = 0; i < MAX_COMMISSION_LEVELS; i++) {
    const user = await User.findById(currentUserId).select('referredBy');
    
    if (!user || !user.referredBy) {
      break; // No more upline
    }
    
    // Find the user who referred this user
    const referrer = await User.findOne({ myReferralCode: user.referredBy }).select('_id');
    
    if (!referrer) {
      break; // Referrer not found
    }
    
    chain.push(referrer._id);
    currentUserId = referrer._id;
  }
  
  return chain;
};

/**
 * Get seller's level in referral hierarchy
 * @param {String} sellerId - Seller's user ID
 * @returns {Number} Level (1-4, or 0 if no upline, or 5+ if beyond visible level)
 */
export const getSellerLevel = async (sellerId) => {
  const chain = await getReferralChain(sellerId);
  return chain.length; // 0 = no upline, 1-4 = levels, 5+ = beyond commission range
};

/**
 * Check if this is the first sale by a user
 * @param {String} userId - User ID
 * @param {String} currentOrderId - Current order ID to exclude from count
 * @returns {Boolean} True if this is their first completed order
 */
export const isFirstSale = async (userId, currentOrderId = null) => {
  const query = {
    user: userId,
    orderStatus: { $in: ['processing', 'shipped', 'delivered'] }
  };
  
  // Exclude current order from count since it was just created
  if (currentOrderId) {
    query._id = { $ne: currentOrderId };
  }
  
  const orderCount = await Order.countDocuments(query);
  
  return orderCount === 0; // True if no previous orders
};

/**
 * Calculate and create commission records for an order
 * @param {Object} order - Order object
 * @param {String} sellerId - ID of user who made the sale
 * @param {Number} productPrice - Price of the product sold
 * @returns {Object} Commission calculation results
 */
export const calculateAndCreateCommissions = async (order, sellerId, productPrice) => {
  try {
    const seller = await User.findById(sellerId);
    
    if (!seller) {
      throw new Error('Seller not found');
    }
    
    // Get seller's level in hierarchy
    const sellerLevel = await getSellerLevel(sellerId);
    
    console.log(`[Commission] Seller: ${seller.firstName} ${seller.lastName}, Level: ${sellerLevel}, Product Price: ${productPrice}`);
    
    // Level 5+ users: No commission chain
    if (sellerLevel > MAX_COMMISSION_LEVELS) {
      console.log(`[Commission] Seller is beyond Level ${MAX_COMMISSION_LEVELS}, no commission chain`);
      return {
        success: true,
        message: 'Seller is beyond Level 4, no commission chain activated',
        baseCommission: 0,
        commissions: []
      };
    }
    
    // Level 0 users: No upline, no commissions to distribute
    if (sellerLevel === 0) {
      console.log(`[Commission] Seller has no upline (Level 0), no commission chain`);
      return {
        success: true,
        message: 'Seller has no upline, no commission chain',
        baseCommission: 0,
        commissions: []
      };
    }
    
    const commissions = [];
    
    // Only distribute to upline if seller is at level 1-4 (has upline)
    if (sellerLevel > 0 && sellerLevel <= MAX_COMMISSION_LEVELS) {
      const referralChain = await getReferralChain(sellerId);
      const distribution = REFERRAL_DISTRIBUTION[sellerLevel];
      
      console.log(`[Commission] Referral chain length: ${referralChain.length}, Distribution rules: ${distribution?.length || 0}`);
      
      if (distribution && referralChain.length > 0) {
        // Check if this is the first sale by the seller (for first-sale bonus)
        const isFirst = await isFirstSale(sellerId, order._id);
        
        console.log(`[Commission] Is first sale: ${isFirst}`);
        
        // Distribute commissions to upline
        for (const dist of distribution) {
          const uplineIndex = dist.uplineLevel;
          
          // Check if this upline level exists in the chain
          if (uplineIndex < referralChain.length) {
            const recipientId = referralChain[uplineIndex];
            let commissionPercentage = dist.percentage;
            
            // Apply first-sale bonus: Direct parent gets 6% + 4% bonus on seller's first sale
            if (uplineIndex === 0 && isFirst && dist.isFirstSaleBonus) {
              commissionPercentage = 10; // 6% + 4% bonus for direct parent on first sale
            }
            
            const commissionAmount = (productPrice * commissionPercentage) / 100;
            
            console.log(`[Commission] Creating commission - Recipient: ${recipientId}, Amount: ₹${commissionAmount} (${commissionPercentage}%), Upline Index: ${uplineIndex}`);
            
            const referralCommission = new Commission({
              recipient: recipientId,
              seller: sellerId,
              order: order._id,
              type: 'referral',
              level: sellerLevel, // Seller's level in hierarchy
              productPrice,
              sellerSlabPercentage: BASE_COMMISSION_PERCENTAGE,
              sellerTotalSalesAtTime: seller.totalSales || 0,
              baseCommissionAmount: commissionAmount,
              commissionPercentage,
              amount: commissionAmount,
              status: 'pending',
              orderStatus: order.orderStatus,
              description: `${isFirst && sellerLevel === 1 && uplineIndex === 0 ? 'First sale bonus + ' : ''}Referral commission from Level ${sellerLevel} sale`
            });
            
            await referralCommission.save();
            commissions.push(referralCommission);
            console.log(`[Commission] Successfully saved commission ID: ${referralCommission._id}`);
          }
        }
      }
    }
    
    console.log(`[Commission] Total commissions created: ${commissions.length}`);
    
    return {
      success: true,
      baseCommission: BASE_COMMISSION_PERCENTAGE,
      sellerLevel,
      commissions
    };
    
  } catch (error) {
    console.error('calculateAndCreateCommissions error:', error);
    throw error;
  }
};

/**
 * Credit commissions when order is delivered
 * @param {String} orderId - Order ID
 */
export const creditCommissionsForOrder = async (orderId) => {
  try {
    // Find all pending commissions for this order
    const commissions = await Commission.find({
      order: orderId,
      status: 'pending'
    });
    
    if (commissions.length === 0) {
      return { success: true, message: 'No pending commissions found' };
    }
    
    // Update each commission and user balance
    for (const commission of commissions) {
      // Update commission status
      commission.status = 'credited';
      commission.orderStatus = 'delivered';
      await commission.save();
      
      // Update user balances
      const user = await User.findById(commission.recipient);
      
      if (user) {
        // Move from pending to available
        user.pendingCommission = Math.max(0, (user.pendingCommission || 0) - commission.amount);
        user.availableCommission = (user.availableCommission || 0) + commission.amount;
        
        // Update total earnings
        if (commission.type === 'direct') {
          user.directCommissionEarned = (user.directCommissionEarned || 0) + commission.amount;
          user.totalEarnings = (user.totalEarnings || 0) + commission.amount;
        } else {
          user.referralCommissionEarned = (user.referralCommissionEarned || 0) + commission.amount;
        }
        
        await user.save();
      }
    }
    
    return {
      success: true,
      message: `Credited ${commissions.length} commissions`,
      count: commissions.length
    };
    
  } catch (error) {
    console.error('creditCommissionsForOrder error:', error);
    throw error;
  }
};

/**
 * Cancel commissions when order is cancelled
 * @param {String} orderId - Order ID
 */
export const cancelCommissionsForOrder = async (orderId) => {
  try {
    // Find all pending commissions for this order
    const commissions = await Commission.find({
      order: orderId,
      status: 'pending'
    });
    
    if (commissions.length === 0) {
      return { success: true, message: 'No pending commissions found' };
    }
    
    // Update each commission and user balance
    for (const commission of commissions) {
      // Update commission status
      commission.status = 'cancelled';
      commission.orderStatus = 'cancelled';
      await commission.save();
      
      // Update user pending commission
      const user = await User.findById(commission.recipient);
      
      if (user) {
        user.pendingCommission = Math.max(0, (user.pendingCommission || 0) - commission.amount);
        await user.save();
      }
    }
    
    return {
      success: true,
      message: `Cancelled ${commissions.length} commissions`,
      count: commissions.length
    };
    
  } catch (error) {
    console.error('cancelCommissionsForOrder error:', error);
    throw error;
  }
};

/**
 * Add pending commission amounts to users when order is created
 * @param {Array} commissions - Array of commission objects
 */
export const addPendingCommissions = async (commissions) => {
  try {
    for (const commission of commissions) {
      const user = await User.findById(commission.recipient);
      
      if (user) {
        user.pendingCommission = (user.pendingCommission || 0) + commission.amount;
        await user.save();
      }
    }
  } catch (error) {
    console.error('addPendingCommissions error:', error);
    throw error;
  }
};

export default {
  getReferralChain,
  getSellerLevel,
  isFirstSale,
  calculateAndCreateCommissions,
  creditCommissionsForOrder,
  cancelCommissionsForOrder,
  addPendingCommissions
};
