const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: function() {
      return !this.googleId; // Password is only required if not using Google login
    }
  },
  googleId: {
    type: String,
    default: null
  },
  photo: {
    type: String,
    default: 'https://i.pravatar.cc/300?img=default'
  },
  role: {
    type: String,
    enum: ['buyer', 'seller', 'admin'],
    default: 'buyer'
  },
  phone: {
    type: String,
    default: ''
  },
  location: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['active', 'blocked'],
    default: 'active'
  },
  verified: {
    type: Boolean,
    default: false
  },
  sellerRequestStatus: {
    type: String,
    enum: ['none', 'pending', 'approved', 'rejected'],
    default: 'none'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Admin check middleware before saving
UserSchema.pre('save', function(next) {
  const adminEmails = ['masud.dev01@gmail.com', 'mr3377006@gmail.com'];
  if (adminEmails.includes(this.email.toLowerCase())) {
    this.role = 'admin';
  }
  next();
});

module.exports = mongoose.model('User', UserSchema);
