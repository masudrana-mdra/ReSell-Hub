const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Review = require('../models/Review');
const Report = require('../models/Report');
const Alert = require('../models/Alert');
const Category = require('../models/Category');
const { protect, authorize } = require('../middleware/auth');

// Helper to update product count in Category model
const updateCategoryCount = async (categoryName) => {
  try {
    const count = await Product.countDocuments({ category: categoryName, status: 'available' });
    await Category.findOneAndUpdate({ name: categoryName }, { productCount: count });
  } catch (err) {
    console.error('Error updating category product count:', err);
  }
};

// @route   GET /api/products
// @desc    Get all available products with filters, search, sort, pagination
router.get('/', async (req, res) => {
  try {
    const {
      search,
      category,
      condition,
      location,
      minPrice,
      maxPrice,
      sort,
      page = 1,
      limit = 6,
      sellerId
    } = req.query;

    // Filter query (Only show available products)
    const query = { status: 'available' };

    if (sellerId) {
      query['sellerInfo.userId'] = sellerId;
    }

    // Search by name (case-insensitive regex)
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    // Filters
    if (category) {
      query.category = category;
    }
    if (condition) {
      query.condition = condition;
    }
    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Sorting
    let sortQuery = { createdAt: -1 }; // Default: Newest first
    if (sort) {
      if (sort === 'priceLow') sortQuery = { price: 1 };
      else if (sort === 'priceHigh') sortQuery = { price: -1 };
      else if (sort === 'newest') sortQuery = { createdAt: -1 };
      else if (sort === 'oldest') sortQuery = { createdAt: 1 };
    }

    // Pagination
    const skip = (Number(page) - 1) * Number(limit);
    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort(sortQuery)
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      products,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching products' });
  }
});

// @route   GET /api/products/seller
// @desc    Get all products listed by logged-in seller
router.get('/seller', protect, authorize('seller'), async (req, res) => {
  try {
    const products = await Product.find({ 'sellerInfo.userId': req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, products });
  } catch (error) {
    console.error('Get seller products error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching seller products' });
  }
});

// @route   GET /api/products/admin
// @desc    Get all products for administration
router.get('/admin', protect, authorize('admin'), async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json({ success: true, products });
  } catch (error) {
    console.error('Get admin products error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching products' });
  }
});

// @route   GET /api/products/:id
// @desc    Get product details and reviews
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.id || req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const reviews = await Review.find({ productId: product._id }).sort({ createdAt: -1 });

    res.json({ success: true, product, reviews });
  } catch (error) {
    console.error('Get product by ID error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching product details' });
  }
});

// @route   POST /api/products
// @desc    Add a product (Sellers only, status is pending approval)
router.post('/', protect, authorize('seller'), async (req, res) => {
  const { title, description, category, condition, price, stock, location, images, brand, model, features } = req.body;

  try {
    if (!title || !description || !category || !condition || !price || !stock || !location || !images || images.length === 0) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    if (Number(price) <= 0) {
      return res.status(400).json({ success: false, message: 'Price must be greater than 0' });
    }

    const product = new Product({
      title,
      description,
      category,
      condition,
      price: Number(price),
      stock: Number(stock),
      location,
      images,
      brand: brand || '',
      model: model || '',
      features: Array.isArray(features) ? features : [],
      sellerInfo: {
        userId: req.user._id,
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phone,
        verified: req.user.verified
      },
      status: 'pending' // Enforce product approval workflow
    });

    await product.save();
    res.status(201).json({ success: true, product, message: 'Product submitted successfully. Awaiting admin approval.' });
  } catch (error) {
    console.error('Add product error:', error);
    res.status(500).json({ success: false, message: 'Server error listing product' });
  }
});

// @route   PUT /api/products/:id
// @desc    Edit a product (Sellers only)
router.put('/:id', protect, authorize('seller'), async (req, res) => {
  const { title, description, category, condition, price, stock, location, images, brand, model, features } = req.body;

  try {
    let product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Verify ownership
    if (product.sellerInfo.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this product' });
    }

    const oldCategory = product.category;

    product.title = title || product.title;
    product.description = description || product.description;
    product.category = category || product.category;
    product.condition = condition || product.condition;
    product.price = price !== undefined ? Number(price) : product.price;
    product.stock = stock !== undefined ? Number(stock) : product.stock;
    product.location = location || product.location;
    product.images = images || product.images;
    product.brand = brand !== undefined ? brand : product.brand;
    product.model = model !== undefined ? model : product.model;
    product.features = Array.isArray(features) ? features : product.features;
    product.status = 'pending'; // Reset approval state after updates

    await product.save();

    // Update counts
    await updateCategoryCount(oldCategory);
    if (category && oldCategory !== category) {
      await updateCategoryCount(category);
    }

    res.json({ success: true, product, message: 'Product updated successfully. Awaiting approval.' });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ success: false, message: 'Server error updating product' });
  }
});

// @route   DELETE /api/products/:id
// @desc    Delete a product (Seller or Admin)
router.delete('/:id', protect, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Verify ownership or check if admin
    if (
      product.sellerInfo.userId.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this product' });
    }

    const categoryName = product.category;
    await Product.findByIdAndDelete(req.params.id);

    // Update category product count
    await updateCategoryCount(categoryName);

    // Delete associated alerts, reviews, reports
    await Review.deleteMany({ productId: req.params.id });
    await Report.deleteMany({ productId: req.params.id });
    await Alert.deleteMany({ productId: req.params.id });

    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ success: false, message: 'Server error deleting product' });
  }
});

// @route   POST /api/products/:id/review
// @desc    Add review for a product
router.post('/:id/review', protect, async (req, res) => {
  const { rating, comment } = req.body;

  try {
    if (!rating || !comment) {
      return res.status(400).json({ success: false, message: 'Rating and comment are required' });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Optional: check if reviewer already reviewed
    const existing = await Review.findOne({ productId: product._id, 'reviewerInfo.userId': req.user._id });
    if (existing) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this product' });
    }

    const review = new Review({
      reviewerInfo: {
        userId: req.user._id,
        name: req.user.name
      },
      productId: product._id,
      rating: Number(rating),
      comment
    });

    await review.save();
    res.status(201).json({ success: true, review, message: 'Review added successfully' });
  } catch (error) {
    console.error('Review creation error:', error);
    res.status(500).json({ success: false, message: 'Server error saving review' });
  }
});

// @route   POST /api/products/:id/report
// @desc    Report a product
router.post('/:id/report', protect, async (req, res) => {
  const { reason } = req.body;

  try {
    if (!reason) {
      return res.status(400).json({ success: false, message: 'Reason is required to report a product' });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Check if reported already by this user
    const existing = await Report.findOne({ productId: product._id, reporterId: req.user._id });
    if (existing) {
      return res.status(400).json({ success: false, message: 'You have already reported this product' });
    }

    const report = new Report({
      productId: product._id,
      reporterId: req.user._id,
      reason
    });

    await report.save();

    // Increment reported count on product
    product.reportsCount = (product.reportsCount || 0) + 1;
    await product.save();

    res.status(201).json({ success: true, message: 'Product reported successfully. Admin will review.' });
  } catch (error) {
    console.error('Report error:', error);
    res.status(500).json({ success: false, message: 'Server error filing report' });
  }
});

// @route   POST /api/products/:id/alert
// @desc    Subscribe to product restock alert
router.post('/:id/alert', protect, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const existing = await Alert.findOne({ productId: product._id, userId: req.user._id });
    if (existing) {
      return res.status(400).json({ success: false, message: 'You are already subscribed to alerts for this product' });
    }

    const alert = new Alert({
      productId: product._id,
      userId: req.user._id,
      email: req.user.email
    });

    await alert.save();
    res.status(201).json({ success: true, message: 'Subscribed to availability alerts successfully' });
  } catch (error) {
    console.error('Alert subscription error:', error);
    res.status(500).json({ success: false, message: 'Server error subscribing to alerts' });
  }
});

// @route   PATCH /api/products/:id/status
// @desc    Update product approval status (Admin only)
router.patch('/:id/status', protect, authorize('admin'), async (req, res) => {
  const { status } = req.body;

  try {
    if (!['pending', 'available', 'rejected', 'sold'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid product status' });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    product.status = status;
    await product.save();

    // Trigger category product count update if status changes
    await updateCategoryCount(product.category);

    res.json({ success: true, product, message: `Product status updated to ${status}` });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ success: false, message: 'Server error updating status' });
  }
});

module.exports = router;
