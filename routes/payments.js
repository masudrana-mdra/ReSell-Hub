const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_mock_stripe_key_placeholder');
const Payment = require('../models/Payment');
const Order = require('../models/Order');
const { protect, authorize } = require('../middleware/auth');

// @route   POST /api/payments/create-intent
// @desc    Create Stripe Payment Intent
router.post('/create-intent', protect, async (req, res) => {
  const { amount } = req.body;

  try {
    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid payment amount' });
    }

    // Stripe amount in cents
    const paymentAmount = Math.round(amount * 100);

    // If using mock stripe key, handle fallback so application stays functional
    if (process.env.STRIPE_SECRET_KEY === 'sk_test_mock_stripe_key_placeholder' || !process.env.STRIPE_SECRET_KEY) {
      // Simulate Stripe Client Secret
      return res.json({
        success: true,
        clientSecret: `mock_secret_intent_${Date.now()}`,
        isMock: true
      });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: paymentAmount,
      currency: 'usd',
      payment_method_types: ['card']
    });

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret
    });
  } catch (error) {
    console.error('Stripe payment intent error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error creating payment' });
  }
});

// @route   POST /api/payments/log
// @desc    Log payment in database after successful checkout
router.post('/log', protect, async (req, res) => {
  const { orderId, transactionId, amount, paymentStatus, paymentMethod } = req.body;

  try {
    if (!orderId || !transactionId || !amount) {
      return res.status(400).json({ success: false, message: 'Missing payment details' });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Associated order not found' });
    }

    const payment = new Payment({
      orderId,
      transactionId,
      amount: Number(amount),
      buyerId: req.user._id,
      paymentStatus: paymentStatus || 'success',
      paymentMethod: paymentMethod || 'stripe'
    });

    await payment.save();

    // Ensure order reflects correct transaction details
    order.transactionId = transactionId;
    order.paymentStatus = 'paid';
    await order.save();

    res.status(201).json({ success: true, payment, message: 'Payment logged successfully' });
  } catch (error) {
    console.error('Payment logging error:', error);
    res.status(500).json({ success: false, message: 'Server error saving transaction log' });
  }
});

// @route   GET /api/payments/history
// @desc    Get logged-in buyer's payment history
router.get('/history', protect, async (req, res) => {
  try {
    const payments = await Payment.find({ buyerId: req.user._id })
      .populate('orderId', 'productTitle')
      .sort({ createdAt: -1 });

    res.json({ success: true, payments });
  } catch (error) {
    console.error('Fetch payment history error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching payment history' });
  }
});

// @route   GET /api/payments/admin
// @desc    Monitor payments and search transactions (Admin only)
router.get('/admin', protect, authorize('admin'), async (req, res) => {
  try {
    const { search, status } = req.query;
    const query = {};

    if (status) {
      query.paymentStatus = status;
    }

    if (search) {
      query.transactionId = { $regex: search, $options: 'i' };
    }

    const payments = await Payment.find(query)
      .populate('buyerId', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, payments });
  } catch (error) {
    console.error('Fetch admin transactions error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching transaction history' });
  }
});

module.exports = router;
