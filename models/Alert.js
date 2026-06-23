const mongoose = require('mongoose');

const AlertSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  email: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Single user can subscribe only once per product
AlertSchema.index({ productId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('Alert', AlertSchema);
