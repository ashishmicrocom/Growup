import User from '../models/User.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Payout from '../models/Payout.js';

// Get dashboard statistics
export const getDashboardStats = async (req, res) => {
  try {
    // Total Active Users
    const totalUsers = await User.countDocuments({ status: 'active' });
    
    // Total Resellers (active users with role 'reseller' or 'admin')
    const totalResellers = await User.countDocuments({ 
      role: { $in: ['reseller', 'admin'] },
      status: 'active'
    });
    
    // Total Orders
    const totalOrders = await Order.countDocuments();
    
    // Total Revenue (sum of all paid orders)
    const revenueResult = await Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalRevenue = revenueResult[0]?.total || 0;
    
    // Today's Orders
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const todayOrders = await Order.countDocuments({
      createdAt: { $gte: startOfToday }
    });
    
    // Pending Orders
    const pendingOrders = await Order.countDocuments({
      orderStatus: 'pending'
    });
    
    // Calculate changes (mock data for now - can be calculated from historical data)
    const stats = {
      totalUsers: {
        value: totalUsers,
        formatted: totalUsers.toLocaleString(),
        change: 12.5
      },
      totalResellers: {
        value: totalResellers,
        formatted: totalResellers.toLocaleString(),
        change: 8.2
      },
      totalOrders: {
        value: totalOrders,
        formatted: totalOrders.toLocaleString(),
        change: 15.3
      },
      totalRevenue: {
        value: totalRevenue,
        formatted: `₹${totalRevenue.toLocaleString()}`,
        change: 22.1
      },
      todayOrders: {
        value: todayOrders,
        formatted: todayOrders.toString(),
        change: 5.8
      },
      pendingOrders: {
        value: pendingOrders,
        formatted: pendingOrders.toString(),
        change: -12.4
      }
    };
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard stats',
      error: error.message
    });
  }
};

// Get sales data (daily, weekly, monthly)
export const getSalesData = async (req, res) => {
  try {
    const { period = 'daily' } = req.query;
    
    let data = [];
    const now = new Date();
    
    if (period === 'daily') {
      // Last 7 days
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        
        const nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + 1);
        
        const orders = await Order.find({
          createdAt: { $gte: date, $lt: nextDate }
        });
        
        const sales = orders.reduce((sum, order) => {
          return order.paymentStatus === 'paid' ? sum + order.amount : sum;
        }, 0);
        
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        data.push({
          name: dayNames[date.getDay()],
          sales,
          orders: orders.length
        });
      }
    } else if (period === 'weekly') {
      // Last 4 weeks
      for (let i = 3; i >= 0; i--) {
        const weekStart = new Date(now);
        weekStart.setDate(weekStart.getDate() - (i * 7) - weekStart.getDay());
        weekStart.setHours(0, 0, 0, 0);
        
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 7);
        
        const orders = await Order.find({
          createdAt: { $gte: weekStart, $lt: weekEnd }
        });
        
        const sales = orders.reduce((sum, order) => {
          return order.paymentStatus === 'paid' ? sum + order.amount : sum;
        }, 0);
        
        data.push({
          name: `Week ${4 - i}`,
          sales,
          orders: orders.length
        });
      }
    } else if (period === 'monthly') {
      // Last 6 months
      for (let i = 5; i >= 0; i--) {
        const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
        monthEnd.setHours(23, 59, 59, 999);
        
        const orders = await Order.find({
          createdAt: { $gte: monthStart, $lte: monthEnd }
        });
        
        const sales = orders.reduce((sum, order) => {
          return order.paymentStatus === 'paid' ? sum + order.amount : sum;
        }, 0);
        
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        data.push({
          name: monthNames[monthStart.getMonth()],
          sales,
          orders: orders.length
        });
      }
    }
    
    res.json({
      success: true,
      period,
      data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching sales data',
      error: error.message
    });
  }
};

// Get category distribution
export const getCategoryDistribution = async (req, res) => {
  try {
    // Get revenue by category from products and orders
    const categoryData = await Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      {
        $lookup: {
          from: 'products',
          localField: 'product',
          foreignField: 'name',
          as: 'productInfo'
        }
      },
      { $unwind: { path: '$productInfo', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: '$productInfo.category',
          revenue: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { revenue: -1 } }
    ]);
    
    // Calculate total revenue
    const totalRevenue = categoryData.reduce((sum, cat) => sum + cat.revenue, 0);
    
    // Calculate percentages and format data
    const formattedData = categoryData.map(cat => ({
      name: cat._id || 'Others',
      value: totalRevenue > 0 ? Math.round((cat.revenue / totalRevenue) * 100) : 0,
      revenue: cat.revenue,
      count: cat.count
    }));
    
    res.json({
      success: true,
      data: formattedData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching category distribution',
      error: error.message
    });
  }
};

// Get recent orders
export const getRecentOrders = async (req, res) => {
  try {
    const { limit = 5 } = req.query;
    
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));
    
    // Format orders with relative time
    const formattedOrders = orders.map(order => {
      const now = new Date();
      const orderDate = new Date(order.createdAt);
      const diffHours = Math.floor((now - orderDate) / (1000 * 60 * 60));
      
      let timeLabel;
      if (diffHours < 24) {
        timeLabel = 'Today';
      } else if (diffHours < 48) {
        timeLabel = 'Yesterday';
      } else {
        const diffDays = Math.floor(diffHours / 24);
        timeLabel = `${diffDays} days ago`;
      }
      
      return {
        id: order.orderId,
        customer: order.customer,
        product: order.product,
        amount: order.amount,
        status: order.orderStatus,
        date: timeLabel,
        createdAt: order.createdAt
      };
    });
    
    res.json({
      success: true,
      data: formattedOrders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching recent orders',
      error: error.message
    });
  }
};

// Get recent activity
export const getRecentActivity = async (req, res) => {
  try {
    const { limit = 5 } = req.query;
    
    const activities = [];
    
    // Get recent orders
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(2);
    
    recentOrders.forEach(order => {
      activities.push({
        type: 'order',
        title: `New Order #${order.orderId}`,
        description: `${order.customer} ordered ${order.product}`,
        time: order.createdAt,
        data: order
      });
    });
    
    // Get recent users
    const recentUsers = await User.find({ role: 'reseller' })
      .sort({ createdAt: -1 })
      .limit(1);
    
    recentUsers.forEach(user => {
      activities.push({
        type: 'user',
        title: 'New Reseller Joined',
        description: `${user.name} registered as reseller`,
        time: user.createdAt,
        data: user
      });
    });
    
    // Get recent payouts
    const recentPayouts = await Payout.find({ status: 'completed' })
      .sort({ date: -1 })
      .limit(1);
    
    recentPayouts.forEach(payout => {
      activities.push({
        type: 'payout',
        title: 'Payout Completed',
        description: `₹${payout.amount.toLocaleString()} sent to ${payout.reseller}`,
        time: payout.date,
        data: payout
      });
    });
    
    // Get recent product updates
    const recentProducts = await Product.find()
      .sort({ updatedAt: -1 })
      .limit(1);
    
    recentProducts.forEach(product => {
      activities.push({
        type: 'product',
        title: 'Product Updated',
        description: `Stock updated for ${product.name}`,
        time: product.updatedAt,
        data: product
      });
    });
    
    // Sort by time and limit
    activities.sort((a, b) => new Date(b.time) - new Date(a.time));
    const limitedActivities = activities.slice(0, parseInt(limit));
    
    // Format with relative time
    const formattedActivities = limitedActivities.map((activity, index) => {
      const now = new Date();
      const activityTime = new Date(activity.time);
      const diffMinutes = Math.floor((now - activityTime) / (1000 * 60));
      
      let timeLabel;
      if (diffMinutes < 1) {
        timeLabel = 'Just now';
      } else if (diffMinutes < 60) {
        timeLabel = `${diffMinutes} min${diffMinutes > 1 ? 's' : ''} ago`;
      } else {
        const diffHours = Math.floor(diffMinutes / 60);
        if (diffHours < 24) {
          timeLabel = `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        } else {
          const diffDays = Math.floor(diffHours / 24);
          timeLabel = `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        }
      }
      
      return {
        id: (index + 1).toString(),
        type: activity.type,
        title: activity.title,
        description: activity.description,
        time: timeLabel,
        timestamp: activity.time
      };
    });
    
    res.json({
      success: true,
      data: formattedActivities
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching recent activity',
      error: error.message
    });
  }
};
