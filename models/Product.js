const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  condition: {
    type: String,
    enum: ['Used', 'Like New', 'Refurbished'],
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0.01
  },
  images: {
    type: [String],
    required: true,
    validate: [val => val.length > 0, 'At least one image is required']
  },
  location: {
    type: String,
    required: true
  },
  brand: {
    type: String,
    trim: true,
    default: ''
  },
  model: {
    type: String,
    trim: true,
    default: ''
  },
  features: {
    type: [String],
    default: []
  },
  stock: {
    type: Number,
    required: true,
    default: 1
  },
  sellerInfo: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    name: String,
    email: String,
    phone: String,
    verified: {
      type: Boolean,
      default: false
    }
  },
  status: {
    type: String,
    enum: ['pending', 'available', 'sold', 'rejected'],
    default: 'available' // By default, available or pending (admin moderation can change this)
  },
  reportsCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

ProductSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Product', ProductSchema);
