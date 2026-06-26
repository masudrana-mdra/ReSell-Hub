const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Category = require('../models/Category');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/analytics/admin
// @desc    Get dashboard metrics & chart data for admin
router.get('/admin', protect, authorize('admin'), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const dateQuery = {};
    if (startDate || endDate) {
      dateQuery.createdAt = {};
      if (startDate) dateQuery.createdAt.$gte = new Date(startDate);
      if (endDate) dateQuery.createdAt.$lte = new Date(endDate);
    }

    const totalUsers = await User.countDocuments(dateQuery);
    const totalBuyers = await User.countDocuments({ role: 'buyer', ...dateQuery });
    const totalSellers = await User.countDocuments({ role: 'seller', ...dateQuery });
    const totalProducts = await Product.countDocuments(dateQuery);
    const pendingProducts = await Product.countDocuments({ status: 'pending', ...dateQuery });
    const approvedProducts = await Product.countDocuments({ status: 'available', ...dateQuery });
    const rejectedProducts = await Product.countDocuments({ status: 'rejected', ...dateQuery });
    const totalOrders = await Order.countDocuments(dateQuery);
    
    // Revenue aggregation
    const matchStage = { paymentStatus: 'paid', orderStatus: { $ne: 'cancelled' } };
    if (dateQuery.createdAt) {
      matchStage.createdAt = dateQuery.createdAt;
    }
    const revenueData = await Order.aggregate([
      { $match: matchStage },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const totalRevenue = revenueData.length > 0 ? revenueData[0].total : 0;

    // Reported products count
    const totalReports = await Product.countDocuments({ reportsCount: { $gt: 0 } });

    // Category Performance
    const categories = await Category.find();
    const categoryPerformance = await Promise.all(
      categories.map(async (cat) => {
        const count = await Product.countDocuments({ category: cat.name });
        return {
          name: cat.name,
          value: count
        };
      })
    );

    // Get last 6 months list
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      months.push({
        name: d.toLocaleString('default', { month: 'short' }),
        year: d.getFullYear(),
        monthNum: d.getMonth()
      });
    }

    // Dynamic User growth over last 6 months
    const userGrowth = await Promise.all(months.map(async (m) => {
      const endOfMonth = new Date(m.year, m.monthNum + 1, 0, 23, 59, 59, 999);
      const count = await User.countDocuments({ createdAt: { $lte: endOfMonth } });
      return { month: m.name, Users: count };
    }));

    // Dynamic Monthly Orders and Revenue
    const monthlyOrders = await Promise.all(months.map(async (m) => {
      const startOfMonth = new Date(m.year, m.monthNum, 1);
      const endOfMonth = new Date(m.year, m.monthNum + 1, 0, 23, 59, 59, 999);
      
      const ordersCount = await Order.countDocuments({
        createdAt: { $gte: startOfMonth, $lte: endOfMonth }
      });
      
      const monthlyRevData = await Order.aggregate([
        { 
          $match: { 
            paymentStatus: 'paid', 
            orderStatus: { $ne: 'cancelled' },
            createdAt: { $gte: startOfMonth, $lte: endOfMonth }
          } 
        },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]);
      const revenue = monthlyRevData.length > 0 ? monthlyRevData[0].total : 0;
      
      return {
        month: m.name,
        Orders: ordersCount,
        Revenue: revenue
      };
    }));

    // Top Categories
    const topCategories = categories.map(cat => ({
      name: cat.name,
      count: cat.productCount || 0
    })).sort((a, b) => b.count - a.count).slice(0, 5);

    // Top Selling Products dynamically aggregated
    const topProductsAgg = await Order.aggregate([
      { $match: { paymentStatus: 'paid', orderStatus: { $ne: 'cancelled' } } },
      {
        $group: {
          _id: '$productId',
          sales: { $sum: '$quantity' },
          revenue: { $sum: '$totalAmount' }
        }
      },
      { $sort: { sales: -1 } },
      { $limit: 5 }
    ]);
    
    let topSellingProducts = await Promise.all(topProductsAgg.map(async (item) => {
      const prod = await Product.findById(item._id);
      return {
        name: prod ? prod.title : 'Deleted Product',
        sales: item.sales,
        revenue: item.revenue
      };
    }));

    if (topSellingProducts.length === 0) {
      const activeProds = await Product.find({ status: 'available' }).limit(5);
      topSellingProducts = activeProds.map(p => ({
        name: p.title,
        sales: 0,
        revenue: 0
      }));
    }

    res.json({
      success: true,
      metrics: {
        totalUsers,
        totalBuyers,
        totalSellers,
        totalProducts,
        pendingProducts,
        approvedProducts,
        rejectedProducts,
        totalOrders,
        totalRevenue,
        totalReports
      },
      charts: {
        userGrowth,
        categoryPerformance,
        monthlyOrders,
        topCategories,
        topSellingProducts
      }
    });
  } catch (error) {
    console.error('Fetch admin analytics error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching analytics' });
  }
});

// @route   GET /api/analytics/seller
// @desc    Get dashboard metrics & chart data for seller
router.get('/seller', protect, authorize('seller'), async (req, res) => {
  try {
    const userId = req.user._id;
    const { startDate, endDate } = req.query;
    const dateQuery = {};
    if (startDate || endDate) {
      dateQuery.createdAt = {};
      if (startDate) dateQuery.createdAt.$gte = new Date(startDate);
      if (endDate) dateQuery.createdAt.$lte = new Date(endDate);
    }

    const totalProducts = await Product.countDocuments({ 'sellerInfo.userId': userId, ...dateQuery });
    const activeProducts = await Product.countDocuments({ 'sellerInfo.userId': userId, status: 'available', stock: { $gt: 0 }, ...dateQuery });
    const soldProducts = await Product.countDocuments({ 'sellerInfo.userId': userId, status: 'sold', ...dateQuery });
    const pendingOrders = await Order.countDocuments({ 'sellerInfo.userId': userId, orderStatus: 'pending', ...dateQuery });
    const deliveredOrders = await Order.countDocuments({ 'sellerInfo.userId': userId, orderStatus: 'delivered', ...dateQuery });
    const totalSales = await Order.countDocuments({ 'sellerInfo.userId': userId, paymentStatus: 'paid', orderStatus: { $ne: 'cancelled' }, ...dateQuery });
    const lowStockProducts = await Product.countDocuments({ 'sellerInfo.userId': userId, status: 'available', stock: { $lte: 2 }, ...dateQuery });

    const matchStage = { 'sellerInfo.userId': userId, paymentStatus: 'paid', orderStatus: { $ne: 'cancelled' } };
    if (dateQuery.createdAt) {
      matchStage.createdAt = dateQuery.createdAt;
    }
    const revenueData = await Order.aggregate([
      { $match: matchStage },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const totalRevenue = revenueData.length > 0 ? revenueData[0].total : 0;

    // Get last 6 months list
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      months.push({
        name: d.toLocaleString('default', { month: 'short' }),
        year: d.getFullYear(),
        monthNum: d.getMonth()
      });
    }

    // Dynamic Monthly revenue & sales trend for this seller
    const monthlyRevenue = await Promise.all(months.map(async (m) => {
      const startOfMonth = new Date(m.year, m.monthNum, 1);
      const endOfMonth = new Date(m.year, m.monthNum + 1, 0, 23, 59, 59, 999);
      
      const salesCount = await Order.countDocuments({
        'sellerInfo.userId': userId,
        paymentStatus: 'paid',
        orderStatus: { $ne: 'cancelled' },
        createdAt: { $gte: startOfMonth, $lte: endOfMonth }
      });
      
      const revData = await Order.aggregate([
        {
          $match: {
            'sellerInfo.userId': userId,
            paymentStatus: 'paid',
            orderStatus: { $ne: 'cancelled' },
            createdAt: { $gte: startOfMonth, $lte: endOfMonth }
          }
        },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]);
      const revenue = revData.length > 0 ? revData[0].total : 0;
      
      return {
        month: m.name,
        Revenue: revenue,
        Sales: salesCount
      };
    }));

    const salesTrend = monthlyRevenue; // Make it match monthlyRevenue so it has the same schema if referenced

    // Top Selling Products dynamically aggregated
    const sellerTopProductsAgg = await Order.aggregate([
      { 
        $match: { 
          'sellerInfo.userId': userId,
          paymentStatus: 'paid', 
          orderStatus: { $ne: 'cancelled' } 
        } 
      },
      {
        $group: {
          _id: '$productId',
          sales: { $sum: '$quantity' },
          revenue: { $sum: '$totalAmount' }
        }
      },
      { $sort: { sales: -1 } },
      { $limit: 5 }
    ]);

    let topSellingProducts = await Promise.all(sellerTopProductsAgg.map(async (item) => {
      const prod = await Product.findById(item._id);
      return {
        name: prod ? prod.title : 'Deleted Product',
        sales: item.sales,
        revenue: item.revenue
      };
    }));

    if (topSellingProducts.length === 0) {
      const activeProds = await Product.find({ 'sellerInfo.userId': userId }).limit(5);
      topSellingProducts = activeProds.map(p => ({
        name: p.title,
        sales: 0,
        revenue: 0
      }));
    }

    // Recent products listed
    const recentProducts = await Product.find({ 'sellerInfo.userId': userId })
      .sort({ createdAt: -1 })
      .limit(5);

    // Recent orders received
    const recentOrders = await Order.find({ 'sellerInfo.userId': userId })
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      metrics: {
        totalProducts,
        activeProducts,
        soldProducts,
        totalSales,
        totalRevenue,
        pendingOrders,
        deliveredOrders,
        lowStockProducts
      },
      charts: {
        monthlyRevenue,
        salesTrend,
        topSellingProducts
      },
      recentProducts,
      recentOrders
    });
  } catch (error) {
    console.error('Fetch seller analytics error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching seller analytics' });
  }
});

module.exports = router;
