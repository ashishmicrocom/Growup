import Order from '../models/Order.js';
import User from '../models/User.js';
import {
  calculateAndCreateCommissions,
  addPendingCommissions,
  creditCommissionsForOrder,
  cancelCommissionsForOrder
} from '../services/commissionService.js';

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
export const getAllOrders = async (req, res) => {
  try {
    const { orderStatus, paymentStatus, search, page = 1, limit = 100 } = req.query;

    const query = {};

    if (orderStatus) query.orderStatus = orderStatus;
    if (paymentStatus) query.paymentStatus = paymentStatus;
    if (search) {
      query.$or = [
        { orderId: { $regex: search, $options: 'i' } },
        { customer: { $regex: search, $options: 'i' } },
        { product: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;

    const orders = await Order.find(query)
      .populate('items.product', 'name image images price originalPrice description')
      .populate('user', 'firstName lastName email mobile')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Order.countDocuments(query);

    return res.status(200).json({
      success: true,
      count: orders.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: orders
    });
  } catch (error) {
    console.error('getAllOrders error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error fetching orders'
    });
  }
};

// @desc    Get user's orders
// @route   GET /api/orders/user/my-orders
// @access  Private
export const getUserOrders = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    // Get user details for email/phone matching
    const user = req.user;

    // Find orders by user ID or by matching email/phone in shipping address
    const query = {
      $or: [
        { user: userId },
        { 'shippingAddress.email': user.email },
        { 'shippingAddress.phone': user.phone }
      ]
    };

    const orders = await Order.find(query)
      .populate('items.product', 'name images')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    console.error('getUserOrders error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error fetching user orders'
    });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private/Admin
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('getOrderById error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error fetching order'
    });
  }
};

// @desc    Create new order
// @route   POST /api/orders
// @access  Public
export const createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, totalAmount, totalEarnings, paymentStatus, orderStatus } = req.body;

    // Get user ID if authenticated
    const userId = req.user?.id || req.user?._id;

    // Generate order ID
    const lastOrder = await Order.findOne().sort({ createdAt: -1 });
    let orderNumber = 2848; // Starting number
    
    if (lastOrder && lastOrder.orderId) {
      const lastNumber = parseInt(lastOrder.orderId.split('-')[1]);
      orderNumber = lastNumber + 1;
    }
    
    const orderId = `ORD-${orderNumber}`;

    // Create order with new structure
    const orderData = {
      orderId,
      items,
      shippingAddress,
      totalAmount,
      totalEarnings,
      // Set legacy fields for backward compatibility with admin panel
      customer: shippingAddress.name,
      product: items.map(item => item.productName).join(', '),
      amount: totalAmount,
      reseller: 'Customer', // Default value
      paymentStatus: paymentStatus || 'pending',
      orderStatus: orderStatus || 'processing'
    };

    // Add user if authenticated
    if (userId) {
      orderData.user = userId;
    }

    const order = await Order.create(orderData);

    // Calculate and create commissions if user is authenticated
    if (userId) {
      try {
        // Calculate total product price from items
        const totalProductPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        // Calculate commissions
        const commissionResult = await calculateAndCreateCommissions(order, userId, totalProductPrice);
        
        // Add pending commission amounts to users
        if (commissionResult.commissions && commissionResult.commissions.length > 0) {
          await addPendingCommissions(commissionResult.commissions);
        }
        
        // Update seller's total sales (no commission slab system anymore)
        const user = await User.findById(userId);
        const newTotalSales = (user.totalSales || 0) + totalProductPrice;
        await User.findByIdAndUpdate(userId, { totalSales: newTotalSales });
        
        console.log(`Commissions created for order ${orderId}:`, {
          baseCommission: commissionResult.baseCommission,
          sellerLevel: commissionResult.sellerLevel,
          commissionCount: commissionResult.commissions.length
        });
      } catch (commError) {
        console.error('Error calculating commissions:', commError);
        // Don't fail the order creation if commission calculation fails
      }
    }

    // Update user's totalOrders and totalEarnings if user is authenticated
    if (userId) {
      await User.findByIdAndUpdate(
        userId,
        {
          $inc: {
            totalOrders: 1,
            totalEarnings: totalEarnings || 0
          }
        }
      );
    }

    return res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: order
    });
  } catch (error) {
    console.error('createOrder error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error creating order'
    });
  }
};

// @desc    Update order
// @route   PUT /api/orders/:id
// @access  Private/Admin
export const updateOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const { customer, product, amount, reseller, paymentStatus, orderStatus } = req.body;

    order.customer = customer || order.customer;
    order.product = product || order.product;
    order.amount = amount !== undefined ? amount : order.amount;
    order.reseller = reseller || order.reseller;
    order.paymentStatus = paymentStatus || order.paymentStatus;
    order.orderStatus = orderStatus || order.orderStatus;

    const updatedOrder = await order.save();

    return res.status(200).json({
      success: true,
      message: 'Order updated successfully',
      data: updatedOrder
    });
  } catch (error) {
    console.error('updateOrder error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error updating order'
    });
  }
};

// @desc    Update order status
// @route   PATCH /api/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const { orderStatus } = req.body;

    if (!orderStatus) {
      return res.status(400).json({
        success: false,
        message: 'Order status is required'
      });
    }

    const previousStatus = order.orderStatus;
    order.orderStatus = orderStatus;
    const updatedOrder = await order.save();

    // Handle commission state changes based on order status
    try {
      // When order is delivered, credit commissions
      if (orderStatus === 'delivered' && previousStatus !== 'delivered') {
        await creditCommissionsForOrder(order._id);
        console.log(`Commissions credited for order ${order.orderId}`);
      }
      
      // When order is cancelled, cancel commissions
      if (orderStatus === 'cancelled' && previousStatus !== 'cancelled') {
        await cancelCommissionsForOrder(order._id);
        console.log(`Commissions cancelled for order ${order.orderId}`);
      }
    } catch (commError) {
      console.error('Error handling commissions on status change:', commError);
      // Don't fail the status update if commission handling fails
    }

    return res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      data: updatedOrder
    });
  } catch (error) {
    console.error('updateOrderStatus error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error updating order status'
    });
  }
};

// @desc    Delete order (Cancel)
// @route   DELETE /api/orders/:id
// @access  Private/Admin
export const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    await order.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Order deleted successfully',
      data: {}
    });
  } catch (error) {
    console.error('deleteOrder error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error deleting order'
    });
  }
};

// @desc    Get order statistics
// @route   GET /api/orders/stats
// @access  Private/Admin
export const getOrderStats = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const processingOrders = await Order.countDocuments({ orderStatus: 'processing' });
    const shippedOrders = await Order.countDocuments({ orderStatus: 'shipped' });
    const deliveredOrders = await Order.countDocuments({ orderStatus: 'delivered' });
    const cancelledOrders = await Order.countDocuments({ orderStatus: 'cancelled' });
    
    const paidOrders = await Order.countDocuments({ paymentStatus: 'paid' });
    const pendingPayments = await Order.countDocuments({ paymentStatus: 'pending' });
    const failedPayments = await Order.countDocuments({ paymentStatus: 'failed' });

    // Calculate total revenue (only paid orders)
    const revenueResult = await Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    return res.status(200).json({
      success: true,
      data: {
        totalOrders,
        processingOrders,
        shippedOrders,
        deliveredOrders,
        cancelledOrders,
        paidOrders,
        pendingPayments,
        failedPayments,
        totalRevenue
      }
    });
  } catch (error) {
    console.error('getOrderStats error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error fetching order statistics'
    });
  }
};
