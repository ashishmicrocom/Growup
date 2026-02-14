import express from 'express';
import Commission from '../models/Commission.js';
import { protect, admin } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Get all commissions (admin only)
router.get('/', protect, admin, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      type,
      recipientId,
      sellerId,
      orderId
    } = req.query;

    const query = {};
    
    if (status) query.status = status;
    if (type) query.type = type;
    if (recipientId) query.recipient = recipientId;
    if (sellerId) query.seller = sellerId;
    if (orderId) query.order = orderId;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [commissions, total] = await Promise.all([
      Commission.find(query)
        .populate('recipient', 'firstName lastName email')
        .populate('seller', 'firstName lastName email')
        .populate('order', 'orderId orderStatus totalAmount')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Commission.countDocuments(query)
    ]);

    res.json({
      success: true,
      count: commissions.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: commissions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch commissions'
    });
  }
});

// Get user's commissions (authenticated user)
router.get('/my-commissions', protect, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      type,
      sellerId
    } = req.query;

    const query = { recipient: req.user._id };
    
    if (status) query.status = status;
    if (type) query.type = type;
    if (sellerId) query.seller = sellerId;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [commissions, total] = await Promise.all([
      Commission.find(query)
        .populate('seller', 'firstName lastName email')
        .populate('order', 'orderId orderStatus totalAmount')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Commission.countDocuments(query)
    ]);

    res.json({
      success: true,
      count: commissions.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: commissions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch your commissions'
    });
  }
});

// Get commission statistics for a user
router.get('/stats', protect, async (req, res) => {
  try {
    const userId = req.user._id;

    const stats = await Commission.aggregate([
      { $match: { recipient: userId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);

    const typeStats = await Commission.aggregate([
      { $match: { recipient: userId } },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);

    const summary = {
      totalEarned: 0,
      pendingAmount: 0,
      creditedAmount: 0,
      cancelledAmount: 0,
      directCommission: 0,
      referralCommission: 0,
      totalTransactions: 0,
      creditedCount: 0,
      pendingCount: 0,
      cancelledCount: 0
    };

    stats.forEach(stat => {
      summary.totalTransactions += stat.count;
      
      if (stat._id === 'credited') {
        summary.creditedAmount = stat.totalAmount;
        summary.creditedCount = stat.count;
        summary.totalEarned += stat.totalAmount;
      } else if (stat._id === 'pending') {
        summary.pendingAmount = stat.totalAmount;
        summary.pendingCount = stat.count;
      } else if (stat._id === 'cancelled') {
        summary.cancelledAmount = stat.totalAmount;
        summary.cancelledCount = stat.count;
      }
    });

    typeStats.forEach(stat => {
      if (stat._id === 'direct') {
        summary.directCommission = stat.totalAmount;
      } else if (stat._id === 'referral') {
        summary.referralCommission = stat.totalAmount;
      }
    });

    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch commission stats'
    });
  }
});

// Get commission by ID
router.get('/:id', protect, async (req, res) => {
  try {
    const commission = await Commission.findById(req.params.id)
      .populate('recipient', 'firstName lastName email')
      .populate('seller', 'firstName lastName email')
      .populate('order');

    if (!commission) {
      return res.status(404).json({
        success: false,
        message: 'Commission not found'
      });
    }

    // Only allow users to view their own commissions, or admins to view any
    if (commission.recipient._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this commission'
      });
    }

    res.json({
      success: true,
      data: commission
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch commission'
    });
  }
});

export default router;
