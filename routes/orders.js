const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const Alert = require('../models/Alert');
const { protect, authorize } = require('../middleware/auth');

// @route   POST /api/orders
// @desc    Create a new order (after Stripe payment success)
router.post('/', protect, async (req, res) => {
  const { productId, quantity, address, phone, transactionId, totalAmount } = req.body;

  try {
    if (!productId || !quantity || !address || !phone || !transactionId || !totalAmount) {
      return res.status(400).json({ success: false, message: 'Please provide all details and transaction ID' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (product.stock < quantity) {
      return res.status(400).json({ success: false, message: 'Insufficient stock available' });
    }

    // Create the order
    const order = new Order({
      buyerInfo: {
        userId: req.user._id,
        name: req.user.name,
        email: req.user.email,
        phone,
        address
      },
      sellerInfo: {
        userId: product.sellerInfo.userId,
        name: product.sellerInfo.name,
        email: product.sellerInfo.email
      },
      productId: product._id,
      productTitle: product.title,
      productPrice: product.price,
      quantity,
      totalAmount,
      paymentStatus: 'paid', // Order created after Stripe checkout
      orderStatus: 'pending',
      transactionId
    });

    await order.save();

    // Reduce stock
    product.stock -= quantity;
    if (product.stock <= 0) {
      product.status = 'sold';
    }
    await product.save();

    res.status(201).json({ success: true, order, message: 'Order created successfully' });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ success: false, message: 'Server error creating order' });
  }
});

// @route   GET /api/orders/buyer
// @desc    Get all orders for the logged-in buyer
router.get('/buyer', protect, async (req, res) => {
  try {
    const orders = await Order.find({ 'buyerInfo.userId': req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (error) {
    console.error('Get buyer orders error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching orders' });
  }
});

// @route   GET /api/orders/seller
// @desc    Get all orders for products owned by the seller
router.get('/seller', protect, authorize('seller'), async (req, res) => {
  try {
    const orders = await Order.find({ 'sellerInfo.userId': req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (error) {
    console.error('Get seller orders error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching seller orders' });
  }
});

// @route   GET /api/orders/admin
// @desc    Get all orders across the entire platform
router.get('/admin', protect, authorize('admin'), async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (error) {
    console.error('Get admin orders error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching all orders' });
  }
});

// @route   GET /api/orders/:id
// @desc    Get details of a single order
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Verify authorized party (Buyer, Seller, or Admin)
    const isBuyer = order.buyerInfo.userId.toString() === req.user._id.toString();
    const isSeller = order.sellerInfo.userId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isBuyer && !isSeller && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this order' });
    }

    res.json({ success: true, order });
  } catch (error) {
    console.error('Get order details error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching order details' });
  }
});

// @route   PATCH /api/orders/:id/status
// @desc    Update order delivery status (Sellers or Admin)
router.patch('/:id/status', protect, async (req, res) => {
  const { status } = req.body;

  try {
    const allowedStatuses = ['pending', 'accepted', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid order status value' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const isSeller = order.sellerInfo.userId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isSeller && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this order' });
    }

    order.orderStatus = status;
    
    // If cancelled, return stock
    if (status === 'cancelled') {
      const product = await Product.findById(order.productId);
      if (product) {
        product.stock += order.quantity;
        if (product.status === 'sold' && product.stock > 0) {
          product.status = 'available';
        }
        await product.save();
      }
    }

    await order.save();
    res.json({ success: true, order, message: `Order status updated to ${status}` });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ success: false, message: 'Server error updating order status' });
  }
});

// @route   PATCH /api/orders/:id/cancel
// @desc    Cancel order by buyer (only before shipment)
router.patch('/:id/cancel', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.buyerInfo.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this order' });
    }

    const uncancelable = ['processing', 'shipped', 'delivered', 'cancelled'];
    if (uncancelable.includes(order.orderStatus)) {
      return res.status(400).json({ success: false, message: 'Cannot cancel order once it is processing, shipped, or delivered' });
    }

    order.orderStatus = 'cancelled';
    order.paymentStatus = 'refunded';

    // Put stock back
    const product = await Product.findById(order.productId);
    if (product) {
      product.stock += order.quantity;
      if (product.status === 'sold' && product.stock > 0) {
        product.status = 'available';
      }
      await product.save();
    }

    await order.save();
    res.json({ success: true, order, message: 'Order cancelled and stock returned successfully' });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({ success: false, message: 'Server error cancelling order' });
  }
});

module.exports = router;
