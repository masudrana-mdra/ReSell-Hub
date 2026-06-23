const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');
const { protect, authorize } = require('../middleware/auth');

// ==========================================
// USER PROFILE MANAGEMENT
// ==========================================

// @route   PUT /api/users/profile
// @desc    Update user profile settings
router.put('/profile', protect, async (req, res) => {
  const { name, photo, phone, location, password } = req.body;

  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.name = name || user.name;
    user.photo = photo || user.photo;
    user.phone = phone !== undefined ? phone : user.phone;
    user.location = location !== undefined ? location : user.location;

    if (password) {
      if (password.length < 6) {
        return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
      }
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();
    
    // If user is a seller, sync seller details across their active product listings
    if (user.role === 'seller') {
      await Product.updateMany(
        { 'sellerInfo.userId': user._id },
        { 
          'sellerInfo.name': user.name,
          'sellerInfo.phone': user.phone,
          'sellerInfo.verified': user.verified
        }
      );
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        photo: user.photo,
        role: user.role,
        phone: user.phone,
        location: user.location,
        status: user.status,
        verified: user.verified,
        sellerRequestStatus: user.sellerRequestStatus
      },
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, message: 'Server error updating profile' });
  }
});

// ==========================================
// WISHLIST OPERATIONS
// ==========================================

// @route   GET /api/users/wishlist
// @desc    Get current user's wishlist
router.get('/wishlist', protect, async (req, res) => {
  try {
    const wishlistItems = await Wishlist.find({ userId: req.user._id })
      .populate({
        path: 'productId',
        match: { status: 'available' } // Filter out deleted or sold products
      });

    // Clean up empty product links if any
    const validItems = wishlistItems.filter(item => item.productId !== null);

    res.json({ success: true, wishlist: validItems });
  } catch (error) {
    console.error('Fetch wishlist error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching wishlist' });
  }
});

// @route   POST /api/users/wishlist/:productId
// @desc    Add product to wishlist
router.post('/wishlist/:productId', protect, async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const existing = await Wishlist.findOne({ userId: req.user._id, productId: product._id });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Product is already in your wishlist' });
    }

    const wishlistItem = new Wishlist({
      userId: req.user._id,
      productId: product._id
    });

    await wishlistItem.save();
    res.status(201).json({ success: true, message: 'Added to wishlist' });
  } catch (error) {
    console.error('Add wishlist error:', error);
    res.status(500).json({ success: false, message: 'Server error adding to wishlist' });
  }
});

// @route   DELETE /api/users/wishlist/:productId
// @desc    Remove product from wishlist
router.delete('/wishlist/:productId', protect, async (req, res) => {
  try {
    const item = await Wishlist.findOneAndDelete({ userId: req.user._id, productId: req.params.productId });
    if (!item) {
      return res.status(404).json({ success: false, message: 'Product not found in wishlist' });
    }
    res.json({ success: true, message: 'Removed from wishlist' });
  } catch (error) {
    console.error('Delete wishlist error:', error);
    res.status(500).json({ success: false, message: 'Server error removing from wishlist' });
  }
});

// ==========================================
// ADMIN USER MANAGEMENT
// ==========================================

// @route   GET /api/users
// @desc    Get all users with optional name/email query search (Admin only)
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { search } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query).select('-password').sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching users' });
  }
});

// @route   PATCH /api/users/:id/status
// @desc    Block or unblock user (Admin only)
router.patch('/:id/status', protect, authorize('admin'), async (req, res) => {
  const { status } = req.body;

  try {
    if (!['active', 'blocked'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Do not allow blocking oneself
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot block yourself' });
    }

    user.status = status;
    await user.save();

    res.json({ success: true, user, message: `User status changed to ${status}` });
  } catch (error) {
    console.error('Block user error:', error);
    res.status(500).json({ success: false, message: 'Server error updating user status' });
  }
});

// @route   PATCH /api/users/:id/role
// @desc    Update user role (Admin only)
router.patch('/:id/role', protect, authorize('admin'), async (req, res) => {
  const { role } = req.body;

  try {
    if (!['buyer', 'seller', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role value' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Do not allow self role demotion
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot change your own role' });
    }

    user.role = role;
    await user.save();

    res.json({ success: true, user, message: `User role updated to ${role}` });
  } catch (error) {
    console.error('Change role error:', error);
    res.status(500).json({ success: false, message: 'Server error updating user role' });
  }
});

// @route   DELETE /api/users/:id
// @desc    Delete user account (Admin only)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot delete yourself' });
    }

    await User.findByIdAndDelete(req.params.id);
    // Also clean up user's wishlist and reports
    await Wishlist.deleteMany({ userId: req.params.id });

    res.json({ success: true, message: 'User account deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ success: false, message: 'Server error deleting user' });
  }
});

// @route   PATCH /api/users/:id/verify
// @desc    Verify seller (Admin only) - Verification badge
router.patch('/:id/verify', protect, authorize('admin'), async (req, res) => {
  const { verified } = req.body;

  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.verified = !!verified;
    await user.save();

    // Sync verification status on all active products listed by this seller
    await Product.updateMany(
      { 'sellerInfo.userId': user._id },
      { 'sellerInfo.verified': user.verified }
    );

    res.json({ success: true, user, message: `Seller verification status set to ${user.verified}` });
  } catch (error) {
    console.error('Seller verification error:', error);
    res.status(500).json({ success: false, message: 'Server error verifying seller' });
  }
});

// @route   POST /api/users/apply-seller
// desc     Apply to become a seller
router.post('/apply-seller', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role === 'seller') {
      return res.status(400).json({ success: false, message: 'You are already registered as a Seller' });
    }

    user.sellerRequestStatus = 'pending';
    await user.save();

    res.json({
      success: true,
      message: 'Seller application submitted successfully. Awaiting Admin moderation.',
      sellerRequestStatus: 'pending'
    });
  } catch (error) {
    console.error('Apply seller error:', error);
    res.status(500).json({ success: false, message: 'Server error filing seller application' });
  }
});

// @route   GET /api/users/seller-applications
// @desc    Get all pending seller applications (Admin only)
router.get('/seller-applications', protect, authorize('admin'), async (req, res) => {
  try {
    const applications = await User.find({ sellerRequestStatus: 'pending' }).select('-password').sort({ createdAt: -1 });
    res.json({ success: true, applications });
  } catch (error) {
    console.error('Get seller applications error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching seller applications' });
  }
});

// @route   PATCH /api/users/seller-applications/:id
// @desc    Approve or reject seller application (Admin only)
router.patch('/seller-applications/:id', protect, authorize('admin'), async (req, res) => {
  const { status } = req.body;

  try {
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status. Must be approved or rejected.' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.sellerRequestStatus = status;
    if (status === 'approved') {
      user.role = 'seller';
      user.verified = true; // Auto-verify seller on request approval
    } else {
      user.role = 'buyer'; // Enforce role is buyer if rejected or demoted
      user.verified = false;
    }

    await user.save();

    // Sync user details/verification across products
    if (user.role === 'seller') {
      await Product.updateMany(
        { 'sellerInfo.userId': user._id },
        { 
          'sellerInfo.name': user.name,
          'sellerInfo.phone': user.phone,
          'sellerInfo.verified': user.verified
        }
      );
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        sellerRequestStatus: user.sellerRequestStatus,
        verified: user.verified
      },
      message: `Seller request status set to ${status}`
    });
  } catch (error) {
    console.error('Moderate seller application error:', error);
    res.status(500).json({ success: false, message: 'Server error moderating application' });
  }
});

// @route   GET /api/users/seller/:id
// @desc    Get public seller profile details (Public)
router.get('/seller/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('name photo role location verified createdAt');
    if (!user || user.role !== 'seller') {
      return res.status(404).json({ success: false, message: 'Seller profile not found' });
    }
    res.json({ success: true, seller: user });
  } catch (error) {
    console.error('Fetch seller profile error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching seller profile' });
  }
});

module.exports = router;
