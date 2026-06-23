const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// JWT signer helper
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret_key', {
    expiresIn: '30d'
  });
};

// @route   POST /api/auth/register
// @desc    Register a new user (default: buyer)
router.post('/register', async (req, res) => {
  const { name, email, password, confirmPassword, photo, phone, location, role } = req.body;

  try {
    // Form validations
    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({ success: false, message: 'Please fill all required fields' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match' });
    }

    // Check existing user
    let user = await User.findOne({ email: email.toLowerCase() });
    if (user) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // Validate admin registration
    const adminEmails = ['masud.dev01@gmail.com', 'mr3377006@gmail.com'];
    if (role === 'admin' && !adminEmails.includes(email.toLowerCase())) {
      return res.status(400).json({ success: false, message: 'You are not authorized to register as an Admin' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    user = new User({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      photo: photo || undefined,
      phone: phone || '',
      location: location || '',
      role: role || 'buyer'
    });

    await user.save();

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
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
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Server error during registration' });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user and get token
router.post('/login', async (req, res) => {
  const { email, password, role } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please enter all fields' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    if (user.status === 'blocked') {
      return res.status(403).json({ success: false, message: 'Your account is blocked. Contact support.' });
    }

    // Google-only users might not have a password
    if (!user.password) {
      return res.status(400).json({ success: false, message: 'Please login using Google' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    // Role verification and dynamic update
    const adminEmails = ['masud.dev01@gmail.com', 'mr3377006@gmail.com'];
    if (role === 'admin' && !adminEmails.includes(email.toLowerCase())) {
      return res.status(400).json({ success: false, message: 'You are not authorized to log in as an Admin' });
    }

    if (role && (role === 'buyer' || role === 'seller' || role === 'admin')) {
      user.role = role;
      await user.save();
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
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
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
});

// @route   POST /api/auth/google
// @desc    Google login / registration using Google credential ID token
router.post('/google', async (req, res) => {
  const { credential, role } = req.body;

  try {
    if (!credential) {
      return res.status(400).json({ success: false, message: 'Google credential ID token is required' });
    }

    if (!role) {
      return res.status(400).json({ success: false, message: 'Login role is required' });
    }

    // Verify token with Google API
    const googleVerifyRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`);
    const googleUser = await googleVerifyRes.json();

    if (!googleUser || googleUser.error_description || !googleUser.email) {
      return res.status(400).json({ success: false, message: 'Invalid Google credential token' });
    }

    const { email, name, picture, sub: googleId } = googleUser;

    // Validate admin permissions
    const adminEmails = ['masud.dev01@gmail.com', 'mr3377006@gmail.com'];
    if (role === 'admin' && !adminEmails.includes(email.toLowerCase())) {
      return res.status(400).json({ success: false, message: 'You are not authorized to login as Admin' });
    }

    let user = await User.findOne({ email: email.toLowerCase() });

    if (user) {
      if (user.status === 'blocked') {
        return res.status(403).json({ success: false, message: 'Your account is blocked. Contact support.' });
      }

      // Link Google ID if not already linked
      if (!user.googleId) {
        user.googleId = googleId;
      }
      if (picture && (!user.photo || user.photo.includes('default') || user.photo.includes('pravatar'))) {
        user.photo = picture;
      }
      // Set role
      user.role = role;
      await user.save();
    } else {
      // Register new user
      user = new User({
        name,
        email: email.toLowerCase(),
        photo: picture || undefined,
        googleId,
        role: role
      });
      await user.save();
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
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
      }
    });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({ success: false, message: 'Server error during Google auth' });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user details (Persistent session)
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
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
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching profile' });
  }
});

module.exports = router;
